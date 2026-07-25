const { SlashCommandBuilder } = require('discord.js');
const { arkEmbed } = require('../../utils/embedBuilder');
const Economy = require('../../models/Economy');
const { colors } = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('battlestats')
    .setDescription('View the top fighters in the server'),

  cooldown: 10,

  async execute(interaction) {
    await interaction.deferReply();

    const top = await Economy.find({ guildId: interaction.guild.id, 'battle.wins': { $gt: 0 } })
      .sort({ 'battle.wins': -1 })
      .limit(10);

    if (!top.length) return interaction.editReply({ content: 'No battles yet! Use `/fight` to start!' });

    const medals = ['🥇', '🥈', '🥉'];
    const list = top.map((u, i) =>
      `${medals[i] ?? `**${i + 1}.**`} <@${u.userId}> — **${u.battle.wins}W** / **${u.battle.losses}L** • Power: **${u.battle.power}**`
    ).join('\n');

    await interaction.editReply({
      embeds: [arkEmbed({
        color: colors.error,
        title: '⚔️ Top Fighters',
        description: list,
        footerText: 'Challenge someone with /fight!',
      })]
    });
  },
};
