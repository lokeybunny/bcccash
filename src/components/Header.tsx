import { motion } from "framer-motion";
import { BCCLogo } from "@/components/BCCLogo";

export const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50"
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center">
          <BCCLogo className="w-9 h-9 text-foreground" />
        </a>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#generate" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Generate
          </a>
          <a href="#verify" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Verify
          </a>
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </a>
        </nav>
      </div>
    </motion.header>
  );
};
