const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { arkEmbed, success } = require('../../utils/embedBuilder');
const { colors, emojis } = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Ticket system management')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub => sub
      .setName('panel')
      .setDescription('Send a ticket panel in this channel')
    )
    .addSubcommand(sub => sub
      .setName('open')
      .setDescription('Open a support ticket')
    ),

  cooldown: 10,

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'panel') {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('ticket_create')
          .setLabel('Open Ticket')
          .setEmoji('🎫')
          .setStyle(ButtonStyle.Primary)
      );

      await interaction.channel.send({
        embeds: [arkEmbed({
          color: colors.primary,
          title: `${emojis.ticket} Support Center`,
          description: 'Need help? Click the button below to open a private support ticket.\n\nOur staff will assist you as soon as possible.',
          footerText: 'The ARK Society Support',
        })],
        components: [row],
      });
      await interaction.reply({ content: '✅ Ticket panel sent.', ephemeral: true });
    }

    if (sub === 'open') {
      const { createTicket } = require('../../utils/ticketHandler');
      await createTicket(interaction);
    }
  },
};
