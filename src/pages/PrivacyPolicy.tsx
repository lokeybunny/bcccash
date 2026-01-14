import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
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

        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2026</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We collect minimal information necessary to provide our service:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Email addresses used to generate wallets</li>
              <li>Public wallet addresses (derived from email)</li>
              <li>Verification status of wallets</li>
              <li>Timestamps of wallet creation and verification</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Your information is used to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Generate deterministic wallet addresses</li>
              <li>Deliver private keys securely to wallet owners</li>
              <li>Allow verification of wallet ownership</li>
              <li>Provide wallet lookup functionality</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Private Key Handling</h2>
            <p className="text-muted-foreground leading-relaxed">
              Private keys are generated server-side and immediately sent to the associated email
              address. We do not store private keys on our servers. Once the email is sent, the
              private key exists only in the recipient's email inbox. You are responsible for
              securely storing your private key after receiving it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Data Storage</h2>
            <p className="text-muted-foreground leading-relaxed">
              We store email addresses and public wallet addresses in our database to enable wallet
              verification and lookup features. This data is stored securely and is not shared with
              third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">We use the following third-party services:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Email delivery services to send private keys</li>
              <li>Cloudflare Turnstile for bot protection</li>
              <li>Analytics services to improve our service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures to protect your data. All
              communications are encrypted using HTTPS. However, no method of transmission over the
              Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Access the data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt out of non-essential communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any
              changes by posting the new Privacy Policy on this page and updating the "Last
              updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this Privacy Policy, please contact us on{" "}
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

export default PrivacyPolicy;
