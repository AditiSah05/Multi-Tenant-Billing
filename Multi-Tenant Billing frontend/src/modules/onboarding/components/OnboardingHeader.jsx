import React from 'react';
import { UserCheck, Store, CreditCard, CheckCircle2 } from 'lucide-react';

const OnboardingHeader = ({ currentStep = 1 }) => {
  const steps = [
    { number: 1, label: 'Owner Info', icon: UserCheck, percent: '33%' },
    { number: 2, label: 'Store & Tax', icon: Store, percent: '66%' },
    { number: 3, label: 'Choose Plan', icon: CreditCard, percent: '100%' }
  ];

  const activeStep = steps.find((s) => s.number === currentStep) || steps[0];
  const progressPercent = currentStep === 1 ? '33%' : currentStep === 2 ? '66%' : '100%';

  return (
    <div className="mb-6 space-y-4">
      {/* Header Badge & Title */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[11px] font-bold mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
            Step {currentStep} of 3 • {activeStep.label}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {currentStep === 1 && 'Owner Profile Setup'}
            {currentStep === 2 && 'Business & Tax Details'}
            {currentStep === 3 && 'Choose Subscription Plan'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentStep === 1 && 'Enter personal contact details of the store owner/admin.'}
            {currentStep === 2 && 'Provide store branding, address, and tax registration info.'}
            {currentStep === 3 && 'Select a subscription plan to activate your store partition.'}
          </p>
        </div>

        {/* Percentage Badge */}
        <div className="shrink-0 text-right bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Progress</div>
          <div className="text-sm font-black text-indigo-600">{progressPercent}</div>
        </div>
      </div>

      {/* Visual Stepper Indicators */}
      <div className="grid grid-cols-3 gap-2">
        {steps.map((step) => {
          const isCompleted = step.number < currentStep;
          const isActive = step.number === currentStep;
          const Icon = step.icon;

          return (
            <div
              key={step.number}
              className={`p-2 sm:p-2.5 rounded-xl border transition-all text-left flex items-center gap-2 ${
                isActive
                  ? 'bg-indigo-50/90 border-indigo-600 ring-2 ring-indigo-500/20 text-indigo-900 font-bold'
                  : isCompleted
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : isCompleted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isCompleted ? <CheckCircle2 size={14} /> : <Icon size={12} />}
              </div>
              <div className="truncate text-[11px]">
                <div className="font-bold truncate">{step.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Line */}
      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
        <div
          className="bg-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: progressPercent }}
        ></div>
      </div>
    </div>
  );
};

export default OnboardingHeader;
