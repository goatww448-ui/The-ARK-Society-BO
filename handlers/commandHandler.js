const { readdirSync } = require('fs');
const { join } = require('path');

// ─── Command Handler ─────────────────────────────────────────────
async function loadCommands(client) {
  const commandFolders = readdirSync(join(__dirname, '../commands'));
  let loaded = 0;

  for (const folder of commandFolders) {
    const commandFiles = readdirSync(join(__dirname, `../commands/${folder}`))
      .filter(f => f.endsWith('.js'));

    for (const file of commandFiles) {
      try {
        const command = require(join(__dirname, `../commands/${folder}/${file}`));
        if (command?.data && command?.execute) {
          client.commands.set(command.data.name, command);
          loaded++;
        }
      } catch (err) {
        console.error(`[CMD] Failed to load ${file}:`, err.message);
      }
    }
  }
  console.log(`[ARK] ✅ Loaded ${loaded} commands`);
}

module.exports = { loadCommands };
