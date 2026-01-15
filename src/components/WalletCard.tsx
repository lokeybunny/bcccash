import { useState, useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import { Download, Image, RefreshCw, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import bccLogo from "@/assets/bcc-logo.png";

interface WalletCardProps {
  publicKey: string;
  email: string;
  source?: string;
}

type BackgroundOption = {
  id: string;
  name: string;
  type: "gradient" | "image";
  style?: string;
  image?: string;
};

const BACKGROUND_OPTIONS: BackgroundOption[] = [
  // Branded BCC backgrounds first
  {
    id: "bcc-brand-1",
    name: "BCC Email",
    type: "image",
    image: cardBg1,
  },
  {
    id: "bcc-brand-2",
    name: "BCC Wallet",
    type: "image",
    image: cardBg2,
  },
  {
    id: "bcc-brand-3",
    name: "BCC Bitcoin",
    type: "image",
    image: cardBg3,
  },
  // Gradient options
  {
    id: "gradient-purple",
    name: "Purple Wave",
    type: "gradient",
    style: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
  },
  {
    id: "gradient-ocean",
    name: "Ocean",
    type: "gradient",
    style: "linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)",
  },
  {
    id: "gradient-night",
    name: "Night Sky",
    type: "gradient",
    style: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
  },
];

export const WalletCard = ({ publicKey, email, source }: WalletCardProps) => {
  const [selectedBg, setSelectedBg] = useState(BACKGROUND_OPTIONS[0]);
  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null);
  const [showWatermark, setShowWatermark] = useState(true);
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
    if (selectedBg.type === "image" && selectedBg.image) {
      return {
        backgroundImage: `url(${selectedBg.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    return { background: selectedBg.style };
  };

  const getPreviewStyle = (bg: BackgroundOption): React.CSSProperties => {
    if (bg.type === "image" && bg.image) {
      return {
        backgroundImage: `url(${bg.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    return { background: bg.style };
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
            
            {/* BCC Branded Backgrounds */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> BCC Branded
              </p>
              <div className="grid grid-cols-3 gap-2">
                {BACKGROUND_OPTIONS.filter(bg => bg.type === "image").map((bg) => (
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
            </div>

            {/* Gradient Backgrounds */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Gradients</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {BACKGROUND_OPTIONS.filter(bg => bg.type === "gradient").map((bg) => (
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
                    style={getPreviewStyle(bg)}
                    title={bg.name}
                  />
                ))}
              </div>
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

          {/* Watermark Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-3">
              <img src={bccLogo} alt="BCC Logo" className="w-8 h-8 rounded" />
              <div>
                <Label htmlFor="watermark-toggle" className="text-sm font-medium">
                  Show Logo Watermark
                </Label>
                <p className="text-xs text-muted-foreground">Display BCC logo on the card</p>
              </div>
            </div>
            <Switch
              id="watermark-toggle"
              checked={showWatermark}
              onCheckedChange={setShowWatermark}
            />
          </div>

          {/* Card Preview */}
          <div className="flex justify-center overflow-x-auto">
            <div
              ref={cardRef}
              className="relative w-[500px] h-[280px] rounded-2xl overflow-hidden shadow-2xl flex-shrink-0"
              style={getBackgroundStyle()}
            >
              {/* Overlay for readability - lighter for branded images */}
              <div className={`absolute inset-0 ${selectedBg.type === "image" || customBgUrl ? "bg-black/20" : "bg-black/30"}`} />
              
              {/* Logo Watermark - same size as header logo */}
              {showWatermark && (
                <div className="absolute top-2 left-2 z-10">
                  <img 
                    src={bccLogo} 
                    alt="BCC Cash" 
                    className="w-20 h-20 object-contain drop-shadow-lg"
                  />
                </div>
              )}
              
              {/* Card Content */}
              <div className="relative h-full p-5 flex flex-col justify-between text-white">
                {/* Header */}
                <div className="flex items-center justify-end">
                  <div className="text-right">
                    <p className="text-[10px] opacity-60 uppercase tracking-wider">Powered by</p>
                    <p className="text-xs font-semibold">bcccash.cash</p>
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
