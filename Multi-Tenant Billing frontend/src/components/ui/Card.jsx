import React from 'react';

export const Card = ({ children, className = '', ...props }) => (
  <div className={`bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`mb-4 pb-3 border-b border-slate-100 flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-base font-extrabold text-slate-900 ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`text-xs text-slate-500 mt-0.5 ${className}`} {...props}>
    {children}
  </p>
);

export const CardBody = ({ children, className = '', ...props }) => (
  <div className={`space-y-3 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`mt-4 pt-3 border-t border-slate-100 flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);

export default Card;
