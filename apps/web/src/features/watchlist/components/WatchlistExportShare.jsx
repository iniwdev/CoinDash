import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share2, Copy, Check, FileJson, FileText } from 'lucide-react';
import {
  exportWatchlistToCSV,
  exportWatchlistToJSON,
  generateShareableWatchlistURL,
  copyToClipboard,
} from "@/utils/watchlistUtils";
import { useWatchlistState } from "@/store/watchlistStateStore";

const WatchlistExportShare = ({ coins }) => {
  const { getActiveWatchlist } = useWatchlistState();
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  const activeWatchlist = getActiveWatchlist();
  const watchlistName = activeWatchlist?.name || 'watchlist';

  const handleExportCSV = () => {
    exportWatchlistToCSV(coins, watchlistName);
    setShowMenu(false);
  };

  const handleExportJSON = () => {
    exportWatchlistToJSON(coins, watchlistName);
    setShowMenu(false);
  };

  const handleGenerateShareLink = () => {
    const url = generateShareableWatchlistURL(coins);
    setShareUrl(url);
    setShowShareModal(true);
  };

  const handleCopyShareLink = () => {
    copyToClipboard(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      {/* Export/Share Button */}
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 text-white rounded-lg font-semibold transition-all duration-300"
        >
          <Download className="w-4 h-4" />
          Export
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerateShareLink}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/50 text-white rounded-lg font-semibold transition-all duration-300"
        >
          <Share2 className="w-4 h-4" />
          Share
        </motion.button>
      </div>

      {/* Export Menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full mt-2 left-0 bg-slate-800 border border-slate-700/50 rounded-lg shadow-xl z-20 overflow-hidden"
          >
            <button
              onClick={handleExportCSV}
              className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-slate-700/50 transition-colors text-sm font-semibold"
            >
              <FileText className="w-4 h-4" />
              Export as CSV
            </button>
            <button
              onClick={handleExportJSON}
              className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-slate-700/50 transition-colors text-sm font-semibold border-t border-slate-700/50"
            >
              <FileJson className="w-4 h-4" />
              Export as JSON
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 border border-slate-700/50 rounded-xl p-6 max-w-md mx-4"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                Share "{watchlistName}"
              </h3>

              <p className="text-slate-400 text-sm mb-4">
                Share this link with others to let them view your watchlist:
              </p>

              <div className="bg-slate-700/50 border border-slate-600/50 rounded-lg p-3 mb-4">
                <p className="text-white text-xs font-mono break-all">{shareUrl}</p>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCopyShareLink}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg font-semibold transition-colors"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WatchlistExportShare;
