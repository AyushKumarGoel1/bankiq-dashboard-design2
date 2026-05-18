import { useState } from 'react';
import { useData } from '../../context/DataContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { Navbar } from '../../components/Navbar.jsx';
import { KpiCard, SectionHeader } from '../../components/UI.jsx';
import { DraggableCard } from '../../components/DraggableCard.jsx';
import AICopilot from '../../ai/AICopilot.jsx';
import RevenueAssessment from './RevenueAssessment.jsx';
import CustomerChurn from './CustomerChurn.jsx';
import CustomerSegmentation from './CustomerSegmentation.jsx';
import NextBestAction from './NextBestAction.jsx';
import CustomerEngagement from './CustomerEngagement.jsx';
import ChannelJourney from './ChannelJourney.jsx';

const TABS = [
  { id:'revenue', label:'Revenue', icon:'💰' },
  { id:'churn', label:'Churn', icon:'📉' },
  { id:'segmentation', label:'Segmentation', icon:'🎯' },
  { id:'nba', label:'Next Best Action', icon:'🚀' },
  { id:'engagement', label:'Engagement', icon:'💬' },
  { id:'channel', label:'Channel Journey', icon:'🔄' },
];

const TAB_COMPONENTS = {
  revenue: RevenueAssessment,
  churn: CustomerChurn,
  segmentation: CustomerSegmentation,
  nba: NextBestAction,
  engagement: CustomerEngagement,
  channel: ChannelJourney,
};

const TAB_QUESTIONS = {
  revenue: ['What drives revenue growth?', 'Which segment contributes most?', 'Forecast next quarter revenue'],
  churn: ['Who are the top churn risks?', 'What reduces churn fastest?', 'Revenue at risk from attrition'],
  segmentation: ['Segment risk profiles', 'Which city has highest CLV?', 'Occupation-wise product fit'],
  nba: ['Top cross-sell opportunities', 'Which customers to call first?', 'Expected revenue uplift from NBA'],
  engagement: ['What drives customer satisfaction?', 'Digital vs branch preference', 'Improve NPS score'],
  channel: ['Biggest journey drop-off points', 'Channel-wise fraud analysis', 'Optimize omni-channel strategy'],
};

export default function Customer360({ onBack }) {
  const { data } = useData();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('revenue');
  const ActiveModule = TAB_COMPONENTS[activeTab];

  return (
    <div style={{ minHeight:'100vh', background:theme.bg, color:theme.text, fontFamily:"'Inter',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap'); *{box-sizing:border-box;}`}</style>
      <Navbar onBack={onBack} subtitle="Customer 360°" />

      <div style={{ padding:'24px 24px 0' }}>
        <SectionHeader
          title="Customer 360 Intelligence"
          subtitle={`${data.kpis.totalCustomers} customers · ₹${data.kpis.totalLoanBook}Cr loan book · ₹${data.kpis.totalTxnVol}Cr transactions`}
        />
        <div className="rg-4" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
          <DraggableCard title="Total Customers" summary={`${data.kpis.totalCustomers} active customers`}
            data={data.kpis} drillData={data.customerProfiles} questions={['Customer growth trend?','Segment distribution?']}>
            <KpiCard label="Total Customers" value={String(data.kpis.totalCustomers)} sub="Active profiles" color={theme.accent}
              sparkData={[165,170,178,185,193,data.kpis.totalCustomers]} />
          </DraggableCard>
          <DraggableCard title="Avg CIBIL Score" summary={`Portfolio average CIBIL: ${data.kpis.avgCreditScore}`}
            data={data.kpis} drillData={data.customerProfiles.map(c=>({id:c.id, name:c.name, cibil:c.cibil, risk:c.risk}))} questions={['CIBIL distribution?','How to improve portfolio CIBIL?']}>
            <KpiCard label="Avg CIBIL Score" value={String(data.kpis.avgCreditScore)} sub="Portfolio health: Good" trend="up" color={theme.green}
              sparkData={[751,754,758,761,764,data.kpis.avgCreditScore]} />
          </DraggableCard>
          <DraggableCard title="Avg CLV" summary={`₹${data.kpis.avgCLV}L average customer lifetime value`}
            data={data.kpis} drillData={data.customerProfiles.map(c=>({id:c.id, name:c.name, clv:c.clv, segment:c.segment}))} questions={['Which segment has highest CLV?','How to maximize CLV?']}>
            <KpiCard label="Avg CLV" value={`₹${data.kpis.avgCLV}L`} sub="Customer lifetime value" color={theme.purple} />
          </DraggableCard>
          <DraggableCard title="Fraud Alert Rate" summary={`${data.kpis.fraudAlertPct}% of transactions flagged as fraud`}
            data={data.kpis} drillData={data.recentTxns.filter(t=>t.fraud)} questions={['Which customers are fraud-flagged?','Fraud by channel?','Mitigation strategies']}>
            <KpiCard label="Fraud Alert Rate" value={`${data.kpis.fraudAlertPct}%`} sub={`${data.kpis.fraudCount} txns flagged`} trend="down" color={theme.rose} />
          </DraggableCard>
        </div>
      </div>

      {/* Tab navigation */}
      <div style={{ padding:'0 24px', display:'flex', gap:4, overflowX:'auto', borderBottom:`1px solid ${theme.border}`, marginBottom:0 }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ padding:'10px 16px', background:'none', border:'none', cursor:'pointer', fontSize:13, fontWeight:activeTab===tab.id?700:500,
              color:activeTab===tab.id?theme.accent:theme.textMuted, borderBottom:activeTab===tab.id?`2px solid ${theme.accent}`:'2px solid transparent',
              display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap', transition:'all 0.2s' }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding:24 }}>
        <ActiveModule />
      </div>

      <AICopilot context={`Customer 360 — ${TABS.find(t=>t.id===activeTab)?.label}`}
        suggestedQuestions={TAB_QUESTIONS[activeTab]} data={data} />
    </div>
  );
}
