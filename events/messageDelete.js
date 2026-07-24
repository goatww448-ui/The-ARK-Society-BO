const GuildSettings = require('../models/GuildSettings');
const { arkEmbed } = require('../utils/embedBuilder');
const { colors, emojis } = require('../config/config');

module.exports = {
  name: 'messageDelete',
  async execute(message, client) {
    if (!message.guild || message.author?.bot) return;

    let settings;
    try {
      settings = await GuildSettings.findOne({ guildId: message.guild.id });
    } catch { return; }

    if (!settings?.antiGhostPing) return;

    // Check if deleted message had mentions
    const mentions = message.mentions?.users?.filter(u => !u.bot && u.id !== message.author?.id);
    if (!mentions?.size) return;

    const mentionList = mentions.map(u => `<@${u.id}>`).join(', ');

    await message.channel.send({
      embeds: [arkEmbed({
        color: colors.warning,
        title: `${emojis.warning} Ghost Ping Detected`,
        description: `**${message.author?.tag ?? 'Someone'}** ghost pinged: ${mentionList}`,
        footerText: 'Anti Ghost Ping',
      })]
    }).catch(() => {});
  },
};
