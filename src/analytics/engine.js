import { CORE, DEMO, LOAN, CRM, CREDIT, TXN, PRODUCTS, BANKDEM, toFloat, toInt, toBool, safe } from '../data/schemas.js';

// ─── Helpers ────────────────────────────────────────────────
const counter = (arr, key) => arr.reduce((acc, r) => {
  const k = safe(r[key]); if (k) acc[k] = (acc[k] || 0) + 1; return acc;
}, {});
const sumField = (arr, key) => arr.reduce((s, r) => s + toFloat(r[key]), 0);
const avgField = (arr, key) => { const v = arr.map(r => toFloat(r[key])).filter(n => n > 0); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0; };
const topN = (obj, n) => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n);
const pct = (v, total) => parseFloat(((v / total) * 100).toFixed(1));
const fmt2 = (n) => parseFloat(n.toFixed(2));

// ─── KPIs ────────────────────────────────────────────────────
export function computeKpis({ core, demo, loan, crm, credit, txn, products, bankdem }) {
  const totalCustomers = core.length;
  const depositAccs = core.filter(r => ['Savings', 'Current'].includes(safe(r[CORE.ACCOUNT_TYPE])));
  const totalDeposits = fmt2(sumField(depositAccs, CORE.BALANCE) / 1e7);
  const totalLoanBook = fmt2(sumField(loan, LOAN.AMOUNT) / 1e7);
  const avgCreditScore = Math.round(avgField(core, CORE.CREDIT_SCORE));
  const avgBalance = fmt2(avgField(core, CORE.BALANCE) / 1e5);
  const avgCLV = fmt2(avgField(crm, CRM.CLV) / 1e5);
  const totalTxnVol = fmt2(sumField(txn, TXN.AMOUNT) / 1e7);
  const fraudCount = txn.filter(r => toBool(r[TXN.FRAUD])).length;
  const fraudAlertPct = parseFloat(((fraudCount / txn.length) * 100).toFixed(1));
  const avgAnnualIncome = fmt2(avgField(demo, DEMO.INCOME) / 1e5);
  const avgPortfolioValue = fmt2(avgField(bankdem, BANKDEM.PORTFOLIO) / 1e5);
  const avgInterestRate = fmt2(avgField(loan, LOAN.RATE));
  const digitalCount = bankdem.filter(r => toBool(r[BANKDEM.DIGITAL])).length;
  const digitalAdoptionPct = Math.round((digitalCount / bankdem.length) * 100);
  const crossSellEligible = products.filter(r => toBool(r[PRODUCTS.CROSS_SELL])).length;
  const totalLoanCount = loan.length;
  const activeLoanCount = loan.filter(r => safe(r[LOAN.STATUS]) !== 'Closed').length;
  return {
    totalCustomers, totalDeposits, totalLoanBook, avgCreditScore, avgBalance, avgCLV,
    totalTxnVol, fraudAlertPct, fraudCount, avgAnnualIncome, avgPortfolioValue,
    avgInterestRate, digitalAdoptionPct, crossSellEligible, totalLoanCount, activeLoanCount,
  };
}

// ─── Segmentation ─────────────────────────────────────────────
export function computeSegmentation({ core, demo, credit, bankdem }) {
  const totalDemo = demo.length;
  const segCount = counter(demo, DEMO.SEGMENT);
  const segments = Object.entries(segCount).sort((a, b) => b[1] - a[1]).map(([seg, count]) => ({ seg, count, pct: pct(count, totalDemo) }));

  const riskCount = counter(demo, DEMO.RISK);
  const riskProfiles = Object.entries(riskCount).sort((a, b) => b[1] - a[1]).map(([risk, count]) => ({ risk, count, pct: pct(count, totalDemo) }));

  const cityCount = counter(core, CORE.CITY);
  const cityDistribution = topN(cityCount, 5).map(([city, count]) => ({ city, count }));

  const acctCount = counter(core, CORE.ACCOUNT_TYPE);
  const accountTypes = Object.entries(acctCount).sort((a, b) => b[1] - a[1]).map(([type, count]) => ({ type, count }));

  const occCount = counter(demo, DEMO.OCCUPATION);
  const topOccupations = topN(occCount, 5).map(([occ, count]) => ({ occ, count }));

  const regCount = counter(bankdem, BANKDEM.REGION);
  const totalReg = bankdem.length;
  const regions = Object.entries(regCount).sort((a, b) => b[1] - a[1]).map(([region, count]) => ({ region, count, pct: pct(count, totalReg) }));

  const creditRiskCount = counter(credit, CREDIT.RISK);
  const totalCredit = credit.length;
  const creditRisk = Object.entries(creditRiskCount).sort((a, b) => b[1] - a[1]).map(([cat, count]) => ({ cat, count, pct: pct(count, totalCredit) }));

  return { segments, riskProfiles, cityDistribution, accountTypes, topOccupations, regions, creditRisk };
}

