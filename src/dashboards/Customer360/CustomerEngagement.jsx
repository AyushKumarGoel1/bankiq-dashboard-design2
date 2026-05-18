import { useData } from '../../context/DataContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { KpiCard } from '../../components/UI.jsx';
import { DraggableCard } from '../../components/DraggableCard.jsx';

export default function CustomerEngagement() {
  const { data } = useData();
  const { theme } = useTheme();
  const satisfied = data.sentiments.find(s=>s.s==='Satisfied');
  const dissatisfied = data.sentiments.find(s=>s.s==='Dissatisfied');
  const maxCh = Math.max(...data.channels.map(c=>c.count));
  const maxTxn = Math.max(...data.txnTypes.map(t=>t.count));

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div className="rg-4" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        <DraggableCard title="Satisfied Customers" summary={`${satisfied?.count||0} (${satisfied?.pct||0}%) satisfied`}
          data={satisfied} drillData={data.customerProfiles.filter(c=>c.sentiment==='Satisfied')} questions={['What drives satisfaction?','Which RM has most satisfied customers?']}>
          <KpiCard label="Satisfied Customers" value={String(satisfied?.count||0)} sub={`${satisfied?.pct||0}% of base`} trend="up" color={theme.green} />
        </DraggableCard>
        <DraggableCard title="Dissatisfied Customers" summary={`${dissatisfied?.count||0} (${dissatisfied?.pct||0}%) dissatisfied`}
          data={dissatisfied} drillData={data.customerProfiles.filter(c=>c.sentiment==='Dissatisfied')} questions={['What causes dissatisfaction?','Resolution rate for complaints?']}>
          <KpiCard label="Dissatisfied Customers" value={String(dissatisfied?.count||0)} sub={`${dissatisfied?.pct||0}% of base`} trend="down" color={theme.rose} />
        </DraggableCard>
        <DraggableCard title="Digital Adoption" summary={`${data.kpis.digitalAdoptionPct}% customers use digital banking`}
          data={{ digitalAdoptionPct: data.kpis.digitalAdoptionPct }} drillData={data.customerProfiles} questions={['Which segment leads digital adoption?','Barriers to digital adoption?']}>
          <KpiCard label="Digital Adoption" value={`${data.kpis.digitalAdoptionPct}%`} sub="Net Banking + Mobile" trend="up" color={theme.accent} />
        </DraggableCard>
        <DraggableCard title="Branch Footfall" summary={`${data.channels.find(c=>c.ch==='Branch')?.count||0} branch transactions`}
          data={data.channels.find(c=>c.ch==='Branch')} drillData={data.recentTxns} questions={['Branch vs digital split?','Branch conversion rate?']}>
          <KpiCard label="Branch Footfall" value={String(data.channels.find(c=>c.ch==='Branch')?.count||0)} sub="Txns via branch" color={theme.amber} />
        </DraggableCard>
      </div>

      <div className="rg-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <DraggableCard title="Customer Sentiment Breakdown"
          summary={data.sentiments.map(s=>`${s.s}: ${s.count} (${s.pct}%)`).join(', ')}
          data={data.sentiments} drillData={data.customerProfiles}
          questions={['Which segment is most dissatisfied?','Sentiment trend over time?','Improve NPS strategy']}>
          <div style={{ background:theme.bgCard, border:`1px solid ${theme.border}`, borderRadius:12, padding:20 }}>
            <div style={{ fontSize:13, fontWeight:600, color:theme.text, marginBottom:16 }}>Customer Sentiment</div>
            {data.sentiments.map(({ s, count, pct }) => {
              const color = s==='Satisfied'?theme.green:s==='Neutral'?theme.amber:theme.rose;
              return (
                <div key={s} style={{ marginBottom:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:12 }}>
                    <span style={{ color:theme.textMuted }}>{s}</span>
                    <span style={{ color, fontWeight:600 }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height:8, background:theme.border, borderRadius:4 }}>
                    <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:4, opacity:0.85 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </DraggableCard>

        <DraggableCard title="Channel Engagement"
          summary={data.channels.map(c=>`${c.ch}: ${c.count}`).join(', ')}
          data={data.channels} drillData={data.recentTxns}
          questions={['Fastest growing channel?','Which channel has most fraud?','Optimize channel mix']}>
          <div style={{ background:theme.bgCard, border:`1px solid ${theme.border}`, borderRadius:12, padding:20 }}>
            <div style={{ fontSize:13, fontWeight:600, color:theme.text, marginBottom:16 }}>Channel Engagement</div>
            {data.channels.map(({ ch, count }) => (
              <div key={ch} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
                    <span style={{ color:theme.textMuted }}>{ch}</span>
                    <span style={{ color:theme.text }}>{count}</span>
                  </div>
                  <div style={{ height:5, background:theme.border, borderRadius:2 }}>
                    <div style={{ height:'100%', width:`${(count/maxCh)*100}%`, background:theme.teal, borderRadius:2 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DraggableCard>
      </div>

      <DraggableCard title="Transaction Type Distribution"
        summary={data.txnTypes.map(t=>`${t.type}: ${t.count}`).join(', ')}
        data={data.txnTypes} drillData={data.recentTxns}
        questions={['Which txn type has highest value?','Fraud by transaction type?','NEFT vs UPI trend']}>
        <div style={{ background:theme.bgCard, border:`1px solid ${theme.border}`, borderRadius:12, padding:20 }}>
          <div style={{ fontSize:13, fontWeight:600, color:theme.text, marginBottom:16 }}>Transaction Channel Usage</div>
          <div style={{ display:'flex', gap:8, alignItems:'flex-end', height:100 }}>
            {data.txnTypes.map(({ type, count }) => (
              <div key={type} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                <span style={{ fontSize:9, color:theme.accent, fontWeight:600 }}>{count}</span>
                <div style={{ width:'100%', height:(count/maxTxn)*88, background:theme.accent+'60', borderRadius:'3px 3px 0 0', border:`1px solid ${theme.accent}40` }} />
                <span style={{ fontSize:8, color:theme.textDim, textAlign:'center' }}>{type.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </DraggableCard>
    </div>
  );
}
