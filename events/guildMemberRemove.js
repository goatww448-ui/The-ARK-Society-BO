const GuildSettings = require('../models/GuildSettings');
const { arkEmbed } = require('../utils/embedBuilder');
const { colors, emojis } = require('../config/config');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member, client) {
    const { guild } = member;
    let settings;
    try {
      settings = await GuildSettings.findOne({ guildId: guild.id });
    } catch { return; }
    if (!settings?.leaveChannel) return;

    const channel = guild.channels.cache.get(settings.leaveChannel);
    if (!channel) return;

    const msg = (settings.leaveMessage || '{user} has left the server.')
      .replace('{user}', member.user.tag)
      .replace('{username}', member.user.username)
      .replace('{server}', guild.name);

    await channel.send({
      embeds: [arkEmbed({
        color: colors.error,
        title: `${emojis.warning} Member Left`,
        description: msg,
        thumbnail: member.user.displayAvatarURL({ dynamic: true }),
        fields: [
          { name: '👤 User', value: member.user.tag, inline: true },
          { name: '👥 Members Now', value: `${guild.memberCount}`, inline: true },
        ],
      })]
    }).catch(() => {});
  },
};