// ─── Loan Analytics ───────────────────────────────────────────
export function computeLoan({ loan }) {
  const totalLoans = loan.length;
  const ltCount = counter(loan, LOAN.TYPE);
  const loanTypes = Object.entries(ltCount).sort((a, b) => b[1] - a[1]).map(([type, count]) => ({ type: type.replace(' Loan', ''), count, pct: pct(count, totalLoans) }));

  const ltAmt = loan.reduce((acc, r) => {
    const t = safe(r[LOAN.TYPE]); if (t) acc[t] = (acc[t] || 0) + toFloat(r[LOAN.AMOUNT]); return acc;
  }, {});
  const totalLoanAmt = sumField(loan, LOAN.AMOUNT);
  const loanBookByType = Object.entries(ltAmt).sort((a, b) => b[1] - a[1]).map(([type, amt]) => ({ type: type.replace(' Loan', ''), crore: fmt2(amt / 1e7), pct: pct(amt, totalLoanAmt) }));

  const lsCount = counter(loan, LOAN.STATUS);
  const loanStatus = Object.entries(lsCount).sort((a, b) => b[1] - a[1]).map(([status, count]) => ({ status, count }));

  const avgRate = fmt2(avgField(loan, LOAN.RATE));
  return { loanTypes, loanBookByType, loanStatus, avgInterestRate: avgRate };
}

// ─── Transaction Analytics ────────────────────────────────────
export function computeTransactions({ txn }) {
  const chCount = counter(txn, TXN.CHANNEL);
  const channels = topN(chCount, 5).map(([ch, count]) => ({ ch, count }));
  const ttCount = counter(txn, TXN.TYPE);
  const txnTypes = topN(ttCount, 8).map(([type, count]) => ({ type, count }));

  const monthly = {};
  txn.forEach(r => {
    const dt = safe(r[TXN.DATETIME]);
    if (dt && r[TXN.AMOUNT]) {
      const m = dt.substring(0, 7);
      monthly[m] = (monthly[m] || 0) + toFloat(r[TXN.AMOUNT]);
    }
  });
  const MN = { '01':'Jan','02':'Feb','03':'Mar','04':'Apr','05':'May','06':'Jun','07':'Jul','08':'Aug','09':'Sep','10':'Oct','11':'Nov','12':'Dec' };
  const monthlyTxnTrend = Object.entries(monthly).sort((a, b) => a[0].localeCompare(b[0])).slice(-12).map(([k, v]) => ({ month: `${MN[k.slice(5)]}'${k.slice(2,4)}`, vol: fmt2(v / 1e7) }));

  const recentTxns = [...txn].sort((a, b) => (b[TXN.DATETIME] || '').localeCompare(a[TXN.DATETIME] || '')).slice(0, 20).map(r => ({
    customerId: safe(r[TXN.CUSTOMER_ID]),
    type: safe(r[TXN.TYPE]),
    channel: safe(r[TXN.CHANNEL]),
    amount: toFloat(r[TXN.AMOUNT]),
    datetime: safe(r[TXN.DATETIME]),
    status: safe(r[TXN.STATUS]),
    fraud: toBool(r[TXN.FRAUD]),
    risk: safe(r[TXN.RISK]),
  }));

  return { channels, txnTypes, monthlyTxnTrend, recentTxns };
}

// ─── CRM & Cross-sell ─────────────────────────────────────────
export function computeCRM({ crm }) {
  const sentCount = counter(crm, CRM.SENTIMENT);
  const totalCrm = crm.length;
  const sentiments = Object.entries(sentCount).sort((a, b) => b[1] - a[1]).map(([s, count]) => ({ s, count, pct: pct(count, totalCrm) }));

  const csCount = counter(crm, CRM.CROSS_SELL);
  const crossSell = topN(csCount, 5).map(([product, count]) => ({ product, count }));

  const pbCount = counter(crm, CRM.STATUS);
  const serviceStatus = Object.entries(pbCount).sort((a, b) => b[1] - a[1]).map(([status, count]) => ({ status, count }));

  return { sentiments, crossSell, serviceStatus };
}

// ─── Credit & Payment Behavior ───────────────────────────────
export function computeCredit({ credit }) {
  const pbCount = counter(credit, CREDIT.PAYMENT);
  const totalCredit = credit.length;
  const paymentBehavior = Object.entries(pbCount).sort((a, b) => b[1] - a[1]).map(([behavior, count]) => ({ behavior, count, pct: pct(count, totalCredit) }));
  return { paymentBehavior };
}

