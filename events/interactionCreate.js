const { error } = require('../utils/embedBuilder');
const { useQueue } = require('discord-player');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {

    // ─── Slash Commands ───────────────────────────────────────
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      if (!client.cooldowns.has(command.data.name)) client.cooldowns.set(command.data.name, new Map());
      const now = Date.now();
      const timestamps = client.cooldowns.get(command.data.name);
      const cooldown = (command.cooldown ?? 3) * 1000;

      if (timestamps.has(interaction.user.id)) {
        const expiry = timestamps.get(interaction.user.id) + cooldown;
        if (now < expiry) {
          const left = ((expiry - now) / 1000).toFixed(1);
          return interaction.reply({
            embeds: [error('Cooldown', `Wait **${left}s** before using this again.`)],
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
        const reply = { embeds: [error('Error', 'Something went wrong.')], ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply).catch(() => {});
        } else {
          await interaction.reply(reply).catch(() => {});
        }
      }
    }

    // ─── Music Buttons ────────────────────────────────────────
    if (interaction.isButton()) {
      const queue = useQueue(interaction.guild.id);

      if (interaction.customId === 'music_pause') {
        if (!queue?.isPlaying()) return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });
        const paused = queue.node.isPaused();
        paused ? queue.node.resume() : queue.node.pause();
        await interaction.reply({ content: paused ? '▶️ Resumed!' : '⏸️ Paused!', ephemeral: true });
      }

      if (interaction.customId === 'music_skip') {
        if (!queue?.isPlaying()) return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });
        queue.node.skip();
        await interaction.reply({ content: '⏭️ Skipped!', ephemeral: true });
      }

      if (interaction.customId === 'music_stop') {
        if (!queue) return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });
        queue.delete();
        await interaction.reply({ content: '⏹️ Music stopped!', ephemeral: true });
      }

      if (interaction.customId === 'music_queue') {
        if (!queue?.tracks.size) return interaction.reply({ content: '❌ Queue is empty!', ephemeral: true });
        const tracks = queue.tracks.toArray().slice(0, 10);
        const list = tracks.map((t, i) => `**${i + 1}.** ${t.title} — ${t.duration}`).join('\n');
        await interaction.reply({ content: `📋 **Queue:**\n${list}`, ephemeral: true });
      }

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
