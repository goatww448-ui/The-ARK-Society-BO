const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { success, error } = require('../../utils/embedBuilder');
const User = require('../../models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearwarnings')
    .setDescription('Clear all warnings for a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption(o => o.setName('user').setDescription('User to clear warnings for').setRequired(true)),

  cooldown: 5,

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const userData = await User.findOne({ userId: target.id, guildId: interaction.guild.id });

    if (!userData || !userData.warns.length) {
      return interaction.reply({ embeds: [error('No Warnings', `**${target.tag}** has no warnings to clear.`)], ephemeral: true });
    }

    userData.warns = [];
    userData.infractions = 0;
    await userData.save();

    await interaction.reply({
      embeds: [success('Warnings Cleared', `All warnings for **${target.tag}** have been cleared.`)]
    });
  },
};
