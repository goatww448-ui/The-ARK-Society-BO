const { SlashCommandBuilder } = require('discord.js');
const { success, error, arkEmbed } = require('../../utils/embedBuilder');
const { colors, emojis } = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('View the music queue'),
  cooldown: 5,
  async execute(interaction) {
    const { useQueue } = require('discord-player');
    const queue = useQueue(interaction.guild.id);
    if (!queue?.tracks.size) return interaction.reply({ embeds: [error('Empty Queue', 'No songs in the queue.')], ephemeral: true });

    const tracks = queue.tracks.toArray().slice(0, 10);
    const list = tracks.map((t, i) => `**${i + 1}.** [${t.title}](${t.url}) — ${t.duration}`).join('\n');

    await interaction.reply({
      embeds: [arkEmbed({
        color: colors.primary,
        title: `${emojis.music} Music Queue`,
        description: `**Now Playing:** ${queue.currentTrack?.title ?? 'Nothing'}\n\n${list}`,
        footerText: `${queue.tracks.size} songs in queue`,
      })]
    });
  },
};
