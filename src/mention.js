function isViolation(message, config) {
  if (config.mention.blockEveryoneHere && (message.mentions.everyone || message.content.includes("@everyone") || message.content.includes("@here"))) {
    return true;
  }

  return message.mentions.users.size >= config.mention.maxUserMentions;
}

async function handle(message, config, logger) {
  await message.delete().catch(() => {});

  const member = message.member;
  let action = "メンション荒らしを削除";

  if (member?.moderatable) {
    await member.timeout(
      config.mention.timeoutMinutes * 60 * 1000,
      "荒らし対策：大量メンション"
    ).catch(() => {});
    action += ` / ${config.mention.timeoutMinutes}分タイムアウト`;
  }

  await logger.log(message.guild, {
    reason: "大量メンションまたは @everyone / @here を検知",
    userTag: message.author.tag,
    userId: message.author.id,
    action
  });
}

module.exports = { isViolation, handle };
