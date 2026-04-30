import { motion } from "framer-motion";
import { Lock, ShieldCheck } from "lucide-react";

/**
 * Kurze, sichere Erfolgs-Animation nach dem Entsperren des Tresors.
 * - Schloss "klickt" auf
 * - Goldener Pulse + Schild-Bestätigung
 * Dauer ca. 1.1s, dann onComplete.
 */
export const VaultUnlockAnimation = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onAnimationComplete={() => {
        window.setTimeout(onComplete, 1100);
      }}
      role="status"
      aria-live="polite"
      aria-label="Tresor wird entsperrt"
    >
      <div className="relative flex flex-col items-center">
        {/* Goldener Pulse-Ring */}
        <motion.div
          className="absolute h-32 w-32 rounded-full bg-gradient-gold opacity-40"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [0.6, 1.6, 2.2], opacity: [0, 0.45, 0] }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
        <motion.div
          className="absolute h-32 w-32 rounded-full border-2 border-primary"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [0.8, 1.8], opacity: [0, 0.6, 0] }}
          transition={{ duration: 1.1, ease: "easeOut", delay: 0.1 }}
        />

        {/* Schloss → Schild Wechsel */}
        <motion.div
          className="relative h-24 w-24 rounded-3xl bg-gradient-gold flex items-center justify-center shadow-gold"
          initial={{ scale: 0.7, rotate: -8 }}
          animate={{ scale: [0.7, 1.1, 1], rotate: [-8, 4, 0] }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: [1, 0], scale: [1, 0.6] }}
            transition={{ duration: 0.35, delay: 0.45 }}
            className="absolute"
          >
            <Lock className="h-10 w-10 text-black" strokeWidth={2.5} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0, 1], scale: [0.6, 1] }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="absolute"
          >
            <ShieldCheck className="h-11 w-11 text-black" strokeWidth={2.5} />
          </motion.div>
        </motion.div>

        <motion.p
          className="mt-6 text-white font-semibold tracking-wide"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.3 }}
        >
          Tresor entsperrt
        </motion.p>
        <motion.p
          className="text-[11px] text-white/50 mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.3 }}
        >
          Lokal entschlüsselt · Zero-Knowledge
        </motion.p>
      </div>
    </motion.div>
  );
};
