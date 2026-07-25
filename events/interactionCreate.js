const { error } = require('../utils/embedBuilder');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // ─── Slash Commands ───────────────────────────────────────
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      // Cooldown check
      if (!client.cooldowns.has(command.data.name)) {
        client.cooldowns.set(command.data.name, new Map());
      }
      const now = Date.now();
      const timestamps = client.cooldowns.get(command.data.name);
      const cooldown = (command.cooldown ?? 3) * 1000;

      if (timestamps.has(interaction.user.id)) {
        const expiry = timestamps.get(interaction.user.id) + cooldown;
        if (now < expiry) {
          const left = ((expiry - now) / 1000).toFixed(1);
          return interaction.reply({
            embeds: [error('Cooldown', `Please wait **${left}s** before using \`/${command.data.name}\` again.`)],
            ephemeral: true,
          });
        }
      }
      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldown);

      try {
        await command.execute(interaction, client);
      } catch (err) {
        console.error(`[CMD] Error in /${interaction.commandName}:`, err);
        const reply = { embeds: [error('Command Error', 'Something went wrong. Please try again.')], ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply).catch(() => {});
        } else {
          await interaction.reply(reply).catch(() => {});
        }
      }
    }

    // ─── Buttons ─────────────────────────────────────────────
    if (interaction.isButton()) {
      // Giveaway join button
      if (interaction.customId.startsWith('giveaway_join_')) {
        const { handleGiveawayJoin } = require('../utils/giveawayHandler');
        await handleGiveawayJoin(interaction);
      }
      // Ticket buttons
      if (interaction.customId === 'ticket_create') {
        const { createTicket } = require('../utils/ticketHandler');
        await createTicket(interaction);
      }
      if (interaction.customId === 'ticket_close') {
        const { closeTicket } = require('../utils/ticketHandler');
        await closeTicket(interaction);
      }
    }

    // ─── Select Menus ─────────────────────────────────────────
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'reaction_roles') {
        const { handleReactionRole } = require('../utils/reactionRoles');
        await handleReactionRole(interaction);
      }
    }
  },
};
