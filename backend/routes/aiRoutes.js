const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

if (!process.env.GROQ_API_KEY) {
  throw new Error("Missing GROQ_API_KEY. Please set GROQ_API_KEY in backend/.env.");
}

console.log("GROQ_API_KEY loaded in aiRoutes:", Boolean(process.env.GROQ_API_KEY));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    console.log("AI request received:", { message });

    if (!message) {
      return res.status(400).json({
        reply: "Message is required",
      });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are CoinDash AI, a professional crypto portfolio assistant. Give intelligent, detailed, human-like responses.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      model: "openai/gpt-oss-120b",
      temperature: 0.3,
      max_tokens: 512,
      top_p: 0.95,
    });

    console.log("GROQ response:", completion);

    const reply =
      completion.choices[0]?.message?.content ||
      completion.choices[0]?.message?.reasoning ||
      completion.choices[0]?.text;
    if (!reply) {
      console.error("GROQ returned no reply", completion);
      return res.status(502).json({
        reply: "CoinDash AI failed to respond.",
      });
    }

    res.json({
      reply,
    });
  } catch (error) {
    console.error("AI ERROR:", error);
    res.status(500).json({
      reply: "CoinDash AI failed to respond.",
    });
  }
});

module.exports = router;