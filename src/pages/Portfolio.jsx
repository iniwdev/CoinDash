import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, RadialBarChart, RadialBar, Legend, ReferenceDot } from 'recharts';

// Animation Variants
const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' },
};

const fadeInUpDelay = (delay) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut', delay },
});

const floatingAnimation = {
  y: [-10, 10, -10],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' },
};

const cardHover = {
  scale: 1.08,
  y: -10,
  boxShadow: '0_0_100px_rgba(124,58,237,0.4), 0_0_100px_rgba(245,158,11,0.2)',
  transition: { duration: 0.3, ease: 'easeOut' },
};

const buttonHover = {
  scale: 1.05,
  boxShadow: '0_0_60px_rgba(245,158,11,0.5)',
  transition: { duration: 0.3 },
};

// Chart Data
const portfolioData = [
  { time: '00:00', value: 96567, date: '2024-01-01' },
  { time: '04:00', value: 97850, date: '2024-01-01' },
  { time: '08:00', value: 101234, date: '2024-01-01' },
  { time: '12:00', value: 104567, date: '2024-01-01' },
  { time: '16:00', value: 108900, date: '2024-01-01' },
  { time: '20:00', value: 110482, date: '2024-01-01' },
  { time: '00:00', value: 112156, date: '2024-01-02' },
  { time: '04:00', value: 109834, date: '2024-01-02' },
  { time: '08:00', value: 113267, date: '2024-01-02' },
  { time: '12:00', value: 115689, date: '2024-01-02' },
  { time: '16:00', value: 114523, date: '2024-01-02' },
  { time: '20:00', value: 116689, date: '2024-01-02' },
];

const assetAllocationData = [
  { name: 'BTC', value: 42, color: '#f97316' },
  { name: 'ETH', value: 24, color: '#a855f7' },
  { name: 'SOL', value: 14, color: '#3b82f6' },
  { name: 'USDT', value: 10, color: '#22d3ee' },
  { name: 'Others', value: 10, color: '#ec4899' },
];

const performanceData = [
  { month: 'Jan', value: 8.5 },
  { month: 'Feb', value: 12.3 },
  { month: 'Mar', value: -3.2 },
  { month: 'Apr', value: 15.7 },
  { month: 'May', value: 9.8 },
  { month: 'Jun', value: 6.4 },
];

const activityData = [
  { name: 'Activity', value: 56, fill: '#a855f7' },
];

const ActivityCard = () => (
  <div className="h-full min-h-[250px] rounded-2xl border border-white/5 bg-[#0B0F17] p-6 shadow-[0_0_40px_rgba(167,139,250,0.3)]">
    <div>
      <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Chain Activity</p>
      <p className="mt-3 text-sm text-slate-400 leading-relaxed">
        Track your wallet activity score and performance compared to other investors.
      </p>
    </div>
    <div className="mt-6 flex h-full items-center justify-center">
      <RadialBarChart
        width={200}
        height={200}
        innerRadius="70%"
        outerRadius="100%"
        data={activityData}
        startAngle={90}
        endAngle={450}
      >
        <defs>
          <linearGradient id="activityGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>
        </defs>
        <RadialBar dataKey="value" cornerRadius={10} fill="url(#activityGradient)" />
        <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" style={{ fill: '#ffffff', fontSize: 18, fontWeight: 700 }}>
          56 / 100
        </text>
        <text x="50%" y="62%" textAnchor="middle" dominantBaseline="middle" style={{ fill: '#94a3b8', fontSize: 12 }}>
          Top 8%
        </text>
      </RadialBarChart>
    </div>
  </div>
);

const InsightsCard = () => (
  <div className="h-full min-h-[250px] rounded-2xl border border-white/5 bg-white/5 backdrop-blur-lg p-6 shadow-[0_0_40px_rgba(124,58,237,0.15)]">
    <div>
      <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Insights</p>
      <p className="mt-3 text-sm text-slate-400 leading-relaxed">
        Actionable intelligence for smarter portfolio decisions and improved risk management.
      </p>
    </div>
    <div className="mt-6 grid gap-4 h-full">
      <div className="rounded-2xl bg-slate-950/70 p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Projected ROI</p>
        <p className="mt-3 text-3xl font-semibold text-white">24.3%</p>
        <p className="mt-2 text-sm text-slate-400">Forecasted growth over the next 30 days.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-950/70 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Top Asset</p>
          <p className="mt-2 text-lg font-semibold text-white">Bitcoin</p>
        </div>
        <div className="rounded-2xl bg-slate-950/70 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Risk Score</p>
          <p className="mt-2 text-lg font-semibold text-white">Low</p>
        </div>
      </div>
    </div>
  </div>
);

const AssetAllocationCard = () => (
  <div className="h-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-6 shadow-[0_0_40px_rgba(249,115,22,0.12)]">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Advanced Wallet Analysis</p>
        <p className="text-xs text-slate-400 mt-1">Understand how your assets are distributed across different cryptocurrencies.</p>
      </div>
      <span className="rounded-full bg-slate-900/60 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-400">Live</span>
    </div>
    <div className="mt-6 flex h-full flex-col justify-between">
      <div className="h-44 rounded-[1.5rem] bg-[#0B0F17] p-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={assetAllocationData} cx="50%" cy="50%" innerRadius={38} outerRadius={70} paddingAngle={4} dataKey="value">
              {assetAllocationData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-6 grid gap-3">
        {assetAllocationData.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span>{entry.name}</span>
            </div>
            <span className="font-semibold text-white">{entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PerformanceCard = () => (
  <div className="h-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-6 shadow-[0_0_40px_rgba(249,115,22,0.12)]">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Profit & Loss Analysis</p>
        <p className="text-xs text-slate-400 mt-1">Visualize monthly gains and losses to identify trends and optimize strategy.</p>
      </div>
      <span className="rounded-full bg-slate-900/60 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-400">6M</span>
    </div>
    <div className="mt-6 h-48 rounded-[1.5rem] bg-[#0B0F17] p-3">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={performanceData} margin={{ top: 8, right: 0, left: -10, bottom: 0 }}>
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(value) => `${value}%`} />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#f1f5f9' }} formatter={(value) => [`${value}%`, 'Performance']} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {performanceData.map((entry, index) => (
              <Cell key={`perf-${index}`} fill={entry.value >= 0 ? '#22c55e' : '#f43f5e'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const PortfolioChartCard = () => (
  <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-6 shadow-[0_0_40px_rgba(249,115,22,0.12)]">
    <div>
      <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Portfolio Overview</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h3 className="text-4xl font-semibold text-white">$110,985</h3>
        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-medium text-emerald-300">+5.31%</span>
      </div>
      <p className="mt-2 text-sm text-slate-400 leading-relaxed">
        A premium overview of your combined wallet and exchange holdings.
      </p>
    </div>
    <div className="mt-6 h-[220px] rounded-[1.5rem] bg-[#0B0F17] p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={portfolioData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(245,158,11,0.25)" />
              <stop offset="100%" stopColor="rgba(167,139,250,0.03)" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} interval="preserveStartEnd" />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(value) => `$${value.toLocaleString()}`} domain={['dataMin - 2000', 'dataMax + 2000']} />
          <Tooltip content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-[#111827] border border-white/10 rounded-xl p-3 shadow-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-[#f59e0b] rounded-full"></div>
                    <span className="text-white text-sm font-medium">{label}</span>
                  </div>
                  <div className="text-white font-semibold">${payload[0].value?.toLocaleString()}</div>
                </div>
              );
            }
            return null;
          }} />
          <Area type="monotone" dataKey="value" stroke="none" fill="url(#areaGradient)" fillOpacity={1} />
          <Line type="monotone" dataKey="value" stroke="url(#lineGradient)" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2, style: { filter: 'drop-shadow(0 0 10px rgba(245,158,11,0.45))' } }} animationDuration={1200} animationEasing="ease-in-out" />
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-6">
      <h3 className="text-2xl font-semibold text-white">Maximize Your Investment Potential</h3>
      <p className="text-sm text-slate-400 mt-2 leading-relaxed">
        Transform insights into growth. Analyze portfolio performance, identify trends, and make smarter investment decisions with real-time analytics.
      </p>
    </div>
  </div>
);

