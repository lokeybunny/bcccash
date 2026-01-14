import { motion } from "framer-motion";
import { ExternalLink, Copy, Users } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface OnboardEntry {
  id: number;
  name: string;
  type: "celebrity" | "organization" | "influencer" | "brand";
  category: string;
  publicKey: string;
  verified: boolean;
  source?: string;
  avatar?: string;
}

// Generate avatar URL using UI Avatars service
const getAvatarUrl = (name: string, type: OnboardEntry["type"]) => {
  const colors: Record<OnboardEntry["type"], string> = {
    celebrity: "9333ea",
    organization: "3b82f6",
    influencer: "f59e0b",
    brand: "10b981",
  };
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${colors[type]}&color=fff&size=128&bold=true`;
};

const placeholderData: OnboardEntry[] = [
  {
    id: 1,
    name: "Elon Musk",
    type: "celebrity",
    category: "Tech & Innovation",
    publicKey: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    verified: true,
    source: "https://x.com/elonmusk",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg/220px-Elon_Musk_Royal_Society_%28crop2%29.jpg",
  },
  {
    id: 2,
    name: "Snoop Dogg",
    type: "celebrity",
    category: "Music & Entertainment",
    publicKey: "Czbmb7osZxLaX5vGHuXMS2mkdtZEXyTNKwsAUUpLGhkG",
    verified: true,
    source: "https://x.com/SnoopDogg",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Snoop_Dogg_2019_by_Glenn_Francis.jpg/220px-Snoop_Dogg_2019_by_Glenn_Francis.jpg",
  },
  {
    id: 3,
    name: "Paris Hilton",
    type: "celebrity",
    category: "Entertainment",
    publicKey: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    verified: true,
    source: "https://x.com/ParisHilton",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Paris_Hilton_2021.jpg/220px-Paris_Hilton_2021.jpg",
  },
  {
    id: 4,
    name: "Gary Vaynerchuk",
    type: "influencer",
    category: "Business & Web3",
    publicKey: "DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC86PZ8okm21hy",
    verified: true,
    source: "https://x.com/garyvee",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Gary_Vaynerchuk_at_TechCrunch_Disrupt_%28cropped%29.jpg/220px-Gary_Vaynerchuk_at_TechCrunch_Disrupt_%28cropped%29.jpg",
  },
  {
    id: 5,
    name: "Solana Foundation",
    type: "organization",
    category: "Blockchain",
    publicKey: "So11111111111111111111111111111111111111112",
    verified: true,
    source: "https://solana.org",
    avatar: "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png",
  },
  {
    id: 6,
    name: "Magic Eden",
    type: "brand",
    category: "NFT Marketplace",
    publicKey: "MEisE1HzehtrDpAAT8PnLHjpSSkRYakotTuJRPjTpo8",
    verified: true,
    source: "https://magiceden.io",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Magic_Eden_Logo.svg/220px-Magic_Eden_Logo.svg.png",
  },
  {
    id: 7,
    name: "Steve Aoki",
    type: "celebrity",
    category: "Music & NFTs",
    publicKey: "AoKi1tFn7cEzWJFp8qx8E8Q8WpYv4sLx6A8zd4SdMxNK",
    verified: true,
    source: "https://x.com/steveaoki",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Steve_Aoki_at_Veld.jpg/220px-Steve_Aoki_at_Veld.jpg",
  },
  {
    id: 8,
    name: "Rarible",
    type: "organization",
    category: "NFT Platform",
    publicKey: "RariZLy8aZ88GJMncG7hRQ4J8TerNf59sFvFxkv2Dqd",
    verified: true,
    source: "https://rarible.com",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Rarible_Logo.png",
  },
  {
    id: 9,
    name: "Phantom Wallet",
    type: "brand",
    category: "Crypto Wallet",
    publicKey: "PhntmWaLLet111111111111111111111111111111111",
    verified: true,
    source: "https://phantom.app",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Phantom-Icon_App_60x60%403x.png/220px-Phantom-Icon_App_60x60%403x.png",
  },
  {
    id: 10,
    name: "Mark Cuban",
    type: "celebrity",
    category: "Business & Crypto",
    publicKey: "CubanMark2023xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    verified: false,
    source: "https://x.com/mcuban",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Mark_Cuban_2008.jpg/220px-Mark_Cuban_2008.jpg",
  },
  {
    id: 11,
    name: "OpenSea",
    type: "organization",
    category: "NFT Marketplace",
    publicKey: "OpenSea2024xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    verified: true,
    source: "https://opensea.io",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/OpenSea_logo.svg/220px-OpenSea_logo.svg.png",
  },
  {
    id: 12,
    name: "Beeple",
    type: "celebrity",
    category: "Digital Art",
    publicKey: "BeepLe69MiLLioN111111111111111111111111111",
    verified: true,
    source: "https://x.com/baboracle",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Beeple_2020.jpg/220px-Beeple_2020.jpg",
  },
];

const typeColors: Record<OnboardEntry["type"], string> = {
  celebrity: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  organization: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  influencer: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  brand: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

const Onboard = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const truncateKey = (key: string) => {
    return `${key.slice(0, 6)}...${key.slice(-6)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent">
              Onboarded
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Famous celebrities, organizations, and brands that have onboarded to Solana.
            View their verified public keys below.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
        >
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="text-muted-foreground font-semibold">Name</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Type</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Category</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Public Key</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {placeholderData.map((entry, index) => (
                <motion.tr
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-border/30 hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-3">
                      <img
                        src={entry.avatar || getAvatarUrl(entry.name, entry.type)}
                        alt={entry.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-border/50"
                      />
                      <div className="flex items-center gap-2">
                        <span>{entry.name}</span>
                        {entry.verified && (
                          <span className="text-primary text-xs">✓</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`${typeColors[entry.type]} capitalize`}
                    >
                      {entry.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {entry.category}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted/50 px-2 py-1 rounded font-mono text-foreground">
                        {truncateKey(entry.publicKey)}
                      </code>
                      <button
                        onClick={() => copyToClipboard(entry.publicKey)}
                        className="p-1.5 rounded-md hover:bg-muted transition-colors"
                        title="Copy full public key"
                      >
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {entry.source && (
                      <a
                        href={entry.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1 text-sm"
                      >
                        Visit
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Onboard;
