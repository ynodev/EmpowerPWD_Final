import React from 'react';

export function LegalSection({ title, children, className = '' }) {
  return (
    <section className={`mb-8 ${className}`}>
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <div className="w-1.5 h-6 bg-blue-500 rounded mr-3"></div>
        {title}
      </h3>
      {children}
    </section>
  );
}