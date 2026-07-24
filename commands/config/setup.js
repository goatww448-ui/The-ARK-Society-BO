const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { success, error, info, arkEmbed } = require('../../utils/embedBuilder');
const GuildSettings = require('../../models/GuildSettings');
const { colors, emojis } = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Configure ARK Bot settings')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub => sub
      .setName('view')
      .setDescription('View current settings')
    )
    .addSubcommand(sub => sub
      .setName('logchannel')
      .setDescription('Set the moderation log channel')
      .addChannelOption(o => o.setName('channel').setDescription('Log channel').setRequired(true))
    )
    .addSubcommand(sub => sub
      .setName('welcomechannel')
      .setDescription('Set the welcome channel')
      .addChannelOption(o => o.setName('channel').setDescription('Welcome channel').setRequired(true))
    )
    .addSubcommand(sub => sub
      .setName('autorole')
      .setDescription('Set auto role on member join')
      .addRoleOption(o => o.setName('role').setDescription('Role to assign').setRequired(true))
    )
    .addSubcommand(sub => sub
      .setName('security')
      .setDescription('Set security level')
      .addStringOption(o => o.setName('level').setDescription('Security level').setRequired(true)
        .addChoices(
          { name: 'Low', value: 'low' },
          { name: 'Medium', value: 'medium' },
          { name: 'High', value: 'high' },
        ))
    )
    .addSubcommand(sub => sub
      .setName('antispam')
      .setDescription('Toggle anti-spam')
      .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable').setRequired(true))
    )
    .addSubcommand(sub => sub
      .setName('antilinks')
      .setDescription('Toggle anti-links filter')
      .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable').setRequired(true))
    )
    .addSubcommand(sub => sub
      .setName('aichannel')
      .setDescription('Set the AI chat channel')
      .addChannelOption(o => o.setName('channel').setDescription('AI channel (or none to disable)').setRequired(false))
    )
    .addSubcommand(sub => sub
      .setName('welcomemsg')
      .setDescription('Set custom welcome message')
      .addStringOption(o => o.setName('message').setDescription('Use {user}, {server}, {count}').setRequired(true))
    )
    .addSubcommand(sub => sub
      .setName('raidmode')
      .setDescription('Toggle raid mode (kicks all new joins)')
      .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable raid mode').setRequired(true))
    ),

  cooldown: 3,

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    let settings = await GuildSettings.findOne({ guildId });
    if (!settings) settings = new GuildSettings({ guildId });

    switch (sub) {
      case 'view': {
        await interaction.reply({
          embeds: [arkEmbed({
            color: colors.primary,
            title: `${emojis.shield} ARK Bot Settings — ${interaction.guild.name}`,
            fields: [
              { name: '📋 Log Channel',     value: settings.logChannel     ? `<#${settings.logChannel}>`     : 'Not set', inline: true },
              { name: '👋 Welcome Channel', value: settings.welcomeChannel ? `<#${settings.welcomeChannel}>` : 'Not set', inline: true },
              { name: '🎭 Auto Role',       value: settings.autoRole       ? `<@&${settings.autoRole}>`      : 'Not set', inline: true },
              { name: '🛡️ Anti-Spam',      value: settings.antiSpam    ? '✅ On' : '❌ Off', inline: true },
              { name: '🔗 Anti-Links',      value: settings.antiLinks   ? '✅ On' : '❌ Off', inline: true },
              { name: '💥 Anti-Raid',       value: settings.antiRaid    ? '✅ On' : '❌ Off', inline: true },
              { name: '🔒 Security Level',  value: settings.securityLevel.toUpperCase(), inline: true },
              { name: '🤖 AI Chat',         value: settings.aiEnabled   ? (settings.aiChannel ? `<#${settings.aiChannel}>` : '✅ On') : '❌ Off', inline: true },
              { name: '🚨 Raid Mode',       value: settings.raidMode    ? '🔴 ACTIVE' : '🟢 Off', inline: true },
            ],
          })]
        });
        break;
      }
      case 'logchannel': {
        settings.logChannel = interaction.options.getChannel('channel').id;
        await settings.save();
        await interaction.reply({ embeds: [success('Log Channel Set', `Logs will be sent to <#${settings.logChannel}>.`)] });
        break;
      }
      case 'welcomechannel': {
        settings.welcomeChannel = interaction.options.getChannel('channel').id;
        await settings.save();
        await interaction.reply({ embeds: [success('Welcome Channel Set', `Welcome messages will go to <#${settings.welcomeChannel}>.`)] });
        break;
      }
      case 'autorole': {
        settings.autoRole = interaction.options.getRole('role').id;
        await settings.save();
        await interaction.reply({ embeds: [success('Auto Role Set', `New members will receive <@&${settings.autoRole}>.`)] });
        break;
      }
      case 'security': {
        settings.securityLevel = interaction.options.getString('level');
        if (settings.securityLevel === 'high') {
          settings.antiSpam = true;
          settings.antiRaid = true;
          settings.antiMention = true;
          settings.antiGhostPing = true;
        }
        await settings.save();
        await interaction.reply({ embeds: [success('Security Level Updated', `Security is now set to **${settings.securityLevel.toUpperCase()}**.`)] });
        break;
      }
      case 'antispam': {
        settings.antiSpam = interaction.options.getBoolean('enabled');
        await settings.save();
        await interaction.reply({ embeds: [success('Anti-Spam Updated', `Anti-spam is now **${settings.antiSpam ? 'enabled' : 'disabled'}**.`)] });
        break;
      }
      case 'antilinks': {
        settings.antiLinks = interaction.options.getBoolean('enabled');
        await settings.save();
        await interaction.reply({ embeds: [success('Anti-Links Updated', `Anti-links is now **${settings.antiLinks ? 'enabled' : 'disabled'}**.`)] });
        break;
      }
      case 'aichannel': {
        const ch = interaction.options.getChannel('channel');
        settings.aiChannel = ch?.id ?? null;
        settings.aiEnabled = !!ch;
        await settings.save();
        await interaction.reply({ embeds: [success('AI Channel', ch ? `AI chat set to <#${ch.id}>.` : 'AI channel chat disabled.')] });
        break;
      }
      case 'welcomemsg': {
        settings.welcomeMessage = interaction.options.getString('message');
        await settings.save();
        await interaction.reply({ embeds: [success('Welcome Message Set', `New message: *${settings.welcomeMessage}*`)] });
        break;
      }
      case 'raidmode': {
        settings.raidMode = interaction.options.getBoolean('enabled');
        await settings.save();
        await interaction.reply({ embeds: [arkEmbed({
          color: settings.raidMode ? colors.error : colors.success,
          title: `🚨 Raid Mode ${settings.raidMode ? 'ACTIVATED' : 'Deactivated'}`,
          description: settings.raidMode
            ? '⚠️ **All new joins will be kicked automatically!** Disable when raid is over.'
            : '✅ Raid mode disabled. New members can join normally.',
        })] });
        break;
      }
    }
  },
};
