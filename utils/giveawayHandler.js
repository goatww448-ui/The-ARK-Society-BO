const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Giveaway = require('../models/Giveaway');
const { arkEmbed } = require('./embedBuilder');
const { colors, emojis } = require('../config/config');

// ─── Handle Giveaway Join Button ─────────────────────────────────
async function handleGiveawayJoin(interaction) {
  const messageId = interaction.customId.replace('giveaway_join_', '');
  const giveaway  = await Giveaway.findOne({ messageId, guildId: interaction.guild.id });

  if (!giveaway) return interaction.reply({ content: 'This giveaway no longer exists.', ephemeral: true });
  if (giveaway.ended) return interaction.reply({ content: 'This giveaway has already ended.', ephemeral: true });
  if (Date.now() > giveaway.endsAt.getTime()) return interaction.reply({ content: 'This giveaway has expired.', ephemeral: true });

  const userId = interaction.user.id;

  // Check required role
  if (giveaway.requiredRole) {
    const haRole = interaction.member.roles.cache.has(giveaway.requiredRole);
    if (!haRole) return interaction.reply({ content: `❌ You need <@&${giveaway.requiredRole}> to enter this giveaway.`, ephemeral: true });
  }

  // Check account age
  if (giveaway.minAccountAge > 0) {
    const ageDays = (Date.now() - interaction.user.createdTimestamp) / 86400000;
    if (ageDays < giveaway.minAccountAge) {
      return interaction.reply({ content: `❌ Your account must be at least **${giveaway.minAccountAge} days** old to enter.`, ephemeral: true });
    }
  }

  // Toggle entry
  const idx = giveaway.participants.indexOf(userId);
  if (idx > -1) {
    giveaway.participants.splice(idx, 1);
    await giveaway.save();
    await updateGiveawayEmbed(interaction, giveaway);
    return interaction.reply({ content: '✅ You have **left** the giveaway.', ephemeral: true });
  } else {
    giveaway.participants.push(userId);
    await giveaway.save();
    await updateGiveawayEmbed(interaction, giveaway);
    return interaction.reply({ content: '🎉 You have **entered** the giveaway! Good luck!', ephemeral: true });
  }
}

// ─── Update Embed with Entry Count ───────────────────────────────
async function updateGiveawayEmbed(interaction, giveaway) {
  try {
    const msg = await interaction.channel.messages.fetch(giveaway.messageId);
    const embed = msg.embeds[0];
    if (!embed) return;

    const updated = arkEmbed({
      color: colors.purple,
      title: embed.title,
      description: embed.description.replace(/👥 \*\*Entries:\*\* \d+/, `👥 **Entries:** ${giveaway.participants.length}`),
      footerText: embed.footer?.text,
    });

    await msg.edit({ embeds: [updated] });
  } catch { /* silent */ }
}

// ─── End Giveaway ────────────────────────────────────────────────
async function endGiveaway(client, giveaway) {
  if (giveaway.ended) return;

  giveaway.ended = true;

  const guild   = client.guilds.cache.get(giveaway.guildId);
  const channel = guild?.channels.cache.get(giveaway.channelId);

  let winnersText = '❌ No valid entries.';
  const winners = [];

  if (giveaway.participants.length > 0) {
    const pool = [...giveaway.participants];
    for (let i = 0; i < Math.min(giveaway.winners, pool.length); i++) {
      const idx = Math.floor(Math.random() * pool.length);
      winners.push(pool.splice(idx, 1)[0]);
    }
    giveaway.winnerIds = winners;
    winnersText = winners.map(id => `<@${id}>`).join(', ');
  }

  await giveaway.save();

  if (channel) {
    // Update original message
    try {
      const msg = await channel.messages.fetch(giveaway.messageId);
      const disabledRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('giveaway_ended')
          .setLabel('Giveaway Ended')
          .setEmoji('🔒')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      );
      await msg.edit({
        embeds: [arkEmbed({
          color: 0x555555,
          title: `🎉 GIVEAWAY ENDED — ${giveaway.prize}`,
          description: `🏆 **Winner(s):** ${winnersText}\n👥 **Total Entries:** ${giveaway.participants.length}`,
          footerText: 'Giveaway ended',
        })],
        components: [disabledRow],
      });
    } catch { /* message might be deleted */ }

    // Announce winners
    if (winners.length > 0) {
      await channel.send({
        content: winners.map(id => `<@${id}>`).join(' '),
        embeds: [arkEmbed({
          color: colors.purple,
          title: `${emojis.gift} Congratulations!`,
          description: `${winnersText} won **${giveaway.prize}**!\n\nThank you to everyone who entered! 🎊`,
        })]
      });
    } else {
      await channel.send({
        embeds: [arkEmbed({
          color: colors.error,
          title: '🎉 Giveaway Ended',
          description: `The giveaway for **${giveaway.prize}** ended with no valid entries.`,
        })]
      });
    }
  }
}

module.exports = { handleGiveawayJoin, endGiveaway };
