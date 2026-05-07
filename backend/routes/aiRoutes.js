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

const FINAL_SYSTEM_PROMPT = `
You are CoinDash AI.

You respond exactly like a helpful chat assistant.

Rules:
- Speak naturally and conversationally
- Use plain text only
- Never use markdown
- Never use tables
- Never use headings
- Never use bullet points unless absolutely necessary
- Never use ###, **, |, or ---
- Never generate articles
- Answer fully and completely
- Do not cut answers off mid-thought
- If the answer is long, continue until finished
- Sound intelligent, modern, and human

Bad response example:
"### Overview | Name | Description |"

Good response example:
"Bitcoin is a decentralized digital currency that works without banks. It runs on blockchain technology and is often called digital gold because of its limited supply."

Always behave like a real AI chat assistant.
`;

const sanitizeReply = (reply) => {
  if (!reply || typeof reply !== "string") return "";

  let text = reply;
  text = text.replace(/\*\*/g, "");
  text = text.replace(/#{1,6}/g, "");
  text = text.replace(/`/g, "");
  text = text.replace(/\|/g, "");
  text = text.replace(/---+/g, "");
  text = text.replace(/>/g, "");
  text = text.replace(/<br\s*\/?>/gi, "");
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.replace(/\s{2,}/g, " ");
  return text.trim();
};

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    console.log("USER:", message);
    console.log("AI request received:", { message });

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        reply: "Message is required",
      });
    }

    const normalizedMessage = message.trim().toLowerCase();
    const greetingPattern = /^(hi|hello|hey)\b|who are you/;
    if (greetingPattern.test(normalizedMessage)) {
      return res.json({
        reply: "Hey! I'm CoinDash AI. I can help with crypto research, portfolio insights, market trends, and trading-related questions.",
      });
    }

    const prompt = FINAL_SYSTEM_PROMPT;
    console.log("System prompt used:", prompt);

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: message },
      ],
      model: "openai/gpt-oss-120b",
      temperature: 0.3,
      max_tokens: 1800,
      top_p: 1.0,
    });

    const rawReply =
      completion.choices[0]?.message?.content ||
      completion.choices[0]?.message?.reasoning ||
      completion.choices[0]?.text || "";
    console.log("RAW AI length:", rawReply.length);
    console.log("RAW AI:", rawReply);

    const reply = sanitizeReply(rawReply);
    console.log("CLEANED:", reply);

    if (!reply) {
      console.error("GROQ returned no reply", completion);
      return res.status(502).json({
        reply: "CoinDash AI failed to respond.",
      });
    }

    res.json({ reply });
  } catch (error) {
    console.error("AI ERROR:", error);
    res.status(500).json({
      reply: "CoinDash AI failed to respond.",
    });
  }
});

module.exports = router;