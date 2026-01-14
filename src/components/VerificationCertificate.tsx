import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Link2, Download, Check, Shield, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface VerificationCertificateProps {
  publicKey: string;
  email: string;
  createdAt: string;
  confirmed: boolean;
  source: string | null;
  searchedBy: "email" | "publicKey";
}

export const VerificationCertificate = ({
  publicKey,
  email,
  createdAt,
  confirmed,
  source,
  searchedBy,
}: VerificationCertificateProps) => {
  const [copied, setCopied] = useState(false);

  const generateShareableLink = () => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      verify: publicKey,
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const copyShareableLink = async () => {
    const link = generateShareableLink();
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Shareable link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const downloadCertificate = () => {
    const certificateText = `
═══════════════════════════════════════════════════════════════
                    WALLET VERIFICATION CERTIFICATE
                           bcc.cash
═══════════════════════════════════════════════════════════════

Certificate ID: ${publicKey.slice(0, 8)}...${publicKey.slice(-8)}
Generated: ${new Date().toISOString()}

───────────────────────────────────────────────────────────────
                        VERIFICATION DETAILS
───────────────────────────────────────────────────────────────

Public Key:
${publicKey}

Associated Email: ${email}
${source ? `Source: ${source}` : ""}
Creation Date: ${formattedDate}
Status: ${confirmed ? "✓ CONFIRMED" : "○ PENDING CONFIRMATION"}

───────────────────────────────────────────────────────────────
                        VERIFICATION PROOF
───────────────────────────────────────────────────────────────

This certificate confirms that the above public key was generated
through bcc.cash and is associated with a verified email address.

Verify this certificate at:
${generateShareableLink()}

═══════════════════════════════════════════════════════════════
                    © ${new Date().getFullYear()} bcc.cash
═══════════════════════════════════════════════════════════════
`;

    const blob = new Blob([certificateText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wallet-certificate-${publicKey.slice(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Certificate downloaded!");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          Share Certificate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Verification Certificate
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          {/* Certificate Preview */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border border-border">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center p-2 rounded-full bg-primary/20 mb-2">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-sm font-semibold text-foreground">Wallet Verified</h4>
              <p className="text-xs text-muted-foreground">bcc.cash</p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Public Key</span>
                <span className="font-mono text-xs text-foreground">
                  {publicKey.slice(0, 4)}...{publicKey.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Email</span>
                <span className="text-foreground text-xs">{email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Created</span>
                <span className="text-foreground text-xs">{formattedDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    confirmed
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {confirmed ? "Confirmed" : "Pending"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Button
              variant="default"
              className="w-full gap-2"
              onClick={copyShareableLink}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Link Copied!
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  Copy Shareable Link
                </>
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={downloadCertificate}
            >
              <Download className="w-4 h-4" />
              Download Certificate
            </Button>

            <Button
              variant="ghost"
              className="w-full gap-2"
              onClick={() => window.open(generateShareableLink(), "_blank")}
            >
              <ExternalLink className="w-4 h-4" />
              Open Verification Link
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Share this link to let others verify this wallet's authenticity
          </p>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
