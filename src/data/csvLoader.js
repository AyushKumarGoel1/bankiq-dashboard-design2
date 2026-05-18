import Papa from 'papaparse';

const CSV_FILES = {
  core:     '/data/core_banking_system_data_india_v2.csv',
  demo:     '/data/customer_demographics_system_data_india_v2.csv',
  loan:     '/data/loan_origination_system_data_india_v2.csv',
  crm:      '/data/customer_relationship_management_data_india_v2.csv',
  credit:   '/data/credit_behavior_system_data_india_v2.csv',
  txn:      '/data/customer_transaction_operational_system_data_india_v2.csv',
  products: '/data/banking_products_data_india.csv',
  bankdem:  '/data/bank_demographics_data_india.csv',
};

let _cache = null;

function parseCsv(text) {
  const result = Papa.parse(text, {
    header: true, skipEmptyLines: true, trimHeaders: true,
    transform: (val) => (val ? val.trim() : val),
  });
  return result.data;
}

export async function loadAllCsvs() {
  if (_cache) return _cache;
  const entries = await Promise.all(
    Object.entries(CSV_FILES).map(async ([key, url]) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to load ${url}`);
      const text = await res.text();
      return [key, parseCsv(text)];
    })
  );
  _cache = Object.fromEntries(entries);
  return _cache;
}

export function clearCache() { _cache = null; }
