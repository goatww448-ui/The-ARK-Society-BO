const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { success, error } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set slowmode on a channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addIntegerOption(o => o.setName('seconds').setDescription('Slowmode seconds (0 to disable, max 21600)').setMinValue(0).setMaxValue(21600).setRequired(true))
    .addChannelOption(o => o.setName('channel').setDescription('Target channel').setRequired(false)),

  cooldown: 5,

  async execute(interaction) {
    const seconds = interaction.options.getInteger('seconds');
    const channel = interaction.options.getChannel('channel') ?? interaction.channel;

    try {
      await channel.setRateLimitPerUser(seconds);
      const msg = seconds === 0
        ? `Slowmode disabled in <#${channel.id}>.`
        : `Slowmode set to **${seconds}s** in <#${channel.id}>.`;
      await interaction.reply({ embeds: [success('Slowmode Updated', msg)] });
    } catch (err) {
      await interaction.reply({ embeds: [error('Failed', err.message)], ephemeral: true });
    }
  },
};
