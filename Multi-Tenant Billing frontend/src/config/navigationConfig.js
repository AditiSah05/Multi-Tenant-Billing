import {
  LayoutDashboard,
  Package,
  Boxes,
  FileText,
  ShoppingCart,
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  Receipt,
  UserCheck,
  
  Settings,
  HelpCircle,
  ShieldCheck,
  CreditCard
} from 'lucide-react';

export const VENDOR_NAVIGATION = [
  { id: 'dashboard', name: 'Dashboard', path: '/vendor/dashboard', icon: LayoutDashboard },
  { id: 'invoices', name: 'Invoices & Bills', path: '/vendor/invoices', icon: FileText },
  { id: 'products', name: 'Products & Catalog', path: '/vendor/products', icon: Package },
  { id: 'inventory', name: 'Inventory & Stock', path: '/vendor/inventory', icon: Boxes },
  { id: 'purchases', name: 'Purchases', path: '/vendor/purchases', icon: Receipt },
  { id: 'customers', name: 'Customers', path: '/vendor/customers', icon: Users },
  { id: 'suppliers', name: 'Suppliers', path: '/vendor/suppliers', icon: Building2 },
  { id: 'payments', name: 'Payments', path: '/vendor/payments', icon: DollarSign },
  { id: 'reports', name: 'Reports & Analytics', path: '/vendor/reports', icon: TrendingUp },
  { id: 'employees', name: 'Staff Management', path: '/vendor/employees', icon: UserCheck },
  { id: 'business-profile', name: 'Store Profile', path: '/vendor/business-profile', icon: Settings }
];

export const ADMIN_NAVIGATION = [
  { id: 'dashboard', name: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { id: 'tenants', name: 'Tenant Businesses', path: '/admin/tenants', icon: Building2, badge: 'Core' },
  { id: 'subscriptions', name: 'Subscriptions', path: '/admin/subscriptions', icon: CreditCard },
  { id: 'packages', name: 'Package Tiers', path: '/admin/packages', icon: Package },
  { id: 'support', name: 'Support Tickets', path: '/admin/support', icon: HelpCircle },
  { id: 'security', name: 'Security Audit', path: '/admin/security', icon: ShieldCheck }
];