// ─── Banking Products ─────────────────────────────────────────
export function computeProducts({ products }) {
  const prodCount = counter(products, PRODUCTS.NAME);
  const bankingProducts = Object.entries(prodCount).sort((a, b) => b[1] - a[1]).map(([product, count]) => ({ product, count }));
  const crossSellEligible = products.filter(r => toBool(r[PRODUCTS.CROSS_SELL])).length;
  return { bankingProducts, crossSellEligible };
}

// ─── Churn Analysis (real per-customer scoring) ───────────────
export function computeChurn({ demo, crm, credit, txn }) {
  const crmMap = Object.fromEntries(crm.map(r => [r[CRM.CUSTOMER_ID], r]));
  const creditMap = {};
  credit.forEach(r => { const id = r[CREDIT.CUSTOMER_ID]; if (!creditMap[id]) creditMap[id] = r; });
  const fraudTxnCusts = new Set(txn.filter(r => toBool(r[TXN.FRAUD])).map(r => r[TXN.CUSTOMER_ID]));

  const scored = demo.map(d => {
    const id = d[DEMO.CUSTOMER_ID];
    const cr = crmMap[id] || {};
    const cb = creditMap[id] || {};
    const sentiment = safe(cr[CRM.SENTIMENT]) || '';
    const risk = safe(cb[CREDIT.RISK]) || '';
    const missed = toInt(cb[CREDIT.MISSED]);
    const fraud = toBool(cb[CREDIT.FRAUD]) || fraudTxnCusts.has(id);
    const tickets = toInt(cr[CRM.TICKETS]);
    const score = (risk === 'High Risk' ? 30 : risk === 'Medium Risk' ? 10 : 0)
                + (sentiment === 'Dissatisfied' ? 20 : sentiment === 'Neutral' ? 5 : 0)
                + missed * 10
                + (fraud ? 15 : 0)
                + tickets * 3;
    return {
      id, name: safe(d[DEMO.NAME]) || id, segment: safe(d[DEMO.SEGMENT]),
      risk, sentiment, missed, fraudFlag: fraud, score, tickets,
      rm: safe(cr[CRM.RM]) || 'Unassigned',
    };
  }).filter(c => c.score > 0).sort((a, b) => b.score - a.score);

  const churnRate = parseFloat(((scored.filter(c => c.score >= 60).length / demo.length) * 100).toFixed(1));
  const atRiskCount = scored.filter(c => c.score >= 40).length;
  return { churnCandidates: scored.slice(0, 20), churnRate, atRiskCount };
}

// ─── Next Best Action (from real CRM data) ───────────────────
export function computeNBA({ demo, crm, credit }) {
  const crmMap = Object.fromEntries(crm.map(r => [r[CRM.CUSTOMER_ID], r]));
  const creditMap = Object.fromEntries(credit.map(r => [r[CREDIT.CUSTOMER_ID], r]));

  const rows = demo.filter(d => {
    const cr = crmMap[d[DEMO.CUSTOMER_ID]];
    return cr && safe(cr[CRM.CROSS_SELL]);
  }).map(d => {
    const id = d[DEMO.CUSTOMER_ID];
    const cr = crmMap[id] || {};
    const cb = creditMap[id] || {};
    const product = safe(cr[CRM.CROSS_SELL]);
    const cibil = toInt(cb[CREDIT.CIBIL]);
    const income = toFloat(d[DEMO.INCOME]);
    const seg = safe(d[DEMO.SEGMENT]);
    // Rough success probability based on CIBIL + segment
    const base = cibil > 750 ? 80 : cibil > 700 ? 70 : cibil > 650 ? 60 : 50;
    const segBonus = seg === 'HNI' ? 8 : seg === 'Corporate' ? 5 : seg === 'Premium' ? 3 : 0;
    const prob = Math.min(95, base + segBonus + Math.floor(Math.random() * 5));
    const loanValue = product?.includes('Loan') ? fmt2((income * 0.4) / 1e5) : fmt2((income * 0.1) / 1e5);
    return {
      id, name: safe(d[DEMO.NAME]) || id, segment: seg,
      product, cibil: cibil || 'N/A', income: fmt2(income / 1e5),
      prob, estValue: loanValue,
      urgency: prob > 78 ? 'High' : prob > 65 ? 'Medium' : 'Low',
    };
  }).sort((a, b) => b.prob - a.prob);

  const totalOpportunities = rows.length;
  const avgProb = rows.length ? fmt2(rows.reduce((s, r) => s + r.prob, 0) / rows.length) : 0;
  return { nbaRows: rows.slice(0, 20), totalOpportunities, avgProb };
}

