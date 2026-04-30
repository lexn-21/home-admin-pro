import { forwardRef } from "react";

export const Logo = forwardRef<HTMLSpanElement, { className?: string }>(
  ({ className = "" }, ref) => (
    <span ref={ref} className={`text-lg font-bold tracking-tight font-display ${className}`}>
      <span className="text-foreground">Immon</span>
      <span className="text-gradient-gold">IQ</span>
    </span>
  )
);
Logo.displayName = "Logo";
