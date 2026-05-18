import { useData } from '../../context/DataContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { Navbar } from '../../components/Navbar.jsx';
import { KpiCard } from '../../components/UI.jsx';
import { DraggableCard } from '../../components/DraggableCard.jsx';
import { MiniDonut } from '../../charts/index.jsx';
import AICopilot from '../../ai/AICopilot.jsx';

const DOMAINS = [
  {
    id: 'c360', label: 'Customer 360', icon: '👤',
    desc: 'Unified customer intelligence, CLV, churn & engagement',
    color: '#0052CC', gradient: 'linear-gradient(135deg,#0052CC,#4D9FFF)',
    subs: ['Revenue Assessment','Customer Churn','Customer Engagement','Customer Segmentation','Next Best Action','Channel Journey'],
    stat: (d) => `${d.kpis.totalCustomers} customers · Avg CLV ₹${d.kpis.avgCLV}L`,
  },
  {
    id: 'hr', label: 'Agentic HR', icon: '🧑‍💼',
    desc: 'Workforce analytics, attrition, skill gaps & hiring',
    color: '#6B44C8', gradient: 'linear-gradient(135deg,#6B44C8,#A78BFA)',
    subs: ['Workforce Analytics','Employee Attrition','Skill Gap Analysis','Hiring Intelligence','Productivity Insights','Employee Engagement'],
    stat: (d) => `${d.kpis.totalCustomers} employees · ${d.sentiments.find(s=>s.s==='Dissatisfied')?.pct||0}% at risk`,
  },
  {
    id: 'supply', label: 'Supply Chain', icon: '🔗',
    desc: 'Vendor performance, logistics, inventory & demand',
    color: '#0097A7', gradient: 'linear-gradient(135deg,#0097A7,#26C6DA)',
    subs: ['Vendor Performance','Logistics Analytics','Inventory Optimization','Demand Forecasting','Procurement Intelligence','Delivery Risk'],
    stat: (d) => `₹${d.kpis.totalLoanBook}Cr portfolio · ${d.loanTypes.length} product lines`,
  },
  {
    id: 'ops', label: 'Production & Ops', icon: '⚙️',
    desc: 'Operational efficiency, bottlenecks & capacity',
    color: '#E67E00', gradient: 'linear-gradient(135deg,#E67E00,#FFB347)',
    subs: ['Production Efficiency','Operational Bottlenecks','Resource Utilization','Downtime Analytics','Capacity Planning','Quality Monitoring'],
    stat: (d) => `${d.txnTypes.reduce((s,t)=>s+t.count,0)} ops · ${d.channels.length} channels active`,
  },
  {
    id: 'risk', label: 'Risk & Compliance', icon: '🛡️',
    desc: 'Fraud detection, credit risk, AML & regulatory',
    color: '#D92D3E', gradient: 'linear-gradient(135deg,#D92D3E,#FF6B7A)',
    subs: ['Fraud Detection','Compliance Monitoring','Credit Risk Assessment','AML Analytics','Operational Risk','Regulatory Insights'],
    stat: (d) => `${d.kpis.fraudAlertPct}% fraud rate · ${d.creditRisk.find(r=>r.cat==='High Risk')?.count||0} high risk`,
  },
  {
    id: 'sales', label: 'Sales & Marketing', icon: '📈',
    desc: 'Campaign performance, lead scoring & conversions',
    color: '#1A7D4A', gradient: 'linear-gradient(135deg,#1A7D4A,#4ADE80)',
    subs: ['Campaign Performance','Customer Acquisition','Sales Funnel','Lead Scoring','Conversion Analytics','Product Recommendations'],
    stat: (d) => `${d.totalOpportunities} leads · ${d.avgProb}% avg conversion`,
  },
  {
    id: 'finance', label: 'Finance & Analytics', icon: '💹',
    desc: 'Revenue intelligence, profitability & forecasting',
    color: '#B45309', gradient: 'linear-gradient(135deg,#B45309,#F59E0B)',
    subs: ['Revenue Intelligence','Profitability Analytics','Financial Forecasting','Cost Optimization','Expense Analytics','KPI Monitoring'],
    stat: (d) => `₹${d.revenue.totalRevenue}Cr revenue · ₹${d.kpis.totalDeposits}Cr deposits`,
  },
];

