export const APP_CONFIG = {
  appName: 'Softfyr BillPro',
  companyName: 'Softfyr Technologies',
  version: '2.0.0',
  defaultCurrency: 'INR',
  currencySymbol: '₹',
  supportEmail: 'support@softfyr.com',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'
};

export const STORE_CATEGORIES = [
  { id: 'RETAIL', name: 'Retail Store', icon: '🛍️' },
  { id: 'ELECTRONICS', name: 'Electronics & IT', icon: '💻' },
  { id: 'GROCERY', name: 'Grocery & Supermarket', icon: '🛒' },
  { id: 'PHARMACY', name: 'Pharmacy & Medicine', icon: '💊' },
  { id: 'APPAREL', name: 'Apparel & Fashion', icon: '👕' },
  { id: 'WHOLESALE', name: 'Wholesale & Distribution', icon: '📦' }
];

export const TAX_RATE_OPTIONS = [
  { id: '0', label: '0% (Exempt)' },
  { id: '5', label: '5% (GST 5%)' },
  { id: '12', label: '12% (GST 12%)' },
  { id: '18', label: '18% (GST 18%)' },
  { id: '28', label: '28% (GST 28%)' }
];
