import { motion, Variants } from "framer-motion";
import { PropsWithChildren, HTMLAttributes } from "react";

const spring = { type: "spring" as const, stiffness: 300, damping: 30, mass: 0.8 };

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export const staggerChildren: Variants = {
  initial: {},
  enter: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

export const itemUp: Variants = {
  initial: { opacity: 0, y: 16 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export const itemScale: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  enter: { opacity: 1, scale: 1, transition: spring },
};

type DivProps = HTMLAttributes<HTMLDivElement>;

export const Page = ({ children, className, ...rest }: PropsWithChildren<DivProps>) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="enter"
    exit="exit"
    className={className}
    {...(rest as any)}
  >
    {children}
  </motion.div>
);

export const Stagger = ({ children, className, ...rest }: PropsWithChildren<DivProps>) => (
  <motion.div
    variants={staggerChildren}
    initial="initial"
    animate="enter"
    className={className}
    {...(rest as any)}
  >
    {children}
  </motion.div>
);

export const Item = ({ children, className, variant = "up", ...rest }: PropsWithChildren<DivProps & { variant?: "up" | "scale" }>) => (
  <motion.div
    variants={variant === "up" ? itemUp : itemScale}
    className={className}
    {...(rest as any)}
  >
    {children}
  </motion.div>
);

export const Tappable = ({ children, className, ...rest }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) => (
  <motion.div
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.985 }}
    transition={spring}
    className={className}
    {...(rest as any)}
  >
    {children}
  </motion.div>
);

export const Counter = ({ value, className, prefix = "", suffix = "" }: { value: number; className?: string; prefix?: string; suffix?: string }) => (
  <motion.span
    key={value}
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {prefix}
    {new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 }).format(value)}
    {suffix}
  </motion.span>
);
