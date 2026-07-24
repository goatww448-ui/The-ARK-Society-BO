const { SlashCommandBuilder } = require('discord.js');
const { arkEmbed } = require('../../utils/embedBuilder');
const { colors, emojis } = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('View information about this server'),

  cooldown: 10,

  async execute(interaction) {
    const guild = interaction.guild;
    await guild.fetch();

    const channels = guild.channels.cache;
    const text  = channels.filter(c => c.type === 0).size;
    const voice = channels.filter(c => c.type === 2).size;
    const roles = guild.roles.cache.size - 1;

    const online  = guild.members.cache.filter(m => m.presence?.status !== 'offline').size;
    const bots    = guild.members.cache.filter(m => m.user.bot).size;
    const humans  = guild.memberCount - bots;

    await interaction.reply({
      embeds: [arkEmbed({
        color: colors.primary,
        title: `${emojis.ark} ${guild.name}`,
        thumbnail: guild.iconURL({ dynamic: true, size: 256 }),
        fields: [
          { name: '👑 Owner',      value: `<@${guild.ownerId}>`,       inline: true },
          { name: '📅 Created',    value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
          { name: '🌍 Region',     value: guild.preferredLocale,       inline: true },
          { name: '👥 Members',    value: `${guild.memberCount} total (${humans} humans, ${bots} bots)`, inline: false },
          { name: '💬 Channels',   value: `${text} text • ${voice} voice`, inline: true },
          { name: '🎭 Roles',      value: `${roles}`,                  inline: true },
          { name: '🔒 Verification', value: ['None','Low','Medium','High','Highest'][guild.verificationLevel], inline: true },
        ],
        footerText: `ID: ${guild.id}`,
      })]
    });
  },
};
