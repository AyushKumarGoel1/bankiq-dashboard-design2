import pandas as pd
from sqlalchemy import text
from database.sqlite_db import engine
import random

# Helper functions
def safe_val(val):
    if pd.isna(val): return None
    if isinstance(val, str):
        val = val.strip()
        return None if val == '' else val
    return val

def to_float(val, fallback=0.0):
    try: return float(val)
    except: return fallback

def to_int(val, fallback=0):
    try: return int(val)
    except: return fallback

def to_bool(val):
    if pd.isna(val): return False
    return str(val).strip().lower() == 'yes'

def pct(val, total):
    if total == 0: return 0.0
    return round((val / total) * 100, 1)

def fmt2(val):
    return round(float(val), 2)

def make_map(df):
    res = {}
    for _, row in df.iterrows():
        cid = row.get('Customer_ID')
        if pd.isna(cid): continue
        if cid not in res:
            res[cid] = row.to_dict()
    return res

def compute_kpis(core, demo, loan, crm, credit, txn, products, bankdem):
    totalCustomers = len(core)
    deposit_accs = core[core['Account_Type'].isin(['Savings', 'Current'])]
    totalDeposits = fmt2(deposit_accs['Available_Balance_INR'].astype(float).sum() / 1e7)
    totalLoanBook = fmt2(loan['Loan_Amount_INR'].astype(float).sum() / 1e7)
    
    avgCreditScore = round(core['Credit_Score'].astype(float).mean()) if not core.empty else 0
    avgBalance = fmt2(core['Available_Balance_INR'].astype(float).mean() / 1e5)
    avgCLV = fmt2(crm['Estimated_Customer_Lifetime_Value'].astype(float).mean() / 1e5)
    totalTxnVol = fmt2(txn['Transaction_Amount_INR'].astype(float).sum() / 1e7)
    
    txn['fraud_bool'] = txn['Fraud_Alert'].apply(to_bool)
    fraudCount = int(txn['fraud_bool'].sum())
    fraudAlertPct = pct(fraudCount, len(txn))
    
    avgAnnualIncome = fmt2(demo['Annual_Income_INR'].astype(float).mean() / 1e5)
    avgPortfolioValue = fmt2(bankdem['Estimated_Portfolio_Value_INR'].astype(float).mean() / 1e5)
    avgInterestRate = fmt2(loan['Interest_Rate'].astype(float).mean())
    
    bankdem['digital_bool'] = bankdem['Digital_Banking_User'].apply(to_bool)
    digitalCount = int(bankdem['digital_bool'].sum())
    digitalAdoptionPct = round((digitalCount / len(bankdem)) * 100) if len(bankdem) > 0 else 0
    
    products['cross_sell_bool'] = products['Cross_Sell_Eligible'].apply(to_bool)
    crossSellEligible = int(products['cross_sell_bool'].sum())
    
    totalLoanCount = len(loan)
    activeLoanCount = len(loan[loan['Loan_Status'] != 'Closed'])
    
    return {
        "totalCustomers": totalCustomers, "totalDeposits": totalDeposits, "totalLoanBook": totalLoanBook,
        "avgCreditScore": avgCreditScore, "avgBalance": avgBalance, "avgCLV": avgCLV,
        "totalTxnVol": totalTxnVol, "fraudAlertPct": fraudAlertPct, "fraudCount": fraudCount,
        "avgAnnualIncome": avgAnnualIncome, "avgPortfolioValue": avgPortfolioValue,
        "avgInterestRate": avgInterestRate, "digitalAdoptionPct": digitalAdoptionPct,
        "crossSellEligible": crossSellEligible, "totalLoanCount": totalLoanCount,
        "activeLoanCount": activeLoanCount
    }

def compute_segmentation(core, demo, credit, bankdem):
    totalDemo = len(demo)
    
    # segments
    segCount = demo['Customer_Segment'].value_counts()
    segments = [{"seg": k, "count": int(v), "pct": pct(v, totalDemo)} for k, v in segCount.items()]
    
    # risk profiles
    riskCount = demo['Risk_Profile'].value_counts()
    riskProfiles = [{"risk": k, "count": int(v), "pct": pct(v, totalDemo)} for k, v in riskCount.items()]
    
    # city distribution
    cityCount = core['City'].value_counts().head(5)
    cityDistribution = [{"city": k, "count": int(v)} for k, v in cityCount.items()]
    
    # account types
    acctCount = core['Account_Type'].value_counts()
    accountTypes = [{"type": k, "count": int(v)} for k, v in acctCount.items()]
    
    # top occupations
    occCount = demo['Occupation'].value_counts().head(5)
    topOccupations = [{"occ": k, "count": int(v)} for k, v in occCount.items()]
    
    # regions
    regCount = bankdem['Region'].value_counts()
    regions = [{"region": k, "count": int(v), "pct": pct(v, len(bankdem))} for k, v in regCount.items()]
    
    # credit risk
    creditRiskCount = credit['Risk_Category'].value_counts()
    creditRisk = [{"cat": k, "count": int(v), "pct": pct(v, len(credit))} for k, v in creditRiskCount.items()]
    
    return {
        "segments": segments, "riskProfiles": riskProfiles, "cityDistribution": cityDistribution,
        "accountTypes": accountTypes, "topOccupations": topOccupations, "regions": regions, "creditRisk": creditRisk
    }

