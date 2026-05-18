import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { loadAllCsvs } from '../data/csvLoader.js';
import { computeAll } from '../analytics/engine.js';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [state, setState] = useState({ loading: true, error: null, raw: null, data: null });

  useEffect(() => {
    loadAllCsvs()
      .then(csvs => {
        const data = computeAll(csvs);
        setState({ loading: false, error: null, raw: csvs, data });
      })
      .catch(err => {
        console.error('CSV load error:', err);
        setState({ loading: false, error: err.message, raw: null, data: null });
      });
  }, []);

  return <DataContext.Provider value={state}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}
