// ─── ARK Society Bot Config ──────────────────────────────────────
module.exports = {
  // Brand Colors
  colors: {
    primary:   0x0066FF,  // Blue glow
    success:   0x00FF88,  // Green
    error:     0xFF3355,  // Red
    warning:   0xFFAA00,  // Amber
    info:      0x00CFFF,  // Cyan
    dark:      0x0D0D1A,  // Dark background
    purple:    0x7B2FFF,  // Purple accent
  },

  // Emojis
  emojis: {
    success:  '✅',
    error:    '❌',
    warning:  '⚠️',
    loading:  '⏳',
    shield:   '🛡️',
    music:    '🎵',
    gift:     '🎉',
    ai:       '🤖',
    mod:      '🔨',
    lock:     '🔒',
    ban:      '🚫',
    kick:     '👢',
    mute:     '🔇',
    warn:     '⚠️',
    star:     '⭐',
    crown:    '👑',
    fire:     '🔥',
    chart:    '📊',
    ticket:   '🎫',
    log:      '📋',
    ark:      '🌐',
  },

  // Auto-mod thresholds
  automod: {
    spamMessageCount:    5,    // msgs in spamInterval ms = spam
    spamInterval:        4000, // ms window for spam detection
    maxMentions:         5,    // max @mentions per message
    maxDuplicates:       3,    // duplicate messages before action
    raidJoinThreshold:   8,    // joins in raidWindow ms = raid
    raidWindow:          10000,// ms window for raid detection
  },

  // Giveaway defaults
  giveaway: {
    defaultDuration: 86400000, // 24 hours in ms
    minDuration:     60000,    // 1 minute
    maxWinners:      20,
  },

  // Music defaults
  music: {
    defaultVolume: 80,
    maxQueueSize:  100,
    leaveOnEmpty:  true,
    leaveTimeout:  30000, // 30s
  },

  // Level system
  levels: {
    xpPerMessage:    { min: 10, max: 25 },
    xpCooldown:      60000, // 1 minute
    levelMultiplier: 300,   // XP needed = level * multiplier
  },

  // Footer branding
  footer: {
    text: 'The ARK Society',
    icon: null, // set to bot avatar URL at runtime if desired
  },
};
