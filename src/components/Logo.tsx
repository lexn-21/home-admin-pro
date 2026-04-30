export const Logo = ({ className = "" }: { className?: string }) => (
  <span className={`text-lg font-bold tracking-tight font-display ${className}`}>
    <span className="text-foreground">Immon</span>
    <span className="text-gradient-gold">IQ</span>
  </span>
);
