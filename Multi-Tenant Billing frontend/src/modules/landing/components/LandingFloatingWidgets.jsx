import React from 'react';
import { MessageSquare, Phone } from 'lucide-react';

export const LandingFloatingWidgets = ({ brandConfig }) => {
  const whatsappUrl = `https://wa.me/${brandConfig.whatsappNumber}?text=${encodeURIComponent(brandConfig.whatsappMessage)}`;
  const phoneUrl = `tel:${brandConfig.supportPhone.replace(/\s+/g, '')}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* WhatsApp Support */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-center w-12 h-12 rounded-full bg-[#22c55e] text-white shadow-xl shadow-green-500/30 hover:bg-emerald-600 hover:scale-110 transition-all duration-300 cursor-pointer"
        title="WhatsApp Support"
      >
        <MessageSquare className="w-5 h-5 fill-current" />
      </a>

      {/* Direct Call Support */}
      <a
        href={phoneUrl}
        className="group flex items-center justify-center w-12 h-12 rounded-full bg-[#0284c7] text-white shadow-xl shadow-blue-500/30 hover:bg-blue-600 hover:scale-110 transition-all duration-300 cursor-pointer"
        title="Call Support"
      >
        <Phone className="w-5 h-5 fill-current" />
      </a>
    </div>
  );
};

export default LandingFloatingWidgets;
