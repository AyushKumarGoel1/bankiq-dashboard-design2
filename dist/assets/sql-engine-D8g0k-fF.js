import{n as e}from"./index-jFFOxWHL.js";import{t}from"./alasql.min-BlUpBetq.js";var n=e(t(),1);function r(e){let t=[];return e.customerProfiles&&e.customerProfiles.length>0&&t.push(`Table 'customers': columns are ${Object.keys(e.customerProfiles[0]).join(`, `)}`),e.recentTxns&&e.recentTxns.length>0&&t.push(`Table 'transactions': columns are ${Object.keys(e.recentTxns[0]).join(`, `)}`),e.churnCandidates&&e.churnCandidates.length>0&&t.push(`Table 'churn': columns are ${Object.keys(e.churnCandidates[0]).join(`, `)}`),e.nbaRows&&e.nbaRows.length>0&&t.push(`Table 'nba' (Next Best Action): columns are ${Object.keys(e.nbaRows[0]).join(`, `)}`),t.join(`
`)}async function i(e,t,i){t.customerProfiles&&(n.default.tables.customers={data:t.customerProfiles}),t.recentTxns&&(n.default.tables.transactions={data:t.recentTxns}),t.churnCandidates&&(n.default.tables.churn={data:t.churnCandidates}),t.nbaRows&&(n.default.tables.nba={data:t.nbaRows});let a=`You are a Text-to-SQL engine for an AI Business Intelligence Dashboard.
You have access to an in-memory SQL database (AlaSQL) with the following tables:
${r(t)}

Your task is to translate the user's natural language question into a VALID SQL query that can be executed by AlaSQL.
RULES:
1. ONLY return the raw SQL string. No markdown formatting, no backticks, no explanations. Just the SQL.
2. Use standard SQL syntax supported by AlaSQL.
3. If asking for "top N", use "SELECT TOP N ...". Wait, alasql supports LIMIT. Use "LIMIT N" at the end of the query.
4. ONLY query the tables and columns provided in the schema above. Do not hallucinate columns.
5. Example output: SELECT * FROM customers WHERE segment = 'HNI' ORDER BY clv DESC LIMIT 10
`;try{let t=await fetch(`https://api.anthropic.com/v1/messages`,{method:`POST`,headers:{"x-api-key":i,"anthropic-version":`2023-06-01`,"content-type":`application/json`,"anthropic-dangerous-direct-browser-access":`true`},body:JSON.stringify({model:`claude-3-5-haiku-20241022`,max_tokens:300,system:a,messages:[{role:`user`,content:e}]})});if(!t.ok)throw Error(`Failed to generate SQL: HTTP ${t.status}`);let r=(await t.json()).content?.[0]?.text||``;r=r.replace(/```sql/gi,``).replace(/```/g,``).trim(),console.log(`Generated SQL:`,r);let o=(0,n.default)(r);return{sql:r,results:o}}catch(e){throw console.error(`SQL Engine Error:`,e),e}}export{i as generateAndExecuteSQL};