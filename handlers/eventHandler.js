const { readdirSync } = require('fs');
const { join } = require('path');

// ─── Event Handler ───────────────────────────────────────────────
async function loadEvents(client) {
  const eventFiles = readdirSync(join(__dirname, '../events')).filter(f => f.endsWith('.js'));
  let loaded = 0;

  for (const file of eventFiles) {
    try {
      const event = require(join(__dirname, `../events/${file}`));
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }
      loaded++;
    } catch (err) {
      console.error(`[EVT] Failed to load ${file}:`, err.message);
    }
  }
  console.log(`[ARK] ✅ Loaded ${loaded} events`);
}

module.exports = { loadEvents };
