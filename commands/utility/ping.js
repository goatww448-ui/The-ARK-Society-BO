const { SlashCommandBuilder } = require('discord.js');
const { arkEmbed } = require('../../utils/embedBuilder');
const { colors, emojis } = require('../../config/config');
const os = require('os');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot latency and status'),

  cooldown: 5,

  async execute(interaction, client) {
    const sent = await interaction.deferReply({ fetchReply: true });
    const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;
    const wsLatency = client.ws.ping;

    const statusBar = (ms) => {
      if (ms < 100) return '🟢 Excellent';
      if (ms < 200) return '🟡 Good';
      if (ms < 400) return '🟠 Fair';
      return '🔴 Poor';
    };

    const uptime = process.uptime();
    const d = Math.floor(uptime / 86400);
    const h = Math.floor((uptime % 86400) / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const uptimeStr = `${d}d ${h}h ${m}m`;

    const memUsed = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    const memTotal = Math.round(os.totalmem() / 1024 / 1024);

    await interaction.editReply({
      embeds: [arkEmbed({
        color: wsLatency < 200 ? colors.success : colors.warning,
        title: `${emojis.ark} ARK Bot Status`,
        fields: [
          { name: '📡 WebSocket',   value: `${wsLatency}ms — ${statusBar(wsLatency)}`, inline: true },
          { name: '⏱️ Roundtrip',   value: `${roundtrip}ms — ${statusBar(roundtrip)}`, inline: true },
          { name: '⏰ Uptime',       value: uptimeStr,                                  inline: true },
          { name: '💾 Memory',       value: `${memUsed}MB used`,                        inline: true },
          { name: '🌐 Servers',      value: `${client.guilds.cache.size}`,               inline: true },
          { name: '👥 Users',        value: `${client.users.cache.size}`,                inline: true },
        ],
        footerText: `Node ${process.version} • discord.js v14`,
      })]
    });
  },
};
