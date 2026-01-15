import { useState, useRef, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import cardBg2 from "@/assets/card-bg-2.png";
import bccLogo from "@/assets/bcc-logo.png";
import solanaLogo from "@/assets/solana-logo.png";

// Demo wallet data
const DEMO_PUBLIC_KEY = "7NP5JZrxZMRQ7WCJyvEpqh3M213zAqq9eLKfuMzggd8W";
const DEMO_EMAIL = "dev@bcc.cash";

// Particle configuration
const PARTICLE_COUNT = 20;

interface Particle {
  id: number;
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  color: string;
}

const generateParticles = (): Particle[] => {
  const colors = [
    "rgba(139, 92, 246, 0.6)",  // Purple
    "rgba(6, 182, 212, 0.6)",   // Cyan
    "rgba(168, 85, 247, 0.5)",  // Violet
    "rgba(34, 211, 238, 0.5)",  // Light cyan
    "rgba(192, 132, 252, 0.4)", // Light purple
  ];
  
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 4,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
};

export const ShowcaseWalletCard = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Generate particles once
  const particles = useMemo(() => generateParticles(), []);
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
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            }}
            animate={{
              y: [0, -30, 0, 20, 0],
              x: [0, 15, -10, 5, 0],
              opacity: [0.3, 0.8, 0.5, 0.9, 0.3],
              scale: [1, 1.2, 0.9, 1.1, 1],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
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
        {/* The Wallet Card - 2x larger */}
        <div
          className="relative w-full max-w-[900px] mx-auto aspect-video rounded-3xl overflow-hidden shadow-2xl"
          style={{
            backgroundImage: `url(${cardBg2})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Overlay for readability */}
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Mouse-follow spotlight glow */}
          <motion.div
            className="absolute inset-0 pointer-events-none z-20 opacity-0 transition-opacity duration-300"
            style={{
              opacity: isHovered ? 0.6 : 0,
              background: useTransform(
                [smoothSpotlightX, smoothSpotlightY],
                ([x, y]) => `radial-gradient(circle 250px at ${x}% ${y}%, rgba(139, 92, 246, 0.4), rgba(6, 182, 212, 0.2) 40%, transparent 70%)`
              ),
            }}
          />
          
          {/* Logo Watermark */}
          <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
            <img 
              src={bccLogo} 
              alt="BCC Cash" 
              className="w-24 h-24 md:w-40 md:h-40 object-contain drop-shadow-lg"
            />
          </div>
          
          {/* Card Content */}
          <div className="relative h-full p-6 md:p-10 flex flex-col justify-between text-white">
            {/* Header */}
            <div className="flex items-center justify-end">
              <div className="text-right">
                <p className="text-xs md:text-sm opacity-60 uppercase tracking-wider">Powered by</p>
                <p className="text-sm md:text-xl font-semibold">BCC.CASH</p>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex items-end justify-between gap-4 md:gap-8">
              {/* QR Codes */}
              <div className="flex gap-3 md:gap-6">
                {/* Wallet QR */}
                <div className="bg-white p-2 md:p-4 rounded-xl shadow-lg">
                  <QRCodeSVG
                    value={`solana:${DEMO_PUBLIC_KEY}`}
                    size={80}
                    level="H"
                    includeMargin={false}
                    imageSettings={{
                      src: solanaLogo,
                      height: 20,
                      width: 20,
                      excavate: true,
                    }}
                    className="md:!w-[120px] md:!h-[120px]"
                  />
                  <p className="text-[8px] md:text-xs text-center text-black mt-1 md:mt-2 font-medium">WALLET</p>
                </div>

                {/* Email QR */}
                <div className="bg-white p-2 md:p-4 rounded-xl shadow-lg">
                  <QRCodeSVG
                    value={`mailto:${DEMO_EMAIL}?subject=Your%20BCC.CASH%20Wallet`}
                    size={80}
                    level="M"
                    includeMargin={false}
                    className="md:!w-[120px] md:!h-[120px]"
                  />
                  <p className="text-[8px] md:text-xs text-center text-black mt-1 md:mt-2 font-medium">EMAIL</p>
                </div>
              </div>

              {/* User Info */}
              <div className="text-right flex-1 min-w-0">
                <p className="text-xs md:text-base opacity-60 uppercase tracking-wider mb-1 md:mb-2">Email</p>
                <p className="text-sm md:text-2xl font-medium truncate">
                  {DEMO_EMAIL}
                </p>
                <p className="text-xs md:text-base opacity-60 uppercase tracking-wider mt-2 md:mt-4 mb-1 md:mb-2">Public Key</p>
                <p className="font-mono text-[8px] md:text-sm leading-tight break-all">
                  {DEMO_PUBLIC_KEY}
                </p>
              </div>
            </div>
          </div>
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