def compute_loan(loan):
    totalLoans = len(loan)
    
    ltCount = loan['Loan_Type'].value_counts()
    loanTypes = [{"type": str(k).replace(' Loan', ''), "count": int(v), "pct": pct(v, totalLoans)} for k, v in ltCount.items()]
    
    totalLoanAmt = loan['Loan_Amount_INR'].astype(float).sum()
    ltAmt = loan.groupby('Loan_Type')['Loan_Amount_INR'].apply(lambda x: x.astype(float).sum()).sort_values(ascending=False)
    loanBookByType = [{"type": str(k).replace(' Loan', ''), "crore": fmt2(v / 1e7), "pct": pct(v, totalLoanAmt)} for k, v in ltAmt.items()]
    
    lsCount = loan['Loan_Status'].value_counts()
    loanStatus = [{"status": k, "count": int(v)} for k, v in lsCount.items()]
    
    avgInterestRate = fmt2(loan['Interest_Rate'].astype(float).mean())
    return {"loanTypes": loanTypes, "loanBookByType": loanBookByType, "loanStatus": loanStatus, "avgInterestRate": avgInterestRate}

def compute_transactions(txn):
    chCount = txn['Transaction_Channel'].value_counts().head(5)
    channels = [{"ch": k, "count": int(v)} for k, v in chCount.items()]
    
    ttCount = txn['Transaction_Type'].value_counts().head(8)
    txnTypes = [{"type": k, "count": int(v)} for k, v in ttCount.items()]
    
    # Monthly trend
    txn_copy = txn.copy()
    txn_copy['month'] = txn_copy['Transaction_Date_Time'].astype(str).str[:7]
    monthly = txn_copy.groupby('month')['Transaction_Amount_INR'].apply(lambda x: x.astype(float).sum()).sort_index().tail(12)
    
    MN = { '01':'Jan','02':'Feb','03':'Mar','04':'Apr','05':'May','06':'Jun','07':'Jul','08':'Aug','09':'Sep','10':'Oct','11':'Nov','12':'Dec' }
    monthlyTxnTrend = []
    for k, v in monthly.items():
        if len(k) >= 7:
            m_str = f"{MN.get(k[5:7], '')}'{k[2:4]}"
            monthlyTxnTrend.append({"month": m_str, "vol": fmt2(v / 1e7)})
            
    recentTxns = []
    sorted_txn = txn.sort_values(by='Transaction_Date_Time', ascending=False).head(20)
    for _, r in sorted_txn.iterrows():
        recentTxns.append({
            "customerId": safe_val(r['Customer_ID']),
            "type": safe_val(r['Transaction_Type']),
            "channel": safe_val(r['Transaction_Channel']),
            "amount": to_float(r['Transaction_Amount_INR']),
            "datetime": safe_val(r['Transaction_Date_Time']),
            "status": safe_val(r['Transaction_Status']),
            "fraud": to_bool(r['Fraud_Alert']),
            "risk": safe_val(r['Operational_Risk_Flag'])
        })
        
    return {"channels": channels, "txnTypes": txnTypes, "monthlyTxnTrend": monthlyTxnTrend, "recentTxns": recentTxns}

def compute_crm(crm):
    sentCount = crm['Customer_Sentiment'].value_counts()
    sentiments = [{"s": k, "count": int(v), "pct": pct(v, len(crm))} for k, v in sentCount.items()]
    
    csCount = crm['Cross_Sell_Opportunity'].value_counts().head(5)
    crossSell = [{"product": k, "count": int(v)} for k, v in csCount.items()]
    
    pbCount = crm['Service_Request_Status'].value_counts()
    serviceStatus = [{"status": k, "count": int(v)} for k, v in pbCount.items()]
    
    return {"sentiments": sentiments, "crossSell": crossSell, "serviceStatus": serviceStatus}

def compute_credit(credit):
    pbCount = credit['Payment_Behavior'].value_counts()
    paymentBehavior = [{"behavior": k, "count": int(v), "pct": pct(v, len(credit))} for k, v in pbCount.items()]
    return {"paymentBehavior": paymentBehavior}

