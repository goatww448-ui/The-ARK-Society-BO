const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
  userId:    { type: String, required: true },
  guildId:   { type: String, required: true },

  // Moderation
  warns: [{
    reason:      { type: String },
    moderatorId: { type: String },
    caseId:      { type: Number },
    timestamp:   { type: Date, default: Date.now },
  }],
  infractions: { type: Number, default: 0 },
  isMuted:     { type: Boolean, default: false },

  // Leveling
  xp:         { type: Number, default: 0 },
  level:      { type: Number, default: 0 },
  totalXp:    { type: Number, default: 0 },
  lastXpTime: { type: Date, default: null },

  // Economy (optional)
  balance:    { type: Number, default: 0 },
  bank:       { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
});

// Compound index for fast lookups
UserSchema.index({ userId: 1, guildId: 1 }, { unique: true });

module.exports = model('User', UserSchema);
