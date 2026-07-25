const { Schema, model } = require('mongoose');

const EconomySchema = new Schema({
  userId:    { type: String, required: true },
  guildId:   { type: String, required: true },

  // Currency
  coins:     { type: Number, default: 0 },
  bank:      { type: Number, default: 0 },

  // Daily/Weekly
  lastDaily:  { type: Date, default: null },
  lastWeekly: { type: Date, default: null },

  // Crates
  crates: {
    common:    { type: Number, default: 0 },
    rare:      { type: Number, default: 0 },
    epic:      { type: Number, default: 0 },
    legendary: { type: Number, default: 0 },
  },

  // Inventory (items won from crates)
  inventory: [{
    name:     { type: String },
    type:     { type: String }, // weapon, armor, potion
    rarity:   { type: String },
    power:    { type: Number },
    emoji:    { type: String },
  }],

  // Battle stats
  battle: {
    wins:   { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    hp:     { type: Number, default: 100 },
    maxHp:  { type: Number, default: 100 },
    power:  { type: Number, default: 10 },
    armor:  { type: Number, default: 0 },
  },

  // Active battle
  inBattle:   { type: Boolean, default: false },
  battleWith:  { type: String, default: null },

  createdAt: { type: Date, default: Date.now },
});

EconomySchema.index({ userId: 1, guildId: 1 }, { unique: true });

module.exports = model('Economy', EconomySchema);
