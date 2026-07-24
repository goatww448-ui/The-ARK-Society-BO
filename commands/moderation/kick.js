const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { success, error, modLog } = require('../../utils/embedBuilder');
const { checkPermissions, sendLog } = require('../../utils/helpers');
const GuildSettings = require('../../models/GuildSettings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption(o => o.setName('user').setDescription('User to kick').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for kick').setRequired(false)),

  cooldown: 5,

  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') ?? 'No reason provided';

    if (!target) return interaction.reply({ embeds: [error('Not Found', 'That user is not in this server.')], ephemeral: true });
    if (!(await checkPermissions(interaction, target))) return;

    try {
      await target.kick(`${interaction.user.tag}: ${reason}`);

      await interaction.reply({
        embeds: [success('Member Kicked', `**${target.user.tag}** has been kicked.\n**Reason:** ${reason}`)]
      });

      await sendLog(interaction.guild, modLog('Kick', [
        { name: 'User',      value: `${target.user.tag} (${target.id})`, inline: true },
        { name: 'Moderator', value: interaction.user.tag,                inline: true },
        { name: 'Reason',    value: reason,                              inline: false },
      ], interaction.user.tag), GuildSettings);

    } catch (err) {
      await interaction.reply({ embeds: [error('Kick Failed', err.message)], ephemeral: true });
    }
  },
};