def compute_products(products):
    prodCount = products['Product_Name'].value_counts()
    bankingProducts = [{"product": k, "count": int(v)} for k, v in prodCount.items()]
    products['cross_sell_bool'] = products['Cross_Sell_Eligible'].apply(to_bool)
    crossSellEligible = int(products['cross_sell_bool'].sum())
    return {"bankingProducts": bankingProducts, "crossSellEligible": crossSellEligible}

def compute_churn(demo, crm, credit, txn):
    crm_map = make_map(crm)
    credit_map = make_map(credit)
    fraud_txns = set(txn[txn['Fraud_Alert'].apply(to_bool)]['Customer_ID'].dropna())
    
    scored = []
    for _, d in demo.iterrows():
        id = d['Customer_ID']
        cr = crm_map.get(id, {})
        cb = credit_map.get(id, {})
        
        sentiment = safe_val(cr.get('Customer_Sentiment', ''))
        risk = safe_val(cb.get('Risk_Category', ''))
        missed = to_int(cb.get('Missed_Payments_Last_12M', 0))
        fraud = to_bool(cb.get('Fraud_Flag', 'No')) or (id in fraud_txns)
        tickets = to_int(cr.get('Number_Of_Open_Tickets', 0))
        
        score = 0
        if risk == 'High Risk': score += 30
        elif risk == 'Medium Risk': score += 10
        
        if sentiment == 'Dissatisfied': score += 20
        elif sentiment == 'Neutral': score += 5
        
        score += missed * 10
        if fraud: score += 15
        score += tickets * 3
        
        if score > 0:
            scored.append({
                "id": id, "name": safe_val(d['Customer_Name']) or id, "segment": safe_val(d['Customer_Segment']),
                "risk": risk, "sentiment": sentiment, "missed": missed, "fraudFlag": fraud, "score": score,
                "tickets": tickets, "rm": safe_val(cr.get('Assigned_Relationship_Manager', 'Unassigned'))
            })
            
    scored.sort(key=lambda x: x['score'], reverse=True)
    high_risk_count = len([c for c in scored if c['score'] >= 60])
    churnRate = pct(high_risk_count, len(demo))
    atRiskCount = len([c for c in scored if c['score'] >= 40])
    
    return {"churnCandidates": scored[:20], "churnRate": churnRate, "atRiskCount": atRiskCount}

def compute_nba(demo, crm, credit):
    crm_map = make_map(crm)
    credit_map = make_map(credit)
    
    rows = []
    for _, d in demo.iterrows():
        id = d['Customer_ID']
        cr = crm_map.get(id)
        if not cr or not safe_val(cr.get('Cross_Sell_Opportunity')):
            continue
            
        cb = credit_map.get(id, {})
        product = safe_val(cr.get('Cross_Sell_Opportunity'))
        cibil = to_int(cb.get('Current_CIBIL_Score', 0))
        income = to_float(d['Annual_Income_INR'])
        seg = safe_val(d['Customer_Segment'])
        
        base = 80 if cibil > 750 else 70 if cibil > 700 else 60 if cibil > 650 else 50
        segBonus = 8 if seg == 'HNI' else 5 if seg == 'Corporate' else 3 if seg == 'Premium' else 0
        prob = min(95, base + segBonus + random.randint(0, 4))
        
        loanValue = fmt2((income * 0.4) / 1e5) if 'Loan' in str(product) else fmt2((income * 0.1) / 1e5)
        
        rows.append({
            "id": id, "name": safe_val(d['Customer_Name']) or id, "segment": seg,
            "product": product, "cibil": cibil or 'N/A', "income": fmt2(income / 1e5),
            "prob": prob, "estValue": loanValue,
            "urgency": 'High' if prob > 78 else 'Medium' if prob > 65 else 'Low'
        })
        
    rows.sort(key=lambda x: x['prob'], reverse=True)
    avgProb = fmt2(sum(r['prob'] for r in rows) / len(rows)) if rows else 0
    return {"nbaRows": rows[:20], "totalOpportunities": len(rows), "avgProb": avgProb}

