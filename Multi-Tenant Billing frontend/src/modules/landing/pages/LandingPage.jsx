import React, { useState } from 'react';

// Editable Data Configurations
import {
  BRAND_CONFIG,
  NAV_LINKS,
  TRUST_STATS,
  ENTERPRISE_TRUST_LOGOS,
  HERO_DATA,
  STEPS_DATA,
  MODULES_DATA,
  TESTIMONIALS_DATA,
  FAQ_ITEMS,
  CTA_BANNER_DATA,
  FOOTER_DATA
} from '../data/landingData';

// Modular Components
import LandingHeader from '../components/LandingHeader';
import LandingHero from '../components/LandingHero';
import LandingStepsSection from '../components/LandingStepsSection';
import LandingModulesSection from '../components/LandingModulesSection';
import LandingTestimonialFaqSection from '../components/LandingTestimonialFaqSection';
import LandingCtaBanner from '../components/LandingCtaBanner';
import LandingContactSection from '../components/LandingContactSection';
import LandingFooter from '../components/LandingFooter';
import LandingFloatingWidgets from '../components/LandingFloatingWidgets';
import BookDemoModal from '../components/BookDemoModal';
import ContactSupportModal from '../components/ContactSupportModal';

const LandingPage = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const scrollToSection = (id) => {
    if (id === 'home' || id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f8fc] text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-indigo-600 selection:text-white relative overflow-x-hidden">
      
      {/* Ambient Radial Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-full h-[650px] bg-gradient-to-b from-indigo-100/60 via-purple-50/40 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-96 right-0 w-96 h-96 bg-sky-100/50 blur-3xl pointer-events-none -z-10" />

      {/* 1. Header Navigation Bar */}
      <LandingHeader
        brandConfig={BRAND_CONFIG}
        navLinks={NAV_LINKS}
        scrollToSection={scrollToSection}
      />

      {/* 2. Home Section - Hero & Trust Metrics */}
      <section id="home" className="relative pt-6 pb-8 md:pt-10 md:pb-10 px-4 sm:px-10 lg:px-16 max-w-full mx-auto space-y-8">
        <LandingHero
          heroData={HERO_DATA}
          trustStats={TRUST_STATS}
          trustLogos={ENTERPRISE_TRUST_LOGOS}
          onOpenDemoModal={() => setIsDemoModalOpen(true)}
        />
      </section>

      {/* 3. About Section - 4-Step Onboarding Workflow */}
      <div id="about">
        <LandingStepsSection stepsData={STEPS_DATA} />
      </div>

      {/* 4. Services Section - Clean 6-Card Services Grid */}
      <div id="services">
        <LandingModulesSection modulesData={MODULES_DATA} />
      </div>

      {/* 5. Testimonials & Frequently Asked Questions (Side-by-Side) */}
      <LandingTestimonialFaqSection
        testimonialsData={TESTIMONIALS_DATA}
        faqItems={FAQ_ITEMS}
      />

      {/* 6. CTA Banner */}
      <LandingCtaBanner
        ctaData={CTA_BANNER_DATA}
        onOpenDemoModal={() => setIsDemoModalOpen(true)}
      />

      {/* 7. Real Interactive Contact Us Section */}
      <LandingContactSection brandConfig={BRAND_CONFIG} />

      {/* 8. Footer */}
      <LandingFooter
        brandConfig={BRAND_CONFIG}
        footerData={FOOTER_DATA}
        scrollToSection={scrollToSection}
      />

      {/* 7. Floating Action Widgets */}
      <LandingFloatingWidgets brandConfig={BRAND_CONFIG} />

      {/* 8. Interactive Modals */}
      <BookDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        brandConfig={BRAND_CONFIG}
      />

      <ContactSupportModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        brandConfig={BRAND_CONFIG}
      />

    </div>
  );
};

export default LandingPage;
