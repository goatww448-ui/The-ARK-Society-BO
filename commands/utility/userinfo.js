const { SlashCommandBuilder } = require('discord.js');
const { arkEmbed } = require('../../utils/embedBuilder');
const User = require('../../models/User');
const { colors, emojis } = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('View information about a user')
    .addUserOption(o => o.setName('user').setDescription('User to look up').setRequired(false)),

  cooldown: 5,

  async execute(interaction) {
    const target = interaction.options.getMember('user') ?? interaction.member;
    const user   = target.user;
    const userData = await User.findOne({ userId: user.id, guildId: interaction.guild.id });

    const roles = target.roles.cache
      .filter(r => r.id !== interaction.guild.id)
      .sort((a, b) => b.position - a.position)
      .map(r => `<@&${r.id}>`)
      .slice(0, 5)
      .join(', ') || 'None';

    await interaction.reply({
      embeds: [arkEmbed({
        color: target.displayHexColor || colors.primary,
        title: `${emojis.crown} ${user.tag}`,
        thumbnail: user.displayAvatarURL({ dynamic: true, size: 256 }),
        fields: [
          { name: '🆔 User ID',      value: user.id,                                                   inline: true },
          { name: '🤖 Bot',          value: user.bot ? 'Yes' : 'No',                                   inline: true },
          { name: '📅 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`,    inline: true },
          { name: '📥 Joined Server',   value: `<t:${Math.floor(target.joinedTimestamp / 1000)}:R>`,   inline: true },
          { name: '⚡ Level',        value: userData ? `${userData.level}` : '0',                      inline: true },
          { name: '⚠️ Warnings',     value: userData ? `${userData.warns.length}` : '0',               inline: true },
          { name: '🎭 Top Roles',    value: roles,                                                      inline: false },
        ],
        footerText: `Requested by ${interaction.user.tag}`,
      })]
    });
  },
};
