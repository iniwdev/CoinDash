require('dotenv').config();
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const models = ['openai/gpt-oss-20b', 'openai/gpt-oss-120b', 'llama-3.1-8b-instant', 'llama-3.3-70b-versatile'];
(async () => {
  for (const model of models) {
    try {
      console.log('Testing model:', model);
      const completion = await groq.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: 'You are CoinDash AI, a professional crypto assistant.' },
          { role: 'user', content: 'Should I invest in Bitcoin now?' },
        ],
        temperature: 0.3,
        max_tokens: 200,
      });
      console.log(JSON.stringify(completion, null, 2));
    } catch (error) {
      console.error('ERROR', model, error);
    }
  }
})();