const faqData = [
  {
    question: "Is my crypto portfolio safe with CoinDash?",
    answer: "Absolutely. CoinDash uses read-only access to your wallets and exchanges, meaning we can only view your balances and transactions - we never have access to your private keys or the ability to move your funds. All data is encrypted with military-grade AES-256 encryption."
  },
  {
    question: "How do I start building my crypto portfolio?",
    answer: "Getting started is simple: connect your existing wallets and exchanges through our secure integration process. We'll automatically sync your portfolio data and provide instant analytics. If you're new to crypto, start with established assets like Bitcoin and Ethereum before exploring altcoins."
  },
  {
    question: "What are some good portfolio management habits?",
    answer: "Diversify across different asset classes, regularly rebalance your portfolio, set clear investment goals, use dollar-cost averaging, stay informed about market trends, and never invest more than you can afford to lose. Our AI insights can help you identify optimal rebalancing opportunities."
  },
  {
    question: "How do I connect my wallets and exchanges?",
    answer: "In your dashboard, click \"Connect Portfolio\" and select from our 300+ supported integrations including MetaMask, Binance, Coinbase, OKX, and many more. You'll be guided through a secure authentication process that gives us read-only access to sync your data in real-time."
  }
];

const Portfolio = () => {
  const [openItem, setOpenItem] = useState(null);
  const timeFilters = ['24H', '1W', '1M', '3M', '6M', '1Y', 'ALL'];
  const activeFilter = '24H';

  const toggleItem = (index) => {
    setOpenItem(openItem === index ? null : index);
  };

  return (
    <Layout>
      <motion.div className="relative overflow-hidden bg-gradient-to-br from-[#050816] via-[#020617] to-[#050816]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <div className="pointer-events-none absolute -top-16 -right-16 h-96 w-96 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -top-10 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-1/3 -left-20 h-80 w-80 rounded-full bg-gradient-to-tr from-purple-600/15 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 right-0 h-72 w-72 rounded-full bg-gradient-to-l from-amber-500/10 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.04),transparent_18%),radial-gradient(circle_at_80%_25%,rgba(255,255,255,0.02),transparent_12%),radial-gradient(circle_at_50%_90%,rgba(255,255,255,0.03),transparent_15%)] opacity-40 mix-blend-overlay" />

        {/* Network Intelligence System */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {/* Soft Radial Glow */}
          <div
            className="absolute h-[600px] w-[600px] rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, rgba(245,158,11,0.05) 50%, transparent 100%)'
            }}
          />

          {/* Central AI Orb */}
          <motion.div
            className="relative z-10"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
          >
            {/* Outer Glow Ring */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/30 to-orange-500/30 blur-xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Main Orb */}
            <motion.div
              className="relative h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 via-violet-500 to-orange-500 shadow-[0_0_80px_rgba(139,92,246,0.6)] flex items-center justify-center"
              animate={{
                scale: [1, 1.1, 1],
                boxShadow: [
                  '0_0_80px_rgba(139,92,246,0.6)',
                  '0_0_120px_rgba(245,158,11,0.4)',
                  '0_0_80px_rgba(139,92,246,0.6)'
                ]
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Inner Core */}
              <motion.div
                className="h-12 w-12 rounded-full bg-gradient-to-br from-white/20 to-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/10 to-transparent" />
            </motion.div>
          </motion.div>

          {/* Floating Nodes */}
          <motion.div
            className="absolute top-20 left-20"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <motion.div
              className="h-16 w-16 rounded-full bg-gradient-to-br from-orange-400/40 to-amber-500/30 backdrop-blur-sm border border-orange-400/40 shadow-[0_0_40px_rgba(245,158,11,0.5)] flex items-center justify-center"
              animate={{
                y: [-8, 8, -8],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                rotate: { duration: 6, repeat: Infinity, ease: 'easeInOut' }
              }}
            >
              <span className="text-2xl text-orange-200 font-bold">₿</span>
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute top-32 right-32"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <motion.div
              className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-400/40 to-violet-500/30 backdrop-blur-sm border border-purple-400/40 shadow-[0_0_35px_rgba(139,92,246,0.5)] flex items-center justify-center"
              animate={{
                y: [-6, 6, -6],
                rotate: [0, -3, 3, 0]
              }}
              transition={{
                y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
                rotate: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }
              }}
            >
              <span className="text-xl text-purple-200 font-bold">Ξ</span>
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute bottom-40 left-32"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            <motion.div
              className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-400/40 to-sky-500/30 backdrop-blur-sm border border-cyan-400/40 shadow-[0_0_30px_rgba(34,211,238,0.5)] flex items-center justify-center"
              animate={{
                y: [-4, 4, -4],
                rotate: [0, 4, -4, 0]
              }}
              transition={{
                y: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 },
                rotate: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }
              }}
            >
              <span className="text-lg text-cyan-200 font-bold">◎</span>
            </motion.div>
          </motion.div>

          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 600">
            {/* BTC to Center */}
            <motion.line
              x1="200"
              y1="120"
              x2="500"
              y2="300"
              stroke="url(#lineGradient1)"
              strokeWidth="2"
              strokeDasharray="8,8"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, delay: 1.5, ease: 'easeInOut' }}
            />

            {/* ETH to Center */}
            <motion.line
              x1="800"
              y1="132"
              x2="500"
              y2="300"
              stroke="url(#lineGradient2)"
              strokeWidth="2"
              strokeDasharray="8,8"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, delay: 1.7, ease: 'easeInOut' }}
            />

            {/* SOL to Center */}
            <motion.line
              x1="232"
              y1="460"
              x2="500"
              y2="300"
              stroke="url(#lineGradient3)"
              strokeWidth="2"
              strokeDasharray="8,8"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, delay: 1.9, ease: 'easeInOut' }}
            />

            {/* Inter-node connections */}
            <motion.line
              x1="200"
              y1="120"
              x2="800"
              y2="132"
              stroke="url(#interGradient1)"
              strokeWidth="1"
              strokeDasharray="4,4"
              opacity="0.4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.4 }}
              transition={{ duration: 2, delay: 2.5, ease: 'easeInOut' }}
            />

            <motion.line
              x1="200"
              y1="120"
              x2="232"
              y2="460"
              stroke="url(#interGradient2)"
              strokeWidth="1"
              strokeDasharray="4,4"
              opacity="0.4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.4 }}
              transition={{ duration: 2, delay: 2.7, ease: 'easeInOut' }}
            />

            <motion.line
              x1="800"
              y1="132"
              x2="232"
              y2="460"
              stroke="url(#interGradient3)"
              strokeWidth="1"
              strokeDasharray="4,4"
              opacity="0.4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.4 }}
              transition={{ duration: 2, delay: 2.9, ease: 'easeInOut' }}
            />

            {/* Gradients */}
            <defs>
              <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(245,158,11,0.6)" />
                <stop offset="100%" stopColor="rgba(139,92,246,0.6)" />
              </linearGradient>
              <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(139,92,246,0.6)" />
                <stop offset="100%" stopColor="rgba(245,158,11,0.6)" />
              </linearGradient>
              <linearGradient id="lineGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(34,211,238,0.6)" />
                <stop offset="100%" stopColor="rgba(139,92,246,0.6)" />
              </linearGradient>
              <linearGradient id="interGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(245,158,11,0.3)" />
                <stop offset="100%" stopColor="rgba(139,92,246,0.3)" />
              </linearGradient>
              <linearGradient id="interGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(245,158,11,0.3)" />
                <stop offset="100%" stopColor="rgba(34,211,238,0.3)" />
              </linearGradient>
              <linearGradient id="interGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(139,92,246,0.3)" />
                <stop offset="100%" stopColor="rgba(34,211,238,0.3)" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative">
          <motion.section className="relative overflow-hidden pt-24 pb-20" initial="initial" whileInView="animate" viewport={{ once: true, margin: '-100px' }}>
            <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-orange-500/10 to-transparent blur-3xl" />
            <div className="absolute inset-x-0 top-16 h-56 bg-gradient-to-b from-violet-500/10 to-transparent blur-3xl" />

            <div className="content-width">
              <div className="max-w-3xl mx-auto text-center">
                <motion.p className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm uppercase tracking-[0.3em] text-slate-300" {...fadeInUpDelay(0)}>
                  Portfolio
                </motion.p>
                <motion.h1 className="mt-8 text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-purple-300 to-amber-300 drop-shadow-lg" {...fadeInUpDelay(0.1)}>
                  The Ultimate Crypto Portfolio Tracker
                </motion.h1>
                <motion.p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed" {...fadeInUpDelay(0.2)}>
                  Connect wallets, exchanges, DeFi, and NFTs from a single dashboard to streamline every holding, automate insights, and keep your assets aligned.
                </motion.p>
              </div>

              <motion.div className="mt-16 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }}>
                <motion.div className="group relative p-6 rounded-3xl transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_0_50px_rgba(124,58,237,0.35)] bg-gradient-to-br from-[rgba(255,255,255,0.04)] via-[rgba(255,255,255,0.02)] to-[rgba(255,255,255,0.01)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] shadow-[0_0_40px_rgba(124,58,237,0.15)]" variants={staggerItem} whileHover={cardHover}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-yellow-400/20 to-yellow-500/10 border border-yellow-400/30 shadow-[0_0_30px_rgba(250,204,21,0.4)]">
                        <svg className="h-8 w-8 text-yellow-200" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Exchange</p>
                        <p className="mt-1 text-lg font-semibold text-white">Binance</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-emerald-300">Live</span>
                  </div>
                  <div className="mt-4 h-px w-full bg-white/10" />
                  <div className="mt-5 text-sm font-semibold text-primary">Connect →</div>
                </motion.div>

                <motion.div className="group relative p-6 rounded-3xl transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_0_50px_rgba(124,58,237,0.35)] bg-gradient-to-br from-[rgba(255,255,255,0.04)] via-[rgba(255,255,255,0.02)] to-[rgba(255,255,255,0.01)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] shadow-[0_0_40px_rgba(124,58,237,0.15)]" variants={staggerItem} whileHover={cardHover}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.4)]">
                        <svg className="h-8 w-8 text-orange-200" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Wallet</p>
                        <p className="mt-1 text-lg font-semibold text-white">MetaMask</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-sky-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-sky-200">AI</span>
                  </div>
                  <div className="mt-4 h-px w-full bg-white/10" />
                  <div className="mt-5 text-sm font-semibold text-primary">Connect →</div>
                </motion.div>

                <motion.div className="group relative p-6 rounded-3xl transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_0_50px_rgba(124,58,237,0.35)] bg-gradient-to-br from-[rgba(255,255,255,0.04)] via-[rgba(255,255,255,0.02)] to-[rgba(255,255,255,0.01)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] shadow-[0_0_40px_rgba(124,58,237,0.15)]" variants={staggerItem} whileHover={cardHover}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400/20 to-sky-500/10 border border-cyan-400/30 shadow-[0_0_30px_rgba(34,211,238,0.4)]">
                        <svg className="h-8 w-8 text-cyan-200" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Wallet</p>
                        <p className="mt-1 text-lg font-semibold text-white">OKX Wallet</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-cyan-200">Real-time</span>
                  </div>
                  <div className="mt-4 h-px w-full bg-white/10" />
                  <div className="mt-5 text-sm font-semibold text-primary">Connect →</div>
                </motion.div>

                <motion.div className="group relative p-6 rounded-3xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_0_50px_rgba(124,58,237,0.3)] bg-gradient-to-br from-[rgba(255,255,255,0.04)] to-[rgba(255,255,255,0.01)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] shadow-[0_0_40px_rgba(124,58,237,0.15)]" variants={staggerItem} whileHover={cardHover}>
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-600/10 border border-violet-400/30 shadow-[0_0_30px_rgba(124,58,237,0.4)]">
                      <svg className="h-8 w-8 text-violet-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">More</p>
                      <p className="mt-1 text-lg font-semibold text-white">Add other sources</p>
                    </div>
                  </div>
                  <div className="mt-6 text-sm font-semibold text-primary">Connect →</div>
                </motion.div>
              </motion.div>

              <div className="mt-16 relative">
                <div className="absolute inset-x-10 top-8 h-36 rounded-full bg-gradient-to-r from-orange-500/10 via-white/10 to-violet-500/10 blur-3xl" />
                <div className="absolute inset-x-24 top-24 h-24 rounded-full bg-gradient-to-r from-violet-500/10 to-transparent blur-3xl" />

                <div className="relative rounded-[32px] overflow-hidden p-10 min-h-[520px] bg-gradient-to-br from-[rgba(255,255,255,0.05)] to-[rgba(255,255,255,0.01)] backdrop-blur-2xl border border-[rgba(255,255,255,0.1)] shadow-[0_0_80px_rgba(124,58,237,0.2),0_0_120px_rgba(245,158,11,0.1)]">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 via-transparent to-slate-950/10" />
                  <div className="absolute left-8 top-16 h-24 w-24 rounded-full border border-dashed border-white/10 bg-slate-900/70" />
                  <div className="absolute right-8 top-28 h-24 w-24 rounded-full border border-dashed border-white/10 bg-slate-900/70" />
                  <div className="absolute left-16 bottom-16 h-20 w-20 rounded-full border border-dashed border-white/10 bg-slate-900/70" />
                  <div className="absolute right-16 bottom-20 h-20 w-20 rounded-full border border-dashed border-white/10 bg-slate-900/70" />
                  <div className="absolute left-1/2 top-1/4 h-[240px] w-[240px] -translate-x-1/2 rounded-full border border-white/10 bg-gradient-to-br from-white/5 via-transparent to-transparent" />

                  <div className="relative z-10 grid place-items-center text-center">
                    <div className="relative mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-slate-950/95 border border-white/10 shadow-[0_0_50px_rgba(124,58,237,0.22)]">
                      <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-orange-400 to-violet-400 opacity-30" />
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent text-lg font-bold text-slate-950 shadow-[0_20px_60px_-20px_rgba(247,147,26,0.9)]">
                        AI
                      </div>
                    </div>
                    <p className="mt-8 text-[11px] uppercase tracking-[0.35em] text-slate-400">LIVE</p>
                    <p className="mt-4 text-sm uppercase tracking-[0.35em] text-slate-500">Portfolio Sync</p>
                    <h2 className="mt-3 text-3xl font-semibold text-white">CoinDash AI unifies every account</h2>
                    <div className="mt-8 inline-flex items-center rounded-full bg-slate-950/90 px-8 py-4 text-sm font-semibold text-white border border-white/10 shadow-[0_16px_40px_-24px_rgba(255,255,255,0.18)]">
                      CoinDash AI
                      <svg className="ml-3 h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>

                  <div className="absolute top-8 left-10 flex items-center gap-3">
                    <motion.div className="h-16 w-16 rounded-3xl bg-slate-900/85 border border-white/10 flex items-center justify-center text-sm font-semibold text-white shadow-[0_12px_30px_-18px_rgba(255,255,255,0.12)]" animate={{ y: [-8, 8, -8] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>BTC</motion.div>
                    <span className="h-0.5 w-24 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    <motion.div className="h-12 w-12 rounded-full bg-orange-500/15 border border-orange-400/20 shadow-[0_10px_20px_-15px_rgba(249,115,22,0.8)]" animate={{ y: [-6, 6, -6] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }} />
                  </div>

                  <div className="absolute top-28 right-12 flex flex-col items-center gap-3">
                    <motion.div className="h-12 w-12 rounded-full bg-slate-900/85 border border-white/10 flex items-center justify-center text-xs font-semibold text-white shadow-[0_12px_30px_-18px_rgba(255,255,255,0.12)]" animate={{ y: [-10, 10, -10] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>ETH</motion.div>
                    <div className="h-1 w-20 rounded-full bg-gradient-to-r from-orange-500/40 via-white/50 to-violet-500/40" />
                    <motion.div className="h-16 w-16 rounded-3xl bg-violet-500/15 border border-violet-400/20 flex items-center justify-center text-sm font-semibold text-violet-200 shadow-[0_12px_30px_-18px_rgba(124,58,237,0.8)]" animate={{ y: [-8, 8, -8] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}>SOL</motion.div>
                  </div>

                  <div className="absolute bottom-14 left-16 flex items-center gap-3">
                    <motion.div className="h-16 w-16 rounded-3xl bg-slate-900/85 border border-white/10 flex items-center justify-center text-sm font-semibold text-white shadow-[0_12px_30px_-18px_rgba(255,255,255,0.12)]" animate={{ y: [-7, 7, -7] }} transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}>USDT</motion.div>
                    <span className="h-0.5 w-24 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    <motion.div className="h-12 w-12 rounded-full bg-sky-400/15 border border-sky-400/20 shadow-[0_10px_20px_-15px_rgba(56,189,248,0.8)]" animate={{ y: [-9, 9, -9] }} transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }} />
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section className="content-width mx-auto grid gap-10 md:grid-cols-2 items-center py-24" initial="initial" whileInView="animate" viewport={{ once: true, margin: '-100px' }}>
            <div className="space-y-8">
              <p className="text-sm tracking-widest text-gray-400 mb-3">CONNECTED ECOSYSTEM</p>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white">
                Track Your Crypto Across 300+ Wallets & Exchanges
              </h1>
              <p className="text-gray-400 mt-4 max-w-lg leading-relaxed">
                CoinDash supports 300+ wallets, exchanges, and DeFi protocols. Monitor all your assets in one unified dashboard with real-time sync.
              </p>
              <button className="mt-6 px-6 py-3 rounded-full bg-orange-500 hover:bg-orange-600 text-black font-semibold transition">
                Connect Portfolio
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/30 to-orange-500/30 blur-3xl opacity-20" />
              <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-purple-500/30 via-transparent to-orange-500/30 overflow-hidden">
                <div className="relative rounded-2xl bg-[#0b1220] overflow-hidden">
                  <div className="absolute inset-0 blur-3xl opacity-20 bg-gradient-to-r from-purple-500 to-orange-500" />
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="relative w-full aspect-video object-cover rounded-2xl"
                  >
                    <source src="https://web-static.coinstats.app/videos/portfolio/300-platforms.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>
            </div>
          </motion.section>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
            <div className="space-y-10">
              <motion.section className="text-center" initial="initial" whileInView="animate" viewport={{ once: true, margin: '-100px' }}>
                <div className="text-center max-w-4xl mx-auto mb-10">
                  <h2 className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-purple-500 bg-clip-text text-transparent">
                    Leverage Advanced Analytics to Boost Your Growth
                  </h2>
                  <p className="text-gray-400 mt-4 text-lg">
                    Analyze performance, track allocation, and monitor activity — all in one unified dashboard.
                  </p>
                </div>

                <motion.div className="grid grid-cols-2 gap-6 h-[520px]" variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }}>
                  <motion.div className="h-full bg-[#0B0F17] rounded-2xl p-6 flex flex-col" variants={staggerItem} whileHover={cardHover}>
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl text-gray-400">Portfolio Overview</h3>
                      <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                        +5.31%
                      </span>
                    </div>
                    <h2 className="text-4xl font-bold mt-2 text-white">$110,985</h2>
                    <div className="h-[220px] mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={portfolioData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#f59e0b" />
                              <stop offset="100%" stopColor="#a78bfa" />
                            </linearGradient>
                            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="rgba(245,158,11,0.25)" />
                              <stop offset="100%" stopColor="rgba(167,139,250,0.03)" />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} strokeDasharray="3 3" />
                          <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} interval="preserveStartEnd" />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(value) => `$${value.toLocaleString()}`} domain={[ 'dataMin - 2000', 'dataMax + 2000' ]} />
                          <Tooltip content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-[#111827] border border-white/10 rounded-xl p-3 shadow-xl">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 bg-[#f59e0b] rounded-full"></div>
                                    <span className="text-white text-sm font-medium">{label}</span>
                                  </div>
                                  <div className="text-white font-semibold">${payload[0].value?.toLocaleString()}</div>
                                </div>
                              );
                            }
                            return null;
                          }} />
                          <Area type="monotone" dataKey="value" stroke="none" fill="url(#areaGradient)" fillOpacity={1} />
                          <Line type="monotone" dataKey="value" stroke="url(#lineGradient)" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-lg font-semibold text-white">Maximize Your Investment Potential</h4>
                      <p className="text-gray-400 text-sm mt-1">
                        Analyze trends and make smarter decisions with real-time insights.
                      </p>
                    </div>
                  </motion.div>

                  <div className="flex flex-col gap-6 h-full">
                    <motion.div className="flex-1 bg-[#0B0F17] rounded-2xl p-5 flex flex-col" variants={staggerItem} whileHover={cardHover}>
                      <h3 className="text-sm text-gray-400">Advanced Wallet Analysis</h3>
                      <div className="h-[140px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={assetAllocationData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="value">
                              {assetAllocationData.map((entry, index) => (
                                <Cell key={`alloc-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Asset distribution across major holdings.
                      </p>
                    </motion.div>

                    <div className="grid grid-cols-2 gap-6 h-full">
                      <motion.div className="bg-[#0B0F17] rounded-2xl p-4 flex flex-col" variants={staggerItem} whileHover={cardHover}>
                        <h3 className="text-sm text-gray-400">Performance</h3>
                        <div className="h-[120px] mt-3">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(value) => `${value}%`} />
                              <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#f1f5f9' }} formatter={(value) => [`${value}%`, 'Performance']} />
                              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                {performanceData.map((entry, index) => (
                                  <Cell key={`perf-${index}`} fill={entry.value >= 0 ? '#22c55e' : '#f43f5e'} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          Monthly profit & loss trends.
                        </p>
                      </motion.div>

                      <motion.div className="bg-[#0B0F17] rounded-2xl p-4 flex flex-col items-center justify-center" variants={staggerItem} whileHover={cardHover}>
                        <h3 className="text-sm text-gray-400 mb-2">Activity</h3>
                        <div className="h-[120px] w-full flex items-center justify-center">
                          <ResponsiveContainer width="160" height="120">
                            <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" data={[{ name: 'Activity', value: 56 }]} startAngle={90} endAngle={450}>
                              <defs>
                                <linearGradient id="activityGradient" x1="0" y1="0" x2="1" y2="0">
                                  <stop offset="0%" stopColor="#a78bfa" />
                                  <stop offset="100%" stopColor="#f472b6" />
                                </linearGradient>
                              </defs>
                              <RadialBar dataKey="value" cornerRadius={10} fill="url(#activityGradient)" />
                              <text x="50%" y="42%" textAnchor="middle" dominantBaseline="middle" style={{ fill: '#ffffff', fontSize: 14, fontWeight: 700 }}>
                                56 / 100
                              </text>
                              <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" style={{ fill: '#94a3b8', fontSize: 12 }}>
                                Top 8%
                              </text>
                            </RadialBarChart>
                          </ResponsiveContainer>
                        </div>
                        <p className="text-xs text-gray-400 text-center mt-2">
                          Top 8% wallet activity score.
                        </p>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.section>

              <motion.section className="content-width mx-auto grid gap-12 lg:grid-cols-[0.95fr_1.05fr] items-center py-24" initial="initial" whileInView="animate" viewport={{ once: true, margin: '-100px' }}>
                <div className="relative">
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-8 -left-8 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
                    <div className="absolute -bottom-8 -right-8 h-48 w-48 rounded-full bg-orange-500/10 blur-3xl" />
                  </div>

                  <div className="relative flex justify-center">
                    <div className="relative">
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-slate-900/90 border border-white/10 flex items-center justify-center text-xs font-semibold text-white shadow-[0_12px_30px_-18px_rgba(255,255,255,0.12)]">BTC</div>
                      <div className="absolute -bottom-4 -left-4 h-6 w-6 rounded-full bg-slate-900/90 border border-white/10 flex items-center justify-center text-xs font-semibold text-white shadow-[0_12px_30px_-18px_rgba(255,255,255,0.12)]">ETH</div>
                      <div className="absolute -bottom-4 -right-4 h-6 w-6 rounded-full bg-slate-900/90 border border-white/10 flex items-center justify-center text-xs font-semibold text-white shadow-[0_12px_30px_-18px_rgba(255,255,255,0.12)]">SOL</div>

                      <motion.div className="relative card-base overflow-hidden border-white/10 p-4 shadow-[0_28px_90px_-50px_rgba(255,255,255,0.16)] w-80 h-[600px] rounded-[3rem]" whileHover={{ scale: 1.03 }} transition={{ duration: 0.4 }}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-slate-950/10 rounded-[3rem]" />
                        <div className="relative z-10 h-full bg-slate-950 rounded-[2.5rem] p-6 flex flex-col">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary"></div>
                              <span className="text-lg font-semibold text-white">CoinDash</span>
                            </div>
                            <div className="h-6 w-6 rounded-full bg-slate-700"></div>
                          </div>

                          <div className="space-y-4 flex-1">
                            <div className="rounded-2xl bg-slate-900/70 p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-white">Total Value</span>
                                <span className="text-xs text-slate-400">+2.4%</span>
                              </div>
                              <div className="text-2xl font-bold text-white">$45,231.89</div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/50">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-300 font-semibold">B</div>
                                  <div>
                                    <p className="text-sm font-medium text-white">Bitcoin</p>
                                    <p className="text-xs text-slate-400">BTC</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-white">$23,456</p>
                                  <p className="text-xs text-green-400">+1.2%</p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/50">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-blue-400/20 flex items-center justify-center text-blue-300 font-semibold">E</div>
                                  <div>
                                    <p className="text-sm font-medium text-white">Ethereum</p>
                                    <p className="text-xs text-slate-400">ETH</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-white">$12,345</p>
                                  <p className="text-xs text-red-400">-0.8%</p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/50">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-violet-400/20 flex items-center justify-center text-violet-300 font-semibold">S</div>
                                  <div>
                                    <p className="text-sm font-medium text-white">Solana</p>
                                    <p className="text-xs text-slate-400">SOL</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-white">$9,430</p>
                                  <p className="text-xs text-green-400">+3.1%</p>
                                </div>
                              </div>
                            </div>

                            <div className="mt-6 h-32 rounded-2xl bg-slate-900/70 p-4">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={[
                                  { time: '1h', price: 9420 },
                                  { time: '2h', price: 9450 },
                                  { time: '3h', price: 9380 },
                                  { time: '4h', price: 9520 },
                                  { time: '5h', price: 9430 },
                                ]}>
                                  <Line
                                    type="monotone"
                                    dataKey="price"
                                    stroke="#8b5cf6"
                                    strokeWidth={2}
                                    dot={false}
                                  />
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                      border: '1px solid rgba(255, 255, 255, 0.1)',
                                      borderRadius: '8px',
                                      color: '#f1f5f9'
                                    }}
                                    formatter={(value) => [`$${value}`, 'Price']}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>

                <motion.div className="space-y-8" variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }}>
                  <motion.p className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm uppercase tracking-[0.3em] text-slate-300" variants={staggerItem}>
                    DeFi Integration
                  </motion.p>
                  <motion.h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-purple-400" variants={staggerItem}>
                    Track & Manage All Your DeFi Assets
                  </motion.h2>
                  <motion.p className="max-w-xl text-lg text-slate-400 leading-relaxed" variants={staggerItem}>
                    Seamlessly track 10,000+ DeFi protocols across multiple blockchains. Monitor liquidity pools, staking rewards, yield farming, and NFT positions in one unified dashboard.
                  </motion.p>
                  <motion.button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full text-slate-950 font-bold text-base hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] hover:scale-105 transition-all duration-300" whileHover={buttonHover} whileTap={{ scale: 0.98 }} variants={staggerItem}>
                    Connect Portfolio
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </motion.button>
                </motion.div>
              </motion.section>

              <motion.section className="content-width mx-auto grid gap-12 lg:grid-cols-[0.95fr_1.05fr] items-center py-24" initial="initial" whileInView="animate" viewport={{ once: true, margin: '-100px' }}>
                <motion.div className="space-y-8" variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }}>
                  <motion.p className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm uppercase tracking-[0.3em] text-slate-300" variants={staggerItem}>
                    AI-Powered Insights ✨
                  </motion.p>
                  <motion.h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-purple-400" variants={staggerItem}>
                    Use AI for Your Exit Strategy & Price Predictions
                  </motion.h2>
                  <motion.p className="max-w-xl text-lg text-slate-400 leading-relaxed" variants={staggerItem}>
                    Set target sell prices and leverage AI-assisted estimates to optimize your exit strategy. Get personalized price predictions based on market trends and your portfolio data.
                  </motion.p>
                  <motion.button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full text-slate-950 font-bold text-base hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] hover:scale-105 transition-all duration-300" whileHover={buttonHover} whileTap={{ scale: 0.98 }} variants={staggerItem}>
                    Set up Your Exit Strategy
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </motion.button>
                </motion.div>

                <div className="relative">
                  {/* Glow behind phone */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-8 -right-8 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500/20 via-orange-500/15 to-transparent blur-3xl" />
                    <div className="absolute -bottom-8 -left-8 h-48 w-48 rounded-full bg-gradient-to-tr from-orange-500/15 via-purple-500/10 to-transparent blur-3xl" />
                  </div>

                  <motion.div className="relative flex justify-center" variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }}>
                    <div className="relative">
                      {/* Floating mini-icons */}
                      <motion.div
                        className="absolute -top-6 left-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-gradient-to-br from-purple-500/20 to-orange-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center text-lg shadow-[0_0_40px_rgba(139,92,246,0.3)]"
                        animate={{ y: [-5, 5, -5], rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        💡
                      </motion.div>
                      <motion.div
                        className="absolute -bottom-6 -left-6 h-8 w-8 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center text-sm shadow-[0_0_30px_rgba(245,158,11,0.3)]"
                        animate={{ y: [-4, 4, -4], rotate: [0, -8, 8, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                      >
                        📈
                      </motion.div>
                      <motion.div
                        className="absolute -bottom-6 -right-6 h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center text-sm shadow-[0_0_30px_rgba(34,211,238,0.3)]"
                        animate={{ y: [-3, 3, -3], rotate: [0, 12, -12, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                      >
                        🎯
                      </motion.div>

                      <motion.div className="relative card-base overflow-hidden border-white/10 p-4 shadow-[0_28px_90px_-50px_rgba(255,255,255,0.16)] w-80 h-[600px] rounded-[3rem]" whileHover={{ scale: 1.03 }} transition={{ duration: 0.4 }} variants={staggerItem}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-slate-950/10 rounded-[3rem]" />
                        <div className="relative z-10 h-full bg-slate-950 rounded-[2.5rem] p-6 flex flex-col">
                          {/* Header */}
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">AI</span>
                              </div>
                              <span className="text-lg font-semibold text-white">Exit Strategy</span>
                            </div>
                            <div className="flex gap-1">
                              <div className="h-2 w-2 rounded-full bg-slate-600"></div>
                              <div className="h-2 w-2 rounded-full bg-slate-600"></div>
                              <div className="h-2 w-2 rounded-full bg-green-400"></div>
                            </div>
                          </div>

                          {/* Portfolio Overview */}
                          <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/60 p-4 mb-4 border border-white/5">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-white">Total Portfolio</span>
                              <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">+2.4%</span>
                            </div>
                            <div className="text-2xl font-bold text-white">$127,459</div>
                            <div className="text-xs text-slate-400 mt-1">+$3,045 today</div>
                          </div>

                          {/* AI Chart */}
                          <div className="h-32 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/60 p-4 mb-4 border border-white/5">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-slate-300">AI Price Prediction</span>
                              <span className="text-xs text-purple-400">Next 30 days</span>
                            </div>
                            <div className="w-full h-20">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={portfolioData.slice(-8)}>
                                  <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="url(#predictionGradient)"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4, fill: '#f97316' }}
                                  />
                                  <defs>
                                    <linearGradient id="predictionGradient" x1="0" y1="0" x2="1" y2="0">
                                      <stop offset="0%" stopColor="#8b5cf6" />
                                      <stop offset="50%" stopColor="#f97316" />
                                      <stop offset="100%" stopColor="#22d3ee" />
                                    </linearGradient>
                                  </defs>
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Target Assets */}
                          <div className="space-y-3 flex-1">
                            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent border border-orange-400/30 backdrop-blur-sm shadow-[0_0_40px_rgba(245,158,11,0.2)]">
                              <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">!</div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400/30 to-amber-500/20 flex items-center justify-center">
                                    <span className="text-orange-300 font-bold text-lg">₿</span>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-white">Bitcoin</p>
                                    <p className="text-xs text-slate-400">BTC • $58,200</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-green-400">+1.2%</p>
                                  <p className="text-xs text-orange-400">Target: $68,500</p>
                                </div>
                              </div>
                              <div className="mt-3 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                                <div className="h-full w-3/4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                              </div>
                              <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span>Current</span>
                                <span>Target</span>
                              </div>
                            </div>

                            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-white/5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400/30 to-cyan-500/20 flex items-center justify-center">
                                    <span className="text-blue-300 font-bold text-lg">Ξ</span>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-white">Ethereum</p>
                                    <p className="text-xs text-slate-400">ETH • $3,450</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-red-400">-0.8%</p>
                                  <p className="text-xs text-slate-400">Target: $4,200</p>
                                </div>
                              </div>
                              <div className="mt-3 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                                <div className="h-full w-1/2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                              </div>
                            </div>

                            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-white/5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400/30 to-violet-500/20 flex items-center justify-center">
                                    <span className="text-purple-300 font-bold text-lg">◎</span>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-white">Solana</p>
                                    <p className="text-xs text-slate-400">SOL • $145</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-green-400">+3.1%</p>
                                  <p className="text-xs text-slate-400">Target: $180</p>
                                </div>
                              </div>
                              <div className="mt-3 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                                <div className="h-full w-2/3 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"></div>
                              </div>
                            </div>
                          </div>

                          {/* AI Insight */}
                          <div className="mt-4 rounded-2xl bg-gradient-to-br from-purple-500/10 via-violet-500/5 to-transparent p-4 border border-purple-400/20">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="h-5 w-5 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                                <span className="text-white text-xs">🤖</span>
                              </div>
                              <p className="text-sm font-medium text-white">AI Insight</p>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">BTC showing strong momentum. Expected to reach target within 3-4 weeks based on current market trends and technical indicators.</p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </motion.section>

              <section className="content-width mx-auto grid gap-12 lg:grid-cols-[0.95fr_1.05fr] items-center py-24">
                <div className="relative">
                  {/* Glow behind phone */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-8 -left-8 h-64 w-64 rounded-full bg-gradient-to-br from-orange-500/20 via-purple-500/15 to-transparent blur-3xl" />
                    <div className="absolute -bottom-8 -right-8 h-48 w-48 rounded-full bg-gradient-to-tr from-purple-500/15 via-orange-500/10 to-transparent blur-3xl" />
                  </div>

                  <div className="relative flex justify-center">
                    <div className="relative">
                      {/* Floating mini-icons */}
                      <motion.div
                        className="absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center text-sm shadow-[0_0_30px_rgba(34,211,238,0.3)]"
                        animate={{ y: [-3, 3, -3], rotate: [0, 8, -8, 0] }}
                        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        📱
                      </motion.div>
                      <motion.div
                        className="absolute -bottom-4 -left-4 h-6 w-6 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center text-xs shadow-[0_0_25px_rgba(34,197,94,0.3)]"
                        animate={{ y: [-2, 2, -2], rotate: [0, -6, 6, 0] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                      >
                        💰
                      </motion.div>
                      <motion.div
                        className="absolute -bottom-4 -right-4 h-6 w-6 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center text-xs shadow-[0_0_25px_rgba(139,92,246,0.3)]"
                        animate={{ y: [-2.5, 2.5, -2.5], rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                      >
                        📊
                      </motion.div>

                      <div className="relative card-base overflow-hidden border-white/10 p-4 shadow-[0_28px_90px_-50px_rgba(255,255,255,0.16)] w-80 h-[600px] rounded-[3rem]">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-slate-950/10 rounded-[3rem]" />
                        <div className="relative z-10 h-full bg-slate-950 rounded-[2.5rem] p-6 flex flex-col">
                          {/* Header */}
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-purple-500 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">C</span>
                              </div>
                              <span className="text-lg font-semibold text-white">CoinDash</span>
                            </div>
                            <div className="flex gap-1">
                              <div className="h-2 w-2 rounded-full bg-slate-600"></div>
                              <div className="h-2 w-2 rounded-full bg-slate-600"></div>
                              <div className="h-2 w-2 rounded-full bg-green-400"></div>
                            </div>
                          </div>

                          {/* Portfolio Value */}
                          <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/60 p-4 mb-4 border border-white/5">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-white">Portfolio Value</span>
                              <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full flex items-center gap-1">
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                                +2.4%
                              </span>
                            </div>
                            <div className="text-3xl font-bold text-white">$127,459</div>
                            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                              <span>+ $3,045 today</span>
                              <span className="text-green-400">•</span>
                              <span className="text-green-400">24h high: $129,203</span>
                            </div>
                          </div>

                          {/* Chart Section */}
                          <div className="h-36 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/60 p-4 mb-4 border border-white/5">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-slate-300">24h Performance</span>
                              <div className="flex gap-1">
                                <button className="text-xs px-2 py-1 rounded bg-slate-700/50 text-slate-300">1H</button>
                                <button className="text-xs px-2 py-1 rounded bg-orange-500/20 text-orange-400">24H</button>
                                <button className="text-xs px-2 py-1 rounded bg-slate-700/50 text-slate-300">7D</button>
                              </div>
                            </div>
                            <div className="w-full h-24">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={portfolioData.slice(-12)}>
                                  <defs>
                                    <linearGradient id="mobileChart" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#f97316"
                                    strokeWidth={2}
                                    fill="url(#mobileChart)"
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Holdings */}
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-white/5">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400/30 to-amber-500/20 flex items-center justify-center">
                                  <span className="text-orange-300 font-bold text-lg">₿</span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-white">Bitcoin</p>
                                  <p className="text-xs text-slate-400">0.5432 BTC</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-white">$58,200</p>
                                <p className="text-xs text-green-400 flex items-center gap-1">
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                  </svg>
                                  +1.2%
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-white/5">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400/30 to-cyan-500/20 flex items-center justify-center">
                                  <span className="text-blue-300 font-bold text-lg">Ξ</span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-white">Ethereum</p>
                                  <p className="text-xs text-slate-400">12.45 ETH</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-white">$3,450</p>
                                <p className="text-xs text-red-400 flex items-center gap-1">
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                  </svg>
                                  -0.8%
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-white/5">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400/30 to-violet-500/20 flex items-center justify-center">
                                  <span className="text-purple-300 font-bold text-lg">◎</span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-white">Solana</p>
                                  <p className="text-xs text-slate-400">89.2 SOL</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-white">$145</p>
                                <p className="text-xs text-green-400 flex items-center gap-1">
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                  </svg>
                                  +3.1%
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-white/5">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400/30 to-emerald-500/20 flex items-center justify-center">
                                  <span className="text-green-300 font-bold text-lg">₮</span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-white">Tether</p>
                                  <p className="text-xs text-slate-400">1,250 USDT</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-white">$1.00</p>
                                <p className="text-xs text-slate-400">0.0%</p>
                              </div>
                            </div>
                          </div>

                          {/* Bottom Navigation */}
                          <div className="mt-4 flex items-center justify-around p-3 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-white/5">
                            <button className="flex flex-col items-center gap-1 text-orange-400">
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                              </svg>
                              <span className="text-xs">Portfolio</span>
                            </button>
                            <button className="flex flex-col items-center gap-1 text-slate-400">
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                              <span className="text-xs">Markets</span>
                            </button>
                            <button className="flex flex-col items-center gap-1 text-slate-400">
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                              <span className="text-xs">Trade</span>
                            </button>
                            <button className="flex flex-col items-center gap-1 text-slate-400">
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="text-xs">Settings</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <h2 className="text-4xl sm:text-5xl font-semibold text-white leading-tight">
                    Download the App to Keep Tracking On the Go
                  </h2>
                  <p className="max-w-xl text-lg text-slate-400 leading-relaxed">
                    Access your portfolio anywhere with real-time alerts, price notifications, and mobile-optimized dashboards. Stay connected to market movements 24/7.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="rounded-2xl p-4 bg-gradient-to-br from-[rgba(255,255,255,0.06)] to-[rgba(255,255,255,0.02)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] shadow-[0_0_40px_rgba(124,58,237,0.15)]">
                      <div className="w-24 h-24 bg-gradient-to-br from-[rgba(255,255,255,0.04)] to-[rgba(255,255,255,0.01)] rounded-2xl flex items-center justify-center backdrop-blur-lg border border-[rgba(255,255,255,0.08)]">
                        <div className="grid grid-cols-3 gap-1">
                          {Array.from({length: 9}).map((_, i) => (
                            <div key={i} className="w-2 h-2 bg-primary rounded-full"></div>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-2 text-center">Scan to Download</p>
                    </div>

                    <div className="space-y-3">
                      <button className="flex items-center gap-3 w-full sm:w-auto card-base p-4 rounded-2xl hover:border-primary/40 transition">
                        <div className="h-8 w-8 rounded-lg bg-slate-900/70 flex items-center justify-center">
                          <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className="text-xs text-slate-400">Download on the</p>
                          <p className="text-sm font-semibold text-white">App Store</p>
                        </div>
                      </button>

                      <button className="flex items-center gap-3 w-full sm:w-auto card-base p-4 rounded-2xl hover:border-primary/40 transition">
                        <div className="h-8 w-8 rounded-lg bg-slate-900/70 flex items-center justify-center">
                          <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.61 3 21.09 3 20.5Z"/>
                            <path d="M16.81 15.12L6.05 21.34L14.54 12.85L16.81 15.12Z"/>
                            <path d="M20.16 10.81C20.5 11.08 20.75 11.53 20.75 12C20.75 12.47 20.5 12.92 20.16 13.19L17.89 14.5L15.39 12L17.89 9.5L20.16 10.81Z"/>
                            <path d="M6.05 2.66L16.81 8.88L14.54 11.15L6.05 2.66Z"/>
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className="text-xs text-slate-400">Get it on</p>
                          <p className="text-sm font-semibold text-white">Google Play</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="content-width mx-auto grid gap-12 lg:grid-cols-[0.95fr_1.05fr] items-center py-24">
                <div className="space-y-8">
                  <h2 className="text-4xl sm:text-5xl font-semibold text-white leading-tight">
                    The Ultimate Security for Your Digital Assets
                  </h2>
                  <p className="max-w-xl text-lg text-slate-400 leading-relaxed">
                    Your assets are protected with military-grade encryption, read-only access to your wallets, and secure storage practices. We never store your private keys or have access to your funds.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="rounded-2xl p-6 bg-gradient-to-br from-[rgba(255,255,255,0.06)] to-[rgba(255,255,255,0.01)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] shadow-[0_0_60px_rgba(124,58,237,0.15)]">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400/20 to-amber-400/10 text-orange-300 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Military-Grade Encryption</h3>
                        <p className="text-sm text-slate-400">All data is encrypted using AES-256 encryption standards, ensuring your information remains secure and private.</p>
                      </div>
                    </div>
                  </div>

                  <div className="card-base p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Secure and Audited</h3>
                        <p className="text-sm text-slate-400">Regular security audits and penetration testing ensure our systems remain robust against emerging threats.</p>
                      </div>
                    </div>
                  </div>

                  <div className="card-base p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Industry Best Practices</h3>
                        <p className="text-sm text-slate-400">We follow industry-leading security protocols and compliance standards to protect your digital assets.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <motion.section className="text-center py-24" variants={fadeInUp} initial="initial" whileInView="animate" viewport={{ once: true }}>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-purple-300 to-amber-300">
                  The Trusted Portfolio Tracker of 1 Million People
                </h2>

                <motion.div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto" variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }}>
                  <motion.div className="rounded-3xl p-6 text-left bg-gradient-to-br from-[rgba(255,255,255,0.06)] to-[rgba(255,255,255,0.01)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] shadow-[0_0_60px_rgba(124,58,237,0.15)] hover:shadow-[0_0_80px_rgba(245,158,11,0.2)] hover:border-2 hover:border-amber-400/50 transition-all" whileHover={cardHover} variants={staggerItem}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 flex items-center justify-center text-white font-semibold text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                        S
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Sarah Chen</p>
                        <p className="text-xs text-slate-400">@sarahcrypto</p>
                      </div>
                    </div>
                    <blockquote className="text-lg text-white font-medium leading-relaxed mb-4">
                      "CoinDash transformed how I manage my portfolio. The AI insights are incredible and have helped me make better investment decisions."
                    </blockquote>
                    <div className="flex gap-1 mb-2">
                      {Array(5).fill(0).map((_, i) => (
                        <svg key={i} className="h-4 w-4 text-amber-400 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">March 2024</p>
                  </motion.div>

                  <motion.div className="rounded-3xl p-6 text-left bg-gradient-to-br from-[rgba(255,255,255,0.06)] to-[rgba(255,255,255,0.01)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] shadow-[0_0_60px_rgba(124,58,237,0.15)] hover:shadow-[0_0_80px_rgba(245,158,11,0.2)] hover:border-2 hover:border-amber-400/50 transition-all" whileHover={cardHover} variants={staggerItem}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-amber-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                        M
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Marcus Rodriguez</p>
                        <p className="text-xs text-slate-400">@marcusdefi</p>
                      </div>
                    </div>
                    <blockquote className="text-lg text-white font-medium leading-relaxed mb-4">
                      "Finally, a portfolio tracker that connects everything. From DeFi yields to NFT collections, it's all in one place with real-time updates."
                    </blockquote>
                    <div className="flex gap-1 mb-2">
                      {Array(5).fill(0).map((_, i) => (
                        <svg key={i} className="h-4 w-4 text-amber-400 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">February 2024</p>
                  </motion.div>

                  <motion.div className="rounded-3xl p-6 text-left bg-gradient-to-br from-[rgba(255,255,255,0.06)] to-[rgba(255,255,255,0.01)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] shadow-[0_0_60px_rgba(124,58,237,0.15)] hover:shadow-[0_0_80px_rgba(245,158,11,0.2)] hover:border-2 hover:border-amber-400/50 transition-all" whileHover={cardHover} variants={staggerItem}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                        A
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Alex Thompson</p>
                        <p className="text-xs text-slate-400">@alexcrypto</p>
                      </div>
                    </div>
                    <blockquote className="text-lg text-white font-medium leading-relaxed mb-4">
                      "The security features give me peace of mind. Military-grade encryption and read-only access - exactly what I need for my digital assets."
                    </blockquote>
                    <div className="flex gap-1 mb-2">
                      {Array(5).fill(0).map((_, i) => (
                        <svg key={i} className="h-4 w-4 text-amber-400 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">January 2024</p>
                  </motion.div>

                  <motion.div className="rounded-3xl p-6 text-left bg-gradient-to-br from-[rgba(255,255,255,0.06)] to-[rgba(255,255,255,0.01)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] shadow-[0_0_60px_rgba(124,58,237,0.15)] hover:shadow-[0_0_80px_rgba(245,158,11,0.2)] hover:border-2 hover:border-amber-400/50 transition-all" whileHover={cardHover} variants={staggerItem}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-orange-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                        J
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Jessica Park</p>
                        <p className="text-xs text-slate-400">@jessicatrades</p>
                      </div>
                    </div>
                    <blockquote className="text-lg text-white font-medium leading-relaxed mb-4">
                      "CoinDash's analytics dashboard is a game-changer. The charts and insights help me understand market trends like never before."
                    </blockquote>
                    <div className="flex gap-1 mb-2">
                      {Array(5).fill(0).map((_, i) => (
                        <svg key={i} className="h-4 w-4 text-amber-400 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">December 2023</p>
                  </motion.div>

                  <motion.div className="rounded-3xl p-6 text-left bg-gradient-to-br from-[rgba(255,255,255,0.06)] to-[rgba(255,255,255,0.01)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] shadow-[0_0_60px_rgba(124,58,237,0.15)] hover:shadow-[0_0_80px_rgba(245,158,11,0.2)] hover:border-2 hover:border-amber-400/50 transition-all" whileHover={cardHover} variants={staggerItem}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-amber-500 to-violet-600 flex items-center justify-center text-white font-semibold text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                        D
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">David Kim</p>
                        <p className="text-xs text-slate-400">@davidhodl</p>
                      </div>
                    </div>
                    <blockquote className="text-lg text-white font-medium leading-relaxed mb-4">
                      "Mobile app is fantastic. Real-time alerts and portfolio tracking on the go - perfect for staying connected to my investments."
                    </blockquote>
                    <div className="flex gap-1 mb-2">
                      {Array(5).fill(0).map((_, i) => (
                        <svg key={i} className="h-4 w-4 text-amber-400 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">November 2023</p>
                  </motion.div>

                  <motion.div className="rounded-3xl p-6 text-left bg-gradient-to-br from-[rgba(255,255,255,0.06)] to-[rgba(255,255,255,0.01)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] shadow-[0_0_60px_rgba(124,58,237,0.15)] hover:shadow-[0_0_80px_rgba(245,158,11,0.2)] hover:border-2 hover:border-amber-400/50 transition-all" whileHover={cardHover} variants={staggerItem}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-orange-400 flex items-center justify-center text-white font-semibold text-sm shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                        L
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Lisa Wong</p>
                        <p className="text-xs text-slate-400">@lisacrypto</p>
                      </div>
                    </div>
                    <blockquote className="text-lg text-white font-medium leading-relaxed mb-4">
                      "The exit strategy feature with AI predictions has been invaluable. Helped me optimize my trades and maximize returns."
                    </blockquote>
                    <div className="flex gap-1 mb-2">
                      {Array(5).fill(0).map((_, i) => (
                        <svg key={i} className="h-4 w-4 text-amber-400 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">October 2023</p>
                  </motion.div>
                </motion.div>
              </motion.section>

              <motion.section className="py-24" variants={fadeInUp} initial="initial" whileInView="animate" viewport={{ once: true }}>
                <motion.div className="grid gap-8 lg:grid-cols-3 max-w-7xl mx-auto" variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }}>
                  <motion.div className="rounded-[2rem] p-8 text-center bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(255,255,255,0.02)] backdrop-blur-2xl border border-[rgba(255,255,255,0.1)] shadow-[0_0_80px_rgba(124,58,237,0.25)]" whileHover={cardHover} variants={staggerItem}>
                    <div className="mb-6">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl shadow-[0_0_40px_rgba(245,158,11,0.3)]">
                        R
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">Rachel Green</h3>
                      <p className="text-sm text-slate-400 mb-4">Crypto Analyst & Investor</p>
                    </div>
                    <blockquote className="text-slate-300 text-lg leading-relaxed mb-6">
                      "CoinDash has revolutionized portfolio management. The comprehensive tracking across all my assets, combined with AI-driven insights, gives me the edge I need in this volatile market."
                    </blockquote>
                    <p className="text-sm text-primary font-medium">See on SourceForge</p>
                  </motion.div>

                  <motion.div className="rounded-[2rem] p-8 text-center bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(255,255,255,0.02)] backdrop-blur-2xl border border-[rgba(255,255,255,0.1)] shadow-[0_0_80px_rgba(124,58,237,0.25)]" whileHover={cardHover} variants={staggerItem}>
                    <div className="mb-6">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-r from-amber-500 to-purple-600 mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl shadow-[0_0_40px_rgba(245,158,11,0.3)]">
                        T
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">Tom Anderson</h3>
                      <p className="text-sm text-slate-400 mb-4">DeFi Protocol Developer</p>
                    </div>
                    <blockquote className="text-slate-300 text-lg leading-relaxed mb-6">
                      "As someone who builds DeFi protocols, I appreciate CoinDash's deep integration capabilities. The security measures and audit compliance give me confidence in their platform."
                    </blockquote>
                    <p className="text-sm text-primary font-medium">See on YouTube</p>
                  </motion.div>

                  <motion.div className="rounded-[2rem] p-8 text-center bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(255,255,255,0.02)] backdrop-blur-2xl border border-[rgba(255,255,255,0.1)] shadow-[0_0_80px_rgba(124,58,237,0.25)]" whileHover={cardHover} variants={staggerItem}>
                    <div className="mb-6">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-r from-violet-500 to-purple-700 mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl shadow-[0_0_40px_rgba(124,58,237,0.3)]">
                        M
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">Maria Santos</h3>
                      <p className="text-sm text-slate-400 mb-4">Financial Advisor</p>
                    </div>
                    <blockquote className="text-slate-300 text-lg leading-relaxed mb-6">
                      "My clients love the comprehensive view CoinDash provides. From traditional assets to crypto, everything is tracked seamlessly with professional-grade analytics."
                    </blockquote>
                    <p className="text-sm text-primary font-medium">See on SourceForge</p>
                  </motion.div>
                </motion.div>
              </motion.section>

              <motion.section className="content-width mx-auto grid gap-12 lg:grid-cols-[0.95fr_1.05fr] items-start py-24" variants={fadeInUp} initial="initial" whileInView="animate" viewport={{ once: true }}>
                <div className="space-y-8">
                  <motion.p className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm uppercase tracking-[0.3em] text-slate-300" variants={staggerItem}>
                    Frequently Asked Questions
                  </motion.p>
                  <motion.h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-purple-400" variants={staggerItem}>
                    Get the Answers to All Your Questions
                  </motion.h2>
                  <motion.p className="max-w-xl text-lg text-slate-400 leading-relaxed" variants={staggerItem}>
                    Everything you need to know about getting started with CoinDash, managing your portfolio securely, and maximizing your crypto investments.
                  </motion.p>
                  <motion.div className="flex items-center gap-4 pt-4" variants={staggerItem}>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Need more help?</p>
                      <p className="text-xs text-slate-400">Contact our support team</p>
                    </div>
                  </motion.div>
                </div>

                <motion.div className="space-y-4" variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }}>
                  {faqData.map((item, index) => (
                    <motion.div
                      key={index}
                      className="rounded-3xl overflow-hidden bg-gradient-to-br from-[rgba(255,255,255,0.06)] to-[rgba(255,255,255,0.01)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] shadow-[0_0_60px_rgba(124,58,237,0.15)]"
                      whileHover={{ scale: 1.02, boxShadow: '0 0 80px rgba(124, 58, 237, 0.25)' }}
                      transition={{ duration: 0.3 }}
                      variants={staggerItem}
                    >
                      <motion.button
                        className="flex items-center justify-between w-full p-6 text-left hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-purple-500/5 transition-all duration-300 group"
                        onClick={() => toggleItem(index)}
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <h3 className="text-lg font-semibold text-white pr-4 group-hover:text-amber-300 transition-colors duration-300">
                          {item.question}
                        </h3>
                        <motion.svg
                          className="h-5 w-5 text-slate-400 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          animate={{ rotate: openItem === index ? 180 : 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </motion.svg>
                      </motion.button>

                      <AnimatePresence>
                        {openItem === index && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                              height: { duration: 0.4, ease: 'easeInOut' },
                              opacity: { duration: 0.3, delay: 0.1 }
                            }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6">
                              <motion.p
                                className="text-slate-400 leading-relaxed"
                                initial={{ y: -10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                              >
                                {item.answer}
                              </motion.p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.section>

              <motion.section className="relative py-32 overflow-hidden" variants={fadeInUp} initial="initial" whileInView="animate" viewport={{ once: true }}>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 blur-3xl" />

                <div className="relative text-center max-w-4xl mx-auto">
                  <motion.h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-purple-300 to-amber-300" variants={staggerItem}>
                    Start Managing Your Crypto Portfolio More Efficiently
                  </motion.h2>
                  <motion.p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto" variants={staggerItem}>
                    Join millions of investors who trust CoinDash to track, analyze, and optimize their crypto portfolios with AI-powered insights.
                  </motion.p>
                  <motion.button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 rounded-full text-slate-950 font-bold text-lg hover:shadow-[0_0_60px_rgba(245,158,11,0.5)] hover:scale-110 transition-all duration-300" whileHover={buttonHover} variants={staggerItem}>
                    Get Started Today
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </motion.button>
                </div>
              </motion.section>

              <motion.footer className="border-t border-white/10 bg-slate-950/50 backdrop-blur-sm" variants={fadeInUp} initial="initial" whileInView="animate" viewport={{ once: true }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                  <motion.div className="grid gap-8 lg:grid-cols-6" variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }}>
                    <motion.div className="lg:col-span-2" variants={staggerItem}>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                          <span className="text-slate-950 font-bold text-lg">C</span>
                        </div>
                        <span className="text-2xl font-bold text-white">CoinDash</span>
                      </div>
                      <p className="text-slate-400 mb-6 max-w-sm">
                        The ultimate crypto portfolio tracker. Connect all your wallets, exchanges, and DeFi positions in one premium dashboard with AI-powered insights.
                      </p>
                      <motion.div className="flex gap-4" variants={staggerItem}>
                        <motion.button className="h-10 w-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition" whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)' }}>
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                          </svg>
                        </motion.button>
                        <motion.button className="h-10 w-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition" whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)' }}>
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                          </svg>
                        </motion.button>
                        <motion.button className="h-10 w-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition" whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)' }}>
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </motion.button>
                        <motion.button className="h-10 w-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition" whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)' }}>
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.749.097.118.112.221.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001.012.017z"/>
                          </svg>
                        </motion.button>
                      </motion.div>
                    </motion.div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Explore</h3>
                      <ul className="space-y-3">
                        <li><a href="#" className="text-slate-400 hover:text-white transition">Portfolio Dashboard</a></li>
                        <li><a href="#" className="text-slate-400 hover:text-white transition">Analytics</a></li>
                        <li><a href="#" className="text-slate-400 hover:text-white transition">AI Insights</a></li>
                        <li><a href="#" className="text-slate-400 hover:text-white transition">DeFi Tracker</a></li>
                        <li><a href="#" className="text-slate-400 hover:text-white transition">NFT Portfolio</a></li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
                      <ul className="space-y-3">
                        <li><a href="#" className="text-slate-400 hover:text-white transition">About Us</a></li>
                        <li><a href="#" className="text-slate-400 hover:text-white transition">Careers</a></li>
                        <li><a href="#" className="text-slate-400 hover:text-white transition">Press</a></li>
                        <li><a href="#" className="text-slate-400 hover:text-white transition">Blog</a></li>
                        <li><a href="#" className="text-slate-400 hover:text-white transition">Contact</a></li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Useful Tools</h3>
                      <ul className="space-y-3">
                        <li><a href="#" className="text-slate-400 hover:text-white transition">Price Alerts</a></li>
                        <li><a href="#" className="text-slate-400 hover:text-white transition">Portfolio Calculator</a></li>
                        <li><a href="#" className="text-slate-400 hover:text-white transition">Tax Reports</a></li>
                        <li><a href="#" className="text-slate-400 hover:text-white transition">API Documentation</a></li>
                        <li><a href="#" className="text-slate-400 hover:text-white transition">Market Data</a></li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Additional Products</h3>
                      <ul className="space-y-3">
                        <li><a href="#" className="text-slate-400 hover:text-white transition">CoinDash Pro</a></li>
                        <li><a href="#" className="text-slate-400 hover:text-white transition">CoinDash Mobile</a></li>
                        <li><a href="#" className="text-slate-400 hover:text-white transition">CoinDash API</a></li>
                        <li><a href="#" className="text-slate-400 hover:text-white transition">CoinDash Enterprise</a></li>
                        <li><a href="#" className="text-slate-400 hover:text-white transition">CoinDash Academy</a></li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Policies</h3>
                      <ul className="space-y-3">
                        <li><a href="#" className="text-slate-400 hover:text-white transition">Privacy Policy</a></li>
                        <li><a href="#" className="text-slate-400 hover:text-white transition">Terms of Service</a></li>
                        <li><a href="#" className="text-slate-400 hover:text-white transition">Security</a></li>
                        <li><a href="#" className="text-slate-400 hover:text-white transition">Compliance</a></li>
                        <li><a href="#" className="text-slate-400 hover:text-white transition">Cookie Policy</a></li>
                      </ul>
                    </div>
                  </motion.div>

                  <div className="border-t border-white/10 mt-12 pt-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <p className="text-slate-400 text-sm">
                          © 2024 CoinDash. All rights reserved.
                        </p>
                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition text-sm text-slate-300 hover:text-white">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                            </svg>
                            <span>App Store</span>
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition text-sm text-slate-300 hover:text-white">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.61 3 21.09 3 20.5Z"/>
                              <path d="M16.81 15.12L6.05 21.34L14.54 12.85L16.81 15.12Z"/>
                              <path d="M20.16 10.81C20.5 11.08 20.75 11.53 20.75 12C20.75 12.47 20.5 12.92 20.16 13.19L17.89 14.5L15.39 12L17.89 9.5L20.16 10.81Z"/>
                              <path d="M6.05 2.66L16.81 8.88L14.54 11.15L6.05 2.66Z"/>
                            </svg>
                            <span>Google Play</span>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-slate-400 text-sm">Support</span>
                        <a href="#" className="text-primary hover:text-accent transition">support@coindash.com</a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.footer>

            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Portfolio;
