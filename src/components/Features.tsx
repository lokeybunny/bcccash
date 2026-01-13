import { motion } from "framer-motion";
import { Zap, Lock, Globe, Mail } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Generation",
    description: "Create Solana wallets in seconds with just an email address.",
  },
  {
    icon: Lock,
    title: "Secure Delivery",
    description: "Private keys are encrypted and sent directly to the recipient's email.",
  },
  {
    icon: Globe,
    title: "On-Chain Verification",
    description: "Every wallet is verifiable on the Solana blockchain.",
  },
  {
    icon: Mail,
    title: "Clear Instructions",
    description: "Recipients receive full guidance on accessing and securing their wallet.",
  },
];

export const Features = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Generate Solana wallets for anyone with just their email. Perfect for airdrops,
            fundraising, and onboarding new users to Web3.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass-card rounded-xl p-6 hover:border-primary/30 transition-colors"
            >
              <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
