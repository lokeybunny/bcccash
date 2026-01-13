import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Header } from "@/components/Header";
import { WalletGenerator } from "@/components/WalletGenerator";
import { VerifyWallet } from "@/components/VerifyWallet";
import { Features } from "@/components/Features";
import { GlowOrb } from "@/components/GlowOrb";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <GlowOrb className="w-[600px] h-[600px] bg-primary -top-40 -left-40" delay={0} />
        <GlowOrb className="w-[500px] h-[500px] bg-secondary top-1/2 -right-40" delay={2} />
        <GlowOrb className="w-[400px] h-[400px] bg-accent bottom-20 left-1/3" delay={4} />
      </div>

      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-muted-foreground">Powered by Solana</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              <span className="text-foreground">Turn Emails Into</span>
              <br />
              <span className="gradient-text">Solana Wallets</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              The simplest way to onboard anyone to Solana. Generate wallets instantly 
              and deliver private keys securely via email.
            </p>

            <motion.a
              href="#generate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Get Started</span>
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section id="generate" className="py-12">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8">
            <WalletGenerator />
            <div id="verify">
              <VerifyWallet />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features">
        <Features />
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 SolMail. Built for the Solana ecosystem.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
