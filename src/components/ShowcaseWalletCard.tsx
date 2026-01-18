import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import bccWalletCard from "@/assets/bcc-wallet-card.png";

export const ShowcaseWalletCard = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Motion values for mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Spotlight position (percentage based for CSS)
  const spotlightX = useMotionValue(50);
  const spotlightY = useMotionValue(50);

  // Spring config for smooth animation
  const springConfig = { damping: 20, stiffness: 300 };
  
  // Transform mouse position to rotation values
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), springConfig);
  
  // Smooth spotlight position
  const smoothSpotlightX = useSpring(spotlightX, { damping: 30, stiffness: 200 });
  const smoothSpotlightY = useSpring(spotlightY, { damping: 30, stiffness: 200 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Normalize mouse position to -0.5 to 0.5
    const normalizedX = (e.clientX - centerX) / rect.width;
    const normalizedY = (e.clientY - centerY) / rect.height;
    
    mouseX.set(normalizedX);
    mouseY.set(normalizedY);
    
    // Calculate spotlight position as percentage
    const percentX = ((e.clientX - rect.left) / rect.width) * 100;
    const percentY = ((e.clientY - rect.top) / rect.height) * 100;
    
    spotlightX.set(percentX);
    spotlightY.set(percentY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
    spotlightX.set(50);
    spotlightY.set(50);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="relative mt-12"
      style={{ perspective: 1000 }}
    >
      {/* Glow effect behind card */}
      <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/30 rounded-3xl transform scale-110" />
      
      {/* Card Container with 3D tilt */}
      <motion.div
        ref={cardRef}
        className="relative cursor-pointer"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* The Wallet Card Image */}
        <div className="relative w-full max-w-[900px] mx-auto rounded-3xl overflow-hidden shadow-2xl">
          <img 
            src={bccWalletCard} 
            alt="BCC Wallet Card Example" 
            className="w-full h-auto"
          />
          
          {/* Mouse-follow spotlight glow */}
          <motion.div
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              opacity: isHovered ? 0.6 : 0,
              background: useTransform(
                [smoothSpotlightX, smoothSpotlightY],
                ([x, y]) => `radial-gradient(circle 250px at ${x}% ${y}%, rgba(139, 92, 246, 0.4), rgba(6, 182, 212, 0.2) 40%, transparent 70%)`
              ),
              transition: "opacity 0.3s",
            }}
          />
        </div>
      </motion.div>

      {/* Caption */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center text-sm text-muted-foreground mt-4"
      >
        ✨ Your wallet will look like this
      </motion.p>
    </motion.div>
  );
};
