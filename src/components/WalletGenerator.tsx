import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Mail, Wallet, ArrowRight, Check, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getBackendClient } from "@/lib/backendClient";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { useCooldownTimer } from "@/hooks/useCooldownTimer";

export const WalletGenerator = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isExistingWallet, setIsExistingWallet] = useState(false);
  const [generatedAddress, setGeneratedAddress] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const cooldownTimer = useCooldownTimer();

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!turnstileToken) {
      toast.error("Please complete the CAPTCHA verification");
      return;
    }

    const client = getBackendClient();

    setIsLoading(true);

    try {
      const { data, error } = await client.functions.invoke("generate-wallet", {
        body: { email, turnstileToken },
      });

      // Handle successful response with data
      if (data?.publicKey && !data?.error) {
        setGeneratedAddress(data.publicKey);
        setIsSuccess(true);
        toast.success("Wallet created! Check your email for the private key.");
        return;
      }

      // Handle response with error field (could be 409 - existing wallet)
      if (data?.error) {
        if (data.publicKey) {
          toast.info("A wallet already exists for this email");
          setGeneratedAddress(data.publicKey);
          setIsSuccess(true);
          setIsExistingWallet(true);
        } else {
          toast.error(data.error);
        }
        return;
      }

      // Handle FunctionsHttpError (non-2xx responses)
      if (error) {
        if (error instanceof FunctionsHttpError) {
          try {
            const errorData = await error.context.json();
            if (errorData?.publicKey) {
              toast.info("A wallet already exists for this email");
              setGeneratedAddress(errorData.publicKey);
              setIsSuccess(true);
              setIsExistingWallet(true);
              return;
            }
            toast.error(errorData?.error || "An error occurred");
            return;
          } catch {
            // Context couldn't be parsed as JSON
          }
        }
        throw error;
      }
    } catch (error: any) {
      console.error("Error generating wallet:", error);
      toast.error(error?.message || "Failed to generate wallet");
    } finally {
      setIsLoading(false);
      setTurnstileToken(null);
    }
  };

  const handleResendEmail = async () => {
    if (!turnstileToken) {
      toast.error("Please complete the CAPTCHA verification");
      return;
    }

    const client = getBackendClient();
    setIsResending(true);

    try {
      const { data, error } = await client.functions.invoke("resend-wallet-email", {
        body: { email, turnstileToken },
      });

      if (error) throw error;
      
      // Check for rate limiting
      if (data?.retryAfter) {
        cooldownTimer.startTimer(data.retryAfter);
        toast.error(data.error);
        return;
      }
      
      if (data?.error) throw new Error(data.error);

      toast.success("Wallet credentials resent! Check your email.");
    } catch (error: any) {
      console.error("Error resending email:", error);
      toast.error(error?.message || "Failed to resend email");
    } finally {
      setIsResending(false);
      setTurnstileToken(null);
    }
  };

  const resetForm = () => {
    setEmail("");
    setIsSuccess(false);
    setIsExistingWallet(false);
    setGeneratedAddress("");
    setTurnstileToken(null);
    cooldownTimer.reset();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="w-full max-w-xl mx-auto"
    >
      <div className="glass-card gradient-border rounded-2xl p-8 glow-effect">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-primary/20">
            <Wallet className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">Generate Wallet</h3>
            <p className="text-sm text-muted-foreground">Enter an email to create a Solana wallet</p>
          </div>
        </div>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="recipient@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-14 text-lg"
                disabled={isLoading}
              />
            </div>

            <TurnstileWidget
              onVerify={handleTurnstileVerify}
              onExpire={handleTurnstileExpire}
              onError={handleTurnstileExpire}
            />
            
            <Button
              type="submit"
              variant="gradient"
              size="xl"
              className="w-full"
              disabled={isLoading || !turnstileToken}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Wallet...
                </>
              ) : (
                <>
                  Create Wallet
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="p-2 rounded-full bg-green-500/20">
                <Check className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="font-medium text-green-400">
                  {isExistingWallet ? "Wallet Found!" : "Wallet Created Successfully!"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isExistingWallet ? `Wallet exists for ${email}` : `Private key sent to ${email}`}
                </p>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Public Address</p>
              <p className="font-mono text-sm text-foreground break-all">{generatedAddress}</p>
            </div>

            {isExistingWallet && (
              <div className="space-y-3">
                <TurnstileWidget
                  onVerify={handleTurnstileVerify}
                  onExpire={handleTurnstileExpire}
                  onError={handleTurnstileExpire}
                />
                
                <Button 
                  variant="glass" 
                  className="w-full border border-primary/30"
                  onClick={handleResendEmail}
                  disabled={isResending || cooldownTimer.isActive || !turnstileToken}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Resending...
                    </>
                  ) : cooldownTimer.isActive ? (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Wait {cooldownTimer.formattedTime}
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Resend Private Key to Email
                    </>
                  )}
                </Button>
                
                {cooldownTimer.isActive && (
                  <p className="text-sm text-muted-foreground text-center">
                    You can request another email in {cooldownTimer.formattedTime}
                  </p>
                )}
              </div>
            )}

            <Button variant="outline" className="w-full" onClick={resetForm}>
              Generate Another Wallet
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
