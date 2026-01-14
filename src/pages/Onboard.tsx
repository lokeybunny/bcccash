import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Copy, Users, Search } from "lucide-react";
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
import { Input } from "@/components/ui/input";

interface OnboardEntry {
  id: number;
  name: string;
  type: "celebrity" | "organization" | "influencer" | "brand";
  category: string;
  publicKey: string;
  verified: boolean;
  source?: string;
}

const placeholderData: OnboardEntry[] = [
  {
    id: 1,
    name: "Elon Musk",
    type: "celebrity",
    category: "Tech & Innovation",
    publicKey: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    verified: true,
    source: "https://x.com/elonmusk",
  },
  {
    id: 2,
    name: "Snoop Dogg",
    type: "celebrity",
    category: "Music & Entertainment",
    publicKey: "Czbmb7osZxLaX5vGHuXMS2mkdtZEXyTNKwsAUUpLGhkG",
    verified: true,
    source: "https://x.com/SnoopDogg",
  },
  {
    id: 3,
    name: "Paris Hilton",
    type: "celebrity",
    category: "Entertainment",
    publicKey: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    verified: true,
    source: "https://x.com/ParisHilton",
  },
  {
    id: 4,
    name: "Gary Vaynerchuk",
    type: "influencer",
    category: "Business & Web3",
    publicKey: "DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC86PZ8okm21hy",
    verified: true,
    source: "https://x.com/garyvee",
  },
  {
    id: 5,
    name: "Solana Foundation",
    type: "organization",
    category: "Blockchain",
    publicKey: "So11111111111111111111111111111111111111112",
    verified: true,
    source: "https://solana.org",
  },
  {
    id: 6,
    name: "Magic Eden",
    type: "brand",
    category: "NFT Marketplace",
    publicKey: "MEisE1HzehtrDpAAT8PnLHjpSSkRYakotTuJRPjTpo8",
    verified: true,
    source: "https://magiceden.io",
  },
  {
    id: 7,
    name: "Steve Aoki",
    type: "celebrity",
    category: "Music & NFTs",
    publicKey: "AoKi1tFn7cEzWJFp8qx8E8Q8WpYv4sLx6A8zd4SdMxNK",
    verified: true,
    source: "https://x.com/steveaoki",
  },
  {
    id: 8,
    name: "Rarible",
    type: "organization",
    category: "NFT Platform",
    publicKey: "RariZLy8aZ88GJMncG7hRQ4J8TerNf59sFvFxkv2Dqd",
    verified: true,
    source: "https://rarible.com",
  },
  {
    id: 9,
    name: "Phantom Wallet",
    type: "brand",
    category: "Crypto Wallet",
    publicKey: "PhntmWaLLet111111111111111111111111111111111",
    verified: true,
    source: "https://phantom.app",
  },
  {
    id: 10,
    name: "Mark Cuban",
    type: "celebrity",
    category: "Business & Crypto",
    publicKey: "CubanMark2023xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    verified: false,
    source: "https://x.com/mcuban",
  },
  {
    id: 11,
    name: "OpenSea",
    type: "organization",
    category: "NFT Marketplace",
    publicKey: "OpenSea2024xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    verified: true,
    source: "https://opensea.io",
  },
  {
    id: 12,
    name: "Beeple",
    type: "celebrity",
    category: "Digital Art",
    publicKey: "BeepLe69MiLLioN111111111111111111111111111",
    verified: true,
    source: "https://x.com/beeple",
  },
];

const typeColors: Record<OnboardEntry["type"], string> = {
  celebrity: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  organization: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  influencer: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  brand: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

const Onboard = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const truncateKey = (key: string) => {
    return `${key.slice(0, 6)}...${key.slice(-6)}`;
  };

  const filteredData = placeholderData.filter((entry) => {
    const query = searchQuery.toLowerCase();
    return (
      entry.name.toLowerCase().includes(query) ||
      entry.type.toLowerCase().includes(query) ||
      entry.category.toLowerCase().includes(query) ||
      entry.publicKey.toLowerCase().includes(query)
    );
  });

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

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 max-w-md mx-auto"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, type, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/50 border-border/50"
            />
          </div>
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
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No results found for "{searchQuery}"
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((entry, index) => (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-border/30 hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <span>{entry.name}</span>
                        {entry.verified && (
                          <span className="text-primary text-xs">✓</span>
                        )}
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
                ))
              )}
            </TableBody>
          </Table>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Onboard;
