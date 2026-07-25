const { SlashCommandBuilder } = require('discord.js');
const { arkEmbed } = require('../../utils/embedBuilder');
const { getEconomy } = require('../../utils/economyHelper');
const { colors, emojis } = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your coin balance')
    .addUserOption(o => o.setName('user').setDescription('Check another user').setRequired(false)),

  cooldown: 5,

  async execute(interaction) {
    const target = interaction.options.getUser('user') ?? interaction.user;
    const eco    = await getEconomy(target.id, interaction.guild.id);
    const total  = eco.coins + eco.bank;

    await interaction.reply({
      embeds: [arkEmbed({
        color: colors.primary,
        title: `💰 ${target.username}'s Balance`,
        thumbnail: target.displayAvatarURL({ dynamic: true }),
        fields: [
          { name: '👛 Wallet', value: `**${eco.coins.toLocaleString()}** coins`,  inline: true },
          { name: '🏦 Bank',   value: `**${eco.bank.toLocaleString()}** coins`,   inline: true },
          { name: '💎 Total',  value: `**${total.toLocaleString()}** coins`,       inline: true },
          { name: '📦 Crates', value: [
            `Common: **${eco.crates.common}**`,
            `Rare: **${eco.crates.rare}**`,
            `Epic: **${eco.crates.epic}**`,
            `Legendary: **${eco.crates.legendary}**`,
          ].join(' • '), inline: false },
        ],
      })]
    });
  },
};
