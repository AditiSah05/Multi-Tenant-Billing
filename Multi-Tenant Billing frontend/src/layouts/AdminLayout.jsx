import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  PackageCheck,
  FolderTree,
  LifeBuoy,
  Shield,
  PhoneCall,
  Bell,
  ChevronDown,
  LogOut,
  IndianRupee,
  Menu,
  X,
  CreditCard,
  Zap,
  ChevronRight
} from 'lucide-react';

const AdminLayout = () => {
  const { logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Mobile Sidebar Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-[260px] bg-[#0c0d38] text-white flex flex-col z-50 border-r border-white/10 transition-transform duration-300 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Brand Header */}
        <div className="h-[75px] flex items-center justify-between px-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-extrabold shadow-lg shadow-indigo-600/40">
              <IndianRupee size={24} />
            </div>
            <div>
              <div className="font-extrabold text-xl leading-tight text-white tracking-tight">BillPro</div>
              <div className="text-[11px] text-slate-400 font-medium">Smart Billing Solution</div>
            </div>
          </div>
          <button
            className="lg:hidden text-slate-400 hover:text-white p-1 cursor-pointer"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Structured Sidebar Sections & Modules */}
        <nav className="p-3.5 flex-1 overflow-y-auto space-y-4">
          {/* SECTION 1: CORE MODULES */}
          <div>
            <div className="px-4 text-[10px] font-extrabold text-slate-400 tracking-wider uppercase mb-1.5">
              Core Modules
            </div>
            <div className="space-y-1">
              <NavLink
                to="/admin/dashboard"
                onClick={() => setMobileSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </div>
              </NavLink>

              <NavLink
                to="/admin/tenants"
                onClick={() => setMobileSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Users size={18} />
                  <span>Tenant Management</span>
                </div>
              </NavLink>
            </div>
          </div>

          {/* SECTION 2: SUBSCRIPTION & BILLING */}
          <div>
            <div className="px-4 text-[10px] font-extrabold text-slate-400 tracking-wider uppercase mb-1.5">
              Subscription & Billing
            </div>
            <div className="space-y-1">
              <NavLink
                to="/admin/tenants/TEN-000248/subscription"
                onClick={() => setMobileSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Zap size={18} />
                  <span>Subscriptions</span>
                </div>
              </NavLink>

              <NavLink
                to="/admin/tenants/TEN-000248/payments"
                onClick={() => setMobileSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <CreditCard size={18} />
                  <span>Payment History</span>
                </div>
              </NavLink>

              <NavLink
                to="/admin/packages"
                onClick={() => setMobileSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <PackageCheck size={18} />
                  <span>Packages & Plans</span>
                </div>
              </NavLink>
            </div>
          </div>

          {/* SECTION 3: PLATFORM & TAXONOMY */}
          <div>
            <div className="px-4 text-[10px] font-extrabold text-slate-400 tracking-wider uppercase mb-1.5">
              Platform & Taxonomy
            </div>
            <div className="space-y-1">
              <NavLink
                to="/admin/categories"
                onClick={() => setMobileSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <FolderTree size={18} />
                  <span>Categories</span>
                </div>
              </NavLink>
            </div>
          </div>

          {/* SECTION 4: CMS & HELPDESK */}
          <div>
            <div className="px-4 text-[10px] font-extrabold text-slate-400 tracking-wider uppercase mb-1.5">
              CMS & Helpdesk
            </div>
            <div className="space-y-1">
              <NavLink
                to="/admin/support"
                onClick={() => setMobileSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <LifeBuoy size={18} />
                  <span>Support Tickets</span>
                </div>
              </NavLink>

              <NavLink
                to="/admin/policies"
                onClick={() => setMobileSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Shield size={18} />
                  <span>Policies</span>
                </div>
              </NavLink>

              <NavLink
                to="/admin/contact-info"
                onClick={() => setMobileSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <PhoneCall size={18} />
                  <span>Contact Info</span>
                </div>
              </NavLink>
            </div>
          </div>
        </nav>

        {/* Logout Button Footer */}
        <div className="p-4 border-t border-white/10 shrink-0">
          <button
            onClick={logout}
            className="w-full px-4 py-2.5 rounded-xl bg-indigo-900/40 hover:bg-indigo-600 text-white transition-all text-xs sm:text-sm font-bold flex items-center justify-start gap-2.5 cursor-pointer border border-white/10"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-[260px] min-h-screen flex flex-col transition-all">
        {/* Topbar */}
        <header className="h-[70px] bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Open Navigation Menu"
            >
              <Menu size={22} />
            </button>
          </div>

          {/* Right Profile & Notifications */}
          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer">
              <Bell size={20} className="text-slate-600" />
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                3
              </span>
            </div>

            {/* Profile Dropdown Trigger */}
            <div className="relative">
              <div
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-md">
                  A
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight">Admin</div>
                  <div className="text-[10px] text-slate-500 font-medium">Super Admin</div>
                </div>
                <ChevronDown size={14} className="text-slate-500" />
              </div>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50">
                  <div className="p-2 border-b border-slate-100 text-xs text-slate-500">
                    Signed in as <strong className="text-slate-900 block">Super Admin</strong>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full text-left flex items-center gap-2 p-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Container */}
        <main className="p-3.5 sm:p-6 lg:p-8 flex-1 w-full mx-auto max-w-full overflow-x-hidden">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="mt-auto px-4 sm:px-8 py-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div>© 2025 BillPro. All rights reserved.</div>
          <div>Made with ❤️ in India</div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
