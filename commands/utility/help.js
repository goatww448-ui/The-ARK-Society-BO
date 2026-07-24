const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const { arkEmbed } = require('../../utils/embedBuilder');
const { colors, emojis } = require('../../config/config');

const categories = {
  '🛡️ Moderation': ['/ban', '/kick', '/timeout', '/warn', '/clear', '/lock', '/unlock', '/slowmode'],
  '🎉 Giveaways':  ['/giveaway start', '/giveaway end', '/giveaway reroll'],
  '🎵 Music':      ['/play', '/skip', '/pause', '/queue', '/stop'],
  '🤖 AI':         ['/ai'],
  '📊 Utility':    ['/rank', '/userinfo', '/serverinfo', '/help'],
  '⚙️ Config':     ['/setup view', '/setup logchannel', '/setup welcomechannel', '/setup autorole', '/setup security', '/setup raidmode'],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('View all ARK Bot commands'),

  cooldown: 5,

  async execute(interaction) {
    const fields = Object.entries(categories).map(([cat, cmds]) => ({
      name: cat,
      value: cmds.map(c => `\`${c}\``).join(', '),
      inline: false,
    }));

    await interaction.reply({
      embeds: [arkEmbed({
        color: colors.primary,
        title: `${emojis.ark} ARK Society Bot — Command List`,
        description: 'All-in-one server bot with security, moderation, music, AI & more.\nUse slash commands — type `/` to get started.',
        fields,
        footerText: 'The ARK Society',
      })]
    });
  },
};
