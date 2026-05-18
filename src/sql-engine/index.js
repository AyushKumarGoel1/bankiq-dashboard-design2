import alasql from 'alasql';

// Build a schema description string for the LLM
function buildSchemaDescription(data) {
  const schemas = [];
  
  if (data.customerProfiles && data.customerProfiles.length > 0) {
    schemas.push(`Table 'customers': columns are ${Object.keys(data.customerProfiles[0]).join(', ')}`);
  }
  if (data.recentTxns && data.recentTxns.length > 0) {
    schemas.push(`Table 'transactions': columns are ${Object.keys(data.recentTxns[0]).join(', ')}`);
  }
  if (data.churnCandidates && data.churnCandidates.length > 0) {
    schemas.push(`Table 'churn': columns are ${Object.keys(data.churnCandidates[0]).join(', ')}`);
  }
  if (data.nbaRows && data.nbaRows.length > 0) {
    schemas.push(`Table 'nba' (Next Best Action): columns are ${Object.keys(data.nbaRows[0]).join(', ')}`);
  }
  
  return schemas.join('\n');
}

export async function generateAndExecuteSQL(query, data, apiKey) {
  // 1. Register tables in alasql
  if (data.customerProfiles) alasql.tables.customers = { data: data.customerProfiles };
  if (data.recentTxns) alasql.tables.transactions = { data: data.recentTxns };
  if (data.churnCandidates) alasql.tables.churn = { data: data.churnCandidates };
  if (data.nbaRows) alasql.tables.nba = { data: data.nbaRows };

  const schemaStr = buildSchemaDescription(data);
  
  const systemPrompt = `You are a Text-to-SQL engine for an AI Business Intelligence Dashboard.
You have access to an in-memory SQL database (AlaSQL) with the following tables:
${schemaStr}

Your task is to translate the user's natural language question into a VALID SQL query that can be executed by AlaSQL.
RULES:
1. ONLY return the raw SQL string. No markdown formatting, no backticks, no explanations. Just the SQL.
2. Use standard SQL syntax supported by AlaSQL.
3. If asking for "top N", use "SELECT TOP N ...". Wait, alasql supports LIMIT. Use "LIMIT N" at the end of the query.
4. ONLY query the tables and columns provided in the schema above. Do not hallucinate columns.
5. Example output: SELECT * FROM customers WHERE segment = 'HNI' ORDER BY clv DESC LIMIT 10
`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: 'user', content: query }],
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to generate SQL: HTTP ${res.status}`);
    }

    const json = await res.json();
    let sql = json.content?.[0]?.text || '';
    
    // Clean up SQL just in case LLM added markdown backticks
    sql = sql.replace(/```sql/gi, '').replace(/```/g, '').trim();

    console.log("Generated SQL:", sql);

    // 2. Execute SQL
    const results = alasql(sql);
    
    return {
      sql,
      results
    };

  } catch (error) {
    console.error("SQL Engine Error:", error);
    throw error;
  }
}
