import { useState, useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import { Download, Image, RefreshCw, X, Sparkles, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// Import branded backgrounds
import cardBg1 from "@/assets/card-bg-1.png";
import cardBg2 from "@/assets/card-bg-2.png";
import cardBg3 from "@/assets/card-bg-3.png";
import cardBg4 from "@/assets/card-bg-4.png";
import bccLogo from "@/assets/bcc-logo.png";

interface WalletCardProps {
  publicKey: string;
  email: string;
  source?: string;
}

type BackgroundOption = {
  id: string;
  name: string;
  image: string;
};

const BACKGROUND_OPTIONS: BackgroundOption[] = [
  {
    id: "bcc-green",
    name: "BCC Green",
    image: cardBg1,
  },
  {
    id: "bcc-blue",
    name: "BCC Blue",
    image: cardBg2,
  },
  {
    id: "bcc-red",
    name: "BCC Red",
    image: cardBg3,
  },
  {
    id: "bcc-pink",
    name: "BCC Pink",
    image: cardBg4,
  },
];

export const WalletCard = ({ publicKey, email, source }: WalletCardProps) => {
  const [selectedBg, setSelectedBg] = useState(BACKGROUND_OPTIONS[0]);
  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const truncatedEmail = email.length > 30 ? `${email.slice(0, 27)}...` : email;

  const handleCustomBgUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomBgUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const clearCustomBg = useCallback(() => {
    setCustomBgUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const downloadCard = useCallback(async () => {
    if (!cardRef.current) return;

    setIsGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
      });

      const link = document.createElement("a");
      link.download = `bcc-wallet-${publicKey.slice(0, 8)}.png`;
      link.href = dataUrl;
      link.click();

      toast.success("Card downloaded! Share it on X 🚀");
    } catch (error) {
      console.error("Error generating card:", error);
      toast.error("Failed to generate card");
    } finally {
      setIsGenerating(false);
    }
  }, [publicKey]);

  const getBackgroundStyle = (): React.CSSProperties => {
    if (customBgUrl) {
      return {
        backgroundImage: `url(${customBgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    return {
      backgroundImage: `url(${selectedBg.image})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  };

  const getPreviewStyle = (bg: BackgroundOption): React.CSSProperties => {
    return {
      backgroundImage: `url(${bg.image})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Image className="w-4 h-4" />
          Create Share Card
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="w-5 h-5 text-primary" />
            Create Shareable Wallet Card
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Background Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Choose Background
            </label>
            
            <div className="grid grid-cols-4 gap-2">
              {BACKGROUND_OPTIONS.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => {
                    setSelectedBg(bg);
                    clearCustomBg();
                  }}
                  className={`aspect-video rounded-lg border-2 transition-all overflow-hidden ${
                    selectedBg.id === bg.id && !customBgUrl
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border hover:border-muted-foreground"
                  }`}
                  style={getPreviewStyle(bg)}
                  title={bg.name}
                />
              ))}
            </div>
            
            {/* Custom Upload */}
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCustomBgUpload}
                className="hidden"
                id="custom-bg-upload"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Image className="w-4 h-4" />
                Upload Custom
              </Button>
              {customBgUrl && (
                <Button variant="ghost" size="sm" onClick={clearCustomBg} className="gap-1">
                  <X className="w-4 h-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Card Preview */}
          <div className="flex justify-center overflow-x-auto">
            <div
              ref={cardRef}
              className="relative w-[500px] h-[280px] rounded-2xl overflow-hidden shadow-2xl flex-shrink-0"
              style={getBackgroundStyle()}
            >
              {/* Overlay for readability */}
              <div className="absolute inset-0 bg-black/20" />
              
              {/* Logo Watermark - always visible, 2x bigger */}
              <div className="absolute top-3 left-3 z-10">
                <img 
                  src={bccLogo} 
                  alt="BCC Cash" 
                  className="w-24 h-24 object-contain drop-shadow-lg"
                />
              </div>
              
              {/* Card Content */}
              <div className="relative h-full p-5 flex flex-col justify-between text-white">
                {/* Header */}
                <div className="flex items-center justify-end">
                  <div className="text-right">
                    <p className="text-[10px] opacity-60 uppercase tracking-wider">Powered by</p>
                    <p className="text-xs font-semibold">BCC.CASH</p>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex items-end justify-between gap-4">
                  {/* QR Codes */}
                  <div className="flex gap-3">
                    {/* Wallet QR */}
                    <div className="bg-white p-2 rounded-lg shadow-lg">
                      <QRCodeSVG
                        value={`solana:${publicKey}`}
                        size={70}
                        level="M"
                        includeMargin={false}
                      />
                      <p className="text-[8px] text-center text-black mt-1 font-medium">WALLET</p>
                    </div>

                    {/* Source QR (if available) */}
                    {source && (
                      <div className="bg-white p-2 rounded-lg shadow-lg">
                        <QRCodeSVG
                          value={source.startsWith("http") ? source : `https://${source}`}
                          size={70}
                          level="M"
                          includeMargin={false}
                        />
                        <p className="text-[8px] text-center text-black mt-1 font-medium">SOURCE</p>
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="text-right flex-1 min-w-0">
                    <p className="text-[10px] opacity-60 uppercase tracking-wider mb-1">Email</p>
                    <p className="text-sm font-medium truncate" title={email}>
                      {truncatedEmail}
                    </p>
                    <p className="text-[10px] opacity-60 uppercase tracking-wider mt-2 mb-1">Public Key</p>
                    <p className="font-mono text-[8px] leading-tight break-all" title={publicKey}>
                      {publicKey}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button
              onClick={downloadCard}
              disabled={isGenerating}
              className="gap-2"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download Card
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="gap-2 bg-black hover:bg-black/90 text-white border-black"
              onClick={() => {
                const tweetText = encodeURIComponent(
                  `🚀 Just created my Solana wallet with @BCCcash!\n\n` +
                  `Turn any email into a Solana wallet instantly.\n\n` +
                  `🔗 bcccash.cash\n\n` +
                  `#Solana #Crypto #Web3 #BCCcash`
                );
                window.open(
                  `https://twitter.com/intent/tweet?text=${tweetText}`,
                  "_blank",
                  "noopener,noreferrer"
                );
              }}
            >
              <Twitter className="w-4 h-4" />
              Share on X
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Download your card, then attach it to your post on X! 🚀
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
