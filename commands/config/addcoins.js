const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { success, error } = require('../../utils/embedBuilder');
const { getEconomy } = require('../../utils/economyHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addcoins')
    .setDescription('Admin: Give coins to a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(o => o.setName('user').setDescription('User to give coins to').setRequired(true))
    .addIntegerOption(o => o.setName('amount').setDescription('Amount of coins').setMinValue(1).setRequired(true)),

  cooldown: 3,

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    const eco = await getEconomy(target.id, interaction.guild.id);
    eco.coins += amount;
    await eco.save();

    await interaction.reply({
      embeds: [success('Coins Added! 💰', `Added **${amount.toLocaleString()}** coins to **${target.username}**!\nNew balance: **${eco.coins.toLocaleString()}** coins`)],
      ephemeral: true,
    });
  },
};
