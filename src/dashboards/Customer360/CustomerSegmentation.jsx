import { useData } from '../../context/DataContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { DraggableCard } from '../../components/DraggableCard.jsx';
import { MiniDonut } from '../../charts/index.jsx';

export default function CustomerSegmentation() {
  const { data } = useData();
  const { theme } = useTheme();
  const segColors = [theme.purple, theme.accent, theme.teal, theme.amber];
  const riskColors = { High: theme.rose, Medium: theme.amber, Low: theme.green };
  const cityColors = ['#0052CC','#6B44C8','#0097A7','#1A7D4A','#E67E00'];
  const occColors = ['#0052CC','#6B44C8','#0097A7','#E67E00','#1A7D4A'];
  const regColors = { South:'#0097A7', North:'#0052CC', East:'#6B44C8', West:'#E67E00' };

  const totalRisk = data.riskProfiles.reduce((s,r)=>s+r.count,0);
  const totalReg = data.regions.reduce((s,r)=>s+r.count,0);
  const maxCity = Math.max(...data.cityDistribution.map(c=>c.count));
  const maxOcc = Math.max(...data.topOccupations.map(o=>o.count));

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Segment Donuts */}
      <div className="rg-4" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {data.segments.map(({ seg, count, pct }, i) => (
          <DraggableCard key={seg} title={`${seg} Segment`} summary={`${count} customers (${pct}%) in ${seg} segment`}
            data={{ seg, count, pct }} drillData={data.customerProfiles.filter(c => c.segment === seg)} questions={[`Analyze ${seg} segment behavior`,`Cross-sell for ${seg}`,`Risk profile of ${seg}`]}>
            <div style={{ background:theme.bgCard, border:`2px solid ${segColors[i]}30`, borderRadius:14, padding:20, textAlign:'center', boxShadow:`0 2px 12px ${segColors[i]}15` }}>
              <MiniDonut size={64} segments={[{value:pct,color:segColors[i]},{value:100-pct,color:theme.border}]} />
              <div style={{ fontSize:24, fontWeight:800, color:theme.text, marginTop:10 }}>{count}</div>
              <div style={{ fontSize:12, fontWeight:600, color:segColors[i], marginBottom:2 }}>{seg}</div>
              <div style={{ fontSize:11, color:theme.textMuted }}>{pct}% of portfolio</div>
            </div>
          </DraggableCard>
        ))}
      </div>

      <div className="rg-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {/* Risk Profile stacked bar */}
        <DraggableCard title="Risk Profile Distribution"
          summary={data.riskProfiles.map(r=>`${r.risk}: ${r.count} (${r.pct}%)`).join(', ')}
          data={data.riskProfiles} drillData={data.customerProfiles.map(c=>({id:c.id, name:c.name, risk:c.risk}))}
          questions={['Which risk tier needs most attention?','Fraud correlation with risk?','Risk migration trends']}>
          <div style={{ background:theme.bgCard, border:`1px solid ${theme.border}`, borderRadius:14, padding:20 }}>
            <div style={{ fontSize:13, fontWeight:700, color:theme.text, marginBottom:16 }}>Risk Profile Distribution</div>
            <div style={{ display:'flex', height:32, borderRadius:10, overflow:'hidden', marginBottom:20 }}>
              {data.riskProfiles.map(({ risk, count }) => (
                <div key={risk} title={`${risk}: ${count}`} style={{ width:`${(count/totalRisk)*100}%`, background:riskColors[risk]||theme.accent }} />
              ))}
            </div>
            {data.riskProfiles.map(({ risk, count, pct }) => (
              <div key={risk} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                <div style={{ width:12, height:12, borderRadius:3, background:riskColors[risk]||theme.accent, flexShrink:0 }} />
                <span style={{ flex:1, fontSize:12, color:theme.textMuted }}>{risk}</span>
                <span style={{ fontSize:14, fontWeight:700, color:theme.text, width:28 }}>{count}</span>
                <span style={{ fontSize:11, color:riskColors[risk], fontWeight:600, width:38 }}>{pct}%</span>
                <div style={{ width:80, height:6, background:theme.border, borderRadius:3, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:riskColors[risk], borderRadius:3 }} />
                </div>
              </div>
            ))}
          </div>
        </DraggableCard>

        {/* Region stacked */}
        <DraggableCard title="Regional Distribution"
          summary={data.regions.map(r=>`${r.region}: ${r.count} (${r.pct}%)`).join(', ')}
          data={data.regions} drillData={data.customerProfiles}
          questions={['Which region has highest risk?','Regional product adoption?','Growth opportunities by region']}>
          <div style={{ background:theme.bgCard, border:`1px solid ${theme.border}`, borderRadius:14, padding:20 }}>
            <div style={{ fontSize:13, fontWeight:700, color:theme.text, marginBottom:16 }}>Regional Distribution</div>
            <div style={{ display:'flex', height:32, borderRadius:10, overflow:'hidden', marginBottom:20 }}>
              {data.regions.map(({ region, count }) => (
                <div key={region} title={`${region}: ${count}`} style={{ width:`${(count/totalReg)*100}%`, background:regColors[region]||theme.accent }} />
              ))}
            </div>
            {data.regions.map(({ region, count, pct }) => (
              <div key={region} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                <div style={{ width:12, height:12, borderRadius:3, background:regColors[region]||theme.accent, flexShrink:0 }} />
                <span style={{ flex:1, fontSize:12, color:theme.textMuted }}>{region}</span>
                <span style={{ fontSize:14, fontWeight:700, color:theme.text, width:28 }}>{count}</span>
                <span style={{ fontSize:11, color:regColors[region], fontWeight:600, width:38 }}>{pct}%</span>
                <div style={{ width:80, height:6, background:theme.border, borderRadius:3, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:regColors[region], borderRadius:3 }} />
                </div>
              </div>
            ))}
          </div>
        </DraggableCard>
      </div>

      <div className="rg-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <DraggableCard title="City-wise Customer Distribution"
          summary={data.cityDistribution.map(c=>`${c.city}: ${c.count}`).join(', ')}
          data={data.cityDistribution} drillData={data.customerProfiles}
          questions={['Which city has highest CLV?','City-wise fraud rate?','Branch expansion priority']}>
          <div style={{ background:theme.bgCard, border:`1px solid ${theme.border}`, borderRadius:14, padding:20 }}>
            <div style={{ fontSize:13, fontWeight:700, color:theme.text, marginBottom:16 }}>City-wise Customers</div>
            {data.cityDistribution.map(({ city, count }, i) => (
              <div key={city} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:cityColors[i], flexShrink:0 }} />
                <span style={{ fontSize:12, color:theme.textMuted, width:74 }}>{city}</span>
                <div style={{ flex:1, height:8, background:theme.border, borderRadius:4, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${(count/maxCity)*100}%`, background:cityColors[i], borderRadius:4 }} />
                </div>
                <span style={{ fontSize:12, fontWeight:700, color:theme.text, width:24 }}>{count}</span>
              </div>
            ))}
          </div>
        </DraggableCard>

        <DraggableCard title="Top Occupations"
          summary={data.topOccupations.map(o=>`${o.occ}: ${o.count}`).join(', ')}
          data={data.topOccupations} drillData={data.customerProfiles}
          questions={['Which occupation has best CIBIL?','Occupation-wise product preference?','Income vs occupation analysis']}>
          <div style={{ background:theme.bgCard, border:`1px solid ${theme.border}`, borderRadius:14, padding:20 }}>
            <div style={{ fontSize:13, fontWeight:700, color:theme.text, marginBottom:16 }}>Top Occupations</div>
            {data.topOccupations.map(({ occ, count }, i) => (
              <div key={occ} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <span style={{ fontSize:11, fontWeight:700, color:occColors[i], width:14 }}>{i+1}</span>
                <div style={{ flex:1, height:8, background:theme.border, borderRadius:4, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${(count/maxOcc)*100}%`, background:occColors[i], borderRadius:4 }} />
                </div>
                <span style={{ fontSize:11, color:theme.textMuted, width:130, textAlign:'right' }}>{occ}</span>
                <span style={{ fontSize:12, fontWeight:700, color:theme.text, width:22 }}>{count}</span>
              </div>
            ))}
          </div>
        </DraggableCard>
      </div>
    </div>
  );
}
