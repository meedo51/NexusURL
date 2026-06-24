import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'react-qr-code';
import { FiDownload, FiCopy, FiShare2, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { qrApi } from '../../services/api';

export default function QRCodeModal({ isOpen, onClose, link }: {
  isOpen: boolean;
  onClose: () => void;
  link: any;
}) {
  const [size, setSize] = useState(280);

  if (!link) return null;

  const shortUrl = link.shortUrl;

  const handleDownload = async () => {
    try {
      await qrApi.downloadQR(link.shortCode, `nexusurl-${link.shortCode}.png`);
    } catch {
      toast.error('Failed to download QR code');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    toast.success('Link copied!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'NexusURL Short Link', text: `Check out this link: ${shortUrl}`, url: shortUrl });
    } else {
      navigator.clipboard.writeText(shortUrl);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="w-full max-w-md bg-[#12122A] border border-white/10 rounded-2xl shadow-2xl shadow-[#6C3CE1]/10"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  QR Code
                </h2>
                <button onClick={onClose} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
                  <FiX size={18} />
                </button>
              </div>

              <div className="p-6 flex flex-col items-center gap-5">
                <div className="relative bg-[#0A0A1A] p-5 rounded-xl border-2 border-[#6C3CE1]/20 shadow-lg shadow-[#6C3CE1]/5">
                  <QRCode value={shortUrl} size={size} bgColor="#0A0A1A" fgColor="#6C3CE1" level="H" />
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#0A0A1A]/80 backdrop-blur-sm px-3 py-1 rounded-full border border-[#6C3CE1]/20">
                    <span className="text-[10px] text-[#6C3CE1] font-semibold">NexusURL</span>
                  </div>
                </div>

                <div className="w-full space-y-3">
                  <div className="flex items-center justify-between bg-white/[0.03] rounded-xl px-4 py-3 border border-white/5">
                    <span className="text-sm text-gray-400">Short Link</span>
                    <span className="text-sm text-[#00D4FF] font-medium truncate max-w-[200px]">{shortUrl}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400 shrink-0">Size: {size}px</span>
                    <input
                      type="range"
                      min="150"
                      max="500"
                      value={size}
                      onChange={(e) => setSize(parseInt(e.target.value))}
                      className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#6C3CE1]"
                    />
                  </div>
                </div>

                <div className="flex gap-3 w-full">
                  <button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[#6C3CE1] to-[#FF6B6B] hover:shadow-lg hover:shadow-[#6C3CE1]/25 transition-all">
                    <FiDownload size={16} /> Download
                  </button>
                  <button onClick={handleCopy} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                    <FiCopy size={16} /> Copy
                  </button>
                  <button onClick={handleShare} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                    <FiShare2 size={16} />
                  </button>
                </div>

                {link.qrScans > 0 && (
                  <div className="w-full text-center text-xs text-gray-500">
                    Scanned {link.qrScans} time{link.qrScans !== 1 ? 's' : ''} via QR code
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
