const https = require('https');

// ─── Per-user context memory ──────────────────────────────────────
const contextMemory = new Map();
const MAX_CONTEXT = 4;

// ─── Get AI Response ─────────────────────────────────────────────
async function getAIResponse(userId, userMessage) {
  const history = contextMemory.get(userId) || [];
  history.push({ role: 'user', content: userMessage });
  if (history.length > MAX_CONTEXT) history.shift();

  const messages = [
    {
      role: 'system',
      content: 'You are ARK AI, a helpful Discord bot assistant for The ARK Society server. Be friendly and concise. Keep responses under 200 words.',
    },
    ...history,
  ];

  const body = JSON.stringify({
    model: 'mistralai/mistral-7b-instruct:free',
    messages,
    max_tokens: 300,
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'HTTP-Referer': 'https://discord.com',
        'X-Title': 'ARK Bot',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          console.log('[AI] Status:', res.statusCode);
          console.log('[AI] Response:', data.substring(0, 200));
          const parsed = JSON.parse(data);
          if (parsed.error) {
            console.error('[AI] Error:', parsed.error);
            return resolve(`⚠️ AI Error: ${parsed.error.message}`);
          }
          const reply = parsed.choices?.[0]?.message?.content?.trim();
          if (reply) {
            history.push({ role: 'assistant', content: reply });
            contextMemory.set(userId, history.slice(-MAX_CONTEXT));
            return resolve(reply);
          }
          resolve('⚠️ No response generated. Try again!');
        } catch (err) {
          console.error('[AI] Parse error:', err.message, data);
          resolve('⚠️ Error parsing response. Try again!');
        }
      });
    });

    req.on('error', (err) => {
      console.error('[AI] Request error:', err.message);
      resolve('⚠️ Connection error. Try again!');
    });

    req.setTimeout(20000, () => {
      req.destroy();
      resolve('⚠️ Request timed out. Try again!');
    });

    req.write(body);
    req.end();
  });
}

module.exports = { getAIResponse };
