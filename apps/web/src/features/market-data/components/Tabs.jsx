const Tabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex flex-wrap gap-3 mb-8 justify-center">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
            activeTab === tab.id
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700/80 hover:text-white'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
