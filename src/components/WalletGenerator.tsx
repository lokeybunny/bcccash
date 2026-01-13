import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Mail, Wallet, ArrowRight, Check, Loader2, RefreshCw, Copy, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getBackendClient } from "@/lib/backendClient";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { useCooldownTimer } from "@/hooks/useCooldownTimer";

type ProgressStep = "idle" | "verifying" | "generating" | "sending" | "done";

const progressSteps: Record<ProgressStep, string> = {
  idle: "",
  verifying: "Verifying CAPTCHA...",
  generating: "Generating wallet keypair...",
  sending: "Sending email with credentials...",
  done: "Complete!",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const WalletGenerator = () => {
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isExistingWallet, setIsExistingWallet] = useState(false);
  const [generatedAddress, setGeneratedAddress] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [progressStep, setProgressStep] = useState<ProgressStep>("idle");

  const emailValidation = useMemo(() => {
    if (!email) return { isValid: false, message: "" };
    if (!EMAIL_REGEX.test(email)) return { isValid: false, message: "Invalid email format" };
    return { isValid: true, message: "" };
  }, [email]);

  const cooldownTimer = useCooldownTimer();

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

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
    setProgressStep("verifying");

    try {
      // Simulate brief delay for progress visibility
      await new Promise(resolve => setTimeout(resolve, 300));
      setProgressStep("generating");
      await new Promise(resolve => setTimeout(resolve, 300));
      setProgressStep("sending");

      const { data, error } = await client.functions.invoke("generate-wallet", {
        body: { email, turnstileToken },
      });

      // Handle successful response with data
      if (data?.publicKey && !data?.error) {
        setProgressStep("done");
        setGeneratedAddress(data.publicKey);
        setIsSuccess(true);
        toast.success("Wallet created! Check your email for the private key.");
        return;
      }

      // Handle response with error field (could be existing wallet)
      if (data?.error) {
        if (data.publicKey) {
          setProgressStep("done");
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
              setProgressStep("done");
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
      setProgressStep("idle");
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
    setProgressStep("sending");

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

      setProgressStep("done");
      toast.success("Wallet credentials resent! Check your email.");
    } catch (error: any) {
      console.error("Error resending email:", error);
      toast.error(error?.message || "Failed to resend email");
    } finally {
      setIsResending(false);
      setProgressStep("idle");
      setTurnstileToken(null);
    }
  };

  const resetForm = () => {
    setEmail("");
    setEmailTouched(false);
    setIsSuccess(false);
    setIsExistingWallet(false);
    setGeneratedAddress("");
    setTurnstileToken(null);
    setProgressStep("idle");
    cooldownTimer.reset();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="w-full max-w-xl mx-auto"
    >
      <div className="glass-card gradient-border rounded-2xl p-8">
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
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="recipient@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailTouched(true);
                  }}
                  onBlur={() => setEmailTouched(true)}
                  className={`pl-12 pr-12 h-14 text-lg ${
                    emailTouched && email
                      ? emailValidation.isValid
                        ? "border-green-500/50 focus-visible:ring-green-500/30"
                        : "border-destructive/50 focus-visible:ring-destructive/30"
                      : ""
                  }`}
                  disabled={isLoading}
                />
                {emailTouched && email && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {emailValidation.isValid ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                )}
              </div>
              {emailTouched && email && !emailValidation.isValid && (
                <p className="text-xs text-destructive pl-1">{emailValidation.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="glass"
              size="lg"
              className="w-full border border-primary/30"
              disabled={isLoading || !turnstileToken || !emailValidation.isValid}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Wallet...
                </>
              ) : (
                <>
                  Create Wallet
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>

            <TurnstileWidget
              onVerify={handleTurnstileVerify}
              onExpire={handleTurnstileExpire}
              onError={handleTurnstileExpire}
            />

            {isLoading && progressStep !== "idle" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20"
              >
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-primary">{progressSteps[progressStep]}</span>
              </motion.div>
            )}
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 text-sm text-green-400">
              <Check className="w-4 h-4" />
              <span>{isExistingWallet ? "Wallet found and verified" : "Wallet created successfully"}</span>
            </div>
            
            <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <p className="text-sm text-foreground">{email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Public Key</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm text-foreground break-all flex-1">{generatedAddress}</p>
                  <button
                    onClick={() => copyToClipboard(generatedAddress)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                  {isExistingWallet ? "Existing Wallet" : "Created"}
                </span>
              </div>
            </div>

            {isExistingWallet && (
              <div className="space-y-3 pt-2">
                <TurnstileWidget
                  onVerify={handleTurnstileVerify}
                  onExpire={handleTurnstileExpire}
                  onError={handleTurnstileExpire}
                />

                {isResending && progressStep !== "idle" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20"
                  >
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-primary">{progressSteps[progressStep]}</span>
                  </motion.div>
                )}
                
                <Button 
                  variant="glass" 
                  size="lg"
                  className="w-full border border-border"
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

            <Button variant="outline" size="lg" className="w-full" onClick={resetForm}>
              Generate Another Wallet
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
