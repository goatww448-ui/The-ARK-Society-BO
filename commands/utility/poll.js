const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { arkEmbed, error } = require('../../utils/embedBuilder');
const { colors, emojis } = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a poll')
    .addStringOption(o => o.setName('question').setDescription('Poll question').setRequired(true))
    .addStringOption(o => o.setName('option1').setDescription('Option 1').setRequired(true))
    .addStringOption(o => o.setName('option2').setDescription('Option 2').setRequired(true))
    .addStringOption(o => o.setName('option3').setDescription('Option 3').setRequired(false))
    .addStringOption(o => o.setName('option4').setDescription('Option 4').setRequired(false)),

  cooldown: 15,

  async execute(interaction) {
    const question = interaction.options.getString('question');
    const options  = [
      interaction.options.getString('option1'),
      interaction.options.getString('option2'),
      interaction.options.getString('option3'),
      interaction.options.getString('option4'),
    ].filter(Boolean);

    const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];
    const optionList = options.map((opt, i) => `${numberEmojis[i]} ${opt}`).join('\n');

    const msg = await interaction.channel.send({
      embeds: [arkEmbed({
        color: colors.primary,
        title: `📊 Poll — ${question}`,
        description: optionList,
        footerText: `Poll by ${interaction.user.tag}`,
      })]
    });

    for (let i = 0; i < options.length; i++) {
      await msg.react(numberEmojis[i]);
    }

    await interaction.reply({ content: '✅ Poll created!', ephemeral: true });
  },
};
