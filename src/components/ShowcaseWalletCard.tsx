import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import cardBg2 from "@/assets/card-bg-2.png";
import bccLogo from "@/assets/bcc-logo.png";
import solanaLogo from "@/assets/solana-logo.png";

// Demo wallet data
const DEMO_PUBLIC_KEY = "7NP5JZrxZMRQ7WCJyvEpqh3M213zAqq9eLKfuMzggd8W";
const DEMO_EMAIL = "dev@bcc.cash";

export const ShowcaseWalletCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="relative mt-12"
    >
      {/* Glow effect behind card */}
      <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/30 rounded-3xl transform scale-110" />
      
      {/* Card Container with perspective */}
      <motion.div
        className="relative"
        whileHover={{ scale: 1.02, rotateY: 2 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* The Wallet Card */}
        <div
          className="relative w-full max-w-[600px] mx-auto aspect-video rounded-2xl overflow-hidden shadow-2xl"
          style={{
            backgroundImage: `url(${cardBg2})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Overlay for readability */}
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Logo Watermark */}
          <div className="absolute top-3 left-3 z-10">
            <img 
              src={bccLogo} 
              alt="BCC Cash" 
              className="w-16 h-16 md:w-24 md:h-24 object-contain drop-shadow-lg"
            />
          </div>
          
          {/* Card Content */}
          <div className="relative h-full p-4 md:p-5 flex flex-col justify-between text-white">
            {/* Header */}
            <div className="flex items-center justify-end">
              <div className="text-right">
                <p className="text-[8px] md:text-[10px] opacity-60 uppercase tracking-wider">Powered by</p>
                <p className="text-[10px] md:text-xs font-semibold">BCC.CASH</p>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex items-end justify-between gap-2 md:gap-4">
              {/* QR Codes */}
              <div className="flex gap-2 md:gap-3">
                {/* Wallet QR */}
                <div className="bg-white p-1.5 md:p-2 rounded-lg shadow-lg">
                  <QRCodeSVG
                    value={`solana:${DEMO_PUBLIC_KEY}`}
                    size={50}
                    level="H"
                    includeMargin={false}
                    imageSettings={{
                      src: solanaLogo,
                      height: 12,
                      width: 12,
                      excavate: true,
                    }}
                    className="md:w-[70px] md:h-[70px]"
                  />
                  <p className="text-[6px] md:text-[8px] text-center text-black mt-1 font-medium">WALLET</p>
                </div>

                {/* Email QR */}
                <div className="bg-white p-1.5 md:p-2 rounded-lg shadow-lg">
                  <QRCodeSVG
                    value={`mailto:${DEMO_EMAIL}?subject=Your%20BCC.CASH%20Wallet`}
                    size={50}
                    level="M"
                    includeMargin={false}
                    className="md:w-[70px] md:h-[70px]"
                  />
                  <p className="text-[6px] md:text-[8px] text-center text-black mt-1 font-medium">EMAIL</p>
                </div>
              </div>

              {/* User Info */}
              <div className="text-right flex-1 min-w-0">
                <p className="text-[8px] md:text-[10px] opacity-60 uppercase tracking-wider mb-0.5 md:mb-1">Email</p>
                <p className="text-xs md:text-sm font-medium truncate">
                  {DEMO_EMAIL}
                </p>
                <p className="text-[8px] md:text-[10px] opacity-60 uppercase tracking-wider mt-1 md:mt-2 mb-0.5 md:mb-1">Public Key</p>
                <p className="font-mono text-[6px] md:text-[8px] leading-tight break-all">
                  {DEMO_PUBLIC_KEY}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Caption */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center text-sm text-muted-foreground mt-4"
      >
        ✨ Your wallet will look like this
      </motion.p>
    </motion.div>
  );
};
