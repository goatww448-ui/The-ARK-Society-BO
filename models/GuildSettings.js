const { Schema, model } = require('mongoose');

const GuildSettingsSchema = new Schema({
  guildId:        { type: String, required: true, unique: true },

  // Channels
  logChannel:     { type: String, default: null },
  welcomeChannel: { type: String, default: null },
  leaveChannel:   { type: String, default: null },
  suggestChannel: { type: String, default: null },
  ticketCategory: { type: String, default: null },
  musicChannel:   { type: String, default: null },

  // Roles
  autoRole:       { type: String, default: null },
  muteRole:       { type: String, default: null },
  djRole:         { type: String, default: null },

  // Welcome
  welcomeMessage: { type: String, default: 'Welcome to the server, {user}! 🎉' },
  leaveMessage:   { type: String, default: '{user} has left the server.' },
  welcomeCard:    { type: Boolean, default: true },

  // Security
  antiSpam:       { type: Boolean, default: true },
  antiRaid:       { type: Boolean, default: true },
  antiLinks:      { type: Boolean, default: false },
  antiMention:    { type: Boolean, default: true },
  antiGhostPing:  { type: Boolean, default: true },
  wordBlacklist:  { type: [String], default: [] },
  allowedLinks:   { type: [String], default: [] },
  securityLevel:  { type: String, enum: ['low','medium','high'], default: 'medium' },
  raidMode:       { type: Boolean, default: false },

  // Features
  aiEnabled:      { type: Boolean, default: true },
  aiChannel:      { type: String, default: null },
  musicEnabled:   { type: Boolean, default: true },
  levelEnabled:   { type: Boolean, default: true },

  // Reaction roles
  reactionRoles:  { type: Map, of: String, default: {} },

  updatedAt: { type: Date, default: Date.now },
});

GuildSettingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = model('GuildSettings', GuildSettingsSchema);
