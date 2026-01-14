import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Shield, Copy, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getBackendClient } from "@/lib/backendClient";
import { VerificationCertificate } from "./VerificationCertificate";

interface WalletResult {
  email: string;
  publicKey: string;
  confirmed: boolean;
  createdAt: string;
  source: string | null;
  searchedBy: "email" | "publicKey";
}

export const VerifyWallet = () => {
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<WalletResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [notFoundMessage, setNotFoundMessage] = useState("");

  // Check for verification link parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyKey = params.get("verify");
    if (verifyKey) {
      setSearchValue(verifyKey);
      // Auto-trigger search after a short delay
      setTimeout(() => {
        verifyWallet(verifyKey);
      }, 500);
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const verifyWallet = async (value: string) => {
    const client = getBackendClient();
    const searchType = isEmail(value) ? "email" : "publicKey";

    setIsSearching(true);
    setNotFound(false);
    setNotFoundMessage("");
    setResult(null);

    try {
      const body = searchType === "email" 
        ? { email: value.trim() } 
        : { publicKey: value.trim() };

      const { data, error } = await client.functions.invoke("verify-wallet", {
        body,
      });

      if (error) throw error;

      if (!data?.found) {
        setNotFound(true);
        if (searchType === "publicKey") {
          setNotFoundMessage("This public key is not associated with any email address from bcc.cash");
        } else {
          setNotFoundMessage("No wallet found for this email");
        }
        return;
      }

      setResult({
        email: data.email,
        publicKey: data.publicKey,
        confirmed: data.confirmed,
        createdAt: data.createdAt,
        source: data.source,
        searchedBy: data.searchedBy,
      });
    } catch (error: any) {
      console.error("Error verifying wallet:", error);
      toast.error(error?.message || "Failed to verify wallet");
    } finally {
      setIsSearching(false);
    }
  };
  const isEmail = (value: string) => {
    return value.includes("@") && value.includes(".");
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchValue.trim()) {
      toast.error("Please enter an email address or public key");
      return;
    }

    verifyWallet(searchValue);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const maskEmail = (email: string) => {
    const [local, domain] = email.split("@");
    if (local.length <= 2) return `${local[0]}***@${domain}`;
    return `${local.slice(0, 2)}***@${domain}`;
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
            <p className="text-sm text-muted-foreground">Look up a wallet by email or public key</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter email or public key..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
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

        {notFound && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <div className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <span className="text-sm text-destructive">{notFoundMessage}</span>
            </div>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-green-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Wallet found and verified</span>
              </div>
              <VerificationCertificate
                publicKey={result.publicKey}
                email={result.email}
                createdAt={result.createdAt}
                confirmed={result.confirmed}
                source={result.source}
                searchedBy={result.searchedBy}
              />
            </div>
            
            <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
              {result.searchedBy === "publicKey" ? (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Associated Email</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-foreground flex-1">{result.email}</p>
                      <button
                        onClick={() => copyToClipboard(result.email)}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
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
                </>
              ) : (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-foreground flex-1">{result.email}</p>
                      <button
                        onClick={() => copyToClipboard(result.email)}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
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
                </>
              )}
              
              {result.source && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Source</p>
                  <a
                    href={result.source.startsWith("http") ? result.source : `https://${result.source}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
                  >
                    {result.source}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Created</p>
                  <p className="text-sm text-foreground">
                    {new Date(result.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${result.confirmed ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {result.confirmed ? 'Confirmed' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
