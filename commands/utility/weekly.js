const { SlashCommandBuilder } = require('discord.js');
const { arkEmbed, error } = require('../../utils/embedBuilder');
const { getEconomy, WEEKLY_REWARD } = require('../../utils/economyHelper');
const { colors } = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('weekly')
    .setDescription('Claim your weekly coins and rare crate!'),

  cooldown: 5,

  async execute(interaction) {
    const eco = await getEconomy(interaction.user.id, interaction.guild.id);
    const now = new Date();

    if (eco.lastWeekly) {
      const diff = now - eco.lastWeekly;
      const week = 7 * 24 * 60 * 60 * 1000;
      if (diff < week) {
        const remaining = week - diff;
        const days = Math.floor(remaining / 86400000);
        const hrs  = Math.floor((remaining % 86400000) / 3600000);
        return interaction.reply({
          embeds: [error('Already Claimed', `Come back in **${days}d ${hrs}h**`)],
          ephemeral: true,
        });
      }
    }

    eco.coins += WEEKLY_REWARD.coins;
    eco.crates[WEEKLY_REWARD.crate] += 1;
    eco.lastWeekly = now;
    await eco.save();

    await interaction.reply({
      embeds: [arkEmbed({
        color: colors.purple,
        title: '🎁 Weekly Reward Claimed!',
        description: `Big rewards for **${interaction.user.username}**!`,
        fields: [
          { name: '💰 Coins',   value: `+**${WEEKLY_REWARD.coins}** coins`,       inline: true },
          { name: '📦 Crate',   value: `+1 **Rare** Crate`,                       inline: true },
          { name: '💳 Balance', value: `**${eco.coins.toLocaleString()}** coins`,  inline: true },
        ],
        footerText: 'Come back next week!',
      })]
    });
  },
};
