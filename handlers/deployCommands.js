const { REST, Routes } = require('discord.js');
const { readdirSync } = require('fs');
const { join } = require('path');
require('dotenv').config();

const commands = [];
const commandFolders = readdirSync(join(__dirname, '../commands'));

for (const folder of commandFolders) {
  const commandFiles = readdirSync(join(__dirname, `../commands/${folder}`)).filter(f => f.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(join(__dirname, `../commands/${folder}/${file}`));
    if (command?.data) commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log(`[DEPLOY] Registering ${commands.length} slash commands...`);
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('[DEPLOY] ✅ Slash commands registered successfully!');
  } catch (err) {
    console.error('[DEPLOY] ❌ Error:', err);
  }
})();
