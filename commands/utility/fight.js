const { SlashCommandBuilder } = require('discord.js');
const { arkEmbed, error, success } = require('../../utils/embedBuilder');
const { getEconomy } = require('../../utils/economyHelper');
const { colors } = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fight')
    .setDescription('Challenge another member to a battle!')
    .addUserOption(o => o.setName('opponent').setDescription('Who do you want to fight?').setRequired(true)),

  cooldown: 30,

  async execute(interaction) {
    const opponent = interaction.options.getMember('opponent');

    if (!opponent) return interaction.reply({ embeds: [error('Not Found', 'User not found.')], ephemeral: true });
    if (opponent.id === interaction.user.id) return interaction.reply({ embeds: [error('Invalid', 'You cannot fight yourself!')], ephemeral: true });
    if (opponent.user.bot) return interaction.reply({ embeds: [error('Invalid', 'You cannot fight a bot!')], ephemeral: true });

    const attackerEco  = await getEconomy(interaction.user.id, interaction.guild.id);
    const defenderEco  = await getEconomy(opponent.id, interaction.guild.id);

    // Calculate stats
    const attackerPower = attackerEco.battle.power + Math.floor(Math.random() * 20);
    const defenderPower = defenderEco.battle.power + Math.floor(Math.random() * 20);
    const attackerArmor = attackerEco.battle.armor;
    const defenderArmor = defenderEco.battle.armor;

    // Simulate battle
    let attackerHp = 100 + (attackerArmor * 2);
    let defenderHp = 100 + (defenderArmor * 2);

    const rounds = [];
    let round = 1;

    while (attackerHp > 0 && defenderHp > 0 && round <= 5) {
      const atkDmg = Math.max(1, attackerPower - Math.floor(defenderArmor / 2) + Math.floor(Math.random() * 10));
      const defDmg = Math.max(1, defenderPower - Math.floor(attackerArmor / 2) + Math.floor(Math.random() * 10));

      defenderHp  -= atkDmg;
      attackerHp  -= defDmg;

      rounds.push(`**Round ${round}:** ${interaction.user.username} dealt **${atkDmg}** dmg | ${opponent.user.username} dealt **${defDmg}** dmg`);
      round++;
    }

    const attackerWon = attackerHp > defenderHp;
    const winner = attackerWon ? interaction.user : opponent.user;
    const loser  = attackerWon ? opponent.user : interaction.user;
    const winnerEco = attackerWon ? attackerEco : defenderEco;
    const loserEco  = attackerWon ? defenderEco : attackerEco;

    // Rewards
    const coinsWon = Math.floor(Math.random() * 300) + 100;
    winnerEco.coins += coinsWon;
    winnerEco.battle.wins += 1;
    loserEco.battle.losses += 1;

    // Steal some coins from loser
    const stolenCoins = Math.min(Math.floor(loserEco.coins * 0.1), 500);
    if (stolenCoins > 0) {
      loserEco.coins  -= stolenCoins;
      winnerEco.coins += stolenCoins;
    }

    await winnerEco.save();
    await loserEco.save();

    await interaction.reply({
      embeds: [arkEmbed({
        color: attackerWon ? colors.success : colors.error,
        title: `⚔️ Battle Result — ${winner.username} Wins!`,
        description: rounds.join('\n'),
        fields: [
          { name: '🏆 Winner',      value: `**${winner.username}**`,                              inline: true },
          { name: '💀 Loser',       value: `**${loser.username}**`,                               inline: true },
          { name: '💰 Coins Won',   value: `**+${coinsWon + stolenCoins}** coins`,                inline: true },
          { name: '📊 Final HP',    value: `${winner.username}: **${Math.max(0, attackerWon ? attackerHp : defenderHp)} HP**`, inline: true },
          { name: '⚔️ Attacker Power', value: `${attackerPower}`,                                inline: true },
          { name: '🛡️ Defender Power', value: `${defenderPower}`,                                inline: true },
        ],
        footerText: `${loser.username} lost ${stolenCoins} coins!`,
      })]
    });
  },
};