def compute_revenue(loan, bankdem, txn):
    totalLoanAmt = loan['Loan_Amount_INR'].astype(float).sum()
    avgRate = loan['Interest_Rate'].astype(float).mean() / 100
    annualInterestIncome = fmt2((totalLoanAmt * avgRate) / 1e7)
    feeIncome = fmt2((txn['Transaction_Amount_INR'].astype(float).sum() * 0.005) / 1e7)
    totalRevenue = fmt2(annualInterestIncome + feeIncome)
    avgPortfolio = fmt2(bankdem['Estimated_Portfolio_Value_INR'].astype(float).mean())
    
    # Monthly trend
    txn_copy = txn.copy()
    txn_copy['month'] = txn_copy['Transaction_Date_Time'].astype(str).str[:7]
    monthly = txn_copy.groupby('month')['Transaction_Amount_INR'].apply(lambda x: x.astype(float).sum()).sort_index().tail(12)
    
    MN = { '01':'Jan','02':'Feb','03':'Mar','04':'Apr','05':'May','06':'Jun','07':'Jul','08':'Aug','09':'Sep','10':'Oct','11':'Nov','12':'Dec' }
    monthlyRevenueTrend = []
    for k, v in monthly.items():
        if len(k) >= 7:
            m_str = f"{MN.get(k[5:7], '')}'{k[2:4]}"
            monthlyRevenueTrend.append({"month": m_str, "vol": fmt2(v / 1e7)})
            
    segPortfolio = bankdem.groupby('Customer_Category')['Estimated_Portfolio_Value_INR'].apply(lambda x: x.astype(float).sum())
    totalPort = segPortfolio.sum()
    
    revenueBySegment = []
    for seg, port in segPortfolio.sort_values(ascending=False).items():
        revenueBySegment.append({
            "seg": seg, "rev": fmt2((port / 1e7) * avgRate * 12), "pct": pct(port, totalPort)
        })
        
    return {
        "totalRevenue": totalRevenue, "annualInterestIncome": annualInterestIncome,
        "feeIncome": feeIncome, "avgPortfolio": float(avgPortfolio),
        "monthlyRevenueTrend": monthlyRevenueTrend, "revenueBySegment": revenueBySegment
    }

def compute_customer_profiles(core, demo, crm, credit, loan, txn, bankdem):
    crm_map = make_map(crm)
    credit_map = make_map(credit)
    bd_map = make_map(bankdem)
    
    loan_by_cust = loan.groupby('Customer_ID')
    txn_count_by_cust = txn.groupby('Customer_ID').size()
    
    profiles = []
    for _, d in demo.iterrows():
        id = d['Customer_ID']
        cr = crm_map.get(id, {})
        cb = credit_map.get(id, {})
        bd = bd_map.get(id, {})
        
        loans = loan_by_cust.get_group(id) if id in loan_by_cust.groups else pd.DataFrame()
        totalLoanAmt = loans['Loan_Amount_INR'].astype(float).sum() if not loans.empty else 0
        
        profiles.append({
            "id": id, "name": safe_val(d['Customer_Name']) or id, "gender": safe_val(d['Gender']),
            "age": to_int(d['Age']), "occupation": safe_val(d['Occupation']),
            "segment": safe_val(d['Customer_Segment']), "risk": safe_val(d['Risk_Profile']),
            "income": to_float(d['Annual_Income_INR']), "city": safe_val(d['Residential_City']),
            "cibil": to_int(cb.get('Current_CIBIL_Score')), "sentiment": safe_val(cr.get('Customer_Sentiment')),
            "clv": to_float(cr.get('Estimated_Customer_Lifetime_Value')), "portfolio": to_float(bd.get('Estimated_Portfolio_Value_INR')),
            "loanCount": len(loans), "totalLoanAmt": totalLoanAmt, "txnCount": int(txn_count_by_cust.get(id, 0)),
            "paymentBehavior": safe_val(cb.get('Payment_Behavior')), "fraudFlag": to_bool(cb.get('Fraud_Flag')),
            "crossSell": safe_val(cr.get('Cross_Sell_Opportunity')), "rm": safe_val(cr.get('Assigned_Relationship_Manager'))
        })
    return profiles

def get_dashboard_data():
    # Read all tables from SQLite
    core = pd.read_sql_query("SELECT * FROM core", engine)
    demo = pd.read_sql_query("SELECT * FROM demo", engine)
    loan = pd.read_sql_query("SELECT * FROM loan", engine)
    crm = pd.read_sql_query("SELECT * FROM crm", engine)
    credit = pd.read_sql_query("SELECT * FROM credit", engine)
    txn = pd.read_sql_query("SELECT * FROM txn", engine)
    products = pd.read_sql_query("SELECT * FROM products", engine)
    bankdem = pd.read_sql_query("SELECT * FROM bankdem", engine)
    
    data = {
        "kpis": compute_kpis(core, demo, loan, crm, credit, txn, products, bankdem),
        **compute_segmentation(core, demo, credit, bankdem),
        **compute_loan(loan),
        **compute_transactions(txn),
        **compute_crm(crm),
        **compute_credit(credit),
        **compute_products(products),
        **compute_churn(demo, crm, credit, txn),
        **compute_nba(demo, crm, credit),
        "revenue": compute_revenue(loan, bankdem, txn),
        "customerProfiles": compute_customer_profiles(core, demo, crm, credit, loan, txn, bankdem)
    }
    return data
