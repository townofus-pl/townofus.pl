"use client";

import { useState, ReactNode } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  icon?: string;
}

export function CollapsibleSection({ 
  title, 
  children, 
  defaultOpen = false,
  icon 
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-zinc-900/50 backdrop-blur-md rounded-xl border border-zinc-700/50 overflow-hidden mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 transition-colors"
      >
        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
        </h3>
        <svg
          className={`w-6 h-6 text-zinc-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6">
          {children}
        </div>
      )}
    </div>
  );
}

export default CollapsibleSection;
