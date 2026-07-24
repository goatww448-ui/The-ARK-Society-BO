const { SlashCommandBuilder } = require('discord.js');
const { success, error } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Set the music volume')
    .addIntegerOption(o => o.setName('level').setDescription('Volume level (1-100)').setMinValue(1).setMaxValue(100).setRequired(true)),

  cooldown: 3,

  async execute(interaction) {
    const { useQueue } = require('discord-player');
    const queue = useQueue(interaction.guild.id);
    if (!queue?.isPlaying()) return interaction.reply({ embeds: [error('Not Playing', 'Nothing is playing right now.')], ephemeral: true });

    const level = interaction.options.getInteger('level');
    queue.node.setVolume(level);

    await interaction.reply({ embeds: [success('Volume Updated', `🔊 Volume set to **${level}%**`)] });
  },
};
