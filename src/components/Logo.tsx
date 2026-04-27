export const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <div className="relative h-8 w-8 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
      <span className="text-primary-foreground font-bold text-sm">i</span>
      <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary-glow" />
    </div>
    <span className="text-lg font-bold tracking-tight">
      Immo<span className="text-gradient-gold">NIQ</span>
    </span>
  </div>
);
