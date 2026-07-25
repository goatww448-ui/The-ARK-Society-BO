const { SlashCommandBuilder } = require('discord.js');
const { arkEmbed, error } = require('../../utils/embedBuilder');
const { getEconomy, DAILY_REWARD, WEEKLY_REWARD, RARITY_COLORS } = require('../../utils/economyHelper');
const { colors, emojis } = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily coins and crate reward!'),

  cooldown: 5,

  async execute(interaction) {
    const eco = await getEconomy(interaction.user.id, interaction.guild.id);
    const now = new Date();

    // Check cooldown (24 hours)
    if (eco.lastDaily) {
      const diff = now - eco.lastDaily;
      const hours = 24 * 60 * 60 * 1000;
      if (diff < hours) {
        const remaining = hours - diff;
        const hrs = Math.floor(remaining / 3600000);
        const mins = Math.floor((remaining % 3600000) / 60000);
        return interaction.reply({
          embeds: [error('Already Claimed', `You already claimed your daily!\nCome back in **${hrs}h ${mins}m**`)],
          ephemeral: true,
        });
      }
    }

    // Give reward
    eco.coins += DAILY_REWARD.coins;
    eco.crates[DAILY_REWARD.crate] += 1;
    eco.lastDaily = now;
    await eco.save();

    await interaction.reply({
      embeds: [arkEmbed({
        color: colors.success,
        title: '🎁 Daily Reward Claimed!',
        description: `Here are your daily rewards, **${interaction.user.username}**!`,
        fields: [
          { name: '💰 Coins',    value: `+**${DAILY_REWARD.coins}** coins`,        inline: true },
          { name: '📦 Crate',    value: `+1 **Common** Crate`,                     inline: true },
          { name: '💳 Balance',  value: `**${eco.coins.toLocaleString()}** coins`,  inline: true },
        ],
        footerText: 'Come back tomorrow for more rewards!',
      })]
    });
  },
};
