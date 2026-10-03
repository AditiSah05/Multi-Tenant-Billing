/**
 * Centralized Landing Page Editable Configuration & Content Data
 * 
 * Admins can easily edit titles, bullet points, pricing, FAQs, testimonials,
 * contact details, and feature descriptions in this single file.
 */

export const BRAND_CONFIG = {
  brandName: 'Softfyr',
  accentName: 'BillPro',
  parentCompany: 'A Unit of Veridian Innovations Private Limited',
  tagline: 'Smarter Billing. Better Business.',
  subtitle: 'Multi-Tenant SaaS Billing',
  domainUrl: 'app.softfyrbillpro.com/vendor/invoices',
  supportEmail: 'info@softfyr.com',
  supportPhone: '+918709122663',
  websiteUrl: 'www.softfyr.com',
  address: '206, 2nd Floor, Brindavan Kunj, Exhibition Road, Patna',
  supportHours: 'Mon - Sat | 9:00 AM - 7:00 PM',
  whatsappNumber: '918709122663',
  whatsappMessage: 'Hi Softfyr Team, I want to know more about Softfyr BillPro',
  copyrightText: '© 2026 Softfyr — A Unit of Veridian Innovations Private Limited. All Rights Reserved.'
};

export const NAV_LINKS = [
  { label: 'Home', id: 'home' },
  { label: 'About', id: 'about' },
  { label: 'Services', id: 'services' },
  { label: 'Contact Us', id: 'contact-us' }
];


export const TRUST_STATS = [
  { value: '10M+', label: 'Invoices Issued', subtext: '99.99% thermal print accuracy' },
  { value: '5,000+', label: 'Active Outlets', subtext: 'Across 28+ Indian States' },
  { value: '₹500Cr+', label: 'Tax Reconciled', subtext: 'Automated Intrastate/Interstate' },
  { value: '99.99%', label: 'Uptime SLA', subtext: '256-bit isolated tenancy' }
];

export const ENTERPRISE_TRUST_LOGOS = [
  { name: 'Apex Supermarket', tag: '35 Outlets' },
  { name: 'Metro Electronics', tag: '18 Showrooms' },
  { name: 'QuickMart Retail', tag: '50+ POS Counters' },
  { name: 'Horizon Digital', tag: 'Multi-State Chain' },
  { name: 'Kulkarni Traders', tag: 'Wholesale & Retail' }
];

export const HERO_DATA = {
  badge: 'ENTERPRISE MULTI-TENANT BILLING & GST TAX PLATFORM',
  titlePrefix: 'Empower Your Enterprise With',
  gradientTitle: 'Smart Billing & Tax Engine',
  subtitle: 'Multi-Tenant Store Outlets, Automated Intrastate (CGST+SGST) vs Interstate (IGST) Tax Engine, Hierarchical Catalogs with Warranty Policies & CA Monthly Returns Package Export.',
  featureBullets: [
    '1-Click Tenant Isolation',
    '256-Bit SSL Encrypted',
    'Multi-Outlet POS Chain',
    'Thermal 3-Inch Ready'
  ],
  primaryCtaText: 'Start Free Trial',
  secondaryCtaText: 'Book Enterprise Demo'
};

export const PRODUCT_SHOWCASE_TABS = [
  {
    id: 'pos-counter',
    label: 'Smart POS Counter',
    badge: 'Lightning Speed Checkout',
    iconName: 'Receipt',
    title: 'High-Performance Barcode Counter & Thermal Receipts',
    description: 'Designed for peak rush hours. Scan barcodes instantly, auto-apply pro-rata header discounts, split payments across Cash/UPI/Card, and trigger thermal 3-inch printing in <300ms.',
    highlights: ['Multi-terminal cash drawer control', 'Pro-rata bill discount apportionment', 'Automatic warranty terms printed on receipt', 'Public URL invoice sharing link generation']
  },
  {
    id: 'tax-engine',
    label: 'Automated Tax Engine',
    badge: '100% GST Compliant',
    iconName: 'Calculator',
    title: 'Intrastate vs Interstate Auto-Split Engine',
    description: 'Evaluates store state vs customer state in real-time. Automatically applies CGST (9%) + SGST (9%) for same state or IGST (18%) for out-of-state transactions with audit health verification.',
    highlights: ['State code auto-match validation', 'HSN Code 8471/8517 Table 12 aggregation', 'Monthly tax health discrepancy alerts', 'Automated ITC input tax credit tracking']
  },
  {
    id: 'multi-catalog',
    label: 'Hierarchical Catalog & Warranty',
    badge: 'Structured Inventory',
    iconName: 'Layers',
    title: 'Category Hierarchy & Warranty Duration Rules',
    description: 'Build Master Categories, Sub-Categories, default HSN GST rates, and warranty duration rules (Days/Months/Years) that auto-inherit to newly added items.',
    highlights: ['Multi-level category tree', 'Automated warranty expiration lookup', 'Batch stock deduction on checkout', 'Low-stock threshold warning triggers']
  },
  {
    id: 'ca-audit',
    label: 'CA Monthly Return Export',
    badge: '1-Click Excel Returns',
    iconName: 'FileSpreadsheet',
    title: 'CA-Ready Financial Returns & Audit Package',
    description: 'Export complete monthly tax filing packages formatted for Chartered Accountants. Reconciles sales tax collected against supplier purchase ITC paid.',
    highlights: ['GSTR-1 & GSTR-3B summary tables', 'Supplier purchase bill attachment store', '1-Click Excel / CSV export package', 'Full audit trail log history']
  }
];

