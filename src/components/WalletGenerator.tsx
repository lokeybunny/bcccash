import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Wallet, ArrowRight, Check, Loader2, RefreshCw, Copy, AlertTriangle } from "lucide-react";
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
import { useCooldownTimer } from "@/hooks/useCooldownTimer";
import { SimpleCaptcha } from "@/components/SimpleCaptcha";

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
  const [isResending, setIsResending] = useState(false);
  const [isExistingWallet, setIsExistingWallet] = useState(false);
  const [generatedAddress, setGeneratedAddress] = useState("");
  const [walletSource, setWalletSource] = useState<string | null>(null);
  const [progressStep, setProgressStep] = useState<ProgressStep>("idle");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [captchaKey, setCaptchaKey] = useState(0);

  const emailValidation = useMemo(() => {
    if (!email) return { isValid: false, message: "" };
    if (!EMAIL_REGEX.test(email)) return { isValid: false, message: "Invalid email format" };
    return { isValid: true, message: "" };
  }, [email]);

  const cooldownTimer = useCooldownTimer();

  const handleCaptchaVerify = useCallback((verified: boolean) => {
    setIsCaptchaVerified(verified);
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

    // Reset captcha when opening dialog
    setIsCaptchaVerified(false);
    setCaptchaKey(prev => prev + 1);
    setShowConfirmDialog(true);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // Reset captcha when closing dialog
      setIsCaptchaVerified(false);
      setCaptchaKey(prev => prev + 1);
    }
    setShowConfirmDialog(open);
  };

  const handleGenerateWallet = async () => {
    if (!isCaptchaVerified) {
      toast.error("Please solve the captcha first");
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
        body: { email, source: source.trim() || undefined },
      });

      // Handle rate limiting
      if (data?.retryAfter) {
        toast.error(data.error || "Too many requests");
        return;
      }

      // Handle successful response
      if (data?.publicKey && !data?.error) {
        setProgressStep("done");
        setGeneratedAddress(data.publicKey);
        setStep("success");
        toast.success("Wallet created! Private key sent to the email.");
        return;
      }

      // Handle existing wallet
      if (data?.error) {
        if (data.publicKey) {
          setProgressStep("done");
          toast.info("A wallet already exists for this email");
          setGeneratedAddress(data.publicKey);
          setStep("success");
          setIsExistingWallet(true);
        } else {
          toast.error(data.error);
        }
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
      setIsCaptchaVerified(false);
      setCaptchaKey(prev => prev + 1);
    }
  };

  const handleResendEmail = async () => {
    const client = getBackendClient();
    setIsResending(true);
    setProgressStep("sending");

    try {
      const { data, error } = await client.functions.invoke("resend-wallet-email", {
        body: { email },
      });

      if (error) throw error;
      
      if (data?.retryAfter) {
        cooldownTimer.startTimer(data.retryAfter);
        toast.error(data.error);
        return;
      }
      
      if (data?.error) throw new Error(data.error);

      setProgressStep("done");
      toast.success("Wallet credentials resent! Check the email.");
    } catch (error: any) {
      console.error("Error resending email:", error);
      toast.error(error?.message || "Failed to resend email");
    } finally {
      setIsResending(false);
      setProgressStep("idle");
    }
  };

  const resetForm = () => {
    setStep("email");
    setEmail("");
    setSource("");
    setEmailTouched(false);
    setIsExistingWallet(false);
    setGeneratedAddress("");
    setWalletSource(null);
    setProgressStep("idle");
    setIsCaptchaVerified(false);
    setCaptchaKey(prev => prev + 1);
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
                <span>{isExistingWallet ? "Wallet found" : "Wallet created successfully"}</span>
              </div>
              
              <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Recipient Email</p>
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
                    {isExistingWallet ? "Existing Wallet" : "Created & Sent"}
                  </span>
                </div>
              </div>

              {isExistingWallet && (
                <div className="space-y-3 pt-2">
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
                    disabled={isResending || cooldownTimer.isActive}
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
                
                {/* Captcha inside dialog */}
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-3">Solve to confirm you're human:</p>
                  <SimpleCaptcha 
                    key={captchaKey}
                    onVerify={handleCaptchaVerify} 
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              onClick={handleGenerateWallet}
              disabled={!isCaptchaVerified}
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
