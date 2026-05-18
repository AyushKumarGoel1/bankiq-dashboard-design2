import os
import json
import sqlite3
import pandas as pd
from pydantic import BaseModel
from autogen import AssistantAgent, UserProxyAgent, GroupChat, GroupChatManager

from constants import OPENAI_API_KEY

llm_config = {
    "config_list": [{"model": "gpt-4o", "api_key": OPENAI_API_KEY}],
    "cache_seed": None, # Disable caching for live data
}

def execute_sql(query: str) -> str:
    """
    Executes a SQL query against the SQLite database (bankiq.db) and returns the results.
    """
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../bankiq.db")
    try:
        conn = sqlite3.connect(db_path)
        df = pd.read_sql_query(query, conn)
        conn.close()
        # Return as JSON string
        return df.to_json(orient="records", date_format="iso")
    except Exception as e:
        return f"Error executing SQL: {str(e)}"

# Define the Agents
sql_agent = AssistantAgent(
    name="SQL_Agent",
    system_message='''You are an expert SQL engineer. Your task is to convert natural language into VALID SQL queries for a SQLite database.
Available Tables:
- customer_360 (Customer_ID, Customer_Name, Account_Type, Available_Balance_INR, Age, Gender, Occupation, Customer_Segment, Annual_Income_INR, Risk_Profile, Customer_Sentiment, Number_Of_Open_Tickets, Cross_Sell_Opportunity, Estimated_Customer_Lifetime_Value, Current_CIBIL_Score, Missed_Payments_Last_12M, Fraud_Flag, Payment_Behavior, Digital_Banking_User, Estimated_Portfolio_Value_INR)
- txn (Customer_ID, Transaction_Type, Transaction_Channel, Transaction_Amount_INR, Transaction_Date_Time, Fraud_Alert, Operational_Risk_Flag)
- loan (Loan_ID, Customer_ID, Loan_Type, Loan_Amount_INR, Interest_Rate, Loan_Status)

Instructions:
1. When asked to query data, write the SQL query.
2. The `customer_360` table contains all merged customer profile data, which is perfect for queries about segments, demographics, risk profiles, etc.
3. Use the `execute_sql` tool to run the query and get the results.
4. Return the exact JSON results to the group so the Analytics Agent can interpret them.
5. ONLY write read-only SELECT queries.
''',
    llm_config=llm_config,
)

analytics_agent = AssistantAgent(
    name="Analytics_Agent",
    system_message='''You are an expert Business Analyst. 
You interpret data returned by the SQL_Agent.
You MUST provide a clear, natural language, and business-focused answer to the user's question based on the SQL results.
Never just return raw data or JSON. Always summarize the findings elegantly in plain English.
Keep your answer under 100 words unless necessary.
Always ensure you are the final speaker to provide the answer to the user.
''',
    llm_config=llm_config,
)

risk_agent = AssistantAgent(
    name="Risk_Agent",
    system_message='''You are a Risk & Compliance Officer.
If the user asks about fraud, churn, defaults, or risk, you should jump in after the SQL_Agent provides data.
Provide insights specifically on risk mitigation, fraud patterns, and churn candidates.
''',
    llm_config=llm_config,
)

customer_intelligence_agent = AssistantAgent(
    name="Customer_Intelligence_Agent",
    system_message='''You are a Customer Intelligence Analyst.
If the user asks about segmentation, CLV, cross-sell, or engagement, analyze the data provided by SQL_Agent.
Provide recommendations on next-best-actions (NBA) and customer retention.
''',
    llm_config=llm_config,
)

user_proxy = UserProxyAgent(
    name="User_Proxy",
    human_input_mode="NEVER",
    max_consecutive_auto_reply=0,
    is_termination_msg=lambda x: x.get("content", "").rstrip().endswith("TERMINATE"),
    code_execution_config=False,
)

# Register the tool
user_proxy.register_for_execution(name="execute_sql")(execute_sql)
sql_agent.register_for_llm(name="execute_sql", description="Executes a SQL query against the database and returns JSON data.")(execute_sql)

groupchat = GroupChat(
    agents=[user_proxy, sql_agent, analytics_agent, risk_agent, customer_intelligence_agent],
    messages=[],
    max_round=6,
    speaker_selection_method="auto"
)

manager = GroupChatManager(groupchat=groupchat, llm_config=llm_config)

def process_chat_query(message: str, context: str, kpis: dict) -> dict:
    """
    Entry point for the API.
    """
    prompt = f"""User Question: {message}
Page Context: {context}
Live KPIs: {json.dumps(kpis)}

Instructions:
1. SQL_Agent: Please query the database if the user is asking for specific data or metrics not in the Live KPIs. 
2. Relevant Analyst Agent: Interpret the results and give the final answer.
"""
    
    # Reset groupchat messages for fresh run
    groupchat.messages.clear()
    
    chat_result = user_proxy.initiate_chat(
        manager,
        message=prompt,
        summary_method="last_msg"
    )
    
    # We want to extract the final text which should ideally be from the Analytics_Agent or Risk_Agent
    # The summary from AutoGen is usually the last message content.
    reply = chat_result.summary
    
    # If the summary is empty or just contains raw data, fallback to the last actual message that isn't a tool message
    if not reply or "{" in reply:
        for msg in reversed(groupchat.messages):
            if msg.get('role') != 'tool' and msg.get('name') != 'SQL_Agent' and 'content' in msg:
                reply = msg['content']
                break
    
    # Attempt to extract any JSON data returned by the tool to pass to the UI
    sql_data = None
    for msg in groupchat.messages:
        if msg.get('role') == 'tool' or (msg.get('name') == 'execute_sql' and 'tool_responses' in msg):
            try:
                # auto-gen tool response format varies but usually stringified JSON
                content = msg.get('content', '')
                if '[' in content and ']' in content:
                    start = content.find('[')
                    end = content.rfind(']') + 1
                    sql_data = json.loads(content[start:end])
            except:
                pass

    return {
        "reply": reply,
        "isSql": sql_data is not None,
        "sqlData": sql_data
    }
