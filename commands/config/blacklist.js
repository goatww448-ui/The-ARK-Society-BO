const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { success, error, arkEmbed } = require('../../utils/embedBuilder');
const GuildSettings = require('../../models/GuildSettings');
const { colors, emojis } = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Manage the word blacklist')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub => sub
      .setName('add')
      .setDescription('Add a word to the blacklist')
      .addStringOption(o => o.setName('word').setDescription('Word to blacklist').setRequired(true))
    )
    .addSubcommand(sub => sub
      .setName('remove')
      .setDescription('Remove a word from the blacklist')
      .addStringOption(o => o.setName('word').setDescription('Word to remove').setRequired(true))
    )
    .addSubcommand(sub => sub
      .setName('list')
      .setDescription('View all blacklisted words')
    ),

  cooldown: 3,

  async execute(interaction) {
    const sub  = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    let settings = await GuildSettings.findOne({ guildId });
    if (!settings) settings = new GuildSettings({ guildId });

    if (sub === 'add') {
      const word = interaction.options.getString('word').toLowerCase();
      if (settings.wordBlacklist.includes(word)) {
        return interaction.reply({ embeds: [error('Already Blacklisted', `\`${word}\` is already on the blacklist.`)], ephemeral: true });
      }
      settings.wordBlacklist.push(word);
      await settings.save();
      await interaction.reply({ embeds: [success('Word Blacklisted', `\`${word}\` has been added to the blacklist.`)] });
    }

    if (sub === 'remove') {
      const word = interaction.options.getString('word').toLowerCase();
      const idx  = settings.wordBlacklist.indexOf(word);
      if (idx === -1) return interaction.reply({ embeds: [error('Not Found', `\`${word}\` is not on the blacklist.`)], ephemeral: true });
      settings.wordBlacklist.splice(idx, 1);
      await settings.save();
      await interaction.reply({ embeds: [success('Word Removed', `\`${word}\` has been removed from the blacklist.`)] });
    }

    if (sub === 'list') {
      const list = settings.wordBlacklist.length
        ? settings.wordBlacklist.map(w => `\`${w}\``).join(', ')
        : 'No blacklisted words.';
      await interaction.reply({
        embeds: [arkEmbed({
          color: colors.warning,
          title: `${emojis.shield} Word Blacklist`,
          description: list,
          footerText: `${settings.wordBlacklist.length} word(s) blacklisted`,
        })],
        ephemeral: true,
      });
    }
  },
};
