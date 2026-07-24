const Giveaway = require('../models/Giveaway');
const { endGiveaway } = require('./giveawayHandler');

// ─── Giveaway Auto-End Checker ───────────────────────────────────
// Runs every 15 seconds to check for expired giveaways
module.exports = function startGiveawayChecker(client) {
  setInterval(async () => {
    try {
      const expired = await Giveaway.find({
        ended: false,
        endsAt: { $lte: new Date() },
      });

      for (const giveaway of expired) {
        await endGiveaway(client, giveaway);
      }
    } catch { /* silent */ }
  }, 15000);

  console.log('[ARK] ✅ Giveaway checker started');
};
