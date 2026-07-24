const GuildSettings = require('../models/GuildSettings');

// ─── Handle Reaction Role Select Menu ───────────────────────────
async function handleReactionRole(interaction) {
  const roleId = interaction.values[0];
  const member = interaction.member;

  try {
    const role = interaction.guild.roles.cache.get(roleId);
    if (!role) return interaction.reply({ content: '❌ Role not found.', ephemeral: true });

    if (member.roles.cache.has(roleId)) {
      await member.roles.remove(role);
      await interaction.reply({ content: `✅ Removed role **${role.name}**.`, ephemeral: true });
    } else {
      await member.roles.add(role);
      await interaction.reply({ content: `✅ Added role **${role.name}**.`, ephemeral: true });
    }
  } catch (err) {
    await interaction.reply({ content: `❌ Failed to assign role: ${err.message}`, ephemeral: true });
  }
}

module.exports = { handleReactionRole };
