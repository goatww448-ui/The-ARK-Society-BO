const GuildSettings = require('../models/GuildSettings');
const { arkEmbed, emojis } = require('../utils/embedBuilder');
const { colors } = require('../config/config');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    const { guild } = member;

    let settings;
    try {
      settings = await GuildSettings.findOne({ guildId: guild.id });
    } catch { return; }

    if (!settings) return;

    // ─── Anti Raid Check ──────────────────────────────────────
    if (settings.raidMode) {
      await member.kick('Anti-Raid: Raid mode is active').catch(() => {});
      return;
    }

    // ─── Auto Role ────────────────────────────────────────────
    if (settings.autoRole) {
      const role = guild.roles.cache.get(settings.autoRole);
      if (role) await member.roles.add(role).catch(() => {});
    }

    // ─── Welcome Message ──────────────────────────────────────
    if (settings.welcomeChannel) {
      const channel = guild.channels.cache.get(settings.welcomeChannel);
      if (!channel) return;

      const msg = (settings.welcomeMessage || 'Welcome to the server, {user}! 🎉')
        .replace('{user}', `<@${member.id}>`)
        .replace('{username}', member.user.username)
        .replace('{server}', guild.name)
        .replace('{count}', guild.memberCount);

      const embed = arkEmbed({
        color: colors.primary,
        title: `${emojis.crown} Welcome to ${guild.name}!`,
        description: msg,
        thumbnail: member.user.displayAvatarURL({ dynamic: true, size: 256 }),
        fields: [
          { name: '👤 Member', value: `${member.user.tag}`, inline: true },
          { name: '📋 Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
          { name: '👥 Member Count', value: `**#${guild.memberCount}**`, inline: true },
        ],
      });

      await channel.send({ content: `<@${member.id}>`, embeds: [embed] }).catch(() => {});
    }
  },
};
