/**
 * Auth & Onboarding Mock Data & Initial Constants
 */

export const DEFAULT_PROFILE_MOCK_DATA = {
  businessName: '',
  category: '',
  gstin: '',
  invoicePrefix: 'INV-',
  currency: 'INR',
  taxRate: '18',
  invoiceTerms: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  pincode: ''
};

export const STORE_CATEGORIES_MOCK = [
  { id: 'RETAIL', name: 'Retail Store', icon: '🛍️' },
  { id: 'SUPERMARKET', name: 'Supermarket', icon: '🛒' },
  { id: 'ELECTRONICS', name: 'Electronics', icon: '💻' },
  { id: 'PHARMACY', name: 'Pharmacy', icon: '💊' },
  { id: 'APPAREL', name: 'Fashion & Clothing', icon: '👕' },
  { id: 'WHOLESALE', name: 'Wholesale & B2B', icon: '📦' },
  { id: 'RESTAURANT', name: 'F&B / Bakery', icon: '🍽️' },
  { id: 'OTHER', name: 'General Store', icon: '🏢' },
];

export const TAX_RATE_OPTIONS_MOCK = [
  { id: '18', label: '18% GST (Standard)' },
  { id: '5', label: '5% GST (Reduced)' },
  { id: '0', label: 'Non-GST / Exemption' }
];

export const SUBSCRIPTION_PACKAGES_MOCK = [
  {
    id: 'starter-trial',
    name: 'Starter Trial',
    monthlyPrice: 0,
    yearlyPrice: 0,
    durationText: '14 Days Free',
    isPopular: false,
    badge: 'Free Trial',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    features: ['Up to 100 Bills / mo', '50 Products catalog', 'Single Admin seat']
  },
  {
    id: 'growth-pro',
    name: 'Growth Professional',
    monthlyPrice: 999,
    yearlyPrice: 799,
    durationText: 'per month',
    isPopular: true,
    badge: 'Most Popular',
    badgeClass: 'bg-indigo-600 text-white border-indigo-600',
    features: ['Unlimited Bills', '5,000 Products & Barcodes', '5 Staff seats', 'GST Reports']
  },
  {
    id: 'enterprise-unlimited',
    name: 'Enterprise Unlimited',
    monthlyPrice: 2499,
    yearlyPrice: 1999,
    durationText: 'per month',
    isPopular: false,
    badge: 'Unlimited Tier',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    features: ['Unlimited Everything', 'Multi-Branch Sync', 'Dedicated Manager', 'API Access']
  }
];

export const DEMO_CREDENTIALS_MOCK = {
  adminEmail: 'admin@system.com',
  adminPassword: 'AdminPassword123!',
  vendorMobile: '9876543210',
  demoOtp: '123456'
};
