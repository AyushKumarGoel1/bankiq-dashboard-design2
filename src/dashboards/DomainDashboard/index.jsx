import { useState } from 'react';
import { useData } from '../../context/DataContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { Navbar } from '../../components/Navbar.jsx';
import { KpiCard } from '../../components/UI.jsx';
import { DraggableCard } from '../../components/DraggableCard.jsx';
import AICopilot from '../../ai/AICopilot.jsx';

const DOMAIN_CONFIG = {
  hr: {
    label:'Agentic HR', icon:'🧑‍💼', color:'#6B44C8',
    subs:[
      { id:'workforce', label:'Workforce Analytics', icon:'📊' },
      { id:'attrition', label:'Employee Attrition', icon:'📉' },
      { id:'skills', label:'Skill Gap Analysis', icon:'🎓' },
      { id:'hiring', label:'Hiring Intelligence', icon:'🎯' },
      { id:'productivity', label:'Productivity Insights', icon:'⚡' },
      { id:'engagement', label:'Employee Engagement', icon:'💬' },
    ],
    kpis: (d) => [
      { label:'Total Employees', value:String(d.kpis.totalCustomers), sub:'Across all branches', color:'#6B44C8', drill: d.customerProfiles },
      { label:'Attrition Risk', value:`${d.churnRate}%`, sub:`${d.atRiskCount} at-risk`, color:'#D92D3E', drill: d.churnCandidates },
      { label:'Satisfied Staff', value:`${d.sentiments.find(s=>s.s==='Satisfied')?.pct||0}%`, sub:'Engagement score', color:'#1A7D4A', drill: d.customerProfiles.filter(c=>c.sentiment==='Satisfied') },
      { label:'Avg CIBIL/Score', value:String(d.kpis.avgCreditScore), sub:'Performance proxy', color:'#E67E00', drill: d.customerProfiles },
    ],
    questions:['Which teams have highest attrition risk?','Skill gaps by department?','Hiring priority areas?'],
  },
  supply: {
    label:'Supply Chain', icon:'🔗', color:'#0097A7',
    subs:[
      { id:'vendor', label:'Vendor Performance', icon:'🏭' },
      { id:'logistics', label:'Logistics Analytics', icon:'🚛' },
      { id:'inventory', label:'Inventory Optimization', icon:'📦' },
      { id:'demand', label:'Demand Forecasting', icon:'📈' },
      { id:'procurement', label:'Procurement Intelligence', icon:'🛒' },
      { id:'delivery', label:'Delivery Risk', icon:'⚠️' },
    ],
    kpis: (d) => [
      { label:'Product Lines', value:String(d.bankingProducts.length), sub:'Active SKUs', color:'#0097A7', drill: d.bankingProducts },
      { label:'Cross-sell Items', value:String(d.kpis.crossSellEligible), sub:'Eligible products', color:'#0052CC', drill: d.nbaRows },
      { label:'Total Volume', value:`₹${d.kpis.totalTxnVol}Cr`, sub:'Transaction flow', color:'#1A7D4A', drill: d.recentTxns },
      { label:'Fraud Risk', value:`${d.kpis.fraudAlertPct}%`, sub:'Supply chain risk', color:'#D92D3E', drill: d.recentTxns.filter(t=>t.fraud) },
    ],
    questions:['Which vendors are underperforming?','Demand forecast next quarter?','Delivery risk hotspots?'],
  },
  ops: {
    label:'Production & Ops', icon:'⚙️', color:'#E67E00',
    subs:[
      { id:'efficiency', label:'Production Efficiency', icon:'⚡' },
      { id:'bottlenecks', label:'Operational Bottlenecks', icon:'🚧' },
      { id:'resources', label:'Resource Utilization', icon:'📊' },
      { id:'downtime', label:'Downtime Analytics', icon:'🔴' },
      { id:'capacity', label:'Capacity Planning', icon:'🏗️' },
      { id:'quality', label:'Quality Monitoring', icon:'✅' },
    ],
    kpis: (d) => [
      { label:'Txn Operations', value:String(d.txnTypes.reduce((s,t)=>s+t.count,0)), sub:'Total ops volume', color:'#E67E00', drill: d.recentTxns },
      { label:'Channels Active', value:String(d.channels.length), sub:'Operational channels', color:'#0052CC', drill: d.recentTxns },
      { label:'Digital Rate', value:`${d.kpis.digitalAdoptionPct}%`, sub:'Process automation', color:'#1A7D4A', drill: d.customerProfiles },
      { label:'Failed Txns', value:`${d.kpis.fraudAlertPct}%`, sub:'Operational risk', color:'#D92D3E', drill: d.recentTxns.filter(t=>t.fraud) },
    ],
    questions:['Where are the operational bottlenecks?','Which channel is most efficient?','Capacity utilization by branch?'],
  },
  risk: {
    label:'Risk & Compliance', icon:'🛡️', color:'#D92D3E',
    subs:[
      { id:'fraud', label:'Fraud Detection', icon:'🔍' },
      { id:'compliance', label:'Compliance Monitoring', icon:'📋' },
      { id:'credit', label:'Credit Risk Assessment', icon:'💳' },
      { id:'aml', label:'AML Analytics', icon:'🕵️' },
      { id:'oprisk', label:'Operational Risk', icon:'⚠️' },
      { id:'regulatory', label:'Regulatory Insights', icon:'⚖️' },
    ],
    kpis: (d) => [
      { label:'Fraud Rate', value:`${d.kpis.fraudAlertPct}%`, sub:`${d.kpis.fraudCount} flagged txns`, color:'#D92D3E', drill: d.recentTxns.filter(t=>t.fraud) },
      { label:'High Risk', value:String(d.creditRisk.find(r=>r.cat==='High Risk')?.count||0), sub:'Credit risk customers', color:'#D92D3E', drill: d.customerProfiles.filter(c=>c.risk==='High Risk') },
      { label:'Missed EMIs', value:String(d.churnCandidates.filter(c=>c.missed>0).length), sub:'Payment default risk', color:'#E67E00', drill: d.churnCandidates.filter(c=>c.missed>0) },
      { label:'Avg CIBIL', value:String(d.kpis.avgCreditScore), sub:'Portfolio health', color:'#1A7D4A', drill: d.customerProfiles },
    ],
    questions:['Top fraud patterns?','Which customers are AML risk?','Credit risk migration trend?','Regulatory compliance gaps?'],
  },
  sales: {
    label:'Sales & Marketing', icon:'📈', color:'#1A7D4A',
    subs:[
      { id:'campaign', label:'Campaign Performance', icon:'📣' },
      { id:'acquisition', label:'Customer Acquisition', icon:'🎯' },
      { id:'funnel', label:'Sales Funnel', icon:'🔽' },
      { id:'leads', label:'Lead Scoring', icon:'⭐' },
      { id:'conversion', label:'Conversion Analytics', icon:'✅' },
      { id:'recommendations', label:'Product Recommendations', icon:'💡' },
    ],
    kpis: (d) => [
      { label:'NBA Opportunities', value:String(d.totalOpportunities), sub:'Cross-sell pipeline', color:'#1A7D4A', drill: d.nbaRows },
      { label:'Avg Conv. Rate', value:`${d.avgProb}%`, sub:'Lead to closure', color:'#0052CC', drill: d.nbaRows },
      { label:'Top Product', value:d.crossSell[0]?.product||'N/A', sub:`${d.crossSell[0]?.count||0} leads`, color:'#E67E00', drill: d.nbaRows.filter(r=>r.product===d.crossSell[0]?.product) },
      { label:'HNI Segment', value:String(d.segments.find(s=>s.seg==='HNI')?.count||0), sub:'High-value prospects', color:'#6B44C8', drill: d.customerProfiles.filter(c=>c.segment==='HNI') },
    ],
    questions:['Which product has best conversion?','High-value customer acquisition strategy?','Campaign ROI analysis?'],
  },
  finance: {
    label:'Finance & Analytics', icon:'💹', color:'#B45309',
    subs:[
      { id:'revenue', label:'Revenue Intelligence', icon:'💰' },
      { id:'profitability', label:'Profitability Analytics', icon:'📊' },
      { id:'forecasting', label:'Financial Forecasting', icon:'🔮' },
      { id:'cost', label:'Cost Optimization', icon:'✂️' },
      { id:'expense', label:'Expense Analytics', icon:'💸' },
      { id:'kpi', label:'KPI Monitoring', icon:'📈' },
    ],
    kpis: (d) => [
      { label:'Total Revenue', value:`₹${d.revenue.totalRevenue}Cr`, sub:'Interest + fee income', color:'#B45309', drill: d.customerProfiles },
      { label:'Loan Book', value:`₹${d.kpis.totalLoanBook}Cr`, sub:`${d.kpis.activeLoanCount} active loans`, color:'#0097A7', drill: d.customerProfiles.filter(c=>c.totalLoanAmt>0) },
      { label:'Deposits', value:`₹${d.kpis.totalDeposits}Cr`, sub:'Total deposit base', color:'#1A7D4A', drill: d.customerProfiles.filter(c=>c.depositAmt>0) },
      { label:'Interest Rate', value:`${d.kpis.avgInterestRate}%`, sub:'Portfolio avg rate', color:'#E67E00', drill: d.customerProfiles },
    ],
    questions:['Revenue growth drivers?','Which product is most profitable?','Cost reduction opportunities?'],
  },
};

