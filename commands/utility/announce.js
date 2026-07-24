const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { arkEmbed, error } = require('../../utils/embedBuilder');
const { colors, emojis } = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Send an announcement embed')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(o => o.setName('title').setDescription('Announcement title').setRequired(true))
    .addStringOption(o => o.setName('message').setDescription('Announcement message').setRequired(true))
    .addChannelOption(o => o.setName('channel').setDescription('Channel to send to (defaults to current)').setRequired(false))
    .addStringOption(o => o.setName('color').setDescription('Embed color').setRequired(false)
      .addChoices(
        { name: 'Blue (Default)', value: 'blue' },
        { name: 'Green',          value: 'green' },
        { name: 'Red',            value: 'red' },
        { name: 'Gold',           value: 'gold' },
        { name: 'Purple',         value: 'purple' },
      ))
    .addBooleanOption(o => o.setName('ping').setDescription('Ping @everyone?').setRequired(false)),

  cooldown: 10,

  async execute(interaction) {
    const title   = interaction.options.getString('title');
    const message = interaction.options.getString('message');
    const channel = interaction.options.getChannel('channel') ?? interaction.channel;
    const colorKey= interaction.options.getString('color') ?? 'blue';
    const ping    = interaction.options.getBoolean('ping') ?? false;

    const colorMap = {
      blue:   colors.primary,
      green:  colors.success,
      red:    colors.error,
      gold:   colors.warning,
      purple: colors.purple,
    };

    const embed = arkEmbed({
      color: colorMap[colorKey],
      title: `📢 ${title}`,
      description: message,
      footerText: `Announced by ${interaction.user.tag}`,
    });

    await channel.send({
      content: ping ? '@everyone' : undefined,
      embeds: [embed],
    });

    await interaction.reply({ content: `✅ Announcement sent to <#${channel.id}>.`, ephemeral: true });
  },
};
