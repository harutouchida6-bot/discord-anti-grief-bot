const users = new Map();

function check(message, config) {
  const now = Date.now();
  const userId = message.author.id;
  const key = `${message.guild.id}:${userId}`;

  let timestamps = users.get(key) || [];
  timestamps = timestamps.filter(
    t => now - t < config.spam.windowSeconds * 1000
  );

  timestamps.push(now);
  users.set(key, timestamps);

  return {
    isSpam: timestamps.length >= config.spam.messageCount,
    count: timestamps.length
  };
}

async function handle(message, result, config, logger) {
  if (config.spam.deleteRecentMessages) {
    await message.delete().catch(() => {});
  }

  const member = message.member;
  let action = "メッセージ削除";

  if (member?.moderatable) {
    await member.timeout(
      config.spam.timeoutMinutes * 60 * 1000,
      "荒らし対策：短時間の大量メッセージ"
    ).catch(() => {});
    action += ` / ${config.spam.timeoutMinutes}分タイムアウト`;
  }

  await logger.log(message.guild, {
    reason: `短時間に大量のメッセージを検知（${result.count}件）`,
    userTag: message.author.tag,
    userId: message.author.id,
    action
  });

  users.delete(`${message.guild.id}:${message.author.id}`);
}

module.exports = { check, handle };
