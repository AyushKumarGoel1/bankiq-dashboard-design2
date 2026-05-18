import os
import pandas as pd
from sqlalchemy import create_engine

# Database path (at the root of the project)
DB_PATH = "../bankiq.db"
CSV_DIR = "../../public/data"  # Relative to this script, which will be run from backend/ingestion or backend/

CSV_FILES = {
    'core': 'core_banking_system_data_india_v2.csv',
    'demo': 'customer_demographics_system_data_india_v2.csv',
    'loan': 'loan_origination_system_data_india_v2.csv',
    'crm': 'customer_relationship_management_data_india_v2.csv',
    'credit': 'credit_behavior_system_data_india_v2.csv',
    'txn': 'customer_transaction_operational_system_data_india_v2.csv',
    'products': 'banking_products_data_india.csv',
    'bankdem': 'bank_demographics_data_india.csv',
}

def ingest_csvs():
    # If running from `backend/`, the path to public/data is `../public/data`
    # Let's find out the absolute path to public/data based on this file's location
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(current_dir, "../../"))
    data_dir = os.path.join(project_root, "public", "data")
    db_path = os.path.join(project_root, "bankiq.db")

    print(f"Project root: {project_root}")
    print(f"Data directory: {data_dir}")
    print(f"Database path: {db_path}")

    engine = create_engine(f"sqlite:///{db_path}")

    for table_name, file_name in CSV_FILES.items():
        csv_path = os.path.join(data_dir, file_name)
        if not os.path.exists(csv_path):
            print(f"Warning: {csv_path} does not exist.")
            continue
        
        print(f"Ingesting {file_name} into table '{table_name}'...")
        
        # Read CSV with pandas, strip whitespace from columns
        df = pd.read_csv(csv_path)
        df.columns = df.columns.str.strip()
        
        # Write to sqlite, replacing if it already exists
        df.to_sql(table_name, engine, if_exists='replace', index=False)
        print(f"Successfully ingested {len(df)} rows into '{table_name}'.")

    print("Creating customer_360 merged view...")
    from sqlalchemy import text
    with engine.connect() as conn:
        conn.execute(text("DROP VIEW IF EXISTS customer_360"))
        conn.execute(text("""
            CREATE VIEW customer_360 AS
            SELECT 
                c.Customer_ID,
                c.Customer_Name,
                c.Account_Type,
                c.Available_Balance_INR,
                d.Age,
                d.Gender,
                d.Occupation,
                d.Customer_Segment,
                d.Annual_Income_INR,
                d.Risk_Profile,
                cr.Customer_Sentiment,
                cr.Number_Of_Open_Tickets,
                cr.Cross_Sell_Opportunity,
                cr.Estimated_Customer_Lifetime_Value,
                cred.Current_CIBIL_Score,
                cred.Missed_Payments_Last_12M,
                cred.Fraud_Flag,
                cred.Payment_Behavior,
                b.Digital_Banking_User,
                b.Estimated_Portfolio_Value_INR
            FROM core c
            LEFT JOIN demo d ON c.Customer_ID = d.Customer_ID
            LEFT JOIN crm cr ON c.Customer_ID = cr.Customer_ID
            LEFT JOIN credit cred ON c.Customer_ID = cred.Customer_ID
            LEFT JOIN bankdem b ON c.Customer_ID = b.Customer_ID;
        """))
        conn.commit()
    print("customer_360 view created successfully.")

if __name__ == "__main__":
    ingest_csvs()
