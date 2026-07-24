const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { success, error, modLog } = require('../../utils/embedBuilder');
const { checkPermissions, parseDuration, formatDuration, sendLog } = require('../../utils/helpers');
const GuildSettings = require('../../models/GuildSettings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a member (mute them temporarily)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('user').setDescription('User to timeout').setRequired(true))
    .addStringOption(o => o.setName('duration').setDescription('Duration e.g. 10m, 1h, 7d').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(false)),

  cooldown: 3,

  async execute(interaction) {
    const target   = interaction.options.getMember('user');
    const durStr   = interaction.options.getString('duration');
    const reason   = interaction.options.getString('reason') ?? 'No reason provided';
    const duration = parseDuration(durStr);

    if (!target) return interaction.reply({ embeds: [error('Not Found', 'User not in server.')], ephemeral: true });
    if (!duration) return interaction.reply({ embeds: [error('Invalid Duration', 'Use format: `10m`, `1h`, `7d`')], ephemeral: true });
    if (duration > 28 * 24 * 60 * 60 * 1000) return interaction.reply({ embeds: [error('Too Long', 'Max timeout is 28 days.')], ephemeral: true });
    if (!(await checkPermissions(interaction, target))) return;

    try {
      await target.timeout(duration, `${interaction.user.tag}: ${reason}`);

      await interaction.reply({
        embeds: [success('Member Timed Out', `**${target.user.tag}** has been timed out for **${formatDuration(duration)}**.\n**Reason:** ${reason}`)]
      });

      await sendLog(interaction.guild, modLog('Timeout', [
        { name: 'User',      value: `${target.user.tag} (${target.id})`, inline: true },
        { name: 'Duration',  value: formatDuration(duration),            inline: true },
        { name: 'Moderator', value: interaction.user.tag,                inline: true },
        { name: 'Reason',    value: reason,                              inline: false },
      ], interaction.user.tag), GuildSettings);

    } catch (err) {
      await interaction.reply({ embeds: [error('Timeout Failed', err.message)], ephemeral: true });
    }
  },
};
