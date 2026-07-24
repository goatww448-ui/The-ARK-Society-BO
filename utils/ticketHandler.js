const { ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { arkEmbed, success, error } = require('./embedBuilder');
const GuildSettings = require('../models/GuildSettings');
const { colors, emojis } = require('../config/config');

// ─── Create Ticket ────────────────────────────────────────────────
async function createTicket(interaction) {
  const guild = interaction.guild;
  const user  = interaction.user;

  const settings = await GuildSettings.findOne({ guildId: guild.id });

  // Check if user already has a ticket open
  const existing = guild.channels.cache.find(c => c.name === `ticket-${user.username.toLowerCase().replace(/\s/g,'-')}`);
  if (existing) {
    return interaction.reply({ content: `You already have an open ticket: <#${existing.id}>`, ephemeral: true });
  }

  // Create ticket channel
  const channel = await guild.channels.create({
    name: `ticket-${user.username.toLowerCase().replace(/\s/g,'-')}`,
    type: ChannelType.GuildText,
    parent: settings?.ticketCategory ?? undefined,
    permissionOverwrites: [
      { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      { id: guild.members.me.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] },
    ],
  });

  const closeRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket_close').setLabel('Close Ticket').setEmoji('🔒').setStyle(ButtonStyle.Danger)
  );

  await channel.send({
    content: `<@${user.id}>`,
    embeds: [arkEmbed({
      color: colors.primary,
      title: `${emojis.ticket} Support Ticket`,
      description: `Hello **${user.username}**! Welcome to your support ticket.\n\nPlease describe your issue and a staff member will assist you shortly.`,
      footerText: 'Click the button below to close this ticket',
    })],
    components: [closeRow],
  });

  await interaction.reply({ content: `✅ Your ticket has been created: <#${channel.id}>`, ephemeral: true });
}

// ─── Close Ticket ─────────────────────────────────────────────────
async function closeTicket(interaction) {
  const channel = interaction.channel;
  if (!channel.name.startsWith('ticket-')) {
    return interaction.reply({ content: 'This is not a ticket channel.', ephemeral: true });
  }

  await interaction.reply({
    embeds: [arkEmbed({
      color: colors.error,
      description: '🔒 This ticket is being closed...',
    })]
  });

  setTimeout(() => channel.delete('Ticket closed').catch(() => {}), 3000);
}

module.exports = { createTicket, closeTicket };
