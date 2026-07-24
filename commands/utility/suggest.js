const { SlashCommandBuilder } = require('discord.js');
const { arkEmbed, success, error } = require('../../utils/embedBuilder');
const GuildSettings = require('../../models/GuildSettings');
const { colors, emojis } = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Submit a suggestion for the server')
    .addStringOption(o => o.setName('suggestion').setDescription('Your suggestion').setRequired(true)),

  cooldown: 30,

  async execute(interaction) {
    const suggestion = interaction.options.getString('suggestion');
    const settings   = await GuildSettings.findOne({ guildId: interaction.guild.id });

    if (!settings?.suggestChannel) {
      return interaction.reply({ embeds: [error('Not Configured', 'The suggestions channel has not been set up yet.')], ephemeral: true });
    }

    const channel = interaction.guild.channels.cache.get(settings.suggestChannel);
    if (!channel) return interaction.reply({ embeds: [error('Channel Not Found', 'Suggestions channel not found.')], ephemeral: true });

    const msg = await channel.send({
      embeds: [arkEmbed({
        color: colors.primary,
        title: `${emojis.star} New Suggestion`,
        description: suggestion,
        author: { name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() },
        fields: [
          { name: '👍 Upvotes',   value: '0', inline: true },
          { name: '👎 Downvotes', value: '0', inline: true },
          { name: '📊 Status',    value: '⏳ Pending', inline: true },
        ],
      })]
    });

    await msg.react('👍');
    await msg.react('👎');

    await interaction.reply({ embeds: [success('Suggestion Submitted', 'Your suggestion has been submitted!')], ephemeral: true });
  },
};
