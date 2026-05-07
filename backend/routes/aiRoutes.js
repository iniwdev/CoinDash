const express = require("express");

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    console.log("Request body:", req.body);

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        reply: "Message is required",
      });
    }

    const lower = message.toLowerCase();

    let reply = "";

    if (lower.includes("bitcoin")) {
      reply =
        "Bitcoin is currently the largest cryptocurrency by market capitalization.";
    } else if (lower.includes("ethereum")) {
      reply =
        "Ethereum powers smart contracts, DeFi, and NFT ecosystems.";
    } else if (lower.includes("solana")) {
      reply =
        "Solana is known for high-speed blockchain transactions and low fees.";
    } else if (lower.includes("portfolio")) {
      reply =
        "Diversification and proper risk management improve portfolio stability.";
    } else if (lower.includes("price")) {
      reply =
        "Crypto prices are highly volatile and influenced by market sentiment.";
    } else {
      reply =
        "CoinDash AI can help with crypto markets, DeFi, wallets, NFTs, and portfolio analytics.";
    }

    res.json({
      reply,
    });
  } catch (error) {
    console.error("AI Route Error:", error);

    res.status(500).json({
      reply: "Internal server error",
    });
  }
});

module.exports = router;