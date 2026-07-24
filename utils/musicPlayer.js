const { Player } = require('discord-player');
const { SpotifyExtractor } = require('@discord-player/extractor');
const { SoundCloudExtractor } = require('@discord-player/extractor');

// ─── Initialize Music Player ─────────────────────────────────────
async function initPlayer(client) {
  const player = new Player(client);

  // Load extractors one by one
  try { await player.extractors.register(SpotifyExtractor, {}); } catch {}
  try { await player.extractors.register(SoundCloudExtractor, {}); } catch {}

  // Try to load YouTube
  try {
    const { YouTubeExtractor } = require('@discord-player/extractor');
    await player.extractors.register(YouTubeExtractor, {});
    console.log('[ARK] ✅ YouTube extractor loaded');
  } catch {
    console.log('[ARK] YouTube extractor not available');
  }

  player.events.on('playerStart', (queue, track) => {
    queue.metadata?.send({
      embeds: [{
        color: 0x0066FF,
        title: '🎵 Now Playing',
        description: `**[${track.title}](${track.url})**`,
        thumbnail: { url: track.thumbnail },
        fields: [
          { name: '👤 Artist',   value: track.author || 'Unknown', inline: true },
          { name: '⏱️ Duration', value: track.duration || 'Live',  inline: true },
        ],
        footer: { text: 'ARK Society Music' },
      }]
    }).catch(() => {});
  });

  player.events.on('emptyQueue', queue => {
    queue.metadata?.send('✅ Queue finished!').catch(() => {});
  });

  player.events.on('error', (queue, err) => {
    console.error('[Music] Error:', err.message);
  });

  console.log('[ARK] ✅ Music player initialized');
  return player;
}

module.exports = { initPlayer };
