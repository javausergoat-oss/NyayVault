import React from 'react';

export default function ShimmerButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  shimmerColor = '#ffffff',
  shimmerSize = '0.05em',
  shimmerDuration = '2.5s',
  background = 'radial-gradient(ellipse 80% 80% at 50% 120%, #1d4ed8, #0e1d3e)',
  borderRadius = '14px',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        borderRadius,
        background,
      }}
      className={`group relative isolate flex items-center justify-center gap-2 overflow-hidden px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-900/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${className}`}
    >
      {/* Animated Shimmer Overlay */}
      <div
        style={{
          '--shimmer-color': shimmerColor,
          '--shimmer-duration': shimmerDuration,
        }}
        className="pointer-events-none absolute -inset-full animate-shimmer bg-[linear-gradient(110deg,transparent,35%,rgba(255,255,255,0.25),50%,transparent,75%)] bg-[length:200%_100%] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />

      {/* Subtle border glow */}
      <div 
        style={{ borderRadius }}
        className="pointer-events-none absolute inset-0 border border-white/20" 
      />

      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </button>
  );
}
