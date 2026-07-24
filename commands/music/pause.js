const { SlashCommandBuilder } = require('discord.js');
const { success, error } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause or resume the current song'),
  cooldown: 3,
  async execute(interaction) {
    const { useQueue } = require('discord-player');
    const queue = useQueue(interaction.guild.id);
    if (!queue?.isPlaying()) return interaction.reply({ embeds: [error('Not Playing', 'Nothing is playing.')], ephemeral: true });
    const paused = queue.node.isPaused();
    paused ? queue.node.resume() : queue.node.pause();
    await interaction.reply({ embeds: [success(paused ? 'Resumed' : 'Paused', paused ? '▶️ Music resumed.' : '⏸️ Music paused.')] });
  },
};
