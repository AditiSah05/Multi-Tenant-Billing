import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, ArrowRight, Menu, X } from 'lucide-react';

export const LandingHeader = ({ brandConfig, navLinks, scrollToSection }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (id) => {
    scrollToSection(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-slate-200/80 shadow-xs">
      <div className="max-w-full px-4 sm:px-10 lg:px-16 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div 
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setIsMobileMenuOpen(false);
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform duration-300">
            <IndianRupee size={18} color="#ffffff" />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#0f172a] flex items-center gap-1 leading-none">
              {brandConfig.brandName} <span className="text-[#0284c7]">{brandConfig.accentName}</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">
              {brandConfig.subtitle}
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs sm:text-sm font-bold text-slate-600">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className="hover:text-[#0284c7] transition-colors cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right Action Buttons & Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="hidden sm:flex items-center gap-2.5">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-1.5 rounded-full text-xs font-bold border border-indigo-600/30 text-indigo-700 bg-white hover:bg-indigo-50 transition-all duration-200 cursor-pointer shadow-2xs"
            >
              Login
            </button>

            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full text-xs font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Hamburger Menu Icon for Mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer / Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="px-5 pt-3 pb-6 space-y-4">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className="w-full text-left py-2.5 px-3.5 rounded-xl text-sm font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 transition-all cursor-pointer flex items-center justify-between"
                >
                  <span>{link.label}</span>
                  <span className="text-slate-400 text-xs">→</span>
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold border border-indigo-600/30 text-indigo-700 bg-white hover:bg-indigo-50 transition-all duration-200 cursor-pointer shadow-2xs text-center"
              >
                Login
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingHeader;


