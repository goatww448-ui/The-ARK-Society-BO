const { SlashCommandBuilder } = require('discord.js');
const { arkEmbed } = require('../../utils/embedBuilder');
const { colors } = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription("Get a user's avatar")
    .addUserOption(o => o.setName('user').setDescription('User to get avatar of').setRequired(false)),

  cooldown: 5,

  async execute(interaction) {
    const target = interaction.options.getUser('user') ?? interaction.user;

    await interaction.reply({
      embeds: [arkEmbed({
        color: colors.primary,
        title: `🖼️ ${target.username}'s Avatar`,
        image: target.displayAvatarURL({ dynamic: true, size: 1024 }),
        footerText: `ID: ${target.id}`,
      })]
    });
  },
};
