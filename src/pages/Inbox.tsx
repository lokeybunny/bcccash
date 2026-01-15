import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Inbox as InboxIcon, RefreshCw, Copy, Check, ArrowLeft, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBackendClient } from "@/lib/backendClient";
import { toast } from "sonner";
import { GlowOrb } from "@/components/GlowOrb";

interface Email {
  id: string;
  from_email: string;
  from_name: string | null;
  subject: string | null;
  body_text: string | null;
  body_html: string | null;
  received_at: string;
  is_read: boolean;
}

interface InboxData {
  bccEmail: string;
  forwardTo: string;
  isActive: boolean;
  emails: Email[];
  totalCount: number;
}

const Inbox = () => {
  const { publicKey, connected } = useWallet();
  const navigate = useNavigate();
  const [inboxData, setInboxData] = useState<InboxData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [hasBccAccount, setHasBccAccount] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  useEffect(() => {
    if (!connected || !publicKey) {
      navigate("/");
      return;
    }

    checkAndLoadInbox();
  }, [connected, publicKey]);

  const checkAndLoadInbox = async () => {
    if (!publicKey) return;

    setIsLoading(true);
    try {
      const supabase = getBackendClient();
      
      // First check wallet status
      const { data: authData, error: authError } = await supabase.functions.invoke("wallet-auth", {
        body: { publicKey: publicKey.toBase58() },
      });

      if (authError || !authData.isBccWallet) {
        toast.error("This wallet is not a BCC wallet");
        navigate("/");
        return;
      }

      setHasBccAccount(authData.hasBccAccount);

      if (authData.hasBccAccount) {
        // Load inbox
        const { data: inboxResult, error: inboxError } = await supabase.functions.invoke("get-inbox", {
          body: { publicKey: publicKey.toBase58() },
        });

        if (inboxError) {
          throw inboxError;
        }

        setInboxData(inboxResult);
      }
    } catch (err) {
      console.error("Error loading inbox:", err);
      toast.error("Failed to load inbox");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimEmail = async () => {
    if (!publicKey) return;

    setIsClaiming(true);
    try {
      const supabase = getBackendClient();
      const { data, error } = await supabase.functions.invoke("claim-bcc-email", {
        body: { publicKey: publicKey.toBase58() },
      });

      if (error) {
        throw error;
      }

      toast.success(`Your BCC email is: ${data.bccEmail}`);
      setHasBccAccount(true);
      checkAndLoadInbox();
    } catch (err) {
      console.error("Error claiming email:", err);
      toast.error("Failed to claim BCC email");
    } finally {
      setIsClaiming(false);
    }
  };

  const copyEmail = () => {
    if (inboxData?.bccEmail) {
      navigator.clipboard.writeText(inboxData.bccEmail);
      setCopied(true);
      toast.success("Email copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!connected) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <GlowOrb className="w-[600px] h-[600px] bg-primary -top-40 -left-40" delay={0} />
        <GlowOrb className="w-[500px] h-[500px] bg-secondary top-1/2 -right-40" delay={2} />
      </div>

      <Header />

      <main className="pt-24 pb-20 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : hasBccAccount === false ? (
            // Claim email flow
            <Card className="max-w-lg mx-auto glass-card">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Claim Your @bcc.cash Email</CardTitle>
                <CardDescription>
                  Your wallet is verified! Claim your unique BCC email address based on your wallet's public key.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-6">
                  Your email will be: <span className="font-mono text-primary">
                    {publicKey?.toBase58().replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toLowerCase()}@bcc.cash
                  </span>
                </p>
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={handleClaimEmail}
                  disabled={isClaiming}
                  className="gap-2"
                >
                  {isClaiming ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Claiming...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Claim Email
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            // Inbox view
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <Card className="glass-card sticky top-24">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <InboxIcon className="h-5 w-5" />
                      Your BCC Mail
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-xs text-muted-foreground">Your Email</label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 text-sm bg-muted px-3 py-2 rounded font-mono">
                          {inboxData?.bccEmail}
                        </code>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={copyEmail}
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Forwards To</label>
                      <p className="text-sm font-mono mt-1">{inboxData?.forwardTo}</p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={checkAndLoadInbox}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Email List / Content */}
              <div className="lg:col-span-2">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>
                      {selectedEmail ? "Email" : "Inbox"}
                    </CardTitle>
                    <CardDescription>
                      {selectedEmail 
                        ? `From: ${selectedEmail.from_name || selectedEmail.from_email}`
                        : `${inboxData?.totalCount || 0} emails`
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedEmail ? (
                      <div className="space-y-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedEmail(null)}
                          className="gap-2"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back to Inbox
                        </Button>
                        <div className="border-b pb-4">
                          <h3 className="font-semibold text-lg">{selectedEmail.subject || "(No Subject)"}</h3>
                          <p className="text-sm text-muted-foreground">
                            From: {selectedEmail.from_name || selectedEmail.from_email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(selectedEmail.received_at)}
                          </p>
                        </div>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          {selectedEmail.body_html ? (
                            <div dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }} />
                          ) : (
                            <pre className="whitespace-pre-wrap font-sans">{selectedEmail.body_text}</pre>
                          )}
                        </div>
                      </div>
                    ) : inboxData?.emails && inboxData.emails.length > 0 ? (
                      <div className="divide-y">
                        {inboxData.emails.map((email) => (
                          <button
                            key={email.id}
                            onClick={() => setSelectedEmail(email)}
                            className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex items-start gap-4"
                          >
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                              <Mail className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-4">
                                <p className={`font-medium truncate ${!email.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                                  {email.from_name || email.from_email}
                                </p>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatDate(email.received_at)}
                                </span>
                              </div>
                              <p className="text-sm font-medium truncate">
                                {email.subject || "(No Subject)"}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {email.body_text?.slice(0, 100)}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <InboxIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No emails yet</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Emails sent to {inboxData?.bccEmail} will appear here
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Inbox;
