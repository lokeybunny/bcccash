import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Shield, Copy, CheckCircle2, XCircle, Mail, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getBackendClient } from "@/lib/backendClient";

interface WalletResult {
  email: string;
  publicKey: string;
  confirmed: boolean;
  createdAt: string;
  searchedBy: "email" | "publicKey";
}

type SearchType = "email" | "publicKey";

export const VerifyWallet = () => {
  const [searchValue, setSearchValue] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("email");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<WalletResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [notFoundMessage, setNotFoundMessage] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchValue) {
      toast.error(`Please enter ${searchType === "email" ? "an email address" : "a public key"}`);
      return;
    }

    const client = getBackendClient();

    setIsSearching(true);
    setNotFound(false);
    setNotFoundMessage("");
    setResult(null);

    try {
      const body = searchType === "email" 
        ? { email: searchValue } 
        : { publicKey: searchValue };

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
        searchedBy: data.searchedBy,
      });
    } catch (error: any) {
      console.error("Error verifying wallet:", error);
      toast.error(error?.message || "Failed to verify wallet");
    } finally {
      setIsSearching(false);
    }
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

        {/* Search Type Toggle */}
        <div className="flex gap-2 mb-4">
          <Button
            type="button"
            variant={searchType === "email" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setSearchType("email");
              setSearchValue("");
              setResult(null);
              setNotFound(false);
            }}
            className="flex-1 gap-2"
          >
            <Mail className="w-4 h-4" />
            Email
          </Button>
          <Button
            type="button"
            variant={searchType === "publicKey" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setSearchType("publicKey");
              setSearchValue("");
              setResult(null);
              setNotFound(false);
            }}
            className="flex-1 gap-2"
          >
            <Key className="w-4 h-4" />
            Public Key
          </Button>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type={searchType === "email" ? "email" : "text"}
              placeholder={searchType === "email" ? "Search by email..." : "Search by public key..."}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-12 h-14 text-lg font-mono"
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
            <div className="flex items-center gap-2 text-sm text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Wallet found and verified</span>
            </div>
            
            <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
              {result.searchedBy === "publicKey" ? (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Associated Email</p>
                    <p className="text-sm text-foreground">{maskEmail(result.email)}</p>
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
                </>
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
