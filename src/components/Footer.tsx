import { Link } from "react-router-dom";
import bccLogo from "@/assets/bcc-logo.png";

// X (Twitter) logo component
const XIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const socialLinks = [
  { icon: XIcon, href: "https://x.com/BCCcash", label: "X" },
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={bccLogo} alt="BCC.cash" className="w-8 h-8 object-contain" />
            <span className="font-semibold text-foreground">BCC.cash</span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6">
            <a
              href="/#generate"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Generate
            </a>
            <a
              href="/#verify"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Verify
            </a>
            <a
              href="/#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </a>
            <a
              href="/#faq"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              FAQ
            </a>
          </nav>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>

        </div>

        {/* Bottom Text */}
        <div className="mt-8 pt-6 border-t border-border/30 text-center space-y-4">
          <p className="text-xs text-muted-foreground">
            Turn emails into Solana wallets. Perfect for airdrops, fundraising, and onboarding new users to Web3.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/terms"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <span className="text-muted-foreground/50">•</span>
            <Link
              to="/privacy"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            © {currentYear} BCC.cash. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};