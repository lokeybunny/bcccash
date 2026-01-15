import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Wallet, LogOut, Mail, Loader2, Check, Copy } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { getBackendClient } from "@/lib/backendClient";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WalletStatus {
  isBccWallet: boolean;
  hasBccAccount: boolean;
  bccEmail?: string;
  walletId?: string;
  originalEmail?: string;
}

// Particle configuration for button
const generateParticles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 2,
  }));
};

interface Button4DProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  disabled?: boolean;
  className?: string;
}

const Button4D = ({ onClick, children, variant = "primary", disabled, className = "" }: Button4DProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const particles = useMemo(() => generateParticles(8), []);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 400 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set((e.clientX - centerX) / rect.width);
    mouseY.set((e.clientY - centerY) / rect.height);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const baseStyles = variant === "primary" 
    ? "bg-gradient-to-r from-primary via-secondary to-accent text-primary-foreground"
    : variant === "secondary"
    ? "bg-gradient-to-r from-secondary to-accent text-secondary-foreground"
    : "bg-background/50 border border-border text-foreground";

  return (
    <div className="relative" style={{ perspective: 800 }}>
      <motion.button
        onClick={onClick}
        disabled={disabled}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ scale: 1.05, z: 20 }}
        whileTap={{ scale: 0.95 }}
        className={`
          relative overflow-hidden px-4 py-2 rounded-xl text-sm font-medium
          backdrop-blur-xl transition-all duration-300
          ${baseStyles}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${className}
        `}
      >
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 opacity-0 transition-opacity duration-300"
          style={{
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(6, 182, 212, 0.3), rgba(168, 85, 247, 0.3))",
            backgroundSize: "200% 200%",
            opacity: isHovered ? 0.5 : 0,
          }}
          animate={{
            backgroundPosition: isHovered ? ["0% 0%", "100% 100%", "0% 0%"] : "0% 0%",
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        {/* Floating particles */}
        {isHovered && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute rounded-full bg-white/60"
                style={{
                  width: particle.size,
                  height: particle.size,
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  boxShadow: `0 0 ${particle.size * 2}px rgba(255,255,255,0.5)`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  y: [-10, -30],
                  x: [0, (Math.random() - 0.5) * 20],
                }}
                transition={{
                  duration: particle.duration,
                  delay: particle.delay * 0.3,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>
        )}

        {/* Spotlight glow effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: useTransform(
              [mouseX, mouseY],
              ([x, y]) => `radial-gradient(circle 60px at ${50 + (x as number) * 50}% ${50 + (y as number) * 50}%, rgba(255,255,255,0.3), transparent 70%)`
            ),
            opacity: isHovered ? 1 : 0,
          }}
        />

        {/* Glass reflection */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"
          style={{ transform: "translateZ(1px)" }}
        />

        {/* 3D depth shadow */}
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            boxShadow: isHovered 
              ? "0 10px 40px -10px rgba(139, 92, 246, 0.5), 0 20px 60px -20px rgba(6, 182, 212, 0.4), inset 0 1px 1px rgba(255,255,255,0.2)"
              : "0 4px 20px -5px rgba(139, 92, 246, 0.3), inset 0 1px 1px rgba(255,255,255,0.1)",
            transition: "box-shadow 0.3s ease",
          }}
        />

        {/* Content with 3D lift */}
        <span 
          className="relative z-10 flex items-center gap-2"
          style={{ transform: "translateZ(10px)" }}
        >
          {children}
        </span>

        {/* Animated border glow */}
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            border: "1px solid transparent",
            background: isHovered
              ? "linear-gradient(135deg, rgba(139, 92, 246, 0.5), rgba(6, 182, 212, 0.5), rgba(168, 85, 247, 0.5)) border-box"
              : "transparent",
            WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
          animate={{
            opacity: isHovered ? [0.5, 1, 0.5] : 0,
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>

      {/* External glow orb */}
      <motion.div
        className="absolute -inset-2 rounded-2xl pointer-events-none -z-10"
        style={{
          background: "radial-gradient(ellipse at center, rgba(139, 92, 246, 0.15), transparent 70%)",
          filter: "blur(8px)",
        }}
        animate={{
          opacity: isHovered ? [0.3, 0.6, 0.3] : 0.1,
          scale: isHovered ? [1, 1.1, 1] : 1,
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
};

export const WalletConnectButton = () => {
  const { publicKey, connected, disconnect, connecting } = useWallet();
  const { setVisible } = useWalletModal();
  const [walletStatus, setWalletStatus] = useState<WalletStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const checkWalletStatus = async () => {
      if (!publicKey) {
        setWalletStatus(null);
        return;
      }

      setIsChecking(true);
      try {
        const supabase = getBackendClient();
        const { data, error } = await supabase.functions.invoke("wallet-auth", {
          body: { publicKey: publicKey.toBase58() },
        });

        if (error) {
          console.error("Error checking wallet:", error);
          toast.error("Failed to verify wallet");
          return;
        }

        setWalletStatus(data);

        if (!data.isBccWallet) {
          toast.error("This wallet was not generated by BCC.cash");
        } else if (data.hasBccAccount) {
          toast.success(`Your BCC email: ${data.bccEmail}`);
        } else {
          // Show claim dialog for eligible wallets
          setShowClaimDialog(true);
        }
      } catch (err) {
        console.error("Error:", err);
        toast.error("Failed to verify wallet");
      } finally {
        setIsChecking(false);
      }
    };

    if (connected && publicKey) {
      checkWalletStatus();
    }
  }, [connected, publicKey]);

  const handleConnect = () => {
    setVisible(true);
  };

  const handleDisconnect = () => {
    disconnect();
    setWalletStatus(null);
    toast.info("Wallet disconnected");
  };

  const handleClaimEmail = async () => {
    if (!publicKey) return;

    setIsClaiming(true);
    try {
      const supabase = getBackendClient();
      const { data, error } = await supabase.functions.invoke("claim-bcc-email", {
        body: { publicKey: publicKey.toBase58() },
      });

      if (error) throw error;

      setWalletStatus(prev => prev ? { ...prev, hasBccAccount: true, bccEmail: data.bccEmail } : null);
      toast.success(`Your BCC email is now active: ${data.bccEmail}`);
      setShowClaimDialog(false);
    } catch (err) {
      console.error("Error claiming email:", err);
      toast.error("Failed to claim BCC email");
    } finally {
      setIsClaiming(false);
    }
  };

  const copyEmail = () => {
    if (walletStatus?.bccEmail) {
      navigator.clipboard.writeText(walletStatus.bccEmail);
      setCopied(true);
      toast.success("Email copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const predictedEmail = publicKey 
    ? `${publicKey.toBase58().replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toLowerCase()}@bcc.cash`
    : "";

  if (connecting || isChecking) {
    return (
      <Button4D onClick={() => {}} disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="hidden sm:inline">Connecting...</span>
      </Button4D>
    );
  }

  if (connected && publicKey) {
    return (
      <>
        <div className="flex items-center gap-2">
          {walletStatus?.hasBccAccount && walletStatus.bccEmail && (
            <Button4D onClick={copyEmail} variant="secondary">
              {copied ? <Check className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
              <span className="hidden sm:inline">{walletStatus.bccEmail}</span>
              <Copy className="h-3 w-3 opacity-60" />
            </Button4D>
          )}
          {walletStatus?.isBccWallet && !walletStatus.hasBccAccount && (
            <Button4D onClick={() => setShowClaimDialog(true)} variant="secondary">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Claim Email</span>
            </Button4D>
          )}
          <Button4D onClick={handleDisconnect} variant="outline">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">{truncateAddress(publicKey.toBase58())}</span>
            <LogOut className="h-4 w-4" />
          </Button4D>
        </div>

        {/* Claim Email Dialog */}
        <Dialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
          <DialogContent className="glass-card border-border/50">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Claim Your @bcc.cash Email
              </DialogTitle>
              <DialogDescription>
                Your wallet is verified! Claim your BCC email address to receive emails forwarded to your original email.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <p className="text-sm text-muted-foreground mb-1">Your BCC email will be:</p>
                <p className="font-mono text-lg text-primary">{predictedEmail}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                All emails sent to this address will be automatically forwarded to your original email.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowClaimDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleClaimEmail}
                  disabled={isClaiming}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary"
                >
                  {isClaiming ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Claiming...
                    </>
                  ) : (
                    "Claim Email"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Button4D onClick={handleConnect}>
      <Wallet className="h-4 w-4" />
      <span className="hidden sm:inline">Connect Wallet</span>
    </Button4D>
  );
};
