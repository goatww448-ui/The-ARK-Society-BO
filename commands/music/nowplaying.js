const { SlashCommandBuilder } = require('discord.js');
const { arkEmbed, error } = require('../../utils/embedBuilder');
const { colors, emojis } = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Show the currently playing song'),

  cooldown: 5,

  async execute(interaction) {
    const { useQueue } = require('discord-player');
    const queue = useQueue(interaction.guild.id);
    if (!queue?.isPlaying()) return interaction.reply({ embeds: [error('Not Playing', 'Nothing is playing right now.')], ephemeral: true });

    const track = queue.currentTrack;
    const progress = queue.node.getTimestamp();
    const bar = createProgressBar(progress?.current?.value ?? 0, progress?.total?.value ?? 0);

    await interaction.reply({
      embeds: [arkEmbed({
        color: colors.primary,
        title: `${emojis.music} Now Playing`,
        description: `**[${track.title}](${track.url})**`,
        thumbnail: track.thumbnail,
        fields: [
          { name: '👤 Artist',   value: track.author || 'Unknown',        inline: true },
          { name: '📋 Queue',    value: `${queue.tracks.size} songs`,      inline: true },
          { name: '🔊 Volume',   value: `${queue.node.volume}%`,           inline: true },
          { name: '⏱️ Progress', value: `\`${bar}\`\n${progress?.current?.label ?? '0:00'} / ${progress?.total?.label ?? track.duration}`, inline: false },
        ],
        footerText: `Requested by ${track.requestedBy?.tag ?? 'Unknown'}`,
      })]
    });
  },
};

function createProgressBar(current, total) {
  if (!total) return '░'.repeat(20);
  const pct = Math.min(current / total, 1);
  const filled = Math.floor(pct * 18);
  return '█'.repeat(filled) + '▶' + '░'.repeat(17 - filled);
}
