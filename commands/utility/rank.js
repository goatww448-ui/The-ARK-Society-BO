const { SlashCommandBuilder } = require('discord.js');
const { arkEmbed } = require('../../utils/embedBuilder');
const User = require('../../models/User');
const { colors, emojis, levels } = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('View your rank and XP progress')
    .addUserOption(o => o.setName('user').setDescription('View another user\'s rank').setRequired(false)),

  cooldown: 5,

  async execute(interaction) {
    const target = interaction.options.getUser('user') ?? interaction.user;
    const userData = await User.findOne({ userId: target.id, guildId: interaction.guild.id });

    if (!userData) {
      return interaction.reply({
        embeds: [arkEmbed({
          color: colors.warning,
          description: `${target.username} hasn't earned any XP yet!`,
        })],
        ephemeral: true,
      });
    }

    const xpNeeded = (userData.level + 1) * levels.levelMultiplier;
    const progress = Math.floor((userData.xp / xpNeeded) * 20);
    const bar = '█'.repeat(progress) + '░'.repeat(20 - progress);

    // Leaderboard rank
    const rank = await User.countDocuments({ guildId: interaction.guild.id, totalXp: { $gt: userData.totalXp } }) + 1;

    await interaction.reply({
      embeds: [arkEmbed({
        color: colors.purple,
        title: `${emojis.star} ${target.username}'s Rank`,
        thumbnail: target.displayAvatarURL({ dynamic: true }),
        fields: [
          { name: '🏆 Rank',     value: `#${rank}`,                                        inline: true },
          { name: '⚡ Level',    value: `${userData.level}`,                                inline: true },
          { name: '✨ Total XP', value: `${userData.totalXp.toLocaleString()}`,             inline: true },
          { name: '📊 Progress', value: `\`${bar}\` ${userData.xp}/${xpNeeded} XP`,        inline: false },
        ],
      })]
    });
  },
};
