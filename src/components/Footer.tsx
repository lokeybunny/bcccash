import { BCCLogo } from "@/components/BCCLogo";
import { Github, Twitter } from "lucide-react";

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com/BCCcash", label: "Twitter" },
  { icon: Github, href: "https://github.com/bcc-cash", label: "GitHub" },
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo and Copyright */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <a href="/" className="flex items-center gap-2">
              <BCCLogo className="w-8 h-8 text-foreground" />
              <span className="font-semibold text-foreground">BCC.cash</span>
            </a>
            <p className="text-sm text-muted-foreground">
              © {currentYear} BCC.cash. All rights reserved.
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-6">
            <a
              href="#generate"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Generate
            </a>
            <a
              href="#verify"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Verify
            </a>
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
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
        <div className="mt-8 pt-6 border-t border-border/30 text-center">
          <p className="text-xs text-muted-foreground">
            Turn emails into Solana wallets. Perfect for airdrops, fundraising, and onboarding new users to Web3.
          </p>
        </div>
      </div>
    </footer>
  );
};
