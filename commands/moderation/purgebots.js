const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { success, error } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purgebots')
    .setDescription('Delete bot messages from the channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(o => o.setName('amount').setDescription('Number of messages to scan (1-100)').setMinValue(1).setMaxValue(100).setRequired(false)),

  cooldown: 10,

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount') ?? 50;
    await interaction.deferReply({ ephemeral: true });

    const messages = await interaction.channel.messages.fetch({ limit: amount });
    const botMsgs  = messages.filter(m => m.author.bot);
    const twoWeeks = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const deletable = botMsgs.filter(m => m.createdTimestamp > twoWeeks);

    try {
      const deleted = await interaction.channel.bulkDelete(deletable, true);
      await interaction.editReply({ embeds: [success('Bot Messages Purged', `Deleted **${deleted.size}** bot message(s).`)] });
    } catch (err) {
      await interaction.editReply({ embeds: [error('Failed', err.message)] });
    }
  },
};
