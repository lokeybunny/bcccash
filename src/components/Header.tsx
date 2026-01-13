import { motion } from "framer-motion";
import { Mail } from "lucide-react";

export const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50"
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-secondary">
            <Mail className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground">BCC.cash</span>
        </div>
        
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
