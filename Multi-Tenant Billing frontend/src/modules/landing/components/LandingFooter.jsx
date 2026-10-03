import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, Mail, Phone, Globe } from 'lucide-react';

export const LandingFooter = ({ brandConfig, footerData, scrollToSection }) => {
  const navigate = useNavigate();

  return (
    <footer className="bg-[#040914] text-slate-300 border-t border-slate-900 py-10 px-4 sm:px-10 lg:px-16 text-sm">
      <div className="max-w-full mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-12 gap-8 mb-10 sm:mb-12">
        
        {/* 1. Brand & Parent Company Column */}
        <div className="col-span-2 sm:col-span-3 lg:col-span-4 space-y-4 pr-0 lg:pr-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-r from-indigo-600 to-sky-500 rounded-xl flex items-center justify-center text-white shadow-md shrink-0">
              <IndianRupee size={20} color="#ffffff" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">
              {brandConfig.brandName} <span className="text-sky-400">{brandConfig.accentName}</span>
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-extrabold text-white tracking-wide">
              {brandConfig.parentCompany}
            </p>
            <p className="text-xs font-semibold text-slate-400 italic">
              {brandConfig.tagline}
            </p>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed font-normal max-w-sm">
            {footerData.brandDescription}
          </p>

          {/* Social Media Buttons */}
          <div className="flex items-center gap-2.5 pt-1">
            <a
              href="#"
              className="w-9 h-9 rounded-xl bg-[#0a1324] border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
              aria-label="Facebook"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href="#"
              className="w-9 h-9 rounded-xl bg-[#0a1324] border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
              aria-label="Twitter"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="#"
              className="w-9 h-9 rounded-xl bg-[#0a1324] border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
              aria-label="LinkedIn"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-1.3.7-2.1 1.6-2.1.9 0 1.3.7 1.3 2.1v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </a>
            <a
              href="#"
              className="w-9 h-9 rounded-xl bg-[#0a1324] border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
              aria-label="YouTube"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>

        {/* 2. PRODUCT Column */}
        <div className="col-span-1 sm:col-span-1 lg:col-span-2">
          <h4 className="text-white font-extrabold mb-3.5 uppercase tracking-widest text-[11px] sm:text-xs">PRODUCT</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            {footerData.productLinks?.map((link, idx) => (
              <li key={idx}>
                <button
                  onClick={() => scrollToSection(link.id)}
                  className="hover:text-white transition-colors cursor-pointer text-left py-0.5"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. COMPANY Column */}
        <div className="col-span-1 sm:col-span-1 lg:col-span-1">
          <h4 className="text-white font-extrabold mb-3.5 uppercase tracking-widest text-[11px] sm:text-xs">COMPANY</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            {footerData.companyLinks?.map((link, idx) => (
              <li key={idx}>
                <button
                  onClick={() => scrollToSection(link.id)}
                  className="hover:text-white transition-colors cursor-pointer text-left py-0.5"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* 4. LEGAL Column */}
        <div className="col-span-1 sm:col-span-1 lg:col-span-2">
          <h4 className="text-white font-extrabold mb-3.5 uppercase tracking-widest text-[11px] sm:text-xs">LEGAL</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            {footerData.legalLinks?.map((link, idx) => (
              <li key={idx}>
                <button
                  onClick={() => {
                    if (link.path && link.path !== '#') {
                      navigate(link.path);
                    }
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left py-0.5"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* 5. SUPPORT Column */}
        <div className="col-span-1 sm:col-span-1 lg:col-span-1">
          <h4 className="text-white font-extrabold mb-3.5 uppercase tracking-widest text-[11px] sm:text-xs">SUPPORT</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            {footerData.supportLinks?.map((link, idx) => (
              <li key={idx}>
                {link.id ? (
                  <button onClick={() => scrollToSection(link.id)} className="hover:text-white transition-colors cursor-pointer text-left py-0.5">
                    {link.label}
                  </button>
                ) : (
                  <a href={link.path || '#'} className="hover:text-white transition-colors block py-0.5">
                    {link.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* 6. CONTACT Column */}
        <div className="col-span-2 sm:col-span-2 lg:col-span-2">
          <h4 className="text-white font-extrabold mb-3.5 uppercase tracking-widest text-[11px] sm:text-xs">CONTACT</h4>
          <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
            <li className="flex items-center gap-2">
              <Mail size={14} className="text-sky-400 shrink-0" />
              <a href={`mailto:${brandConfig.supportEmail}`} className="hover:text-white transition-colors break-all">
                {brandConfig.supportEmail}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={14} className="text-emerald-400 shrink-0" />
              <a href={`tel:${brandConfig.supportPhone}`} className="hover:text-white transition-colors whitespace-nowrap">
                {brandConfig.supportPhone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Globe size={14} className="text-purple-400 shrink-0" />
              <a href={`https://${brandConfig.websiteUrl}`} target="_blank" rel="noreferrer" className="hover:text-white transition-colors break-all">
                {brandConfig.websiteUrl}
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* Copyright Bar */}
      <div className="max-w-full mx-auto pt-6 sm:pt-8 border-t border-slate-900/90 flex flex-col sm:flex-row items-center justify-center text-xs text-slate-400 font-medium text-center">
        <div>{brandConfig.copyrightText}</div>
      </div>
    </footer>
  );
};

export default LandingFooter;
