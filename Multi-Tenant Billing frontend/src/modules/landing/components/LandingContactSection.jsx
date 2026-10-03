import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MessageSquare, 
  FileText, 
  Send, 
  MapPin, 
  Globe, 
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

export const LandingContactSection = ({ brandConfig }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  const addressText = brandConfig?.address || '206, 2nd Floor, Brindavan Kunj, Exhibition Road, Patna';
  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressText)}`;

  return (
    <section id="contact-us" className="py-10 md:py-20 px-4 sm:px-10 lg:px-16 max-w-full mx-auto bg-white font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-full mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMN 1: Get In Touch (Form) */}
          <div className="lg:col-span-5 space-y-5 sm:space-y-6">
            <div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Get In <span className="text-[#00A3FF]">Touch</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-2 font-medium">
                Fill out the form and our team will get back to you as soon as possible.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 sm:p-8 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">Thank You!</h3>
                <p className="text-xs text-slate-600">
                  Your message has been received. Our team will contact you shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
                  }}
                  className="mt-2 text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
                
                {/* Row 1: Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Your Name *"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white border border-indigo-200 focus:border-[#00A3FF] focus:ring-2 focus:ring-sky-100 rounded-xl pl-12 pr-4 py-3 text-xs text-slate-900 placeholder-slate-400 font-semibold transition-all outline-none"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="Email Address *"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white border border-indigo-200 focus:border-[#00A3FF] focus:ring-2 focus:ring-sky-100 rounded-xl pl-12 pr-4 py-3 text-xs text-slate-900 placeholder-slate-400 font-semibold transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Row 2: Phone & Subject */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="Phone Number *"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-white border border-indigo-200 focus:border-[#00A3FF] focus:ring-2 focus:ring-sky-100 rounded-xl pl-12 pr-4 py-3 text-xs text-slate-900 placeholder-slate-400 font-semibold transition-all outline-none"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Subject *"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-white border border-indigo-200 focus:border-[#00A3FF] focus:ring-2 focus:ring-sky-100 rounded-xl pl-12 pr-4 py-3 text-xs text-slate-900 placeholder-slate-400 font-semibold transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Row 3: Message */}
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    required
                    placeholder="Your Message *"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-white border border-indigo-200 focus:border-[#00A3FF] focus:ring-2 focus:ring-sky-100 rounded-2xl pl-12 pr-4 py-3 text-xs text-slate-900 placeholder-slate-400 font-semibold transition-all outline-none resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:opacity-95 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Sending Message...</span>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send className="w-4 h-4 transform rotate-45" />
                    </>
                  )}
                </button>

              </form>
            )}
          </div>

          {/* COLUMN 2: Contact Information */}
          <div className="lg:col-span-4 space-y-5 sm:space-y-6 lg:pl-2">
            <div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Contact <span className="text-[#00A3FF]">Information</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-2 font-medium">
                Reach out to us through any of these channels.
              </p>
            </div>

            <div className="space-y-4 sm:space-y-5 text-xs sm:text-sm">
              
              {/* Our Address */}
              <div className="flex items-start gap-3.5 sm:gap-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-600">Our Address</div>
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5 leading-snug">
                    {addressText}
                  </div>
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex items-start gap-3.5 sm:gap-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-600">Phone Number</div>
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5">
                    {brandConfig.supportPhone}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                    {brandConfig.supportHours || 'Mon - Sat | 9:00 AM - 7:00 PM'}
                  </div>
                </div>
              </div>

              {/* Email Address */}
              <div className="flex items-start gap-3.5 sm:gap-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-emerald-600">Email Address</div>
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5 break-all">
                    {brandConfig.supportEmail}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                    We reply within a few hours
                  </div>
                </div>
              </div>

              {/* Website */}
              <div className="flex items-start gap-3.5 sm:gap-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-emerald-600">Website</div>
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5 break-all">
                    {brandConfig.websiteUrl}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                    Visit our website for more information
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* COLUMN 3: Google Map Card */}
          <div className="lg:col-span-3">
            <div className="relative w-full h-[260px] sm:h-[340px] rounded-3xl border border-slate-200 overflow-hidden shadow-md group">
              
              {/* Google Maps Embed iframe */}
              <iframe
                title="Office Location Map"
                src="https://maps.google.com/maps?q=Exhibition%20Road%20Patna&t=&z=14&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0 filter grayscale-[10%] contrast-[105%]"
                allowFullScreen=""
                loading="lazy"
              />

              {/* Top Overlay Button: Open in Maps */}
              <a
                href={mapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-md border border-slate-200 text-xs font-bold text-sky-600 shadow-md flex items-center gap-1.5 hover:bg-white transition-colors cursor-pointer"
              >
                <span>Open in Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default LandingContactSection;
