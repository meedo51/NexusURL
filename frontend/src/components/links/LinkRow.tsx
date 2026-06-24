import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'react-qr-code';
import {
  FiCopy, FiExternalLink, FiTrash2, FiBarChart2,
  FiMoreVertical, FiDownload, FiMaximize2, FiCalendar, FiEye,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { qrApi } from '../../services/api';

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  expired: { label: 'Expired', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  protected: { label: 'Protected', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  onetime: { label: 'One-time', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  inactive: { label: 'Inactive', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  dying: { label: 'Expiring', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
};

function getStatus(link: any) {
  if (!link.isActive) return statusConfig.inactive;
  if (link.expirationDate && new Date(link.expirationDate) < new Date()) return statusConfig.expired;
  if (link.expirationDate) {
    const daysLeft = Math.ceil((new Date(link.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 7) return { ...statusConfig.dying, label: `${daysLeft}d left` };
  }
  if (link.hasPassword) return statusConfig.protected;
  if (link.oneTimeAccess) return statusConfig.onetime;
  return statusConfig.active;
}

export default function LinkRow({ link, index, onDelete, onShowQR }: {
  link: any;
  index: number;
  onDelete: (id: string) => void;
  onShowQR: (link: any) => void;
}) {
  const [showQR, setShowQR] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const shortUrl = link.shortUrl;

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    toast.success('Copied!');
  };

  const handleDownloadQR = async () => {
    try {
      await qrApi.downloadQR(link.shortCode, `nexusurl-${link.shortCode}.png`);
    } catch {
      toast.error('Failed to download QR code');
    }
  };

  return (
    <motion.tr
      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <td className="py-2.5 px-4 w-[90px]">
        <div
          className="relative"
          onMouseEnter={() => setShowQR(true)}
          onMouseLeave={() => setShowQR(false)}
        >
          <div
            ref={qrRef}
            className="qr-cell-preview bg-[#0A0A1A] rounded-lg border border-white/5 hover:border-[#6C3CE1]/30 transition-all cursor-pointer overflow-hidden flex items-center justify-center"
            style={{ width: showQR ? 120 : 48, height: showQR ? 120 : 48 }}
          >
            <QRCode
              value={shortUrl}
              size={showQR ? 110 : 44}
              bgColor="#0A0A1A"
              fgColor="#6C3CE1"
              level="H"
            />
          </div>
          <AnimatePresence>
            {showQR && (
              <motion.div
                className="absolute left-0 top-full mt-2 z-50 bg-[#12122A] border border-[#6C3CE1]/30 rounded-xl p-3 shadow-2xl shadow-[#6C3CE1]/10"
                initial={{ opacity: 0, scale: 0.9, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -5 }}
              >
                <div className="flex gap-2">
                  <button onClick={handleDownloadQR} className="px-2.5 py-1.5 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all flex items-center gap-1.5">
                    <FiDownload size={12} /> Download
                  </button>
                  <button onClick={() => onShowQR(link)} className="px-2.5 py-1.5 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all flex items-center gap-1.5">
                    <FiMaximize2 size={12} /> Expand
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </td>
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#00D4FF] text-sm">{link.shortCode}</span>
          <button
            onClick={handleCopy}
            className="text-gray-500 hover:text-white transition-colors"
            title="Copy short URL"
          >
            <FiExternalLink size={14} />
          </button>
        </div>
      </td>
      <td className="py-3.5 px-4 text-gray-400 max-w-xs truncate text-sm" title={link.longUrl}>
        {link.longUrl}
      </td>
      <td className="py-3.5 px-4 text-center">
        <div className="flex items-center justify-center gap-3">
          <span className="font-medium text-white">{link.clicks}</span>
          {link.qrScans > 0 && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <FiEye size={11} /> QR: {link.qrScans}
            </span>
          )}
        </div>
      </td>
      <td className="py-3.5 px-4 text-center">
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatus(link).color}`}>
          {getStatus(link).label}
        </span>
      </td>
      <td className="py-3.5 px-4 text-center text-gray-500 text-xs">
        <FiCalendar className="inline mr-1" size={11} />
        {new Date(link.createdAt).toLocaleDateString()}
      </td>
      <td className="py-3.5 px-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <Link
            to={`/links/${link.id}/stats`}
            className="p-2 rounded-lg text-gray-500 hover:text-[#00D4FF] hover:bg-white/5 transition-all"
            title="Stats"
          >
            <FiBarChart2 size={15} />
          </Link>
          <button
            onClick={() => onShowQR(link)}
            className="p-2 rounded-lg text-gray-500 hover:text-[#6C3CE1] hover:bg-white/5 transition-all"
            title="QR Code"
          >
            <FiMaximize2 size={15} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all"
              title="More"
            >
              <FiMoreVertical size={15} />
            </button>
            <AnimatePresence>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <motion.div
                    className="absolute right-0 top-full mt-1 z-50 w-44 bg-[#12122A] border border-white/10 rounded-xl shadow-xl overflow-hidden"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <button
                      onClick={() => { onShowQR(link); setShowMenu(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <FiMaximize2 size={14} /> View QR Code
                    </button>
                    <button
                      onClick={() => { handleDownloadQR(); setShowMenu(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <FiDownload size={14} /> Download QR
                    </button>
                    <div className="border-t border-white/5" />
                    <button
                      onClick={() => { onDelete(link.id); setShowMenu(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <FiTrash2 size={14} /> Delete Link
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </td>
    </motion.tr>
  );
}
