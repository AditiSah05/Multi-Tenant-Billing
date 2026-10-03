import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  Package,
  Users,
  Building2,
  Boxes,
  FileText,
  CreditCard,
  Receipt,
  BarChart2,
  UserCheck,
  Settings,
  Search,
  Plus,
  Bell,
  HelpCircle,
  Crown,
  ChevronDown,
  LogOut,
  IndianRupee,
  Menu,
  X,
  Sparkles,
  Percent
} from 'lucide-react';

const navItems = [
  {
    section: 'Core Operations',
    items: [
      { to: '/vendor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      {
        id: 'invoices-menu',
        label: 'Invoices & Bills',
        icon: FileText,
        subItems: [
          { to: '/vendor/invoices', label: 'Customer Invoices' },
          { to: '/vendor/invoices/returns/create', label: 'Return & Cancel Bill' },
        ],
      },
      {
        id: 'purchase-menu',
        label: 'Purchase',
        icon: ShoppingBag,
        subItems: [
          { to: '/vendor/purchases', label: 'Purchase Bills' },
          { to: '/vendor/purchases/returns/create', label: 'Purchase Returns' },
        ],
      },
    ]
  },
  {
    section: 'Inventory & Catalog',
    items: [
      { to: '/vendor/products', label: 'Products Catalog', icon: Package },
      { to: '/vendor/inventory', label: 'Inventory Stock', icon: Boxes }
    ]
  },
  {
    section: 'Contacts & People',
    items: [
      { to: '/vendor/customers', label: 'Customers', icon: Users },
      { to: '/vendor/suppliers', label: 'Suppliers', icon: Building2 },
      { to: '/vendor/employees', label: 'Staff & Cashiers', icon: UserCheck }
    ]
  },
  {
    section: 'Accounting & Reports',
    items: [
      { to: '/vendor/tax', label: 'Tax & GST Hub', icon: Percent, badge: 'CA Audit' },
      { to: '/vendor/payments', label: 'Payments', icon: CreditCard },
      { to: '/vendor/expenses', label: 'Expenses', icon: Receipt },
      { to: '/vendor/reports', label: 'Analytics Reports', icon: BarChart2 }
    ]
  }
];

const VendorLayout = () => {
  const { user, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState({
    'invoices-menu': true,
    'purchase-menu': true,
  });

  const toggleSubMenu = (menuId) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const storeName = user?.tenant?.businessName || user?.name || 'Apex Retail Store';
  const userRoleText = user?.role === 'EMPLOYEE' ? 'Cashier / Staff' : 'Store Admin';
  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AD';

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-[260px] bg-[#0c0d38] text-white flex flex-col z-50 border-r border-white/10 transition-transform duration-300 ease-in-out ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-[75px] flex items-center justify-between px-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-extrabold shadow-lg shadow-indigo-600/40">
              <IndianRupee size={22} />
            </div>
            <div>
              <div className="font-extrabold text-xl leading-tight text-white tracking-tight">Softfyr POS</div>
              <div className="text-[10px] text-slate-400 font-medium">Multi-Tenant Billing</div>
            </div>
          </div>

          <button
            className="lg:hidden text-slate-400 hover:text-white p-1"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="p-3.5 flex-1 overflow-y-auto space-y-4">
          {navItems.map((sec, idx) => (
            <div key={idx}>
              <div className="px-4 text-[10px] font-extrabold text-slate-400 tracking-wider uppercase mb-1.5">
                {sec.section}
              </div>
              <div className="space-y-1">
                {sec.items.map((item) => {
                  const Icon = item.icon;

                  if (item.subItems) {
                    const isOpen = Boolean(openSubMenus[item.id]);
                    return (
                      <div key={item.id} className="space-y-1">
                        <button
                          onClick={() => toggleSubMenu(item.id)}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={18} />
                            <span>{item.label}</span>
                          </div>
                          <ChevronDown
                            size={16}
                            className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-white' : 'text-slate-400'}`}
                          />
                        </button>

                        {isOpen && (
                          <div className="pl-9 pr-2 space-y-1 border-l-2 border-indigo-500/30 ml-6 my-1">
                            {item.subItems.map((sub) => (
                              <NavLink
                                key={sub.to}
                                to={sub.to}
                                end={sub.to === '/vendor/invoices' || sub.to === '/vendor/purchases'}
                                onClick={() => setMobileSidebarOpen(false)}
                                className={({ isActive }) =>
                                  `block px-3 py-2 text-xs font-semibold rounded-lg transition-all ${isActive
                                    ? 'bg-indigo-600 text-white font-extrabold shadow-md shadow-indigo-600/30'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                  }`
                                }
                              >
                                {sub.label}
                              </NavLink>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${isActive
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-400/30">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Settings Section */}
          <div>
            <div className="px-4 text-[10px] font-extrabold text-slate-400 tracking-wider uppercase mb-1.5">
              Configuration
            </div>
            <NavLink
              to="/vendor/settings"
              onClick={() => setMobileSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Settings size={18} />
              <span>Store Settings</span>
            </NavLink>
          </div>
        </nav>

        {/* Subscription Plan Card */}
        <div className="p-3.5 border-t border-white/10 shrink-0">
          <div className="bg-indigo-950/80 border border-indigo-500/30 rounded-2xl p-3.5 text-white space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                <Crown size={15} />
                <span>Growth Pro Plan</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30 uppercase">
                Active
              </span>
            </div>
            <div className="text-[11px] text-indigo-200">Isolated Multi-Tenant Store</div>
          </div>
        </div>

        {/* User Card Footer */}
        <div className="p-3.5 border-t border-white/10 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3 truncate">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-md">
              {userInitials}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">{storeName}</div>
              <div className="text-[10px] text-slate-400">{userRoleText}</div>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Container */}
      <div className="flex-1 lg:ml-[260px] min-h-screen flex flex-col transition-all">
        {/* Topbar Header */}
        <header className="h-[70px] bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 shadow-xs">
          {/* Mobile Menu Toggle & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              title="Open Navigation"
            >
              <Menu size={22} />
            </button>

            <div className="hidden sm:block text-sm font-extrabold text-slate-900">
              {storeName}
            </div>
          </div>

          {/* Right Section Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Quick Bill Action */}
            <NavLink
              to="/vendor/bills/create"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs shadow-md shadow-indigo-200 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={16} /> Create Bill
            </NavLink>

            {/* Notifications Bell */}
            <div className="relative cursor-pointer p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 bg-indigo-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                2
              </span>
            </div>

            {/* User Profile Dropdown */}
            <div className="relative">
              <div
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 cursor-pointer p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                  {userInitials}
                </div>
                <ChevronDown size={14} className="text-slate-500" />
              </div>

              {showProfileMenu && (
                <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in duration-150">
                  <div className="p-2 border-b border-slate-100 text-xs">
                    <div className="font-extrabold text-slate-900 truncate">{storeName}</div>
                    <div className="text-[11px] text-slate-400">{userRoleText}</div>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full text-left flex items-center gap-2 p-2 mt-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Outlet for Module Pages */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 w-full mx-auto">
          <Outlet />
        </main>

        {/* Application Footer */}
        <footer className="mt-auto px-4 sm:px-8 py-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div>© {new Date().getFullYear()} Softfyr Multi-Tenant Billing. All rights reserved.</div>
          <div>Enterprise SaaS Store Engine</div>
        </footer>
      </div>
    </div>
  );
};

export default VendorLayout;
