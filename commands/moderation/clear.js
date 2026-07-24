const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { success, error } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Delete multiple messages at once')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(o => o.setName('amount').setDescription('Number of messages to delete (1-100)').setMinValue(1).setMaxValue(100).setRequired(true))
    .addUserOption(o => o.setName('user').setDescription('Only delete messages from this user').setRequired(false)),

  cooldown: 5,

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const target = interaction.options.getUser('user');

    await interaction.deferReply({ ephemeral: true });

    let messages = await interaction.channel.messages.fetch({ limit: 100 });

    if (target) {
      messages = messages.filter(m => m.author.id === target.id).first(amount);
    } else {
      messages = messages.first(amount);
    }

    // Filter out messages older than 14 days (Discord limitation)
    const twoWeeks = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const deletable = messages.filter ? 
      [...messages.values()].filter(m => m.createdTimestamp > twoWeeks) :
      messages.filter(m => m.createdTimestamp > twoWeeks);

    try {
      const deleted = await interaction.channel.bulkDelete(deletable, true);
      await interaction.editReply({
        embeds: [success('Messages Cleared', `Successfully deleted **${deleted.size}** message(s).`)]
      });
    } catch (err) {
      await interaction.editReply({ embeds: [error('Clear Failed', err.message)] });
    }
  },
};
