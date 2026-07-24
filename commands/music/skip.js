const { SlashCommandBuilder } = require('discord.js');
const { success, error, arkEmbed } = require('../../utils/embedBuilder');
const { colors, emojis } = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current song'),
  cooldown: 3,
  async execute(interaction) {
    const { useQueue } = require('discord-player');
    const queue = useQueue(interaction.guild.id);
    if (!queue?.isPlaying()) return interaction.reply({ embeds: [error('Not Playing', 'Nothing is playing right now.')], ephemeral: true });
    queue.node.skip();
    await interaction.reply({ embeds: [success('Skipped', '⏭️ Skipped to the next song.')] });
  },
};
