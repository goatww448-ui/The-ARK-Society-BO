const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { success, error } = require('../../utils/embedBuilder');
const { sendLog } = require('../../utils/helpers');
const { modLog } = require('../../utils/embedBuilder');
const GuildSettings = require('../../models/GuildSettings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user from the server')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption(o => o.setName('user_id').setDescription('User ID to unban').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for unban').setRequired(false)),

  cooldown: 5,

  async execute(interaction) {
    const userId = interaction.options.getString('user_id');
    const reason = interaction.options.getString('reason') ?? 'No reason provided';

    try {
      const ban = await interaction.guild.bans.fetch(userId).catch(() => null);
      if (!ban) return interaction.reply({ embeds: [error('Not Banned', 'That user is not banned.')], ephemeral: true });

      await interaction.guild.members.unban(userId, `${interaction.user.tag}: ${reason}`);

      await interaction.reply({
        embeds: [success('User Unbanned', `**${ban.user.tag}** has been unbanned.\n**Reason:** ${reason}`)]
      });

      await sendLog(interaction.guild, modLog('Unban', [
        { name: 'User',      value: `${ban.user.tag} (${userId})`, inline: true },
        { name: 'Moderator', value: interaction.user.tag,          inline: true },
        { name: 'Reason',    value: reason,                        inline: false },
      ], interaction.user.tag), GuildSettings);

    } catch (err) {
      await interaction.reply({ embeds: [error('Unban Failed', err.message)], ephemeral: true });
    }
  },
};
