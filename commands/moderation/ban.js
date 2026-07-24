const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { success, error, modLog } = require('../../utils/embedBuilder');
const { checkPermissions, sendLog } = require('../../utils/helpers');
const GuildSettings = require('../../models/GuildSettings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(o => o.setName('user').setDescription('User to ban').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for ban').setRequired(false))
    .addIntegerOption(o => o.setName('days').setDescription('Days of messages to delete (0-7)').setMinValue(0).setMaxValue(7).setRequired(false)),

  cooldown: 5,

  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') ?? 'No reason provided';
    const days   = interaction.options.getInteger('days') ?? 0;

    if (!target) return interaction.reply({ embeds: [error('Not Found', 'That user is not in this server.')], ephemeral: true });
    if (!(await checkPermissions(interaction, target))) return;

    try {
      await target.ban({ deleteMessageDays: days, reason: `${interaction.user.tag}: ${reason}` });

      await interaction.reply({
        embeds: [success('Member Banned', `**${target.user.tag}** has been banned.\n**Reason:** ${reason}`)]
      });

      await sendLog(interaction.guild, modLog('Ban', [
        { name: 'User',       value: `${target.user.tag} (${target.id})`, inline: true },
        { name: 'Moderator',  value: interaction.user.tag,                inline: true },
        { name: 'Reason',     value: reason,                              inline: false },
      ], interaction.user.tag), GuildSettings);

    } catch (err) {
      await interaction.reply({ embeds: [error('Ban Failed', err.message)], ephemeral: true });
    }
  },
};
