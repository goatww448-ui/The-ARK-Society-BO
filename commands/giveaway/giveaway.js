const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { arkEmbed, success, error } = require('../../utils/embedBuilder');
const { parseDuration, formatDuration } = require('../../utils/helpers');
const Giveaway = require('../../models/Giveaway');
const { colors, emojis } = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Giveaway management')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub => sub
      .setName('start')
      .setDescription('Start a new giveaway')
      .addStringOption(o => o.setName('prize').setDescription('What are you giving away?').setRequired(true))
      .addStringOption(o => o.setName('duration').setDescription('Duration e.g. 1h, 2d, 30m').setRequired(true))
      .addIntegerOption(o => o.setName('winners').setDescription('Number of winners').setMinValue(1).setMaxValue(20).setRequired(false))
      .addRoleOption(o => o.setName('required_role').setDescription('Required role to enter').setRequired(false))
      .addIntegerOption(o => o.setName('min_account_age').setDescription('Min account age in days').setRequired(false))
    )
    .addSubcommand(sub => sub
      .setName('end')
      .setDescription('End a giveaway early')
      .addStringOption(o => o.setName('message_id').setDescription('Giveaway message ID').setRequired(true))
    )
    .addSubcommand(sub => sub
      .setName('reroll')
      .setDescription('Reroll giveaway winners')
      .addStringOption(o => o.setName('message_id').setDescription('Giveaway message ID').setRequired(true))
    ),

  cooldown: 5,

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'start') {
      const prize       = interaction.options.getString('prize');
      const durStr      = interaction.options.getString('duration');
      const winnerCount = interaction.options.getInteger('winners') ?? 1;
      const reqRole     = interaction.options.getRole('required_role');
      const minAge      = interaction.options.getInteger('min_account_age') ?? 0;
      const duration    = parseDuration(durStr);

      if (!duration) return interaction.reply({ embeds: [error('Invalid Duration', 'Use formats like: `30m`, `2h`, `1d`')], ephemeral: true });

      const endsAt = new Date(Date.now() + duration);

      const embed = arkEmbed({
        color: colors.purple,
        title: `${emojis.gift} GIVEAWAY — ${prize}`,
        description: [
          `> Click the button below to enter!`,
          ``,
          `🏆 **Winners:** ${winnerCount}`,
          `⏰ **Ends:** <t:${Math.floor(endsAt.getTime() / 1000)}:R>`,
          reqRole ? `🎭 **Required Role:** <@&${reqRole.id}>` : '',
          minAge ? `📅 **Min Account Age:** ${minAge} days` : '',
          ``,
          `👥 **Entries:** 0`,
        ].filter(Boolean).join('\n'),
        footerText: `Hosted by ${interaction.user.tag}`,
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('giveaway_join_PLACEHOLDER')
          .setLabel('Enter Giveaway')
          .setEmoji('🎉')
          .setStyle(ButtonStyle.Primary)
      );

      await interaction.reply({ embeds: [success('Giveaway Started!', `Your giveaway for **${prize}** has begun!`)], ephemeral: true });

      const msg = await interaction.channel.send({ embeds: [embed], components: [row] });

      // Update button with real message ID
      const realRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`giveaway_join_${msg.id}`)
          .setLabel('Enter Giveaway')
          .setEmoji('🎉')
          .setStyle(ButtonStyle.Primary)
      );
      await msg.edit({ components: [realRow] });

      // Save to DB
      await Giveaway.create({
        guildId: interaction.guild.id,
        channelId: interaction.channel.id,
        messageId: msg.id,
        hostId: interaction.user.id,
        prize,
        winners: winnerCount,
        endsAt,
        requiredRole: reqRole?.id ?? null,
        minAccountAge: minAge,
      });
    }

    if (sub === 'end') {
      const msgId = interaction.options.getString('message_id');
      const giveaway = await Giveaway.findOne({ messageId: msgId, guildId: interaction.guild.id });
      if (!giveaway) return interaction.reply({ embeds: [error('Not Found', 'No giveaway found with that message ID.')], ephemeral: true });

      await interaction.deferReply({ ephemeral: true });
      const { endGiveaway } = require('../../utils/giveawayHandler');
      await endGiveaway(interaction.client, giveaway);
      await interaction.editReply({ embeds: [success('Giveaway Ended', 'The giveaway has been ended and winners selected.')] });
    }

    if (sub === 'reroll') {
      const msgId = interaction.options.getString('message_id');
      const giveaway = await Giveaway.findOne({ messageId: msgId, guildId: interaction.guild.id, ended: true });
      if (!giveaway) return interaction.reply({ embeds: [error('Not Found', 'No ended giveaway found with that ID.')], ephemeral: true });

      if (!giveaway.participants.length) return interaction.reply({ embeds: [error('No Entries', 'There are no participants to reroll from.')], ephemeral: true });

      const newWinners = [];
      const pool = [...giveaway.participants];
      for (let i = 0; i < Math.min(giveaway.winners, pool.length); i++) {
        const idx = Math.floor(Math.random() * pool.length);
        newWinners.push(pool.splice(idx, 1)[0]);
      }

      giveaway.winnerIds = newWinners;
      await giveaway.save();

      const mentions = newWinners.map(id => `<@${id}>`).join(', ');
      await interaction.reply({
        embeds: [arkEmbed({
          color: colors.purple,
          title: `${emojis.gift} Giveaway Rerolled!`,
          description: `New winner(s): ${mentions}\nCongratulations! 🎉`,
        })]
      });
    }
  },
};
