import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Shield, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const VerifyWallet = () => {
  const [searchEmail, setSearchEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<{ email: string; publicKey: string; createdAt: string } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchEmail) {
      toast.error("Please enter an email address");
      return;
    }

    setIsSearching(true);
    
    // Simulate search - will be replaced with actual backend
    setTimeout(() => {
      setIsSearching(false);
      // Demo result
      setResult({
        email: searchEmail,
        publicKey: "7xKXtR2Jz9mBvNpqE4fLsYhW3kDcAoP5RnGuMjXyZbC8",
        createdAt: new Date().toISOString(),
      });
    }, 1000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="w-full max-w-xl mx-auto"
    >
      <div className="glass-card gradient-border rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-secondary/20">
            <Shield className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">Verify Address</h3>
            <p className="text-sm text-muted-foreground">Look up a wallet by email address</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Search by email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="pl-12 h-14 text-lg"
              disabled={isSearching}
            />
          </div>
          
          <Button
            type="submit"
            variant="glass"
            size="lg"
            className="w-full border border-border"
            disabled={isSearching}
          >
            {isSearching ? "Searching..." : "Verify Wallet"}
          </Button>
        </form>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-3"
          >
            <div className="flex items-center gap-2 text-sm text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Wallet found and verified</span>
            </div>
            
            <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <p className="text-sm text-foreground">{result.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Public Key</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm text-foreground break-all flex-1">{result.publicKey}</p>
                  <button
                    onClick={() => copyToClipboard(result.publicKey)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Created</p>
                <p className="text-sm text-foreground">
                  {new Date(result.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
