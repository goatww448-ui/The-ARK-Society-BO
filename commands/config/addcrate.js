const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { success, error } = require('../../utils/embedBuilder');
const { getEconomy } = require('../../utils/economyHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addcrate')
    .setDescription('Admin: Give crates to a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(o => o.setName('user').setDescription('User to give crates to').setRequired(true))
    .addStringOption(o => o.setName('type').setDescription('Crate type').setRequired(true)
      .addChoices(
        { name: '📦 Common',    value: 'common'    },
        { name: '💙 Rare',      value: 'rare'      },
        { name: '💜 Epic',      value: 'epic'      },
        { name: '🌟 Legendary', value: 'legendary' },
      ))
    .addIntegerOption(o => o.setName('amount').setDescription('Amount of crates').setMinValue(1).setMaxValue(100).setRequired(true)),

  cooldown: 3,

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const type   = interaction.options.getString('type');
    const amount = interaction.options.getInteger('amount');

    const eco = await getEconomy(target.id, interaction.guild.id);
    eco.crates[type] += amount;
    await eco.save();

    const emojis = { common: '📦', rare: '💙', epic: '💜', legendary: '🌟' };

    await interaction.reply({
      embeds: [success('Crates Added! 📦', `Added **${amount}x ${emojis[type]} ${type}** crates to **${target.username}**!`)],
      ephemeral: true,
    });
  },
};
