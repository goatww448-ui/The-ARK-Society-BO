const { ActivityType } = require('discord.js');
const { emojis } = require('../config/config');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`[ARK] ✅ Logged in as ${client.user.tag}`);
    console.log(`[ARK] 🌐 Serving ${client.guilds.cache.size} server(s)`);

    // Rotating status messages
    const statuses = [
      { name: '🛡️ The ARK Society', type: ActivityType.Watching },
      { name: '/help | ARK Bot', type: ActivityType.Playing },
      { name: `${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} members`, type: ActivityType.Watching },
    ];

    let i = 0;
    const setStatus = () => {
      client.user.setPresence({
        activities: [statuses[i % statuses.length]],
        status: 'dnd',
      });
      i++;
    };

    setStatus();
    setInterval(setStatus, 15000);

    // Start giveaway checker
    require('../utils/giveawayChecker')(client);
  },
};
