// ============================================================
// COLUMN NAME CONSTANTS — single source of truth for CSV field names
// ============================================================
export const CORE = {
  CUSTOMER_ID: 'Customer_ID', NAME: 'Customer_Name', ACCOUNT_TYPE: 'Account_Type',
  CITY: 'City', CREDIT_SCORE: 'Credit_Score', BALANCE: 'Available_Balance_INR',
  LOAN_PROFILE: 'Loan_Profile', KYC: 'KYC_Status', BRANCH: 'Branch_Name',
};
export const DEMO = {
  CUSTOMER_ID: 'Customer_ID', NAME: 'Customer_Name', GENDER: 'Gender',
  AGE: 'Age', OCCUPATION: 'Occupation', SEGMENT: 'Customer_Segment',
  RISK: 'Risk_Profile', INCOME: 'Annual_Income_INR', CITY: 'Residential_City',
  STATE: 'Residential_State', HAS_LOAN: 'Has_Active_Loan', CHANNEL: 'Preferred_Channel',
};
export const LOAN = {
  LOAN_ID: 'Loan_ID', CUSTOMER_ID: 'Customer_ID', TYPE: 'Loan_Type',
  AMOUNT: 'Loan_Amount_INR', RATE: 'Interest_Rate', TENURE: 'Tenure_Months',
  EMI: 'EMI_Amount', STATUS: 'Loan_Status', CIBIL: 'CIBIL_Score',
  INCOME: 'Monthly_Income_INR',
};
export const CRM = {
  CUSTOMER_ID: 'Customer_ID', SEGMENT: 'Customer_Segment', SENTIMENT: 'Customer_Sentiment',
  CHANNEL: 'Preferred_Communication_Channel', LAST_DATE: 'Last_Interaction_Date',
  SERVICE_REQ: 'Last_Service_Request', STATUS: 'Service_Request_Status',
  TICKETS: 'Number_Of_Open_Tickets', CROSS_SELL: 'Cross_Sell_Opportunity',
  CLV: 'Estimated_Customer_Lifetime_Value', RM: 'Assigned_Relationship_Manager',
};
export const CREDIT = {
  CUSTOMER_ID: 'Customer_ID', CIBIL: 'Current_CIBIL_Score', MISSED: 'Missed_Payments_Last_12M',
  SPEND: 'Average_Monthly_Spend_INR', FRAUD: 'Fraud_Flag', RISK: 'Risk_Category',
  PAYMENT: 'Payment_Behavior', ACTIVE_LOANS: 'Number_Of_Active_Loans',
  DEBT: 'Outstanding_Debt_INR', CREDIT_LIMIT: 'Total_Credit_Limit_INR',
  BANKING_YEARS: 'Banking_Relationship_Years',
};
export const TXN = {
  CUSTOMER_ID: 'Customer_ID', TYPE: 'Transaction_Type', CHANNEL: 'Transaction_Channel',
  AMOUNT: 'Transaction_Amount_INR', DATETIME: 'Transaction_Date_Time',
  STATUS: 'Transaction_Status', FRAUD: 'Fraud_Alert', RISK: 'Operational_Risk_Flag',
  REMARKS: 'Transaction_Remarks',
};
export const PRODUCTS = {
  CUSTOMER_ID: 'Customer_ID', NAME: 'Product_Name', STATUS: 'Product_Status',
  BALANCE: 'Product_Balance_INR', CROSS_SELL: 'Cross_Sell_Eligible',
  DIGITAL: 'Digital_Product_Usage', RISK: 'Product_Risk_Level',
};
export const BANKDEM = {
  CUSTOMER_ID: 'Customer_ID', CITY: 'City', CATEGORY: 'Customer_Category',
  REGION: 'Region', DIGITAL: 'Digital_Banking_User', PORTFOLIO: 'Estimated_Portfolio_Value_INR',
  PROFIT_SCORE: 'Customer_Profitability_Score', KYC: 'KYC_Status',
};

// Type coercers
export const toFloat = (v, fallback = 0) => { const n = parseFloat(v); return isNaN(n) ? fallback : n; };
export const toInt = (v, fallback = 0) => { const n = parseInt(v, 10); return isNaN(n) ? fallback : n; };
export const toBool = (v) => typeof v === 'string' && v.trim().toLowerCase() === 'yes';
export const safe = (v) => (v == null || v === '' ? null : v.trim());