export const CALCULATOR_CONFIG = {
  defaultPrice: 1000,
  defaultTaxPercent: 18,
  taxSlabs: [5, 12, 18, 28]
};

export const STEPS_DATA = {
  sectionTag: 'ABOUT THE PLATFORM & WORKFLOW',
  sectionTitle: 'Deploy Your Store In 4 Simple Steps',
  subtitle: 'Setup owner profile, configure store GSTIN details, organize product catalogs, and go live quickly.',
  steps: [
    {
      number: '01',
      tag: 'STEP 01',
      title: 'Register Owner & Store Profile',
      description: 'Set owner contact details, store location, state code, GSTIN number, logo, and receipt header text in Screen 1 & Screen 2 onboarding.'
    },
    {
      number: '02',
      tag: 'STEP 02',
      title: 'Organize Catalogs & Warranty',
      description: 'Build Master Categories, Sub-Categories, default HSN GST rates, and item warranty duration rules (Days/Months/Years).'
    },
    {
      number: '03',
      tag: 'STEP 03',
      title: 'POS Counter & Thermal Print',
      description: 'Scan barcodes, select customer profiles, apply header discounts, auto-calculate CGST/SGST/IGST, and print thermal 3-inch receipts.'
    },
    {
      number: '04',
      tag: 'STEP 04',
      title: 'CA Returns & Supplier Ledger',
      description: 'Track vendor purchase bills, Input ITC tax credit, HSN Table 12 data, and export CA monthly tax packages in Excel format.'
    }
  ]
};

export const MODULES_DATA = {
  sectionTag: 'Our Services & Modules',
  sectionTitle: 'Simple, Powerful Services For Your Business',
  subtitle: 'Everything you need to manage sales, inventory, customers, and tax compliance in one clean platform.',
  modules: [
    {
      id: 'sales-billing',
      iconType: 'receipt',
      iconColor: 'blue',
      title: 'Sales Invoices & Billing',
      description: 'Create B2B & B2C tax invoices quickly with itemized discounts, tax calculation, and thermal or A4 print options.'
    },
    {
      id: 'tax-compliance',
      iconType: 'calculator',
      iconColor: 'teal',
      title: 'GST & Tax Management',
      description: 'Automated state-based CGST, SGST, and IGST calculations with CA-ready monthly tax report exports.'
    },
    {
      id: 'inventory-stock',
      iconType: 'package',
      iconColor: 'blue',
      title: 'Inventory & Stock Control',
      description: 'Real-time stock tracking, automatic deduction on sales, low stock alerts, and product catalog management.'
    },
    {
      id: 'customer-supplier',
      iconType: 'cart',
      iconColor: 'teal',
      title: 'Customer & Supplier Ledger',
      description: 'Maintain customer purchase history, supplier purchase bills, payment statuses, and outstanding dues.'
    },
    {
      id: 'reports-analytics',
      iconType: 'chart',
      iconColor: 'blue',
      title: 'Reports & Business Analytics',
      description: 'Comprehensive sales reports, daily revenue summaries, and downloadable financial data in Excel/CSV.'
    },
    {
      id: 'multi-tenant',
      iconType: 'layers',
      iconColor: 'teal',
      title: 'Multi-Tenant & Security',
      description: 'Bank-grade tenant data isolation, secure user permissions, and reliable cloud infrastructure.'
    }
  ]
};

