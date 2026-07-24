const { EmbedBuilder } = require('discord.js');
const { colors, footer, emojis } = require('../config/config');

// ─── ARK Embed Builder ───────────────────────────────────────────
// Consistent dark-themed embeds across all features

function arkEmbed(options = {}) {
  const embed = new EmbedBuilder()
    .setColor(options.color ?? colors.primary)
    .setTimestamp();

  if (options.title)       embed.setTitle(options.title);
  if (options.description) embed.setDescription(options.description);
  if (options.thumbnail)   embed.setThumbnail(options.thumbnail);
  if (options.image)       embed.setImage(options.image);
  if (options.url)         embed.setURL(options.url);
  if (options.fields)      embed.addFields(options.fields);
  if (options.author)      embed.setAuthor(options.author);

  embed.setFooter({
    text: options.footerText ? `${footer.text} • ${options.footerText}` : footer.text,
    iconURL: options.footerIcon ?? undefined,
  });

  return embed;
}

// ─── Preset Embeds ───────────────────────────────────────────────

const success = (title, description) => arkEmbed({
  color: colors.success,
  title: `${emojis.success} ${title}`,
  description,
});

const error = (title, description) => arkEmbed({
  color: colors.error,
  title: `${emojis.error} ${title}`,
  description,
});

const warning = (title, description) => arkEmbed({
  color: colors.warning,
  title: `${emojis.warning} ${title}`,
  description,
});

const info = (title, description) => arkEmbed({
  color: colors.info,
  title: `${emojis.ark} ${title}`,
  description,
});

const modLog = (action, fields, moderator) => arkEmbed({
  color: colors.error,
  title: `${emojis.mod} Moderation Action — ${action}`,
  fields,
  footerText: `Moderator: ${moderator}`,
});

module.exports = { arkEmbed, success, error, warning, info, modLog };
