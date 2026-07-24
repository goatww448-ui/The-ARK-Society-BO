const GuildSettings = require('../models/GuildSettings');
const User = require('../models/User');
const { colors, automod, levels, emojis } = require('../config/config');
const { arkEmbed, warning } = require('../utils/embedBuilder');
const { sendLog } = require('../utils/helpers');

// ─── Spam tracking maps ──────────────────────────────────────────
const spamMap   = new Map(); // userId → [timestamps]
const warnMap   = new Map(); // userId → infraction count

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    let settings;
    try {
      settings = await GuildSettings.findOne({ guildId: message.guild.id });
    } catch { return; }

    if (!settings) return;

    // ─── Auto Moderation ──────────────────────────────────────
    if (await runAutoMod(message, settings, client)) return;

    // ─── AI Chat Channel ──────────────────────────────────────
    if (settings.aiEnabled && settings.aiChannel && message.channel.id === settings.aiChannel) {
      await handleAIChat(message);
      return;
    }

    // ─── Leveling System ─────────────────────────────────────
    if (settings.levelEnabled) {
      await handleXP(message);
    }
  },
};

// ─── Auto Mod Logic ───────────────────────────────────────────────
async function runAutoMod(message, settings, client) {
  const { content, author, guild, channel, member } = message;
  const userId = author.id;

  // Skip admins/mods
  if (member.permissions.has('Administrator') || member.permissions.has('ManageMessages')) return false;

  let violated = false;
  let reason = '';

  // ── Anti Spam ──────────────────────────────────────────────
  if (settings.antiSpam) {
    const now = Date.now();
    if (!spamMap.has(userId)) spamMap.set(userId, []);
    const timestamps = spamMap.get(userId).filter(t => now - t < automod.spamInterval);
    timestamps.push(now);
    spamMap.set(userId, timestamps);

    if (timestamps.length >= automod.spamMessageCount) {
      violated = true;
      reason = 'Spamming messages';
      spamMap.delete(userId);
    }
  }

  // ── Anti Mass Mention ──────────────────────────────────────
  if (!violated && settings.antiMention) {
    const mentionCount = (content.match(/<@[!&]?\d+>/g) || []).length;
    if (mentionCount >= automod.maxMentions) {
      violated = true;
      reason = `Mass mention (${mentionCount} mentions)`;
    }
  }

  // ── Anti Links ─────────────────────────────────────────────
  if (!violated && settings.antiLinks) {
    const urlRegex = /https?:\/\/[^\s]+/gi;
    const urls = content.match(urlRegex) || [];
    const allowed = settings.allowedLinks || [];
    const suspicious = urls.filter(u => !allowed.some(a => u.includes(a)));
    if (suspicious.length > 0) {
      violated = true;
      reason = 'Posting unauthorized links';
    }
  }

  // ── Token / Key Detection ──────────────────────────────────
  const tokenRegex = /[MN][A-Za-z\d]{23}\.[\w-]{6}\.[\w-]{27}/;
  const apiKeyRegex = /sk-[a-zA-Z0-9]{32,}/;
  if (tokenRegex.test(content) || apiKeyRegex.test(content)) {
    await message.delete().catch(() => {});
    await message.channel.send({
      embeds: [arkEmbed({
        color: 0xFF0000,
        title: `${emojis.shield} Security Alert`,
        description: `${author}, a **potential token/API key** was detected in your message and removed.\n\n> If this was your token, **regenerate it immediately**!`,
      })]
    });
    await sendLog(guild, arkEmbed({
      color: 0xFF0000,
      title: '🔑 Token/Key Leak Detected',
      fields: [
        { name: 'User', value: `${author.tag} (${author.id})`, inline: true },
        { name: 'Channel', value: `<#${channel.id}>`, inline: true },
      ],
    }), GuildSettings);
    return true;
  }

  // ── Scam Link Detection ────────────────────────────────────
  const scamPatterns = [/discord\.gift\/[a-zA-Z0-9]+/, /free.*nitro/i, /steamcommunity\.com\/tradeoffer/i];
  if (scamPatterns.some(p => p.test(content))) {
    violated = true;
    reason = 'Potential scam link';
  }

  // ── Word Blacklist ─────────────────────────────────────────
  if (!violated && settings.wordBlacklist?.length) {
    const lower = content.toLowerCase();
    const found = settings.wordBlacklist.find(w => lower.includes(w.toLowerCase()));
    if (found) {
      violated = true;
      reason = `Blacklisted word detected`;
    }
  }

  // ── Take Action ────────────────────────────────────────────
  if (violated) {
    await message.delete().catch(() => {});
    await channel.send({
      embeds: [warning('Auto-Moderation', `${author}, your message was removed. **Reason:** ${reason}`)],
    }).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));

    // Track infractions
    const count = (warnMap.get(userId) || 0) + 1;
    warnMap.set(userId, count);

    // Escalating punishments
    if (count === 3) {
      await member.timeout(5 * 60 * 1000, `AutoMod: ${reason}`).catch(() => {});
    } else if (count >= 5) {
      await member.timeout(60 * 60 * 1000, `AutoMod: Repeated violations`).catch(() => {});
      warnMap.set(userId, 0);
    }

    // Log it
    await sendLog(guild, arkEmbed({
      color: 0xFF6600,
      title: `${emojis.shield} AutoMod Action`,
      fields: [
        { name: 'User',    value: `${author.tag} (${userId})`, inline: true },
        { name: 'Channel', value: `<#${channel.id}>`,          inline: true },
        { name: 'Reason',  value: reason,                      inline: false },
        { name: 'Infractions', value: `${count}`,              inline: true },
      ],
    }), GuildSettings);

    return true;
  }

  return false;
}

// ─── XP / Leveling ────────────────────────────────────────────────
async function handleXP(message) {
  try {
    let user = await User.findOne({ userId: message.author.id, guildId: message.guild.id });
    if (!user) user = new User({ userId: message.author.id, guildId: message.guild.id });

    const now = Date.now();
    if (user.lastXpTime && now - user.lastXpTime.getTime() < levels.xpCooldown) return;

    const xpGain = Math.floor(Math.random() * (levels.xpPerMessage.max - levels.xpPerMessage.min + 1)) + levels.xpPerMessage.min;
    user.xp += xpGain;
    user.totalXp += xpGain;
    user.lastXpTime = now;

    // Check level up
    const xpNeeded = (user.level + 1) * levels.levelMultiplier;
    if (user.xp >= xpNeeded) {
      user.xp -= xpNeeded;
      user.level += 1;
      await message.channel.send({
        embeds: [arkEmbed({
          color: 0x7B2FFF,
          title: `${emojis.star} Level Up!`,
          description: `${message.author} reached **Level ${user.level}**! 🎉`,
        })]
      });
    }

    await user.save();
  } catch { /* silent */ }
}

// ─── AI Chat Channel ──────────────────────────────────────────────
async function handleAIChat(message) {
  try {
    const { getAIResponse } = require('../utils/aiHandler');
    const typing = await message.channel.sendTyping();
    const response = await getAIResponse(message.author.id, message.content);
    await message.reply({
      embeds: [arkEmbed({
        color: 0x0066FF,
        description: `${emojis.ai} ${response}`,
        footerText: 'ARK AI',
      })]
    });
  } catch { /* silent */ }
}

const { arkEmbed: _arkEmbed } = require('../utils/embedBuilder');
