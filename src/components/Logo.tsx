export const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    {/* Icon: Schwarz gefüllt, IQ in Gold — passend zum Brand-Mark */}
    <div className="relative h-9 w-9 rounded-xl bg-black border border-primary/40 flex items-center justify-center shadow-gold transition-transform hover:scale-105">
      <span className="text-gradient-gold font-bold text-[13px] tracking-tight font-display leading-none">
        IQ
      </span>
    </div>
    {/* Wordmark */}
    <span className="text-lg font-bold tracking-tight font-display">
      <span className="text-foreground">Immon</span>
      <span className="text-gradient-gold">IQ</span>
    </span>
  </div>
);
