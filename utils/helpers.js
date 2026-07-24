const { PermissionFlagsBits } = require('discord.js');
const { error } = require('./embedBuilder');

// ─── Permission Check ────────────────────────────────────────────
async function checkPermissions(interaction, targetMember = null) {
  const botMember = interaction.guild.members.me;
  const executor  = interaction.member;

  // Bot needs ADMINISTRATOR or at least manage roles/members
  if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
    await interaction.reply({ embeds: [error('Missing Permissions', 'I need **Manage Roles** permission.')], ephemeral: true });
    return false;
  }

  // Executor must outrank target
  if (targetMember) {
    if (targetMember.id === interaction.guild.ownerId) {
      await interaction.reply({ embeds: [error('Role Hierarchy', 'You cannot take action on the server owner.')], ephemeral: true });
      return false;
    }
    if (executor.roles.highest.position <= targetMember.roles.highest.position) {
      await interaction.reply({ embeds: [error('Role Hierarchy', 'You cannot take action on someone with equal or higher roles.')], ephemeral: true });
      return false;
    }
    if (botMember.roles.highest.position <= targetMember.roles.highest.position) {
      await interaction.reply({ embeds: [error('Role Hierarchy', 'My role is not high enough to take action on this member.')], ephemeral: true });
      return false;
    }
  }

  return true;
}

// ─── Parse Duration String ───────────────────────────────────────
// e.g. "1h", "30m", "7d" → milliseconds
function parseDuration(str) {
  const map = { s: 1000, m: 60000, h: 3600000, d: 86400000, w: 604800000 };
  const match = str.match(/^(\d+)([smhdw])$/i);
  if (!match) return null;
  return parseInt(match[1]) * (map[match[2].toLowerCase()] || 0);
}

// ─── Format Duration ─────────────────────────────────────────────
function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

// ─── Send to Log Channel ─────────────────────────────────────────
async function sendLog(guild, embed, GuildSettings) {
  try {
    const settings = await GuildSettings.findOne({ guildId: guild.id });
    if (!settings?.logChannel) return;
    const channel = guild.channels.cache.get(settings.logChannel);
    if (channel) await channel.send({ embeds: [embed] });
  } catch { /* silent */ }
}

module.exports = { checkPermissions, parseDuration, formatDuration, sendLog };
