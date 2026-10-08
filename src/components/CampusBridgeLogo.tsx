import React from 'react';

export const CampusBridgeLogo: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 32,
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="flex items-center justify-center rounded-lg bg-[#173B63] text-white shadow-sm"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-blue-300"
        >
          {/* Bridge arch and connecting nodes symbolizing Academia and Industry */}
          <path d="M3 18h18" />
          <path d="M4 18V9" />
          <path d="M20 18V9" />
          <path d="M4 10c4-4 12-4 16 0" />
          <path d="M12 7v11" />
          <circle cx="12" cy="5" r="1.5" fill="#60A5FA" />
          <circle cx="4" cy="9" r="1.5" fill="#93C5FD" />
          <circle cx="20" cy="9" r="1.5" fill="#93C5FD" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-bold tracking-tight text-[#173B63] leading-none">
          CampusBridge
        </span>
        <span className="text-[10px] font-medium text-slate-500 tracking-wider uppercase mt-0.5">
          Academic–Industry Network
        </span>
      </div>
    </div>
  );
};