export const FEATURE_CARDS_DATA = {
  sectionTag: 'ALL THE FEATURES YOU NEED',
  sectionTitle: 'Designed For High Reliability, Security & Speed',
  subtitle: 'Complete store automation built for single outlets and large retail chains.',
  cards: [
    {
      iconType: 'store',
      leftTitle: 'Store Operations & POS',
      leftDesc: 'Instant barcode scanning, thermal POS printing, custom receipt branding, and cash counter management.',
      rightTitle: 'Complete Counter Control',
      features: [
        'Multi-Terminal POS Cash Registers',
        '3-Inch Thermal Receipt Printing',
        'Split Payment (Cash, UPI, Card)',
        'Pro-Rata Header Discounts',
        'Item Warranty Tracking (12/24 Months)',
        'Public Bill Share URL Links (/public/bills/:id)'
      ]
    },
    {
      iconType: 'tax',
      leftTitle: 'Tax & CA Compliance',
      leftDesc: 'Automated state-based CGST/SGST/IGST calculation, HSN Table 12 grouping, and Excel return export.',
      rightTitle: 'CA-Ready Financial Returns',
      features: [
        'Intrastate vs Interstate Auto-Split',
        'Output Sales Tax vs ITC Paid Reconciliation',
        'HSN Code 8471 / 8517 Aggregation',
        '1-Click CA Audit Package (Excel/CSV)',
        'Supplier Purchase Bill Tracking',
        'Monthly Tax Health Discrepancy Alerts'
      ]
    }
  ]
};

export const ENTERPRISE_SECURITY_ITEMS = [
  {
    title: 'Multi-Tenant Isolation',
    desc: 'Database queries and staff roles are scoped strictly by tenant partition ID, ensuring complete store privacy.',
    iconName: 'ShieldCheck'
  },
  {
    title: '256-Bit SSL Encryption',
    desc: 'All billing data, customer mobile numbers, and invoice records are encrypted in transit and at rest.',
    iconName: 'Lock'
  },
  {
    title: 'GST Suvidha Ready',
    desc: 'Built according to official GSTN tax slabs and state code rules for seamless monthly audit compliance.',
    iconName: 'Award'
  },
  {
    title: 'Real-Time Cloud Backups',
    desc: 'Automated redundant backups ensure your store counter never loses a single billing invoice or ledger entry.',
    iconName: 'Server'
  }
];

export const TESTIMONIALS_DATA = {
  sectionTag: 'STORE OWNER REVIEWS',
  sectionTitle: 'Trusted By Retail Outlets & Distributors Across India',
  subtitle: 'See how Softfyr BillPro empowers businesses to streamline POS checkout and GST tax filings.',
  testimonials: [
    {
      id: 1,
      rating: 5,
      quote: "Softfyr BillPro changed how we handle billing! The thermal printer support is lightning fast, and our customers love getting instant WhatsApp bill links.",
      name: "Vikram Malhotra",
      role: "Owner",
      business: "Apex Supermarket",
      location: "Mumbai, Maharashtra",
      outlets: "6 Stores",
      avatarColor: "bg-indigo-600"
    },
    {
      id: 2,
      rating: 5,
      quote: "The automated GST Tax Engine is a lifesaver. It automatically splits CGST/SGST vs IGST depending on customer location. Our CA gets monthly Excel reports with 1 click!",
      name: "Priya Sharma",
      role: "Finance Director",
      business: "Priya Tech Solutions",
      location: "Bengaluru, Karnataka",
      outlets: "12 Locations",
      avatarColor: "bg-purple-600"
    },
    {
      id: 3,
      rating: 5,
      quote: "Managing electronics warranty policies was always messy until Softfyr BillPro. Now warranty terms auto-inherit from sub-categories and print right on the bill receipt.",
      name: "Rajesh Kulkarni",
      role: "Store Manager",
      business: "Kulkarni Electronics Chain",
      location: "Pune, Maharashtra",
      outlets: "4 Outlets",
      avatarColor: "bg-emerald-600"
    }
  ]
};

export const SAAS_PRICING_PACKAGES = [
  {
    id: 'starter-plan',
    name: 'Starter Retail',
    tagline: 'Ideal for single retail shops & small billing counters',
    monthlyPrice: 499,
    yearlyPrice: 4990,
    badge: '14-Day Free Trial',
    badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
    popular: false,
    features: [
      '1 Active POS Billing Terminal',
      'Barcode Scanning & Thermal 3-Inch Receipts',
      'Customer Lookup by Mobile & Name',
      'Basic Inventory & Low Stock Alerts',
      'Item Warranty Period Tracking',
      'Standard GST Tax Reports'
    ]
  },
  {
    id: 'growth-pro-plan',
    name: 'Growth Pro',
    tagline: 'Best for growing multi-store businesses & supermarkets',
    monthlyPrice: 999,
    yearlyPrice: 9990,
    badge: '★ MOST POPULAR',
    badgeStyle: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-500 shadow-md shadow-indigo-200 font-extrabold',
    popular: true,
    features: [
      'Unlimited POS Terminals & Billing Counters',
      'Automated CGST/SGST vs IGST Tax Engine',
      'Master Category & Sub-Category Hierarchy',
      'Supplier Purchase Bills & ITC Credit Ledger',
      'Pro-Rata Header Discount Apportionment',
      '24/7 Priority WhatsApp & Phone Support'
    ]
  },
  {
    id: 'enterprise-plan',
    name: 'Enterprise Unlimited',
    tagline: 'For large chains, franchises & multi-tenant setups',
    monthlyPrice: 1999,
    yearlyPrice: 19990,
    badge: '👑 BEST VALUE',
    badgeStyle: 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold',
    popular: false,
    features: [
      'Unlimited Multi-Tenant Outlets & Partitions',
      'CA Audit Package Monthly Returns (Excel/CSV)',
      'HSN Code 8471/8517 Table 12 Aggregation',
      'Public Bill Share URLs for Customers',
      'Custom Store Receipt Headers & Logo Branding',
      'Dedicated Account Manager & SLA'
    ]
  }
];