export default function MainDashboard({ onModuleClick }) {
  const { data } = useData();
  const { theme } = useTheme();
  const segColors = [theme.purple, theme.accent, theme.teal, theme.amber];
  const maxTxnVol = Math.max(...data.monthlyTxnTrend.map(m => m.vol), 1);
  const riskColors = { 'High Risk': theme.rose, 'Medium Risk': theme.amber, 'Low Risk': theme.green };
  const totalRisk = data.creditRisk.reduce((s, r) => s + r.count, 0);

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, color: theme.text, fontFamily: "'Inter',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box;}@keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}} @keyframes shimmer{0%{opacity:0.7}50%{opacity:1}100%{opacity:0.7}}`}</style>
      <Navbar />

      <div style={{ padding: '24px 28px' }}>
        {/* Hero KPI strip */}
        <div style={{ marginBottom: 28, background: theme.bgCard, borderRadius: 16, padding: '22px 26px', border: `1px solid ${theme.border}`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 300, height: '100%', background: `linear-gradient(to left, ${theme.accent}08, transparent)`, pointerEvents: 'none' }} />
          <div style={{ fontSize: 11, color: theme.accent, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 4, textTransform: 'uppercase' }}>Agentic-Next · Enterprise Intelligence Platform</div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: theme.text, letterSpacing: '-0.5px' }}>Business Intelligence Hub</h1>
          <p style={{ margin: '0 0 22px', fontSize: 12, color: theme.textMuted }}>
            Real-time analytics across 7 business domains · {data.kpis.totalCustomers} customers · 8 CSV datasets · AI-powered insights
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12 }}>
            {[
              { label: 'Customers', value: String(data.kpis.totalCustomers), color: theme.accent, spark: [165,170,178,185,193,data.kpis.totalCustomers], sub: 'Active profiles', trend: 'up', drill: data.customerProfiles },
              { label: 'Loan Book', value: `₹${data.kpis.totalLoanBook}Cr`, color: theme.teal, spark: [310,325,338,352,366,parseFloat(data.kpis.totalLoanBook)], sub: `${data.kpis.activeLoanCount} active`, trend: 'up', drill: data.customerProfiles.filter(c => c.totalLoanAmt > 0) },
              { label: 'Deposits', value: `₹${data.kpis.totalDeposits}Cr`, color: theme.green, spark: [14,15,16,17,18,parseFloat(data.kpis.totalDeposits)], sub: `Avg ₹${data.kpis.avgBalance}L`, drill: data.customerProfiles },
              { label: 'Avg CIBIL', value: String(data.kpis.avgCreditScore), color: theme.purple, spark: [751,755,758,761,764,data.kpis.avgCreditScore], sub: 'Portfolio: Healthy', trend: 'up', drill: data.customerProfiles.map(c => ({ id: c.id, name: c.name, cibil: c.cibil, risk: c.risk })) },
              { label: 'Fraud Alerts', value: `${data.kpis.fraudAlertPct}%`, color: theme.rose, spark: [18,20,21,21,22,data.kpis.fraudAlertPct], sub: `${data.kpis.fraudCount} flagged`, drill: data.recentTxns.filter(t => t.fraud) },
              { label: 'Txn Volume', value: `₹${data.kpis.totalTxnVol}Cr`, color: theme.amber, spark: [38,40,43,46,48,parseFloat(data.kpis.totalTxnVol)], sub: `${data.txnTypes.reduce((s,t)=>s+t.count,0)} txns`, trend: 'up', drill: data.recentTxns },
            ].map(({ label, value, color, spark, sub, trend, drill }) => (
              <DraggableCard key={label} title={label} summary={`${label}: ${value} — ${sub}`} data={{ value, label }} drillData={drill}
                questions={[`Analyze ${label} trend`, `Risk factors for ${label}?`, `How to improve ${label}?`]}>
                <KpiCard label={label} value={value} sub={sub} color={color} sparkData={spark} trend={trend} />
              </DraggableCard>
            ))}
          </div>
        </div>

        {/* Primary domain cards — 7 domains */}
        <div style={{ marginBottom: 10, fontSize: 11, color: theme.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Business Domains</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
          {DOMAINS.map(dom => (
            <DraggableCard key={dom.id} title={dom.label}
              summary={`${dom.label}: ${dom.desc}. Sub-modules: ${dom.subs.join(', ')}`}
              data={{ id: dom.id, label: dom.label, subs: dom.subs }}
              questions={[`Analyze ${dom.label} performance`, `Top risks in ${dom.label}?`, `${dom.label} improvement opportunities`, `Key ${dom.label} KPIs`]}>
              <div
                onClick={() => onModuleClick(dom.id)}
                style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 16, padding: '22px 20px', cursor: 'pointer', transition: 'all 0.25s', height: '100%' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = dom.color; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 32px ${dom.color}20`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                {/* Icon + gradient bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: dom.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    {dom.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{dom.label}</div>
                    <div style={{ fontSize: 10, color: dom.color, fontWeight: 600, marginTop: 1 }}>
                      {dom.stat(data)}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: theme.textMuted, lineHeight: 1.5, marginBottom: 14 }}>{dom.desc}</div>
                {/* Sub-module pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
                  {dom.subs.slice(0, 4).map(sub => (
                    <span key={sub} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: `${dom.color}15`, color: dom.color, fontWeight: 500 }}>{sub}</span>
                  ))}
                  {dom.subs.length > 4 && (
                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: theme.bgPanel, color: theme.textMuted }}>+{dom.subs.length - 4} more</span>
                  )}
                </div>
                {/* Progress bar */}
                <div style={{ height: 3, background: theme.border, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '100%', background: dom.gradient, borderRadius: 2, animation: 'shimmer 2s infinite' }} />
                </div>
              </div>
            </DraggableCard>
          ))}
        </div>

        {/* Analytics row */}
        <div style={{ marginBottom: 10, fontSize: 11, color: theme.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Live Analytics Snapshot</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
          <DraggableCard title="Customer Segments" summary={data.segments.map(s=>`${s.seg}:${s.count}(${s.pct}%)`).join(', ')}
            data={data.segments} questions={['Which segment is most profitable?','Segment churn risk?','Cross-sell by segment']}>
            <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 14 }}>Customer Segments</div>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 10 }}>
                {data.segments.map(({ seg, pct }, i) => (
                  <div key={seg} style={{ textAlign: 'center' }}>
                    <MiniDonut size={46} segments={[{ value: pct, color: segColors[i] }, { value: 100-pct, color: theme.border }]} />
                    <div style={{ fontSize: 9, color: theme.textMuted, marginTop: 3 }}>{seg}</div>
                    <div style={{ fontSize: 10, color: segColors[i], fontWeight: 700 }}>{pct}%</div>
                  </div>
                ))}
              </div>
            </div>
          </DraggableCard>

          <DraggableCard title="Credit Risk Distribution" summary={data.creditRisk.map(r=>`${r.cat}:${r.count}(${r.pct}%)`).join(', ')}
            data={data.creditRisk} questions={['High risk NPA exposure?','Risk migration trend?','Mitigation strategy']}>
            <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 14 }}>Credit Risk</div>
              <div style={{ display: 'flex', height: 20, borderRadius: 8, overflow: 'hidden', marginBottom: 14 }}>
                {data.creditRisk.map(({ cat, count }) => (
                  <div key={cat} title={cat} style={{ width: `${(count/totalRisk)*100}%`, background: riskColors[cat]||theme.accent }} />
                ))}
              </div>
              {data.creditRisk.map(({ cat, count, pct }) => (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 11 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: riskColors[cat]||theme.accent }} />
                  <span style={{ flex: 1, color: theme.textMuted }}>{cat}</span>
                  <span style={{ fontWeight: 700, color: theme.text }}>{count}</span>
                  <span style={{ color: riskColors[cat], fontWeight: 600 }}>{pct}%</span>
                </div>
              ))}
            </div>
          </DraggableCard>

          <DraggableCard title="Recent Transactions" summary={`${data.recentTxns.filter(t=>t.fraud).length} fraud in last ${data.recentTxns.length} txns`}
            data={data.recentTxns} questions={['Fraud pattern analysis?','High-value alerts?','Channel-wise activity']}>
            <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 14 }}>Recent Transactions</div>
              {data.recentTxns.slice(0, 6).map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: `1px solid ${theme.border}`, fontSize: 11 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.fraud ? theme.rose : theme.green, flexShrink: 0 }} />
                  <span style={{ color: theme.textMuted, width: 70, flexShrink: 0 }}>{t.customerId}</span>
                  <span style={{ color: theme.textMuted, flex: 1 }}>{t.type}</span>
                  <span style={{ color: theme.text, fontWeight: 600 }}>₹{(t.amount/100000).toFixed(1)}L</span>
                  {t.fraud && <span style={{ color: theme.rose, fontWeight: 700, fontSize: 12 }}>⚠</span>}
                </div>
              ))}
            </div>
          </DraggableCard>
        </div>

        {/* Txn trend */}
        <DraggableCard title="Monthly Transaction Volume" summary={data.monthlyTxnTrend.map(m=>`${m.month}:₹${m.vol}Cr`).join(', ')}
          data={data.monthlyTxnTrend} questions={['Peak volume months?','Volume growth rate?','Forecast next quarter']}>
          <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 16 }}>Monthly Transaction Volume (₹Cr)</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 100 }}>
              {data.monthlyTxnTrend.map((m, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 8, color: theme.accent, fontWeight: 600 }}>{m.vol}</span>
                  <div style={{ width: '100%', height: (m.vol/maxTxnVol)*88, background: `linear-gradient(to top,${theme.accent},${theme.purple})`, borderRadius: '3px 3px 0 0', opacity: 0.85 }} />
                  <span style={{ fontSize: 7, color: theme.textDim }}>{m.month}</span>
                </div>
              ))}
            </div>
          </div>
        </DraggableCard>
      </div>

      <AICopilot context="Enterprise Dashboard" data={data}
        suggestedQuestions={['Which domain needs most attention?','Top 3 risks across all domains?','Cross-domain revenue opportunities','Portfolio health summary']} />
    </div>
  );
}
