const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { success, error } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock a channel so members cannot send messages')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption(o => o.setName('channel').setDescription('Channel to lock (defaults to current)').setRequired(false))
    .addStringOption(o => o.setName('reason').setDescription('Reason for locking').setRequired(false)),

  cooldown: 5,

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel') ?? interaction.channel;
    const reason  = interaction.options.getString('reason') ?? 'No reason provided';

    try {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: false,
        AddReactions: false,
      });

      await interaction.reply({
        embeds: [success('🔒 Channel Locked', `<#${channel.id}> has been locked.\n**Reason:** ${reason}`)]
      });
    } catch (err) {
      await interaction.reply({ embeds: [error('Lock Failed', err.message)], ephemeral: true });
    }
  },
};
