import { createContext, useContext, useState } from 'react';

const DrillDownContext = createContext(null);

export function DrillDownProvider({ children }) {
  const [drillState, setDrillState] = useState({
    isOpen: false,
    title: '',
    data: [],
  });

  const openDrillDown = (title, data) => {
    setDrillState({ isOpen: true, title, data });
  };

  const closeDrillDown = () => {
    setDrillState({ isOpen: false, title: '', data: [] });
  };

  return (
    <DrillDownContext.Provider value={{ ...drillState, openDrillDown, closeDrillDown }}>
      {children}
    </DrillDownContext.Provider>
  );
}

export function useDrillDown() {
  const ctx = useContext(DrillDownContext);
  if (!ctx) throw new Error('useDrillDown must be used inside DrillDownProvider');
  return ctx;
}
