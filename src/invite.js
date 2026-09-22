const { PermissionsBitField } = require("discord.js");

function isDiscordInvite(content) {
  return /(https?:\/\/)?(www\.)?(discord\.gg|discord\.com\/invite)\/[A-Za-z0-9-]+/i.test(content);
}

async function handle(message, config, logger) {
  await message.delete().catch(() => {});

  const member = message.member;
  let action = "招待リンク削除";

  if (member?.moderatable) {
    await member.timeout(
      config.invite.timeoutMinutes * 60 * 1000,
      "荒らし対策：Discord招待リンク"
    ).catch(() => {});
    action += ` / ${config.invite.timeoutMinutes}分タイムアウト`;
  }

  await logger.log(message.guild, {
    reason: "Discord招待リンクを検知",
    userTag: message.author.tag,
    userId: message.author.id,
    action
  });
}

module.exports = { isDiscordInvite, handle };
