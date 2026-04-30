import { Link } from "react-router-dom";

export const Logo = ({
  className = "",
  to = "/app",
}: {
  className?: string;
  /** Ziel für Klick aufs Icon — default: Dashboard */
  to?: string;
}) => (
  <Link to={to} className={`flex items-center gap-2.5 group ${className}`} aria-label="ImmonIQ — zum Dashboard">
    {/* Icon: schwarz gefüllt, IQ in Gold */}
    <div className="relative h-9 w-9 rounded-xl bg-black border border-primary/40 flex items-center justify-center shadow-gold transition-transform group-hover:scale-105">
      <span className="text-gradient-gold font-bold text-[13px] tracking-tight font-display leading-none">
        IQ
      </span>
    </div>
    {/* Wordmark */}
    <span className="text-lg font-bold tracking-tight font-display">
      <span className="text-foreground">Immon</span>
      <span className="text-gradient-gold">IQ</span>
    </span>
  </Link>
);
