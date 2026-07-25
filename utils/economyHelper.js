const Economy = require('../models/Economy');

// ─── Get or Create Economy Profile ──────────────────────────────
async function getEconomy(userId, guildId) {
  let eco = await Economy.findOne({ userId, guildId });
  if (!eco) eco = await Economy.create({ userId, guildId });
  return eco;
}

// ─── Crate Items Table ────────────────────────────────────────────
const CRATE_ITEMS = {
  common: [
    { name: 'Wooden Sword',   type: 'weapon', power: 5,  emoji: '🗡️',  rarity: 'common' },
    { name: 'Leather Armor',  type: 'armor',  power: 3,  emoji: '🥋',  rarity: 'common' },
    { name: 'Health Potion',  type: 'potion', power: 20, emoji: '🧪',  rarity: 'common' },
    { name: 'Shield',         type: 'armor',  power: 4,  emoji: '🛡️',  rarity: 'common' },
  ],
  rare: [
    { name: 'Iron Sword',     type: 'weapon', power: 15, emoji: '⚔️',  rarity: 'rare' },
    { name: 'Chain Armor',    type: 'armor',  power: 10, emoji: '🔗',  rarity: 'rare' },
    { name: 'Speed Potion',   type: 'potion', power: 30, emoji: '💨',  rarity: 'rare' },
    { name: 'Magic Wand',     type: 'weapon', power: 18, emoji: '🪄',  rarity: 'rare' },
  ],
  epic: [
    { name: 'Dragon Sword',   type: 'weapon', power: 35, emoji: '🐉',  rarity: 'epic' },
    { name: 'Shadow Armor',   type: 'armor',  power: 25, emoji: '🌑',  rarity: 'epic' },
    { name: 'Elixir',         type: 'potion', power: 60, emoji: '✨',  rarity: 'epic' },
    { name: 'Thunder Axe',    type: 'weapon', power: 40, emoji: '⚡',  rarity: 'epic' },
  ],
  legendary: [
    { name: 'Excalibur',      type: 'weapon', power: 75, emoji: '🌟',  rarity: 'legendary' },
    { name: 'God Armor',      type: 'armor',  power: 60, emoji: '👑',  rarity: 'legendary' },
    { name: 'Phoenix Elixir', type: 'potion', power: 100,emoji: '🔥',  rarity: 'legendary' },
    { name: 'Dark Matter',    type: 'weapon', power: 80, emoji: '🌌',  rarity: 'legendary' },
  ],
};

// ─── Coin Rewards Per Crate ───────────────────────────────────────
const CRATE_COINS = {
  common:    { min: 50,   max: 200  },
  rare:      { min: 200,  max: 500  },
  epic:      { min: 500,  max: 1500 },
  legendary: { min: 1500, max: 5000 },
};

// ─── Open A Crate ─────────────────────────────────────────────────
function openCrate(type) {
  const items = CRATE_ITEMS[type];
  const item  = items[Math.floor(Math.random() * items.length)];
  const coins = Math.floor(
    Math.random() * (CRATE_COINS[type].max - CRATE_COINS[type].min) + CRATE_COINS[type].min
  );
  return { item, coins };
}

// ─── Rarity Colors ───────────────────────────────────────────────
const RARITY_COLORS = {
  common:    0x808080,
  rare:      0x0066FF,
  epic:      0x9B59B6,
  legendary: 0xF1C40F,
};

// ─── Daily Rewards ───────────────────────────────────────────────
const DAILY_REWARD  = { coins: 500,  crate: 'common' };
const WEEKLY_REWARD = { coins: 2500, crate: 'rare'   };

module.exports = { getEconomy, openCrate, RARITY_COLORS, DAILY_REWARD, WEEKLY_REWARD, CRATE_ITEMS };
