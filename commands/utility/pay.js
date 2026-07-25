const { SlashCommandBuilder } = require('discord.js');
const { success, error } = require('../../utils/embedBuilder');
const { getEconomy } = require('../../utils/economyHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pay')
    .setDescription('Send coins to another member')
    .addUserOption(o => o.setName('user').setDescription('Who to pay').setRequired(true))
    .addIntegerOption(o => o.setName('amount').setDescription('Amount to send').setMinValue(1).setRequired(true)),

  cooldown: 10,

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (target.id === interaction.user.id) return interaction.reply({ embeds: [error('Invalid', 'You cannot pay yourself!')], ephemeral: true });
    if (target.bot) return interaction.reply({ embeds: [error('Invalid', 'You cannot pay a bot!')], ephemeral: true });

    const senderEco   = await getEconomy(interaction.user.id, interaction.guild.id);
    const receiverEco = await getEconomy(target.id, interaction.guild.id);

    if (senderEco.coins < amount) {
      return interaction.reply({ embeds: [error('Insufficient Funds', `You only have **${senderEco.coins}** coins!`)], ephemeral: true });
    }

    senderEco.coins   -= amount;
    receiverEco.coins += amount;
    await senderEco.save();
    await receiverEco.save();

    await interaction.reply({
      embeds: [success('Payment Sent!', `You sent **${amount.toLocaleString()}** coins to **${target.username}**!\nYour new balance: **${senderEco.coins.toLocaleString()}** coins`)]
    });
  },
};
