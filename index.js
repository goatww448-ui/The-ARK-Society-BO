const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const { loadCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');
const { initPlayer } = require('./utils/musicPlayer');
const mongoose = require('mongoose');
require('dotenv').config();

// ─── Client Setup ───────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User, Partials.GuildMember],
});

// ─── Collections ────────────────────────────────────────────────
client.commands  = new Collection();
client.cooldowns = new Collection();

// ─── Anti-Crash Protection ──────────────────────────────────────
process.on('unhandledRejection', (reason) => console.error('[ARK] Unhandled Rejection:', reason));
process.on('uncaughtException',  (err)    => console.error('[ARK] Uncaught Exception:', err));

// ─── MongoDB ─────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('[ARK] ✅ Connected to MongoDB'))
  .catch(err => console.error('[ARK] ❌ MongoDB Error:', err));

// ─── Music Player ────────────────────────────────────────────────
initPlayer(client).catch(err => console.error('[ARK] Music init error:', err));

// ─── Load Handlers ───────────────────────────────────────────────
loadCommands(client);
loadEvents(client);

// ─── Login ───────────────────────────────────────────────────────
client.login(process.env.TOKEN);
