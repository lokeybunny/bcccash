import { motion } from "framer-motion";

interface GlowOrbProps {
  className?: string;
  delay?: number;
}

export const GlowOrb = ({ className = "", delay = 0 }: GlowOrbProps) => {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-30 ${className}`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.2, 0.4, 0.2],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
};
