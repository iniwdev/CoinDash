import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { useWatchlistState } from "@/store/watchlistStateStore";

const WatchlistManager = () => {
  const {
    watchlists,
    activeWatchlistId,
    setActiveWatchlistId,
    createWatchlist,
    renameWatchlist,
    deleteWatchlist,
  } = useWatchlistState();

  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const handleCreateWatchlist = () => {
    if (newName.trim()) {
      createWatchlist(newName);
      setNewName('');
      setShowNewForm(false);
    }
  };

  const handleRename = (watchlistId, name) => {
    if (editName.trim()) {
      renameWatchlist(watchlistId, editName);
      setEditingId(null);
      setEditName('');
    }
  };

  const handleDelete = (watchlistId) => {
    if (watchlists.length > 1) {
      deleteWatchlist(watchlistId);
    }
  };

  return (
    <motion.div
      className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6"
      whileHover={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">My Watchlists</h3>
          <p className="text-slate-400 text-sm mt-1">
            {watchlists.length} watchlist{watchlists.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          New
        </button>
      </div>

      {/* New Watchlist Form */}
      <AnimatePresence>
        {showNewForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 flex gap-2"
          >
            <input
              type="text"
              placeholder="Watchlist name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateWatchlist()}
              autoFocus
              className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
            />
            <button
              onClick={handleCreateWatchlist}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setShowNewForm(false);
                setNewName('');
              }}
              className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Watchlists List */}
      <div className="flex flex-wrap gap-3">
        {watchlists.map((watchlist) => {
          const isActive = watchlist.id === activeWatchlistId;
          const isEditing = editingId === watchlist.id;

          return (
            <motion.div
              key={watchlist.id}
              className={`relative group transition-all duration-300 ${
                isActive ? 'ring-2 ring-blue-500' : ''
              }`}
              whileHover={{ scale: 1.02 }}
            >
              <button
                onClick={() => setActiveWatchlistId(watchlist.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                }`}
              >
                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === 'Enter' && handleRename(watchlist.id, editName)
                    }
                    autoFocus
                    className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{watchlist.name}</span>
                    <span className="text-xs bg-black/30 px-2 py-1 rounded">
                      {watchlist.coins.length}
                    </span>
                  </div>
                )}
              </button>

              {/* Actions */}
              <div className="absolute -top-8 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {isEditing ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRename(watchlist.id, editName);
                      }}
                      className="p-1 bg-green-600/80 hover:bg-green-700 text-white rounded transition-colors"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(null);
                      }}
                      className="p-1 bg-slate-600/80 hover:bg-slate-700 text-white rounded transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(watchlist.id);
                        setEditName(watchlist.name);
                      }}
                      className="p-1 bg-blue-600/80 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    {watchlists.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(watchlist.id);
                        }}
                        className="p-1 bg-red-600/80 hover:bg-red-700 text-white rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default WatchlistManager;
