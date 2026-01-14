import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-12 max-w-4xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2026</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using BCC.cash, you accept and agree to be bound by the terms and
              provisions of this agreement. If you do not agree to these terms, please do not use
              our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              BCC.cash provides a service that generates Solana wallet addresses from email
              addresses. The service creates deterministic wallet addresses and securely delivers
              private keys via email to the wallet owner.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">You agree to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Provide accurate email addresses when generating wallets</li>
              <li>Keep your private keys secure and confidential</li>
              <li>Not use the service for any illegal or unauthorized purpose</li>
              <li>Not attempt to interfere with or compromise the system integrity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Wallet Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              Private keys are delivered only to the email address associated with the wallet. We do
              not store private keys on our servers after delivery. You are solely responsible for
              the security of your private keys and any funds in your wallet.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              The service is provided "as is" without warranties of any kind. We do not guarantee
              uninterrupted access to the service or that the service will be error-free. We are not
              responsible for any loss of funds or damages arising from the use of this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              BCC.cash shall not be liable for any indirect, incidental, special, consequential, or
              punitive damages resulting from your use of or inability to use the service,
              including but not limited to loss of cryptocurrency or digital assets.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. Changes will be effective
              immediately upon posting. Your continued use of the service constitutes acceptance of
              the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms of Service, please contact us on{" "}
              <a
                href="https://x.com/BCCcash"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                X (Twitter)
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
