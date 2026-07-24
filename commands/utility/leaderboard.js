const { SlashCommandBuilder } = require('discord.js');
const { arkEmbed } = require('../../utils/embedBuilder');
const User = require('../../models/User');
const { colors, emojis } = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the top 10 most active members'),

  cooldown: 10,

  async execute(interaction) {
    await interaction.deferReply();

    const top = await User.find({ guildId: interaction.guild.id })
      .sort({ totalXp: -1 })
      .limit(10);

    if (!top.length) {
      return interaction.editReply({ embeds: [arkEmbed({ color: colors.warning, description: 'No data yet! Start chatting to earn XP.' })] });
    }

    const medals = ['🥇', '🥈', '🥉'];
    const list = top.map((u, i) =>
      `${medals[i] ?? `**${i + 1}.**`} <@${u.userId}> — Level **${u.level}** • ${u.totalXp.toLocaleString()} XP`
    ).join('\n');

    await interaction.editReply({
      embeds: [arkEmbed({
        color: colors.purple,
        title: `${emojis.crown} ARK Society Leaderboard`,
        description: list,
        footerText: 'Keep chatting to climb the ranks!',
      })]
    });
  },
};
