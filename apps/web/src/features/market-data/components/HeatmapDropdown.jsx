import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const HeatmapDropdown = ({ selected, options, onSelect, compact = false, upward = false }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const activeOption = options.find((option) => option.value === selected) || options[0];

  return (
    <div ref={wrapperRef} className={`relative ${compact ? 'min-w-[110px]' : 'min-w-[156px]'}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center justify-between w-full gap-2 rounded-[18px] border border-white/10 bg-slate-950/95 px-4 py-3 text-[#cfd6e4] text-[15px] font-medium transition-all hover:border-white/20 hover:text-white"
      >
        <span className="truncate">{activeOption.label}</span>
        {open ? <ChevronUp className="h-4 w-4 text-[#cfd6e4]" /> : <ChevronDown className="h-4 w-4 text-[#cfd6e4]" />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: upward ? 6 : -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: upward ? 6 : -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute ${upward ? 'bottom-full mb-3' : 'top-full mt-3'} right-0 min-w-[140px] rounded-[22px] bg-[#090b11] border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl overflow-hidden z-50`}
          >
            {options.map((option) => {
              const isActive = option.value === selected;
              return (
                <button
                  type="button"
                  key={String(option.value)}
                  onClick={() => {
                    onSelect(option.value);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-6 py-4 text-[15px] font-medium transition-all ${
                    isActive ? 'bg-white/5 text-white' : 'text-[#d7dce5] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeatmapDropdown;
