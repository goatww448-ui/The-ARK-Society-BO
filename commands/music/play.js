const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { arkEmbed, error } = require('../../utils/embedBuilder');
const { colors, emojis } = require('../../config/config');
const { useMainPlayer } = require('discord-player');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song from YouTube or Spotify')
    .addStringOption(o => o.setName('query').setDescription('Song name or URL').setRequired(true)),

  cooldown: 3,

  async execute(interaction, client) {
    const query = interaction.options.getString('query');
    const member = interaction.member;

    if (!member.voice.channel) {
      return interaction.reply({ embeds: [error('Not in Voice', 'You must be in a voice channel to play music.')], ephemeral: true });
    }

    await interaction.deferReply();

    try {
      const player = useMainPlayer();
      const { track } = await player.play(member.voice.channel, query, {
        nodeOptions: {
          metadata: interaction.channel,
          selfDeaf: true,
          volume: 80,
          leaveOnEmpty: true,
          leaveOnEmptyCooldown: 30000,
        },
        requestedBy: interaction.user,
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('music_pause').setEmoji('⏸️').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('music_skip').setEmoji('⏭️').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('music_stop').setEmoji('⏹️').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('music_queue').setEmoji('📋').setStyle(ButtonStyle.Primary),
      );

      await interaction.editReply({
        embeds: [arkEmbed({
          color: colors.primary,
          title: `${emojis.music} Added to Queue`,
          description: `**[${track.title}](${track.url})**`,
          thumbnail: track.thumbnail,
          fields: [
            { name: '👤 Artist',    value: track.author || 'Unknown', inline: true },
            { name: '⏱️ Duration',  value: track.duration || 'Live',  inline: true },
            { name: '🎧 Requested', value: `<@${interaction.user.id}>`, inline: true },
          ],
        })],
        components: [row],
      });
    } catch (err) {
      await interaction.editReply({ embeds: [error('Play Failed', `Could not play that track.\n\`${err.message}\``)] });
    }
  },
};
