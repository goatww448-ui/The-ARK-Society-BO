const { SlashCommandBuilder } = require('discord.js');
const { arkEmbed, error } = require('../../utils/embedBuilder');
const { getAIResponse } = require('../../utils/aiHandler');
const { colors, emojis } = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ai')
    .setDescription('Chat with ARK AI assistant')
    .addStringOption(o => o.setName('message').setDescription('Your question or message').setRequired(true)),

  cooldown: 10,

  async execute(interaction) {
    const message = interaction.options.getString('message');
    await interaction.deferReply();

    try {
      const response = await getAIResponse(interaction.user.id, message);
      await interaction.editReply({
        embeds: [arkEmbed({
          color: colors.primary,
          title: `${emojis.ai} ARK AI`,
          description: response,
          author: {
            name: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL(),
          },
          footerText: 'Powered by OpenRouter',
        })]
      });
    } catch {
      await interaction.editReply({ embeds: [error('AI Error', 'Could not get a response. Try again shortly.')] });
    }
  },
};
