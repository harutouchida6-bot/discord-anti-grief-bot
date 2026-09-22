const { EmbedBuilder } = require("discord.js");

async function log(guild, data) {
  const channelId = process.env.LOG_CHANNEL_ID;
  if (!channelId) return;

  const channel = guild.channels.cache.get(channelId);
  if (!channel || !channel.isTextBased()) return;

  const embed = new EmbedBuilder()
    .setTitle("🛡️ 荒らし対策ログ")
    .setDescription(data.reason || "違反を検知しました。")
    .addFields(
      { name: "ユーザー", value: `${data.userTag} (${data.userId})`, inline: false },
      { name: "処分", value: data.action || "なし", inline: true }
    )
    .setTimestamp();

  await channel.send({ embeds: [embed] }).catch(() => {});
}

module.exports = { log };
