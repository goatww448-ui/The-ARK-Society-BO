const GuildSettings = require('../models/GuildSettings');
const { arkEmbed } = require('../utils/embedBuilder');
const { colors, automod, emojis } = require('../config/config');
const { sendLog } = require('../utils/helpers');

// Track join timestamps per guild
const joinTracker = new Map();

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    const { guild } = member;

    let settings;
    try {
      settings = await GuildSettings.findOne({ guildId: guild.id });
    } catch { return; }

    if (!settings?.antiRaid) return;

    const now = Date.now();
    if (!joinTracker.has(guild.id)) joinTracker.set(guild.id, []);

    const joins = joinTracker.get(guild.id).filter(t => now - t < automod.raidWindow);
    joins.push(now);
    joinTracker.set(guild.id, joins);

    if (joins.length >= automod.raidJoinThreshold) {
      // Auto-enable raid mode
      settings.raidMode = true;
      await settings.save();

      await sendLog(guild, arkEmbed({
        color: colors.error,
        title: `🚨 RAID DETECTED — Raid Mode Activated`,
        description: `**${joins.length}** members joined in the last **${automod.raidWindow / 1000}s**.\n\nRaid mode is now **active**. New joins will be kicked.\nUse \`/setup raidmode enabled:false\` to disable when safe.`,
      }), GuildSettings);

      // Alert in system channel if available
      const sysChannel = guild.systemChannel;
      if (sysChannel) {
        await sysChannel.send({
          embeds: [arkEmbed({
            color: colors.error,
            title: `🚨 RAID ALERT`,
            description: `A raid has been detected! Raid mode is now active.\n\nAll new joins are being kicked automatically.\n\nAdmins: use \`/setup raidmode enabled:false\` to disable.`,
          })]
        }).catch(() => {});
      }

      joinTracker.set(guild.id, []); // Reset tracker
    }
  },
};