function SubCard({ sub, domainColor, data, theme }) {
  const [expanded, setExpanded] = useState(false);

  const getSubContent = (subId, d, t) => {
    const metrics = {
      workforce: d.segments.map(s=>({ label:s.seg, value:s.count, pct:s.pct })),
      attrition: d.churnCandidates.slice(0,5).map(c=>({ label:c.name, value:c.score, pct:Math.min(100,c.score) })),
      skills: d.topOccupations.map(o=>({ label:o.occ, value:o.count, pct:Math.round((o.count/Math.max(...d.topOccupations.map(x=>x.count)))*100) })),
      hiring: d.crossSell.map(c=>({ label:c.product, value:c.count, pct:Math.round((c.count/Math.max(...d.crossSell.map(x=>x.count)))*100) })),
      productivity: d.channels.map(c=>({ label:c.ch, value:c.count, pct:Math.round((c.count/Math.max(...d.channels.map(x=>x.count)))*100) })),
      engagement: d.sentiments.map(s=>({ label:s.s, value:s.count, pct:s.pct })),
      fraud: d.recentTxns.filter(t=>t.fraud).map((t,i)=>({ label:t.customerId, value:Math.round(t.amount/100000), pct:80 })),
      credit: d.creditRisk.map(r=>({ label:r.cat, value:r.count, pct:r.pct })),
      vendor: d.bankingProducts.slice(0,5).map(p=>({ label:p.product, value:p.count, pct:Math.round((p.count/Math.max(...d.bankingProducts.map(x=>x.count)))*100) })),
      inventory: d.loanBookByType?.slice(0,5).map(l=>({ label:l.type, value:l.crore, pct:l.pct }))||[],
      revenue: d.revenue.revenueBySegment.map(r=>({ label:r.seg, value:r.rev, pct:r.pct })),
      profitability: d.loanBookByType?.map(l=>({ label:l.type, value:l.crore, pct:l.pct }))||[],
      funnel: d.nbaRows.slice(0,5).map(r=>({ label:r.name, value:r.prob, pct:r.prob })),
      leads: d.nbaRows.slice(0,5).map(r=>({ label:`${r.name} → ${r.product}`, value:r.prob, pct:r.prob })),
    };
    return metrics[subId] || d.txnTypes.map(t=>({ label:t.type, value:t.count, pct:Math.round((t.count/Math.max(...d.txnTypes.map(x=>x.count)))*100) }));
  };

  const getRawContent = (subId, d) => {
    const raw = {
      workforce: d.customerProfiles,
      attrition: d.churnCandidates,
      skills: d.customerProfiles,
      hiring: d.nbaRows,
      productivity: d.recentTxns,
      engagement: d.customerProfiles,
      fraud: d.recentTxns.filter(t=>t.fraud),
      credit: d.customerProfiles.filter(c=>c.risk),
      vendor: d.nbaRows,
      inventory: d.nbaRows,
      revenue: d.customerProfiles,
      profitability: d.nbaRows,
      funnel: d.nbaRows,
      leads: d.nbaRows,
    };
    return raw[subId] || d.customerProfiles;
  };

  const rows = getSubContent(sub.id, data, theme);
  const rawRows = getRawContent(sub.id, data);
  const barColors = [domainColor, theme.teal, theme.purple, theme.amber, theme.green, theme.rose];

  return (
    <DraggableCard title={sub.label}
      summary={rows.slice(0,3).map(r=>`${r.label}: ${r.value}`).join(', ')}
      data={rows} drillData={rawRows}
      questions={[`Analyze ${sub.label}`, `Key risks in ${sub.label}?`, `Improve ${sub.label} performance`, `${sub.label} trend analysis`]}>
      <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 18, transition: 'all 0.2s' }}
        onMouseEnter={e=>{ e.currentTarget.style.borderColor=domainColor+'60'; e.currentTarget.style.boxShadow=`0 4px 16px ${domainColor}15`; }}
        onMouseLeave={e=>{ e.currentTarget.style.borderColor=theme.border; e.currentTarget.style.boxShadow='none'; }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:16 }}>{sub.icon}</span>
            <span style={{ fontSize:13, fontWeight:700, color:theme.text }}>{sub.label}</span>
          </div>
          <button onClick={()=>setExpanded(e=>!e)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, color:theme.textMuted, padding:'2px 6px' }}>
            {expanded ? '▲' : '▼'}
          </button>
        </div>
        {rows.slice(0, expanded ? 8 : 4).map((row, i) => (
          <div key={i} style={{ marginBottom:9 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
              <span style={{ color:theme.textMuted, maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{row.label}</span>
              <span style={{ color:barColors[i%barColors.length], fontWeight:600 }}>{row.value}</span>
            </div>
            <div style={{ height:5, background:theme.border, borderRadius:3 }}>
              <div style={{ height:'100%', width:`${Math.min(100,row.pct)}%`, background:barColors[i%barColors.length], borderRadius:3, transition:'width 0.8s ease' }} />
            </div>
          </div>
        ))}
      </div>
    </DraggableCard>
  );
}

export default function DomainDashboard({ domainId, onBack }) {
  const { data } = useData();
  const { theme } = useTheme();
  const cfg = DOMAIN_CONFIG[domainId];
  if (!cfg) return null;
  const kpis = cfg.kpis(data);

  return (
    <div style={{ minHeight:'100vh', background:theme.bg, color:theme.text, fontFamily:"'Inter',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');*{box-sizing:border-box;}@keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}`}</style>
      <Navbar onBack={onBack} subtitle={`${cfg.icon} ${cfg.label}`} />
      <div style={{ padding:24 }}>
        {/* KPI strip */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
          {kpis.map(k => (
            <DraggableCard key={k.label} title={k.label} summary={`${k.label}: ${k.value} — ${k.sub}`} data={k} drillData={k.drill}
              questions={[`Analyze ${k.label}`,`${k.label} improvement strategy`,`Risk factors for ${k.label}`]}>
              <KpiCard label={k.label} value={k.value} sub={k.sub} color={k.color} />
            </DraggableCard>
          ))}
        </div>
        {/* Sub-module grid */}
        <div style={{ marginBottom:10, fontSize:11, color:theme.textMuted, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>
          {cfg.label} Modules — Powered by Live CSV Data
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
          {cfg.subs.map(sub => (
            <SubCard key={sub.id} sub={sub} domainColor={cfg.color} data={data} theme={theme} />
          ))}
        </div>
      </div>
      <AICopilot context={cfg.label} data={data} suggestedQuestions={cfg.questions} />
    </div>
  );
}
