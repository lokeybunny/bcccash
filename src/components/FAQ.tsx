import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Shield, Lock, Eye, Server, Mail, Code } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    icon: Lock,
    question: "Are private keys stored on your servers?",
    answer: "No, absolutely not. Private keys are generated server-side using cryptographic libraries, immediately sent to the recipient's email, and then permanently discarded. We only store the public key (wallet address) in our database. There is no way for us to access or recover private keys after they're sent.",
  },
  {
    icon: Shield,
    question: "How do I know this is secure?",
    answer: "Our entire codebase is open source and available on GitHub for public audit. We use industry-standard Ed25519 cryptography for key generation, server-side Cloudflare Turnstile for bot protection, and rate limiting to prevent abuse. You can verify our security practices by reviewing the code yourself.",
  },
  {
    icon: Eye,
    question: "Can you see wallets I create or their balances?",
    answer: "We can only see the public wallet address (which is public on the blockchain anyway) and the email it was sent to. We cannot see private keys, wallet balances, or any transactions. The blockchain is public, but we don't track or monitor any wallet activity.",
  },
  {
    icon: Mail,
    question: "Why send private keys via email?",
    answer: "Email is the most accessible way to onboard non-crypto users. While not as secure as hardware wallets, it's practical for airdrops, tips, and introducing people to Web3. We strongly recommend recipients transfer funds to a more secure wallet for large amounts and delete the email after saving their key.",
  },
  {
    icon: Server,
    question: "What happens if your service goes down?",
    answer: "Your wallet works completely independently of our service. Once you have your private key, you can use it with any Solana wallet (Phantom, Solflare, etc.) forever. We're just the onboarding tool - the wallet lives on the Solana blockchain, not on our servers.",
  },
  {
    icon: Code,
    question: "How does the wallet generation work?",
    answer: "We use the Ed25519 elliptic curve algorithm (same as Solana) to generate a cryptographically secure keypair. A 32-byte random seed is generated, the public key is derived from it, and together they form a 64-byte secret key compatible with all Solana wallets. The process happens in secure edge functions with no logging of private keys.",
  },
];

export const FAQ = () => {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Security & <span className="gradient-text">Transparency</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We believe in full transparency. Here's everything you need to know about how we handle your data and keep your wallets secure.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="glass-card rounded-xl px-6 border border-border/50 data-[state=open]:border-primary/30 transition-colors"
              >
                <AccordionTrigger className="hover:no-underline py-5">
                  <div className="flex items-center gap-4 text-left">
                    <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                      <faq.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-5 pl-14 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Open Source Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <a
            href="https://github.com/lokeybunny/bcccash"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3 rounded-xl glass-card border border-border/50 hover:border-primary/30 transition-colors group"
          >
            <Code className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-muted-foreground group-hover:text-foreground transition-colors">
              View Source Code on GitHub
            </span>
          </a>
        </motion.div>
      </div>
    </section>
  );
};