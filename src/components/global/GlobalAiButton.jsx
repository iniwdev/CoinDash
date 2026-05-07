import { IoSparkles } from 'react-icons/io5';
import { useAi } from '../../context/AiContext.jsx';

const GlobalAiButton = () => {
  const { openAiModal } = useAi();

  return (
    <button
      type="button"
      onClick={openAiModal}
      className="fixed bottom-7 left-1/2 z-[9999] -translate-x-1/2 inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/40 px-5 py-3 text-sm font-semibold text-white shadow-[0_0_40px_rgba(168,85,247,0.25)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-400/40 pointer-events-auto max-w-[min(92vw,360px)]"
    >
      <span className="inline-flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-purple-200 shadow-sm shadow-purple-500/20">
          <IoSparkles className="h-5 w-5" />
        </span>
        <span className="text-white">Ask CoinDash AI</span>
      </span>
    </button>
  );
};

export default GlobalAiButton;
