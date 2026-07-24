const { Schema, model } = require('mongoose');

const TicketSchema = new Schema({
  guildId:   { type: String, required: true },
  channelId: { type: String, required: true, unique: true },
  userId:    { type: String, required: true },
  open:      { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  closedAt:  { type: Date, default: null },
});

module.exports = model('Ticket', TicketSchema);
