const { SlashCommandBuilder } = require('discord.js');
const { success, error } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop music and clear the queue'),
  cooldown: 3,
  async execute(interaction) {
    const { useQueue } = require('discord-player');
    const queue = useQueue(interaction.guild.id);
    if (!queue) return interaction.reply({ embeds: [error('Not Playing', 'Nothing is playing.')], ephemeral: true });
    queue.delete();
    await interaction.reply({ embeds: [success('Stopped', '⏹️ Music stopped and queue cleared.')] });
  },
};