// ─── Revenue Proxy (from loan + portfolio) ───────────────────
export function computeRevenue({ loan, bankdem, txn }) {
  const totalLoanAmt = sumField(loan, LOAN.AMOUNT);
  const avgRate = avgField(loan, LOAN.RATE) / 100;
  const annualInterestIncome = fmt2((totalLoanAmt * avgRate) / 1e7);
  const feeIncome = fmt2((sumField(txn, TXN.AMOUNT) * 0.005) / 1e7);
  const totalRevenue = fmt2(annualInterestIncome + feeIncome);
  const avgPortfolio = avgField(bankdem, BANKDEM.PORTFOLIO);

  const MN = { '01':'Jan','02':'Feb','03':'Mar','04':'Apr','05':'May','06':'Jun','07':'Jul','08':'Aug','09':'Sep','10':'Oct','11':'Nov','12':'Dec' };
  const monthly = {};
  txn.forEach(r => {
    const dt = safe(r[TXN.DATETIME]);
    if (dt) { const m = dt.substring(0, 7); monthly[m] = (monthly[m] || 0) + toFloat(r[TXN.AMOUNT]); }
  });
  const monthlyRevenueTrend = Object.entries(monthly).sort((a, b) => a[0].localeCompare(b[0])).slice(-12).map(([k, v]) => ({ month: `${MN[k.slice(5)]}'${k.slice(2,4)}`, vol: fmt2(v / 1e7) }));

  // Revenue by segment (approximate from portfolio proportion)
  // Uses bankdem Customer_Category as segment proxy
  const segPortfolio = {};
  bankdem.forEach(r => {
    const cat = safe(r[BANKDEM.CATEGORY]); const val = toFloat(r[BANKDEM.PORTFOLIO]);
    if (cat) segPortfolio[cat] = (segPortfolio[cat] || 0) + val;
  });
  const totalPort = Object.values(segPortfolio).reduce((a, b) => a + b, 0);
  const revenueBySegment = Object.entries(segPortfolio).sort((a, b) => b[1] - a[1]).map(([seg, port]) => ({
    seg, rev: fmt2((port / 1e7) * avgRate * 12), pct: pct(port, totalPort)
  }));

  return { totalRevenue, annualInterestIncome, feeIncome, avgPortfolio, monthlyRevenueTrend, revenueBySegment };
}

// ─── Customer Profiles (joined table) ─────────────────────────
export function computeCustomerProfiles({ core, demo, crm, credit, loan, txn, bankdem }) {
  const crmMap = Object.fromEntries(crm.map(r => [r[CRM.CUSTOMER_ID], r]));
  const creditMap = Object.fromEntries(credit.map(r => [r[CREDIT.CUSTOMER_ID], r]));
  const bdMap = Object.fromEntries(bankdem.map(r => [r[BANKDEM.CUSTOMER_ID], r]));
  const loanByCustomer = loan.reduce((acc, r) => {
    const id = r[LOAN.CUSTOMER_ID]; if (!acc[id]) acc[id] = []; acc[id].push(r); return acc;
  }, {});
  const txnCountByCustomer = txn.reduce((acc, r) => {
    const id = r[TXN.CUSTOMER_ID]; acc[id] = (acc[id] || 0) + 1; return acc;
  }, {});

  return demo.map(d => {
    const id = d[DEMO.CUSTOMER_ID];
    const cr = crmMap[id] || {};
    const cb = creditMap[id] || {};
    const bd = bdMap[id] || {};
    const loans = loanByCustomer[id] || [];
    const totalLoanAmt = loans.reduce((s, l) => s + toFloat(l[LOAN.AMOUNT]), 0);
    return {
      id, name: safe(d[DEMO.NAME]) || id, gender: safe(d[DEMO.GENDER]),
      age: toInt(d[DEMO.AGE]), occupation: safe(d[DEMO.OCCUPATION]),
      segment: safe(d[DEMO.SEGMENT]), risk: safe(d[DEMO.RISK]),
      income: toFloat(d[DEMO.INCOME]), city: safe(d[DEMO.CITY]),
      cibil: toInt(cb[CREDIT.CIBIL]), sentiment: safe(cr[CRM.SENTIMENT]),
      clv: toFloat(cr[CRM.CLV]), portfolio: toFloat(bd[BANKDEM.PORTFOLIO]),
      loanCount: loans.length, totalLoanAmt, txnCount: toInt(txnCountByCustomer[id]),
      paymentBehavior: safe(cb[CREDIT.PAYMENT]), fraudFlag: toBool(cb[CREDIT.FRAUD]),
      crossSell: safe(cr[CRM.CROSS_SELL]), rm: safe(cr[CRM.RM]),
    };
  });
}

// ─── Master Compute ───────────────────────────────────────────
export function computeAll(csvs) {
  return {
    kpis: computeKpis(csvs),
    ...computeSegmentation(csvs),
    ...computeLoan(csvs),
    ...computeTransactions(csvs),
    ...computeCRM(csvs),
    ...computeCredit(csvs),
    ...computeProducts(csvs),
    ...computeChurn(csvs),
    ...computeNBA(csvs),
    revenue: computeRevenue(csvs),
    customerProfiles: computeCustomerProfiles(csvs),
  };
}
