const { SlashCommandBuilder } = require('discord.js');
const { arkEmbed } = require('../../utils/embedBuilder');
const { getEconomy } = require('../../utils/economyHelper');
const { colors } = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('View your inventory and battle stats')
    .addUserOption(o => o.setName('user').setDescription('View another user').setRequired(false)),

  cooldown: 5,

  async execute(interaction) {
    const target = interaction.options.getUser('user') ?? interaction.user;
    const eco    = await getEconomy(target.id, interaction.guild.id);

    const items = eco.inventory.slice(-10);
    const itemList = items.length
      ? items.map(i => `${i.emoji} **${i.name}** — ${i.type} (+${i.power} power) [${i.rarity}]`).join('\n')
      : 'No items yet! Open crates to get items.';

    await interaction.reply({
      embeds: [arkEmbed({
        color: colors.purple,
        title: `🎒 ${target.username}'s Inventory`,
        thumbnail: target.displayAvatarURL({ dynamic: true }),
        fields: [
          { name: '⚔️ Battle Stats', value: [
            `❤️ HP: **${eco.battle.maxHp}**`,
            `⚔️ Power: **${eco.battle.power}**`,
            `🛡️ Armor: **${eco.battle.armor}**`,
            `🏆 Wins: **${eco.battle.wins}**`,
            `💀 Losses: **${eco.battle.losses}**`,
          ].join('\n'), inline: true },
          { name: '📦 Crates', value: [
            `📦 Common: **${eco.crates.common}**`,
            `💙 Rare: **${eco.crates.rare}**`,
            `💜 Epic: **${eco.crates.epic}**`,
            `🌟 Legendary: **${eco.crates.legendary}**`,
          ].join('\n'), inline: true },
          { name: `🎒 Items (${eco.inventory.length} total)`, value: itemList, inline: false },
        ],
      })]
    });
  },
};
