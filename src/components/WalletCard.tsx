import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import { Download, Image, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface WalletCardProps {
  publicKey: string;
  email: string;
  source?: string;
}

const BACKGROUND_OPTIONS = [
  {
    id: "gradient-purple",
    name: "Purple Wave",
    style: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
  },
  {
    id: "gradient-ocean",
    name: "Ocean",
    style: "linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)",
  },
  {
    id: "gradient-sunset",
    name: "Sunset",
    style: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  },
  {
    id: "gradient-forest",
    name: "Forest",
    style: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  },
  {
    id: "gradient-night",
    name: "Night Sky",
    style: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
  },
  {
    id: "gradient-fire",
    name: "Fire",
    style: "linear-gradient(135deg, #f12711 0%, #f5af19 100%)",
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
  const truncatedKey = `${publicKey.slice(0, 8)}...${publicKey.slice(-8)}`;

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

  const getBackgroundStyle = () => {
    if (customBgUrl) {
      return {
        backgroundImage: `url(${customBgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    return { background: selectedBg.style };
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
            <label className="text-sm font-medium text-foreground">Choose Background</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {BACKGROUND_OPTIONS.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => {
                    setSelectedBg(bg);
                    clearCustomBg();
                  }}
                  className={`aspect-square rounded-lg border-2 transition-all ${
                    selectedBg.id === bg.id && !customBgUrl
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border hover:border-muted-foreground"
                  }`}
                  style={{ background: bg.style }}
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
          <div className="flex justify-center">
            <div
              ref={cardRef}
              className="relative w-[400px] h-[250px] rounded-2xl overflow-hidden shadow-2xl"
              style={getBackgroundStyle()}
            >
              {/* Overlay for readability */}
              <div className="absolute inset-0 bg-black/30" />
              
              {/* Card Content */}
              <div className="relative h-full p-5 flex flex-col justify-between text-white">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold tracking-wide">BCC WALLET</h3>
                    <p className="text-xs opacity-80">Solana Wallet Card</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] opacity-60 uppercase tracking-wider">Powered by</p>
                    <p className="text-xs font-semibold">bcccash.lovable.app</p>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex items-end justify-between gap-4">
                  {/* QR Codes */}
                  <div className="flex gap-3">
                    {/* Wallet QR */}
                    <div className="bg-white p-2 rounded-lg">
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
                      <div className="bg-white p-2 rounded-lg">
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
                    <p className="font-mono text-xs" title={publicKey}>
                      {truncatedKey}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="flex justify-center">
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
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Share your wallet card on X to help others discover BCC! 🚀
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
