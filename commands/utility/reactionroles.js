const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { arkEmbed, success, error } = require('../../utils/embedBuilder');
const GuildSettings = require('../../models/GuildSettings');
const { colors, emojis } = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reactionroles')
    .setDescription('Reaction roles panel management')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(sub => sub
      .setName('panel')
      .setDescription('Send a reaction roles panel')
      .addStringOption(o => o.setName('title').setDescription('Panel title').setRequired(true))
      .addStringOption(o => o.setName('description').setDescription('Panel description').setRequired(true))
    )
    .addSubcommand(sub => sub
      .setName('add')
      .setDescription('Add a role to the reaction roles panel')
      .addRoleOption(o => o.setName('role').setDescription('Role to add').setRequired(true))
      .addStringOption(o => o.setName('label').setDescription('Label for the menu option').setRequired(true))
      .addStringOption(o => o.setName('emoji').setDescription('Emoji for the option').setRequired(false))
    ),

  cooldown: 5,

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    let settings = await GuildSettings.findOne({ guildId });
    if (!settings) settings = new GuildSettings({ guildId });

    if (sub === 'add') {
      const role  = interaction.options.getRole('role');
      const label = interaction.options.getString('label');
      const emoji = interaction.options.getString('emoji') ?? null;

      settings.reactionRoles.set(role.id, JSON.stringify({ label, emoji, roleId: role.id }));
      await settings.save();

      await interaction.reply({
        embeds: [success('Role Added', `**${role.name}** has been added to the reaction roles list.`)]
      });
    }

    if (sub === 'panel') {
      const title = interaction.options.getString('title');
      const desc  = interaction.options.getString('description');

      if (!settings.reactionRoles.size) {
        return interaction.reply({ embeds: [error('No Roles', 'Add roles first with `/reactionroles add`.')], ephemeral: true });
      }

      const options = [];
      for (const [roleId, dataStr] of settings.reactionRoles) {
        const data = JSON.parse(dataStr);
        const opt = { label: data.label, value: roleId };
        if (data.emoji) opt.emoji = data.emoji;
        options.push(opt);
      }

      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('reaction_roles')
          .setPlaceholder('Select roles to toggle...')
          .setMinValues(1)
          .setMaxValues(1)
          .addOptions(options.slice(0, 25))
      );

      await interaction.channel.send({
        embeds: [arkEmbed({
          color: colors.primary,
          title: `${emojis.star} ${title}`,
          description: desc,
          footerText: 'Select a role below to toggle it',
        })],
        components: [row],
      });

      await interaction.reply({ content: '✅ Reaction roles panel sent.', ephemeral: true });
    }
  },
};
