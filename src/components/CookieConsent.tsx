import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

const COOKIE_CONSENT_KEY = "bcc-cookie-consent";

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay for smoother UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-5 duration-300">
      <div className="container mx-auto max-w-4xl">
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:p-6 rounded-xl border border-border bg-background/95 backdrop-blur-md shadow-lg">
          <button
            onClick={handleDecline}
            className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground transition-colors sm:hidden"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex-1 pr-6 sm:pr-0">
            <p className="text-sm text-foreground font-medium mb-1">We value your privacy</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We use cookies to enhance your browsing experience and analyze site traffic. By
              clicking "Accept", you consent to our use of cookies. Read our{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>{" "}
              for more information.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDecline}
              className="flex-1 sm:flex-none text-xs"
            >
              Decline
            </Button>
            <Button
              size="sm"
              onClick={handleAccept}
              className="flex-1 sm:flex-none text-xs"
            >
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
