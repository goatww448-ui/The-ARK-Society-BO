const { SlashCommandBuilder } = require('discord.js');
const { arkEmbed } = require('../../utils/embedBuilder');
const { colors, emojis } = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleinfo')
    .setDescription('Get information about a role')
    .addRoleOption(o => o.setName('role').setDescription('Role to inspect').setRequired(true)),

  cooldown: 5,

  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const members = interaction.guild.members.cache.filter(m => m.roles.cache.has(role.id)).size;

    await interaction.reply({
      embeds: [arkEmbed({
        color: role.color || colors.primary,
        title: `${emojis.crown} Role Info — ${role.name}`,
        fields: [
          { name: '🆔 ID',          value: role.id,                                                         inline: true },
          { name: '🎨 Color',       value: role.hexColor,                                                   inline: true },
          { name: '👥 Members',     value: `${members}`,                                                    inline: true },
          { name: '📌 Position',    value: `${role.position}`,                                              inline: true },
          { name: '🔔 Mentionable', value: role.mentionable ? 'Yes' : 'No',                                 inline: true },
          { name: '📌 Hoisted',     value: role.hoist ? 'Yes' : 'No',                                       inline: true },
          { name: '📅 Created',     value: `<t:${Math.floor(role.createdTimestamp / 1000)}:D>`,             inline: true },
          { name: '🤖 Managed',     value: role.managed ? 'Yes (bot/integration)' : 'No',                  inline: true },
        ],
        footerText: `Requested by ${interaction.user.tag}`,
      })]
    });
  },
};
