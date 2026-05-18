import { useData } from '../../context/DataContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { KpiCard } from '../../components/UI.jsx';
import { DraggableCard } from '../../components/DraggableCard.jsx';

export default function CustomerChurn() {
  const { data } = useData();
  const { theme } = useTheme();
  const { churnCandidates, churnRate, atRiskCount } = data;
  const top5 = churnCandidates.slice(0, 5);
  const avgScore = churnCandidates.length ? Math.round(churnCandidates.reduce((s,c)=>s+c.score,0)/churnCandidates.length) : 0;
  const revAtRisk = ((atRiskCount / data.kpis.totalCustomers) * data.kpis.totalLoanBook * 0.08).toFixed(1);

  const actionMap = {
    'High Risk': 'Offer loan restructuring',
    'Medium Risk': 'RM outreach + product offer',
    'Low Risk': 'Retention nudge',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="rg-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        <DraggableCard title="Churn Rate" summary={`${churnRate}% customers at high churn risk`} data={{ churnRate }}
          drillData={churnCandidates} questions={['What drives churn?','Which segments churn most?','Suggest retention strategies']}>
          <KpiCard label="Churn Rate (Est.)" value={`${churnRate}%`} sub="Customers with score ≥60" trend="down" color={theme.rose} />
        </DraggableCard>
        <DraggableCard title="At-Risk Customers" summary={`${atRiskCount} customers with churn score ≥40`} data={{ atRiskCount }}
          drillData={churnCandidates.filter(c => c.score >= 40)} questions={['Who are the top at-risk customers?','What actions reduce attrition?']}>
          <KpiCard label="At-Risk Customers" value={String(atRiskCount)} sub="Score ≥ 40 threshold" color={theme.amber} />
        </DraggableCard>
        <DraggableCard title="Avg Churn Score" summary={`Average churn score: ${avgScore}/100`} data={{ avgScore }}
          drillData={churnCandidates} questions={['What factors push the score up?','How to reduce average score?']}>
          <KpiCard label="Avg Churn Score" value={String(avgScore)} sub="Composite risk score" color={theme.purple} />
        </DraggableCard>
        <DraggableCard title="Revenue at Risk" summary={`₹${revAtRisk}Cr revenue tied to at-risk customers`} data={{ revAtRisk }}
          drillData={churnCandidates} questions={['Which products are at risk?','Prioritize by revenue impact']}>
          <KpiCard label="Revenue at Risk" value={`₹${revAtRisk}Cr`} sub="From at-risk loan base" color={theme.rose} />
        </DraggableCard>
      </div>

      <DraggableCard title="Customer Churn Analysis — Top At-Risk"
        summary={top5.map(c=>`${c.name}(${c.segment}): Score ${c.score}`).join(' | ')}
        data={top5}
        questions={['Analyze churn drivers for top customers','Suggest personalized retention','Which RM should be assigned?']}>
        <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 16 }}>Top At-Risk Customers (Real Data)</div>
          {top5.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: `1px solid ${theme.border}` }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: theme.bgPanel, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: theme.textMuted, flexShrink: 0, fontWeight: 700 }}>
                {(c.name||'').split(' ').map(n=>n[0]||'').join('').slice(0,2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{c.name}</div>
                <div style={{ fontSize: 11, color: theme.textMuted }}>{c.id} · {c.segment} · {c.rm}</div>
              </div>
              <div style={{ textAlign: 'center', minWidth: 60 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: c.score >= 80 ? theme.rose : c.score >= 50 ? theme.amber : theme.textMuted }}>{c.score}</div>
                <div style={{ fontSize: 10, color: theme.textDim }}>score</div>
              </div>
              <div style={{ textAlign: 'right', minWidth: 100 }}>
                <div style={{ fontSize: 11, color: theme.text }}>{actionMap[c.risk] || 'Review account'}</div>
                <div style={{ fontSize: 10, color: theme.textMuted }}>{c.risk} · {c.missed} missed EMIs</div>
              </div>
              <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: c.fraudFlag ? theme.rose+'20' : theme.amber+'20', color: c.fraudFlag ? theme.rose : theme.amber }}>
                {c.fraudFlag ? '⚠ Fraud' : c.sentiment || 'N/A'}
              </span>
            </div>
          ))}
        </div>
      </DraggableCard>

      <div className="rg-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <DraggableCard title="Churn Score Distribution"
          summary={`${churnCandidates.filter(c=>c.score>=80).length} critical, ${churnCandidates.filter(c=>c.score>=60&&c.score<80).length} high, ${churnCandidates.filter(c=>c.score<60).length} medium`}
          data={churnCandidates} questions={['What causes critical churn?','Segment-wise churn breakdown']}>
          <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 16 }}>Churn Score Distribution</div>
            {[['Critical (≥80)', churnCandidates.filter(c=>c.score>=80).length, theme.rose],
              ['High (60-79)', churnCandidates.filter(c=>c.score>=60&&c.score<80).length, theme.amber],
              ['Medium (40-59)', churnCandidates.filter(c=>c.score>=40&&c.score<60).length, theme.purple],
            ].map(([label, count, color]) => (
              <div key={label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                  <span style={{ color: theme.textMuted }}>{label}</span>
                  <span style={{ color, fontWeight: 700 }}>{count}</span>
                </div>
                <div style={{ height: 8, background: theme.border, borderRadius: 4 }}>
                  <div style={{ height: '100%', width: `${(count/data.kpis.totalCustomers)*100}%`, background: color, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </DraggableCard>

        <DraggableCard title="Retention Recommendations"
          summary="AI-suggested retention actions based on churn drivers"
          data={{ strategies: ['Loan restructuring for missed EMI', 'RM outreach for dissatisfied', 'Fraud resolution priority'] }}
          questions={['Which retention tactic works best?','Cost of retention vs acquisition']}>
          <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 16 }}>Retention Strategies</div>
            {[
              { action: `Loan restructure for ${churnCandidates.filter(c=>c.missed>0).length} customers with missed EMIs`, impact: 'High' },
              { action: `RM call for ${churnCandidates.filter(c=>c.sentiment==='Dissatisfied').length} dissatisfied customers`, impact: 'High' },
              { action: `Fraud resolution for ${churnCandidates.filter(c=>c.fraudFlag).length} flagged accounts`, impact: 'High' },
              { action: `Digital onboarding nudge for offline-only users`, impact: 'Medium' },
              { action: `Fee waiver offer for high-ticket customers`, impact: 'Medium' },
            ].map(({ action, impact }) => (
              <div key={action} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${theme.border}`, fontSize: 12 }}>
                <span style={{ color: theme.textMuted, flex: 1 }}>{action}</span>
                <span style={{ color: impact === 'High' ? theme.green : theme.amber, fontWeight: 600, marginLeft: 8 }}>{impact}</span>
              </div>
            ))}
          </div>
        </DraggableCard>
      </div>
    </div>
  );
}
