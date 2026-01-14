import { useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Wallet, ArrowRight, Check, Loader2, Copy, AlertTriangle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { getBackendClient } from "@/lib/backendClient";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import type { TurnstileInstance } from "@marsidev/react-turnstile";

type Step = "email" | "success";
type ProgressStep = "idle" | "generating" | "sending" | "done";

const progressSteps: Record<ProgressStep, string> = {
  idle: "",
  generating: "Generating wallet keypair...",
  sending: "Sending email with credentials...",
  done: "Complete!",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const WalletGenerator = () => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExistingWallet, setIsExistingWallet] = useState(false);
  const [generatedAddress, setGeneratedAddress] = useState("");
  const [progressStep, setProgressStep] = useState<ProgressStep>("idle");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);

  const emailValidation = useMemo(() => {
    if (!email) return { isValid: false, message: "" };
    if (!EMAIL_REGEX.test(email)) return { isValid: false, message: "Invalid email format" };
    return { isValid: true, message: "" };
  }, [email]);

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  const handleTurnstileError = useCallback(() => {
    setTurnstileToken(null);
    toast.error("Captcha verification failed. Please try again.");
  }, []);

  const resetTurnstile = useCallback(() => {
    setTurnstileToken(null);
    setTurnstileKey(prev => prev + 1);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleFormSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!emailValidation.isValid) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Reset turnstile when opening dialog
    resetTurnstile();
    setShowConfirmDialog(true);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetTurnstile();
    }
    setShowConfirmDialog(open);
  };

  const handleGenerateWallet = async () => {
    if (!turnstileToken) {
      toast.error("Please complete the captcha verification");
      return;
    }

    setShowConfirmDialog(false);

    const client = getBackendClient();
    setIsLoading(true);
    setProgressStep("generating");

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setProgressStep("sending");

      const { data, error } = await client.functions.invoke("generate-wallet", {
        body: { 
          email, 
          source: source.trim() || undefined,
          turnstileToken 
        },
      });

      // Handle rate limiting
      if (data?.retryAfter) {
        toast.error(data.error || "Too many requests");
        return;
      }

      // Handle captcha failure
      if (data?.error?.includes("Captcha")) {
        toast.error(data.error);
        return;
      }

      // Handle existing wallet
      if (data?.exists) {
        setProgressStep("done");
        toast.info("This email has already been converted into a wallet");
        setGeneratedAddress(data.publicKey);
        setStep("success");
        setIsExistingWallet(true);
        return;
      }

      // Handle successful new wallet creation
      if (data?.success && data?.publicKey) {
        setProgressStep("done");
        setGeneratedAddress(data.publicKey);
        setStep("success");
        toast.success("Wallet created! Private key sent to the email.");
        return;
      }

      // Handle errors
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (error) {
        if (error instanceof FunctionsHttpError) {
          try {
            const errorData = await error.context.json();
            if (errorData?.publicKey) {
              setProgressStep("done");
              toast.info("A wallet already exists for this email");
              setGeneratedAddress(errorData.publicKey);
              setStep("success");
              setIsExistingWallet(true);
              return;
            }
            toast.error(errorData?.error || "An error occurred");
            return;
          } catch {
            // Context couldn't be parsed
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
      resetTurnstile();
    }
  };

  const resetForm = () => {
    setStep("email");
    setEmail("");
    setSource("");
    setEmailTouched(false);
    setIsExistingWallet(false);
    setGeneratedAddress("");
    setProgressStep("idle");
    resetTurnstile();
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
            <p className="text-sm text-muted-foreground">
              {step === "email" && "Enter recipient's email to create a wallet"}
              {step === "success" && "Wallet is ready"}
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === "email" && (
            <motion.form
              key="email-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleFormSubmit}
              className="space-y-4"
            >
              <div className="space-y-1">
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
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <span className="w-5 h-5 text-destructive">✕</span>
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
                className="w-full border border-border"
                disabled={isLoading || !emailValidation.isValid}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {progressSteps[progressStep] || "Processing..."}
                  </>
                ) : (
                  <>
                    Generate & Send Wallet
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>

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
            </motion.form>
          )}

          {step === "success" && (
            <motion.div
              key="success-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 text-sm text-green-400">
                <Check className="w-4 h-4" />
                <span>{isExistingWallet ? "Email already converted" : "Wallet created successfully"}</span>
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
                  <span className={`text-xs px-2 py-1 rounded-full ${isExistingWallet ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                    {isExistingWallet ? "Previously Created" : "Created & Sent"}
                  </span>
                </div>
              </div>

              {isExistingWallet && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-amber-500">
                    <ShieldAlert className="w-4 h-4" />
                    <span className="text-sm font-medium">Private Key Cannot Be Resent</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This email was already converted into a wallet. For security, private keys are never stored 
                    and were only sent once during the original wallet creation. No emails can be resent.
                  </p>
                </div>
              )}

              <Button variant="outline" size="lg" className="w-full" onClick={resetForm}>
                Generate Another Wallet
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={handleDialogClose}>
        <AlertDialogContent className="glass-card border-border max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <AlertDialogTitle>Confirm Wallet Creation</AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>You are about to create a new Solana wallet and send the private key to:</p>
                <p className="font-medium text-foreground bg-muted/50 px-3 py-2 rounded-lg break-all">
                  {email}
                </p>
                
                {/* Source input */}
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Source (optional)</label>
                  <Input
                    type="text"
                    placeholder="e.g., Twitter, LinkedIn, GitHub"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="h-10"
                  />
                  <p className="text-xs text-muted-foreground">
                    Where was this email publicly found?
                  </p>
                </div>
                
                <p className="text-amber-500">
                  ⚠️ Make sure this email address is correct. The private key will be sent directly to this address.
                </p>
                
                {/* Turnstile Captcha */}
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-3">Complete verification:</p>
                  <TurnstileWidget
                    key={turnstileKey}
                    onVerify={handleTurnstileVerify}
                    onExpire={handleTurnstileExpire}
                    onError={handleTurnstileError}
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              onClick={handleGenerateWallet}
              disabled={!turnstileToken}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Yes, Create Wallet
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};