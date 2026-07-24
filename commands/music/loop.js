const { SlashCommandBuilder } = require('discord.js');
const { success, error } = require('../../utils/embedBuilder');
const { QueueRepeatMode } = require('discord-player');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Set loop mode for the queue')
    .addStringOption(o => o.setName('mode').setDescription('Loop mode').setRequired(true)
      .addChoices(
        { name: 'Off',        value: 'off' },
        { name: 'Track',      value: 'track' },
        { name: 'Queue',      value: 'queue' },
        { name: 'Autoplay',   value: 'autoplay' },
      )),

  cooldown: 3,

  async execute(interaction) {
    const { useQueue } = require('discord-player');
    const queue = useQueue(interaction.guild.id);
    if (!queue?.isPlaying()) return interaction.reply({ embeds: [error('Not Playing', 'Nothing is playing.')], ephemeral: true });

    const modeMap = {
      off:      QueueRepeatMode.OFF,
      track:    QueueRepeatMode.TRACK,
      queue:    QueueRepeatMode.QUEUE,
      autoplay: QueueRepeatMode.AUTOPLAY,
    };
    const modeLabel = { off: '🔇 Off', track: '🔂 Track', queue: '🔁 Queue', autoplay: '♾️ Autoplay' };

    const mode = interaction.options.getString('mode');
    queue.setRepeatMode(modeMap[mode]);
    await interaction.reply({ embeds: [success('Loop Mode Set', `Loop mode set to **${modeLabel[mode]}**`)] });
  },
};
