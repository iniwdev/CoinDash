const express = require('express');
const OpenAI = require('openai');
const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// CoinDash AI System Prompt
const SYSTEM_PROMPT = `You are CoinDash AI, a premium cryptocurrency portfolio assistant. You help users with:

CRYPTO & PORTFOLIO QUESTIONS:
- Portfolio analysis and optimization
- Crypto market trends and insights
- DeFi, NFTs, and blockchain technology
- Investment strategies and risk management
- Wallet and exchange connections

FINANCIAL ADVICE:
- Market analysis and predictions
- Rebalancing recommendations
- Risk assessment
- Performance tracking

GENERAL CONVERSATION:
- Friendly, professional, and knowledgeable
- Use crypto/blockchain terminology naturally
- Be helpful and engaging

RESPONSE STYLE:
- Professional yet conversational
- Use markdown for formatting when helpful
- Keep responses concise but informative
- Always maintain a premium, expert tone
- Reference current market context when relevant

IMPORTANT: You are CoinDash AI - always identify yourself as such and maintain the premium assistant persona.`;

router.post('/coindash-ai', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Message is required and must be a string'
      });
    }

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using cost-effective model
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from OpenAI');
    }

    res.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
      model: 'gpt-4o-mini'
    });

  } catch (error) {
    console.error('CoinDash AI Error:', error);

    // Handle different error types
    if (error.response?.status === 401) {
      return res.status(500).json({
        error: 'AI service authentication failed'
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({
        error: 'AI service rate limit exceeded. Please try again later.'
      });
    }

    res.status(500).json({
      error: 'AI service temporarily unavailable. Please try again.'
    });
  }
});

module.exports = router;