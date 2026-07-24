const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { success, error, modLog } = require('../../utils/embedBuilder');
const { checkPermissions, sendLog } = require('../../utils/helpers');
const User = require('../../models/User');
const GuildSettings = require('../../models/GuildSettings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a member')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('user').setDescription('User to warn').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for warning').setRequired(true)),

  cooldown: 3,

  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason');

    if (!target) return interaction.reply({ embeds: [error('Not Found', 'User not in server.')], ephemeral: true });
    if (!(await checkPermissions(interaction, target))) return;

    // Save warn to DB
    let userData = await User.findOne({ userId: target.id, guildId: interaction.guild.id });
    if (!userData) userData = new User({ userId: target.id, guildId: interaction.guild.id });

    const caseId = userData.warns.length + 1;
    userData.warns.push({ reason, moderatorId: interaction.user.id, caseId });
    userData.infractions += 1;
    await userData.save();

    await interaction.reply({
      embeds: [success('Member Warned', `**${target.user.tag}** has been warned.\n**Reason:** ${reason}\n**Total Warnings:** ${userData.warns.length}`)]
    });

    // DM the user
    await target.user.send({
      embeds: [error(`Warning in ${interaction.guild.name}`, `You have been warned.\n**Reason:** ${reason}\n**Total Warnings:** ${userData.warns.length}`)]
    }).catch(() => {});

    await sendLog(interaction.guild, modLog('Warn', [
      { name: 'User',      value: `${target.user.tag} (${target.id})`, inline: true },
      { name: 'Case ID',   value: `#${caseId}`,                        inline: true },
      { name: 'Moderator', value: interaction.user.tag,                inline: true },
      { name: 'Reason',    value: reason,                              inline: false },
    ], interaction.user.tag), GuildSettings);
  },
};
