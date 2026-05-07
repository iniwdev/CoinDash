import React from "react";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
  },
};

const Footer = React.memo(() => {
  const footerColumns = [
    {
      title: "Explore",
      links: [
        "Portfolio Dashboard",
        "Analytics",
        "AI Insights",
        "DeFi Tracker",
        "NFT Portfolio",
      ],
    },
    {
      title: "Company",
      links: ["About Us", "Careers", "Press", "Blog", "Contact"],
    },
    {
      title: "Useful Tools",
      links: [
        "Price Alerts",
        "Portfolio Calculator",
        "Tax Reports",
        "API Documentation",
        "Market Data",
      ],
    },
    {
      title: "Additional Products",
      links: [
        "CoinDash Pro",
        "CoinDash Mobile",
        "CoinDash API",
        "Enterprise",
        "Academy",
      ],
    },
    {
      title: "Policies",
      links: [
        "Privacy Policy",
        "Terms of Service",
        "Security",
        "Compliance",
        "Cookie Policy",
      ],
    },
  ];

  return (
    <motion.footer
      className="border-t border-white/10 bg-slate-950/50 backdrop-blur-sm mt-0"
      variants={fadeInUp}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <motion.div
            className="lg:col-span-2"
            variants={staggerItem}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-orange-400 to-purple-500 flex items-center justify-center">
                <span className="text-black font-bold text-lg">C</span>
              </div>

              <span className="text-2xl font-bold text-white">
                CoinDash
              </span>
            </div>

            <p className="text-slate-400 mb-6 max-w-sm break-words">
              Track real-time crypto prices, monitor portfolio performance,
              analyze trends, and manage digital assets across a unified
              dashboard.
            </p>

            <motion.div
              className="flex gap-4"
              variants={staggerItem}
            >
              {["𝕏", "in", "◉", "△"].map((icon, i) => (
                <motion.button
                  key={i}
                  className="h-10 w-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition"
                  whileHover={{
                    scale: 1.1,
                    boxShadow:
                      "0 0 20px rgba(124, 58, 237, 0.35)",
                  }}
                >
                  <span>{icon}</span>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>

          {footerColumns.map((column) => (
            <motion.div
              key={column.title}
              variants={staggerItem}
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                {column.title}
              </h3>

              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-slate-400 hover:text-white transition text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <p className="text-slate-400 text-sm">
                © {new Date().getFullYear()} CoinDash. All rights reserved.
              </p>

              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition text-sm text-slate-300 hover:text-white">
                  App Store
                </button>

                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition text-sm text-slate-300 hover:text-white">
                  Google Play
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-sm">
                Support
              </span>

              <a
                href="mailto:support@coindash.com"
                className="text-orange-400 hover:text-purple-400 transition text-sm"
              >
                support@coindash.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
});

export default Footer;