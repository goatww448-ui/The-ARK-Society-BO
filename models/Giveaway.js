const { Schema, model } = require('mongoose');

const GiveawaySchema = new Schema({
  guildId:     { type: String, required: true },
  channelId:   { type: String, required: true },
  messageId:   { type: String, required: true, unique: true },
  hostId:      { type: String, required: true },

  prize:       { type: String, required: true },
  winners:     { type: Number, default: 1 },
  endsAt:      { type: Date, required: true },
  ended:       { type: Boolean, default: false },

  participants:    { type: [String], default: [] },
  winnerIds:       { type: [String], default: [] },

  // Requirements
  requiredRole:    { type: String, default: null },
  minAccountAge:   { type: Number, default: 0 }, // days

  createdAt: { type: Date, default: Date.now },
});

module.exports = model('Giveaway', GiveawaySchema);
