import { useState } from 'react';
import { DataProvider, useData } from './context/DataContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { DragProvider } from './hooks/useDragToAI.jsx';
import { DrillDownProvider } from './context/DrillDownContext.jsx';
import { DrillDownModal } from './components/DrillDownModal.jsx';
import { LoadingScreen } from './components/UI.jsx';
import MainDashboard from './dashboards/MainDashboard/index.jsx';
import Customer360 from './dashboards/Customer360/index.jsx';
import DomainDashboard from './dashboards/DomainDashboard/index.jsx';

const DOMAIN_ROUTES = ['hr','supply','ops','risk','sales','finance'];

function AppRouter() {
  const { loading, error } = useData();
  const [active, setActive] = useState(null);

  if (loading) return <LoadingScreen />;
  if (error) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12, fontFamily:'sans-serif' }}>
      <div style={{ fontSize:40 }}>⚠️</div>
      <div style={{ fontSize:18, fontWeight:700 }}>Failed to load datasets</div>
      <div style={{ fontSize:13, color:'#666' }}>{error}</div>
    </div>
  );

  if (!active) return <MainDashboard onModuleClick={setActive} />;
  if (active === 'c360') return <Customer360 onBack={() => setActive(null)} />;
  if (DOMAIN_ROUTES.includes(active)) return <DomainDashboard domainId={active} onBack={() => setActive(null)} />;
  return <DomainDashboard domainId={active} onBack={() => setActive(null)} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <DrillDownProvider>
          <DragProvider>
            <AppRouter />
            <DrillDownModal />
          </DragProvider>
        </DrillDownProvider>
      </DataProvider>
    </ThemeProvider>
  );
}