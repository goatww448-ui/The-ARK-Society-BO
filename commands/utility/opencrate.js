const { SlashCommandBuilder } = require('discord.js');
const { arkEmbed, error } = require('../../utils/embedBuilder');
const { getEconomy, openCrate, RARITY_COLORS } = require('../../utils/economyHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('opencrate')
    .setDescription('Open one of your crates!')
    .addStringOption(o => o.setName('type').setDescription('Crate type').setRequired(true)
      .addChoices(
        { name: '📦 Common',    value: 'common'    },
        { name: '💙 Rare',      value: 'rare'      },
        { name: '💜 Epic',      value: 'epic'      },
        { name: '🌟 Legendary', value: 'legendary' },
      )),

  cooldown: 3,

  async execute(interaction) {
    const type = interaction.options.getString('type');
    const eco  = await getEconomy(interaction.user.id, interaction.guild.id);

    if (eco.crates[type] < 1) {
      return interaction.reply({
        embeds: [error('No Crates', `You don't have any **${type}** crates!\nGet them from \`/daily\`, \`/weekly\`, or buy from the shop.`)],
        ephemeral: true,
      });
    }

    // Open crate
    eco.crates[type] -= 1;
    const { item, coins } = openCrate(type);

    // Add to inventory and coins
    eco.coins += coins;
    eco.inventory.push(item);

    // Boost battle stats based on item
    if (item.type === 'weapon') eco.battle.power += Math.floor(item.power * 0.1);
    if (item.type === 'armor')  eco.battle.armor  += Math.floor(item.power * 0.1);

    await eco.save();

    const crateEmojis = { common: '📦', rare: '💙', epic: '💜', legendary: '🌟' };

    await interaction.reply({
      embeds: [arkEmbed({
        color: RARITY_COLORS[item.rarity],
        title: `${crateEmojis[type]} ${type.charAt(0).toUpperCase() + type.slice(1)} Crate Opened!`,
        description: `You opened a **${type}** crate and found...`,
        fields: [
          { name: `${item.emoji} Item Found`,  value: `**${item.name}**\nType: ${item.type} • Power: +${item.power}`, inline: true },
          { name: '💰 Coins Found',            value: `**+${coins.toLocaleString()}** coins`,                          inline: true },
          { name: '💳 New Balance',            value: `**${eco.coins.toLocaleString()}** coins`,                       inline: true },
        ],
        footerText: `Rarity: ${item.rarity.toUpperCase()}`,
      })]
    });
  },
};
