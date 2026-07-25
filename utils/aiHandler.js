const axios = require('axios');

// ─── Per-user context memory ──────────────────────────────────────
// Stores last N messages per user for context
const contextMemory = new Map();
const MAX_CONTEXT = 6; // messages to remember

// ─── Get AI Response ─────────────────────────────────────────────
async function getAIResponse(userId, userMessage) {
  const history = contextMemory.get(userId) || [];

  history.push({ role: 'user', content: userMessage });
  if (history.length > MAX_CONTEXT) history.shift();

  const messages = [
    {
      role: 'system',
      content: `You are ARK AI, the helpful assistant for "The ARK Society" Discord server. 
You are friendly, concise, and knowledgeable. You help server members with questions, 
provide information, and make the community more engaging. Keep responses under 300 words. 
Do not produce harmful, illegal, or NSFW content.`,
    },
    ...history,
  ];

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: process.env.AI_MODEL || 'mistralai/mistral-7b-instruct:free',
        messages,
        max_tokens: 400,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://arksociety.bot',
          'X-Title': 'ARK Society Bot',
        },
        timeout: 15000,
      }
    );

    const reply = response.data.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error('Empty response');

    history.push({ role: 'assistant', content: reply });
    contextMemory.set(userId, history.slice(-MAX_CONTEXT));

    return reply;
  } catch (err) {
    console.error('[AI] Error:', err.response?.data || err.message);
    return '⚠️ I\'m having trouble connecting right now. Please try again in a moment!';
  }
}

module.exports = { getAIResponse };
