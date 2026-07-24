const { SlashCommandBuilder } = require('discord.js');
const { success, error } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Shuffle the music queue'),

  cooldown: 5,

  async execute(interaction) {
    const { useQueue } = require('discord-player');
    const queue = useQueue(interaction.guild.id);
    if (!queue?.tracks.size) return interaction.reply({ embeds: [error('Empty Queue', 'No songs in the queue to shuffle.')], ephemeral: true });
    queue.tracks.shuffle();
    await interaction.reply({ embeds: [success('Queue Shuffled', `🔀 Shuffled **${queue.tracks.size}** songs.`)] });
  },
};
