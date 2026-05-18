import { useData } from '../../context/DataContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { KpiCard } from '../../components/UI.jsx';
import { DraggableCard } from '../../components/DraggableCard.jsx';

export default function ChannelJourney() {
  const { data } = useData();
  const { theme } = useTheme();
  const branchCount = data.channels.find(c=>c.ch==='Branch')?.count || 0;
  const mobileCount = data.channels.find(c=>c.ch==='Mobile Banking')?.count || 0;
  const netCount = data.channels.find(c=>c.ch==='Internet Banking')?.count || 0;
  const digitalTotal = mobileCount + netCount;

  const journeyStages = [
    { stage:'Onboarding', channel:'Branch/KYC', volume:data.kpis.totalCustomers, conv:100 },
    { stage:'First Txn', channel:'Mobile/Web', volume:Math.round(data.kpis.totalCustomers*0.89), conv:89 },
    { stage:'Loan Inquiry', channel:'Branch/Phone', volume:data.loanTypes.reduce((s,l)=>s+l.count,0), conv:Math.round(data.loanTypes.reduce((s,l)=>s+l.count,0)/data.kpis.totalCustomers*100) },
    { stage:'Loan Active', channel:'Digital', volume:data.loanStatus.find(s=>s.status==='Disbursed')?.count||0, conv:Math.round((data.loanStatus.find(s=>s.status==='Disbursed')?.count||0)/data.loanTypes.reduce((s,l)=>s+l.count,0)*100) },
    { stage:'Active Usage', channel:'All channels', volume:data.txnTypes.reduce((s,t)=>s+t.count,0), conv:100 },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div className="rg-4" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        <DraggableCard title="Digital Adoption" summary={`${data.kpis.digitalAdoptionPct}% of customers use digital banking`}
          data={{ digitalAdoptionPct: data.kpis.digitalAdoptionPct }} drillData={data.customerProfiles} questions={['Which segment has highest digital adoption?','Barriers to digital onboarding?']}>
          <KpiCard label="Digital Adoption" value={`${data.kpis.digitalAdoptionPct}%`} sub="Net Banking + Mobile" trend="up" color={theme.green} />
        </DraggableCard>
        <DraggableCard title="Branch Footfall" summary={`${branchCount} branch transactions recorded`}
          data={{ branchCount }} drillData={data.recentTxns} questions={['Branch vs digital trend?','Branch transaction types?']}>
          <KpiCard label="Branch Footfall" value={String(branchCount)} sub="Txns via branch" color={theme.amber} />
        </DraggableCard>
        <DraggableCard title="Digital Transactions" summary={`${digitalTotal} digital transactions (mobile + net banking)`}
          data={{ digitalTotal, mobileCount, netCount }} drillData={data.recentTxns} questions={['Mobile vs net banking split?','Digital fraud rate?']}>
          <KpiCard label="Digital Txns" value={String(digitalTotal)} sub={`Mobile: ${mobileCount} · Net: ${netCount}`} trend="up" color={theme.accent} />
        </DraggableCard>
        <DraggableCard title="Active Channels" summary={`${data.channels.length} channels active in dataset`}
          data={data.channels} drillData={data.recentTxns} questions={['Which channel is fastest growing?','Cost per channel?']}>
          <KpiCard label="Active Channels" value={String(data.channels.length)} sub="Omni-channel coverage" color={theme.purple} />
        </DraggableCard>
      </div>

      <DraggableCard title="Omni-channel Journey Flow"
        summary={journeyStages.map(s=>`${s.stage}: ${s.volume}`).join(' → ')}
        data={journeyStages} drillData={data.recentTxns}
        questions={['Where is the biggest drop-off?','Improve loan approval funnel?','Digital vs branch conversion comparison']}>
        <div style={{ background:theme.bgCard, border:`1px solid ${theme.border}`, borderRadius:12, padding:20 }}>
          <div style={{ fontSize:13, fontWeight:600, color:theme.text, marginBottom:20 }}>Omni-channel Journey Flow</div>
          <div style={{ display:'flex', alignItems:'center', gap:0, overflowX:'auto' }}>
            {journeyStages.map((s, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center' }}>
                <div style={{ textAlign:'center', padding:'0 6px' }}>
                  <div style={{ width:68+(s.volume/data.kpis.totalCustomers)*14, height:68+(s.volume/data.kpis.totalCustomers)*14, borderRadius:'50%', background:`${theme.accent}${Math.round(20+s.conv/100*60).toString(16)}`, border:`2px solid ${theme.accent}50`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 8px', flexShrink:0 }}>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:14, fontWeight:700, color:theme.text }}>{s.volume}</div>
                      <div style={{ fontSize:9, color:theme.textMuted }}>{s.conv}%</div>
                    </div>
                  </div>
                  <div style={{ fontSize:11, fontWeight:600, color:theme.text }}>{s.stage}</div>
                  <div style={{ fontSize:10, color:theme.textMuted }}>{s.channel}</div>
                </div>
                {i < journeyStages.length-1 && (
                  <div style={{ width:32, height:2, background:`linear-gradient(to right,${theme.accent},${theme.purple})`, flexShrink:0 }}>
                    <div style={{ textAlign:'center', fontSize:16, marginTop:-10, color:theme.accent }}>›</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </DraggableCard>

      <div className="rg-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <DraggableCard title="Channel Transaction Distribution"
          summary={data.channels.map(c=>`${c.ch}: ${c.count}`).join(', ')}
          data={data.channels} drillData={data.recentTxns} questions={['Channel-wise fraud rate?','Revenue per channel?']}>
          <div style={{ background:theme.bgCard, border:`1px solid ${theme.border}`, borderRadius:12, padding:20 }}>
            <div style={{ fontSize:13, fontWeight:600, color:theme.text, marginBottom:14 }}>Channel Transaction Share</div>
            {(() => {
              const total = data.channels.reduce((s,c)=>s+c.count,0);
              const cols = [theme.accent,theme.purple,theme.teal,theme.amber,theme.green];
              return data.channels.map(({ ch, count },i) => (
                <div key={ch} style={{ marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
                    <span style={{ color:theme.textMuted }}>{ch}</span>
                    <span style={{ color:theme.text, fontWeight:600 }}>{count} ({((count/total)*100).toFixed(0)}%)</span>
                  </div>
                  <div style={{ height:8, background:theme.border, borderRadius:4, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${(count/total)*100}%`, background:cols[i], borderRadius:4 }} />
                  </div>
                </div>
              ));
            })()}
          </div>
        </DraggableCard>

        <DraggableCard title="Loan Status Pipeline"
          summary={data.loanStatus.map(s=>`${s.status}: ${s.count}`).join(', ')}
          data={data.loanStatus} drillData={data.nbaRows} questions={['Loan approval bottleneck?','Under review processing time?','Disbursement rate optimization']}>
          <div style={{ background:theme.bgCard, border:`1px solid ${theme.border}`, borderRadius:12, padding:20 }}>
            <div style={{ fontSize:13, fontWeight:600, color:theme.text, marginBottom:14 }}>Loan Status Pipeline</div>
            {(() => {
              const cols = { Approved:theme.green, Disbursed:theme.accent, 'Under Review':theme.amber, Closed:theme.textDim };
              const total = data.loanStatus.reduce((s,l)=>s+l.count,0);
              return data.loanStatus.map(({ status, count }) => (
                <div key={status} style={{ marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
                    <span style={{ color:theme.textMuted }}>{status}</span>
                    <span style={{ color:cols[status]||theme.text, fontWeight:600 }}>{count}</span>
                  </div>
                  <div style={{ height:8, background:theme.border, borderRadius:4, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${(count/total)*100}%`, background:cols[status]||theme.accent, borderRadius:4 }} />
                  </div>
                </div>
              ));
            })()}
          </div>
        </DraggableCard>
      </div>
    </div>
  );
}
