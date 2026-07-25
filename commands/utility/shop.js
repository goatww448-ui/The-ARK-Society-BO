const { SlashCommandBuilder } = require('discord.js');
const { arkEmbed, success, error } = require('../../utils/embedBuilder');
const { getEconomy } = require('../../utils/economyHelper');
const { colors } = require('../../config/config');

const SHOP_ITEMS = [
  { id: 'common_crate',    name: 'Common Crate',    emoji: '📦', price: 300,   type: 'crate', crate: 'common'    },
  { id: 'rare_crate',      name: 'Rare Crate',      emoji: '💙', price: 800,   type: 'crate', crate: 'rare'      },
  { id: 'epic_crate',      name: 'Epic Crate',      emoji: '💜', price: 2000,  type: 'crate', crate: 'epic'      },
  { id: 'legendary_crate', name: 'Legendary Crate', emoji: '🌟', price: 5000,  type: 'crate', crate: 'legendary' },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Buy crates and items with your coins')
    .addSubcommand(sub => sub.setName('view').setDescription('View the shop'))
    .addSubcommand(sub => sub
      .setName('buy')
      .setDescription('Buy an item')
      .addStringOption(o => o.setName('item').setDescription('Item to buy').setRequired(true)
        .addChoices(
          { name: '📦 Common Crate (300 coins)',    value: 'common_crate'    },
          { name: '💙 Rare Crate (800 coins)',      value: 'rare_crate'      },
          { name: '💜 Epic Crate (2000 coins)',     value: 'epic_crate'      },
          { name: '🌟 Legendary Crate (5000 coins)',value: 'legendary_crate' },
        ))),

  cooldown: 5,

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'view') {
      const list = SHOP_ITEMS.map(i => `${i.emoji} **${i.name}** — **${i.price.toLocaleString()}** coins`).join('\n');
      await interaction.reply({
        embeds: [arkEmbed({
          color: colors.warning,
          title: '🛒 ARK Society Shop',
          description: list,
          footerText: 'Use /shop buy to purchase!',
        })]
      });
    }

    if (sub === 'buy') {
      const itemId = interaction.options.getString('item');
      const item   = SHOP_ITEMS.find(i => i.id === itemId);
      if (!item) return interaction.reply({ embeds: [error('Not Found', 'Item not found.')], ephemeral: true });

      const eco = await getEconomy(interaction.user.id, interaction.guild.id);
      if (eco.coins < item.price) {
        return interaction.reply({
          embeds: [error('Insufficient Funds', `You need **${item.price}** coins but only have **${eco.coins}**!`)],
          ephemeral: true,
        });
      }

      eco.coins -= item.price;
      if (item.type === 'crate') eco.crates[item.crate] += 1;
      await eco.save();

      await interaction.reply({
        embeds: [success('Purchase Successful!', `You bought **${item.emoji} ${item.name}** for **${item.price}** coins!\nNew balance: **${eco.coins.toLocaleString()}** coins\n\nUse \`/opencrate\` to open it!`)]
      });
    }
  },
};
