import React from "react";
import { cn } from "../../lib/utils";

export function BackgroundGrid({ children, className }) {
  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-hidden bg-slate-950 flex items-center justify-center",
        className
      )}
    >
      {/* Grid Pattern with Radial Gradient Mask */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-25 [background-image:linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] [background-size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" 
      />
      {children}
    </div>
  );
}
