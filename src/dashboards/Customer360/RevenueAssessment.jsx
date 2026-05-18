import { useData } from '../../context/DataContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { KpiCard, SectionHeader } from '../../components/UI.jsx';
import { DraggableCard } from '../../components/DraggableCard.jsx';

export default function RevenueAssessment() {
  const { data } = useData();
  const { theme } = useTheme();
  const rev = data.revenue;
  const maxVol = Math.max(...rev.monthlyRevenueTrend.map(m => m.vol), 1);
  const maxRevSeg = Math.max(...rev.revenueBySegment.map(s => s.pct), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="rg-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        <DraggableCard title="Total Revenue" summary={`₹${rev.totalRevenue}Cr estimated annual revenue from loan interest + fee income`}
          data={{ totalRevenue: rev.totalRevenue }} drillData={data.customerProfiles} questions={['What drives this revenue?', 'How can we grow it?']}>
          <KpiCard label="Total Revenue (Est.)" value={`₹${rev.totalRevenue}Cr`} sub="Loan interest + fee income" trend="up" color={theme.green} />
        </DraggableCard>
        <DraggableCard title="Interest Income" summary={`₹${rev.annualInterestIncome}Cr from loan book`} data={{ interest: rev.annualInterestIncome }}
          drillData={data.customerProfiles.filter(c => c.totalLoanAmt > 0)} questions={['Which loan type drives most interest?', 'How does CIBIL affect income?']}>
          <KpiCard label="Interest Income (Est.)" value={`₹${rev.annualInterestIncome}Cr`} sub="From ₹378.5Cr loan book" color={theme.teal} />
        </DraggableCard>
        <DraggableCard title="Fee Income" summary={`₹${rev.feeIncome}Cr from transactions`} data={{ fee: rev.feeIncome }}
          drillData={data.recentTxns} questions={['Which channels generate most fees?', 'How to grow fee income?']}>
          <KpiCard label="Fee Income (Est.)" value={`₹${rev.feeIncome}Cr`} sub="From transaction volume" color={theme.amber} />
        </DraggableCard>
        <DraggableCard title="Avg Portfolio Value" summary={`₹${(rev.avgPortfolio/1e5).toFixed(1)}L per customer`} data={{ avgPortfolio: rev.avgPortfolio }}
          drillData={data.customerProfiles.map(c => ({ id: c.id, name: c.name, portfolio: c.depositAmt + c.totalLoanAmt, clv: c.clv }))} questions={['Which segment has highest portfolio?', 'How to increase portfolio value?']}>
          <KpiCard label="Avg Portfolio Value" value={`₹${(rev.avgPortfolio/1e5).toFixed(1)}L`} sub="Per customer" color={theme.purple} />
        </DraggableCard>
      </div>

      <div className="rg-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <DraggableCard title="Monthly Transaction Volume Trend"
          summary={`Last 12 months: ${rev.monthlyRevenueTrend.map(m=>`${m.month}:₹${m.vol}Cr`).join(', ')}`}
          data={rev.monthlyRevenueTrend}
          questions={['Which month had peak volume?', 'What caused dips?', 'Forecast next quarter']}>
          <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 16 }}>Monthly Txn Volume (₹Cr)</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 100 }}>
              {rev.monthlyRevenueTrend.map((m, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 8, color: theme.accent, fontWeight: 600 }}>{m.vol}</span>
                  <div style={{ width: '100%', height: (m.vol / maxVol) * 80, background: `linear-gradient(to top,${theme.accent},${theme.purple})`, borderRadius: '3px 3px 0 0', opacity: 0.85 }} />
                  <span style={{ fontSize: 7, color: theme.textDim }}>{m.month}</span>
                </div>
              ))}
            </div>
          </div>
        </DraggableCard>

        <DraggableCard title="Revenue by Customer Segment"
          summary={rev.revenueBySegment.map(s=>`${s.seg}: ₹${s.rev}Cr (${s.pct}%)`).join(', ')}
          data={rev.revenueBySegment}
          questions={['Which segment is most profitable?', 'How to grow HNI revenue?', 'Segment cross-sell potential']}>
          <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 16 }}>Revenue by Segment (Est.)</div>
            {(() => {
              const cols = [theme.purple, theme.accent, theme.teal, theme.amber];
              return rev.revenueBySegment.map(({ seg, rev: r, pct }, i) => (
                <div key={seg} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                    <span style={{ color: theme.textMuted }}>{seg}</span>
                    <span style={{ color: theme.text, fontWeight: 600 }}>₹{r}Cr ({pct}%)</span>
                  </div>
                  <div style={{ height: 6, background: theme.border, borderRadius: 3 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: cols[i % cols.length], borderRadius: 3 }} />
                  </div>
                </div>
              ));
            })()}
          </div>
        </DraggableCard>
      </div>

      <DraggableCard title="Product Revenue Contribution"
        summary={data.loanBookByType?.map(l=>`${l.type}: ₹${l.crore}Cr (${l.pct}%)`).join(', ')}
        data={data.loanBookByType}
        questions={['Which loan type is most profitable?', 'How to optimize product mix?', 'Risk vs return by product']}>
        <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 16 }}>Loan Book by Product (₹Cr)</div>
          <div className="rg-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
            {data.loanBookByType?.map(({ type, crore, pct }, i) => {
              const cols = [theme.accent, theme.purple, theme.teal, theme.amber, theme.green];
              return (
                <div key={type} style={{ textAlign: 'center' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: `conic-gradient(${cols[i]} ${pct*3.6}deg, ${theme.border} 0deg)`, margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: theme.bgCard }} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: cols[i] }}>₹{crore}Cr</div>
                  <div style={{ fontSize: 10, color: theme.textMuted }}>{type}</div>
                  <div style={{ fontSize: 10, color: theme.textDim }}>{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </DraggableCard>
    </div>
  );
}
