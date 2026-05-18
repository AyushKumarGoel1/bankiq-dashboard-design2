import { useData } from '../../context/DataContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { KpiCard } from '../../components/UI.jsx';
import { DraggableCard } from '../../components/DraggableCard.jsx';

export default function NextBestAction() {
  const { data } = useData();
  const { theme } = useTheme();
  const { nbaRows, totalOpportunities, avgProb } = data;
  const top5 = nbaRows.slice(0, 5);
  const maxCount = Math.max(...data.crossSell.map(c=>c.count));
  const csPipeline = data.crossSell[0]?.count || 0;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div className="rg-4" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        <DraggableCard title="NBA Opportunities" summary={`${totalOpportunities} NBA opportunities across ${data.kpis.totalCustomers} customers`}
          data={{ totalOpportunities }} drillData={nbaRows} questions={['How to prioritize opportunities?','Which segment has most NBA?']}>
          <KpiCard label="NBA Opportunities" value={String(totalOpportunities)} sub="Across all customers" color={theme.accent} />
        </DraggableCard>
        <DraggableCard title="Avg Success Probability" summary={`${avgProb}% average success probability from CRM + CIBIL model`}
          data={{ avgProb }} drillData={nbaRows} questions={['What drives success probability?','Which product has highest conversion?']}>
          <KpiCard label="Avg Success Prob" value={`${avgProb}%`} sub="CIBIL + segment model" trend="up" color={theme.green} />
        </DraggableCard>
        <DraggableCard title="Cross-sell Pipeline" summary={`${csPipeline} customers recommended for ${data.crossSell[0]?.product}`}
          data={{ pipeline: csPipeline, product: data.crossSell[0]?.product }} drillData={nbaRows.filter(r=>r.product===data.crossSell[0]?.product)} questions={['Which product pipeline is strongest?','Conversion funnel analysis']}>
          <KpiCard label="Top Pipeline" value={String(csPipeline)} sub={data.crossSell[0]?.product || 'Credit Card'} color={theme.amber} />
        </DraggableCard>
        <DraggableCard title="Cross-sell Eligible Products" summary={`${data.kpis.crossSellEligible} products marked cross-sell eligible`}
          data={{ eligible: data.kpis.crossSellEligible }} drillData={nbaRows} questions={['Which customers are cross-sell eligible?']}>
          <KpiCard label="Cross-sell Eligible" value={String(data.kpis.crossSellEligible)} sub="Active product flags" color={theme.purple} />
        </DraggableCard>
      </div>

      <DraggableCard title="AI-Recommended Actions (Top 5)"
        summary={top5.map(r=>`${r.name}: ${r.product} (${r.prob}% prob)`).join(' | ')}
        data={top5}
        questions={['Analyze success factors for top NBA','Which customers should be contacted first?','Product-wise expected revenue uplift']}>
        <div style={{ background:theme.bgCard, border:`1px solid ${theme.border}`, borderRadius:12, padding:20 }}>
          <div style={{ fontSize:13, fontWeight:600, color:theme.text, marginBottom:16 }}>AI-Recommended Actions (Real CRM Data)</div>
          {top5.map(r => (
            <div key={r.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 0', borderBottom:`1px solid ${theme.border}` }}>
              <div style={{ width:38, height:38, borderRadius:'50%', background:theme.bgPanel, border:`1px solid ${theme.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:theme.textMuted, flexShrink:0, fontWeight:700 }}>
                {(r.name||'').split(' ').map(n=>n[0]||'').join('').slice(0,2).toUpperCase()}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color:theme.text }}>{r.name}</div>
                <div style={{ fontSize:11, color:theme.textMuted }}>{r.segment} · CIBIL: {r.cibil} · Income: ₹{r.income}L</div>
              </div>
              <div style={{ fontSize:12, color:theme.text, minWidth:120 }}>{r.product}</div>
              <div style={{ textAlign:'center', minWidth:52 }}>
                <div style={{ fontSize:16, fontWeight:700, color:r.prob>78?theme.green:r.prob>65?theme.amber:theme.textMuted }}>{r.prob}%</div>
                <div style={{ fontSize:10, color:theme.textDim }}>success</div>
              </div>
              <div style={{ fontSize:11, color:theme.teal, fontWeight:600, minWidth:56 }}>₹{r.estValue}L</div>
              <span style={{ fontSize:11, padding:'3px 8px', borderRadius:6, background:r.urgency==='High'?theme.rose+'20':theme.amber+'20', color:r.urgency==='High'?theme.rose:theme.amber }}>
                {r.urgency}
              </span>
            </div>
          ))}
        </div>
      </DraggableCard>

      <div className="rg-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <DraggableCard title="Cross-sell Opportunities"
          summary={data.crossSell.map(c=>`${c.product}: ${c.count}`).join(', ')}
          data={data.crossSell}
          questions={['Which product has best ROI?','Segment-wise cross-sell success?','Digital vs branch cross-sell']}>
          <div style={{ background:theme.bgCard, border:`1px solid ${theme.border}`, borderRadius:12, padding:20 }}>
            <div style={{ fontSize:13, fontWeight:600, color:theme.text, marginBottom:14 }}>Cross-sell Opportunities</div>
            {data.crossSell.map(({ product, count }) => (
              <div key={product} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:`1px solid ${theme.border}`, fontSize:12 }}>
                <span style={{ color:theme.textMuted }}>{product}</span>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:60, height:4, background:theme.border, borderRadius:2 }}>
                    <div style={{ height:'100%', width:`${(count/maxCount)*100}%`, background:theme.accent, borderRadius:2 }} />
                  </div>
                  <span style={{ color:theme.text, fontWeight:600, width:24 }}>{count}</span>
                </div>
              </div>
            ))}
          </div>
        </DraggableCard>

        <DraggableCard title="Product Recommendation Rules"
          summary="Rule-based NBA triggers from real credit behavior and CRM data"
          data={{ rules: 'CIBIL > 750, missed EMI, HNI without investment' }}
          questions={['Which rules trigger most?','How to improve rule accuracy?','Add new recommendation rules']}>
          <div style={{ background:theme.bgCard, border:`1px solid ${theme.border}`, borderRadius:12, padding:20 }}>
            <div style={{ fontSize:13, fontWeight:600, color:theme.text, marginBottom:14 }}>Recommendation Engine Rules</div>
            {[
              { rule:`CIBIL > 750 + No Home Loan → Home Loan`, triggered: nbaRows.filter(r=>r.product?.includes('Home')).length },
              { rule:`HNI + No Investment → Wealth Mgmt`, triggered: nbaRows.filter(r=>r.segment==='HNI'&&r.product?.includes('Investment')).length },
              { rule:`Missed EMI → Loan Restructure`, triggered: data.churnCandidates.filter(c=>c.missed>0).length },
              { rule:`Credit Card eligible → Card Offer`, triggered: nbaRows.filter(r=>r.product?.includes('Credit')).length },
              { rule:`No Digital + Branch-only → App Onboarding`, triggered: data.kpis.totalCustomers - Math.round(data.kpis.digitalAdoptionPct/100*data.kpis.totalCustomers) },
            ].map(({ rule, triggered }) => (
              <div key={rule} style={{ padding:'7px 0', borderBottom:`1px solid ${theme.border}`, fontSize:11 }}>
                <div style={{ color:theme.textMuted, marginBottom:2 }}>{rule}</div>
                <div style={{ color:theme.accent, fontWeight:600 }}>→ {triggered} customers triggered</div>
              </div>
            ))}
          </div>
        </DraggableCard>
      </div>
    </div>
  );
}
