import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'react-qr-code';
import { FiDownload, FiX, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { qrApi } from '../../services/api';

export default function BulkQRGenerator({ links, isOpen, onClose }: {
  links: any[];
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleBulkDownload = async () => {
    setIsGenerating(true);
    let downloaded = 0;
    try {
      for (const link of links) {
        try {
          await qrApi.downloadQR(link.shortCode, `nexusurl-${link.shortCode}.png`);
          downloaded++;
        } catch {
          // continue with next
        }
      }
      if (downloaded > 0) {
        toast.success(`Downloaded ${downloaded} QR code${downloaded !== 1 ? 's' : ''}!`);
      } else {
        toast.error('Failed to download QR codes');
      }
    } catch {
      toast.error('Failed to generate QR codes');
    } finally {
      setIsGenerating(false);
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
              className="w-full max-w-lg bg-[#12122A] border border-white/10 rounded-2xl shadow-2xl shadow-[#6C3CE1]/10"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FiFileText size={18} className="text-[#6C3CE1]" /> Bulk QR Codes
                </h2>
                <button onClick={onClose} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
                  <FiX size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-400">
                  Generate QR codes for <span className="text-white font-medium">{links.length}</span> selected link{links.length !== 1 ? 's' : ''}
                </p>

                <div className="flex flex-wrap gap-3">
                  {links.slice(0, 6).map((link) => (
                    <div key={link.id} className="flex flex-col items-center gap-1.5 bg-[#0A0A1A] rounded-xl p-3 border border-white/5">
                      <QRCode value={link.shortUrl} size={60} bgColor="#0A0A1A" fgColor="#6C3CE1" level="H" />
                      <span className="text-[10px] text-gray-500 max-w-[70px] truncate">{link.shortCode}</span>
                    </div>
                  ))}
                  {links.length > 6 && (
                    <div className="flex items-center justify-center bg-[#0A0A1A] rounded-xl p-3 border border-white/5 min-w-[76px]">
                      <span className="text-xs text-gray-400">+{links.length - 6} more</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleBulkDownload}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#6C3CE1] to-[#FF6B6B] hover:shadow-lg hover:shadow-[#6C3CE1]/25 transition-all disabled:opacity-60"
                >
                  {isGenerating ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><FiDownload size={16} /> Download All QR Codes ({links.length})</>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
