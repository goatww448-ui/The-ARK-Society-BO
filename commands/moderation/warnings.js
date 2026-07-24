const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { arkEmbed, error } = require('../../utils/embedBuilder');
const User = require('../../models/User');
const { colors, emojis } = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View warnings for a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('user').setDescription('User to check').setRequired(true)),

  cooldown: 5,

  async execute(interaction) {
    const target   = interaction.options.getUser('user');
    const userData = await User.findOne({ userId: target.id, guildId: interaction.guild.id });

    if (!userData?.warns.length) {
      return interaction.reply({
        embeds: [arkEmbed({
          color: colors.success,
          description: `✅ **${target.tag}** has no warnings.`,
        })]
      });
    }

    const warnList = userData.warns.slice(-10).map((w, i) =>
      `**Case #${w.caseId ?? i + 1}** — ${w.reason}\n> <t:${Math.floor(new Date(w.timestamp).getTime() / 1000)}:R> by <@${w.moderatorId}>`
    ).join('\n\n');

    await interaction.reply({
      embeds: [arkEmbed({
        color: colors.warning,
        title: `${emojis.warn} Warnings — ${target.tag}`,
        description: warnList,
        footerText: `Total: ${userData.warns.length} warning(s)`,
      })]
    });
  },
};
