import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export const OfflineIndicator = () => {
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [showRecovered, setShowRecovered] = useState(false);

  useEffect(() => {
    const goOnline = () => {
      setOnline(true);
      setShowRecovered(true);
      setTimeout(() => setShowRecovered(false), 2500);
    };
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-full bg-destructive text-destructive-foreground text-xs font-medium shadow-lg flex items-center gap-2"
        >
          <WifiOff className="h-3.5 w-3.5" />
          Offline — gecachte Daten werden angezeigt
        </motion.div>
      )}
      {online && showRecovered && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-medium shadow-lg flex items-center gap-2"
        >
          <Wifi className="h-3.5 w-3.5" /> Wieder online
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;
