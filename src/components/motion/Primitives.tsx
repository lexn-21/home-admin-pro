import { motion, Variants } from "framer-motion";
import { forwardRef, HTMLAttributes, PropsWithChildren } from "react";

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

export const Page = forwardRef<HTMLDivElement, PropsWithChildren<DivProps>>(
  ({ children, className, ...rest }, ref) => (
    <motion.div
      ref={ref}
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      className={className}
      {...(rest as any)}
    >
      {children}
    </motion.div>
  )
);
Page.displayName = "Page";

export const Stagger = forwardRef<HTMLDivElement, PropsWithChildren<DivProps>>(
  ({ children, className, ...rest }, ref) => (
    <motion.div
      ref={ref}
      variants={staggerChildren}
      initial="initial"
      animate="enter"
      className={className}
      {...(rest as any)}
    >
      {children}
    </motion.div>
  )
);
Stagger.displayName = "Stagger";

export const Item = forwardRef<
  HTMLDivElement,
  PropsWithChildren<DivProps & { variant?: "up" | "scale" }>
>(({ children, className, variant = "up", ...rest }, ref) => (
  <motion.div
    ref={ref}
    variants={variant === "up" ? itemUp : itemScale}
    className={className}
    {...(rest as any)}
  >
    {children}
  </motion.div>
));
Item.displayName = "Item";

export const Tappable = forwardRef<HTMLDivElement, PropsWithChildren<DivProps>>(
  ({ children, className, ...rest }, ref) => (
    <motion.div
      ref={ref}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      transition={spring}
      className={className}
      {...(rest as any)}
    >
      {children}
    </motion.div>
  )
);
Tappable.displayName = "Tappable";

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
