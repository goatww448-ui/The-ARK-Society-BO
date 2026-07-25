const { SlashCommandBuilder } = require('discord.js');
const { arkEmbed } = require('../../utils/embedBuilder');
const Economy = require('../../models/Economy');
const { colors } = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('richest')
    .setDescription('View the richest members in the server'),

  cooldown: 10,

  async execute(interaction) {
    await interaction.deferReply();

    const top = await Economy.find({ guildId: interaction.guild.id })
      .sort({ coins: -1 })
      .limit(10);

    if (!top.length) return interaction.editReply({ content: 'No economy data yet!' });

    const medals = ['🥇', '🥈', '🥉'];
    const list = top.map((u, i) =>
      `${medals[i] ?? `**${i + 1}.**`} <@${u.userId}> — **${u.coins.toLocaleString()}** coins`
    ).join('\n');

    await interaction.editReply({
      embeds: [arkEmbed({
        color: colors.warning,
        title: '💰 Richest Members',
        description: list,
        footerText: 'Earn coins with /daily, /weekly and /fight!',
      })]
    });
  },
};
