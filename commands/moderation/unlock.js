const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { success, error } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock a channel so members can send messages again')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption(o => o.setName('channel').setDescription('Channel to unlock').setRequired(false)),

  cooldown: 5,

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel') ?? interaction.channel;

    try {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: null,
        AddReactions: null,
      });
      await interaction.reply({
        embeds: [success('🔓 Channel Unlocked', `<#${channel.id}> is now unlocked.`)]
      });
    } catch (err) {
      await interaction.reply({ embeds: [error('Unlock Failed', err.message)], ephemeral: true });
    }
  },
};