export const FAQ_CATEGORIES = [
  { id: 'ALL', label: 'All Questions' },
  { id: 'POS_THERMAL', label: 'POS & Thermal Print' },
  { id: 'TAX_CA', label: 'GST Tax & CA Audit' },
  { id: 'SECURITY_TENANT', label: 'Security & Multi-Tenant' }
];

export const FAQ_ITEMS = [
  {
    category: 'TAX_CA',
    q: "How does Softfyr BillPro calculate Intrastate (CGST+SGST) vs Interstate (IGST) tax?",
    a: "During POS billing or purchase entry, our automated tax engine compares your store's state code with the customer's state code. If both are in the same state, it automatically splits tax into CGST (9%) + SGST (9%). If the customer is in a different state, it calculates IGST (18%)."
  },
  {
    category: 'POS_THERMAL',
    q: "Can I track Product Warranty policies across Categories and Sub-Categories?",
    a: "Yes! You can define default warranty policies (Days, Months, Years) at Master Category or Sub-Category levels. Products automatically inherit these defaults, and warranty periods are printed directly on the thermal receipt."
  },
  {
    category: 'TAX_CA',
    q: "How does the CA Monthly Audit Package export work?",
    a: "The Tax Management Hub provides a 1-click export of the entire Monthly Tax Audit Package in Excel/CSV format. It reconciles Output Sales GST against Input ITC Paid to suppliers and aggregates HSN Table 12 data for easy CA filing."
  },
  {
    category: 'POS_THERMAL',
    q: "Does it support Thermal Printers and Public Bill URL sharing?",
    a: "Softfyr BillPro supports 3-inch (80mm) and 2-inch (58mm) Thermal Printers. Every generated invoice also creates a secure Public URL link (/public/bills/:id) that can be shared with customers via WhatsApp or SMS."
  },
  {
    category: 'SECURITY_TENANT',
    q: "Is my store data isolated from other tenant accounts?",
    a: "Yes! Softfyr BillPro uses multi-tenant database scoping. Every store tenant has completely isolated database records, custom receipt branding, and independent staff role-based access control (RBAC)."
  },
  {
    category: 'TAX_CA',
    q: "Can I manage supplier purchase bills and Input Tax Credit (ITC)?",
    a: "Absolutely. The Purchase & Supplier module allows you to record inward vendor bills, upload bill attachments, record payments, and track eligible ITC credit against your outward GST liabilities."
  }
];

export const CTA_BANNER_DATA = {
  badge: 'Get Started Today',
  title: 'Ready To Digitize Your Enterprise Store Outlets?',
  subtitle: 'Join retail stores & distributors automating POS billing and GST tax compliance with Softfyr BillPro.',
  primaryCtaText: 'Start Free Trial Now',
  secondaryCtaText: 'Book Enterprise Demo'
};

export const FOOTER_DATA = {
  brandDescription: 'All-in-one GST & multi-tenant billing software to automate operations, manage inventory, and deliver better retail experience.',
  productLinks: [
    { label: 'Features', id: 'about' },
    { label: 'Modules', id: 'services' },
    { label: 'Pricing', id: 'services' }
  ],
  companyLinks: [
    { label: 'About Us', id: 'about' },
    { label: 'Contact Us', id: 'contact-us' }
  ],
  legalLinks: [
    { label: 'Privacy Policy', path: '/privacy-policy' },
    { label: 'Terms & Conditions', path: '/terms-and-conditions' },
    { label: 'Refund Policy', path: '/refund-policy' }
  ],
  supportLinks: [
    { label: 'Help Center', path: '#' },
    { label: 'Documentation', path: '#' },
    { label: 'Customer Support', id: 'contact-us' }
  ]
};

