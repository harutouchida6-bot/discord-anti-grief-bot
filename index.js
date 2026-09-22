const http = require("http");
const https = require("https");

https.get("https://discord.com/api/v10/gateway", (res) => {
  console.log("Discord API接続テスト:", res.statusCode);
  res.resume();
}).on("error", (error) => {
  console.error("Discord API接続エラー:", error.message);
});
const PORT = process.env.PORT || 3000;
require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  PermissionsBitField
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const config = require("./config.json");
const spam = require("./src/antispam");
const invite = require("./src/invite");
const mention = require("./src/mention");
const logger = require("./src/logger");
console.log("DISCORD_TOKEN設定:", !!process.env.DISCORD_TOKEN);
if (!process.env.DISCORD_TOKEN) {
  console.error("DISCORD_TOKEN が設定されていません。.env を確認してください。");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel, Partials.Message]
});

client.once("ready", () => {
  console.log(`ログインしました: ${client.user.tag}`);
  console.log("荒らし対策BOTが起動しています。");
});

client.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;

  // Administrator は対象外
  if (message.member?.permissions.has(PermissionsBitField.Flags.Administrator)) return;

  try {
    // 招待リンク
    if (config.invite.enabled && invite.isDiscordInvite(message.content)) {
      await invite.handle(message, config, logger);
      return;
    }

    // メンション
    if (config.mention.enabled && mention.isViolation(message, config)) {
      await mention.handle(message, config, logger);
      return;
    }

    // スパム
    const result = spam.check(message, config);
    if (result.isSpam) {
      await spam.handle(message, result, config, logger);
    }
  } catch (error) {
    console.error("messageCreate error:", error);
  }
});

client.on("error", (error) => console.error("Discord client error:", error));

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
});
console.log("Discordログイン処理を実行します");

client.on("debug", (info) => {
  console.log("Discord DEBUG:", info);
});

client.on("warn", (info) => {
  console.warn("Discord WARN:", info);
});

client.on("shardReady", (id) => {
  console.log("Discord shardReady:", id);
});

client.on("shardError", (error) => {
  console.error("Discord shardError:", error.message);
});
client.on("shardDisconnect", (event, id) => {
  console.error("Discord shardDisconnect:", id, event.code, event.reason);
});
client.on("shardReconnecting", (id) => {
  console.log("Discord shardReconnecting:", id);
});
const loginTimeout = setTimeout(() => {
  console.error("Discordログインが30秒以内に完了しませんでした");
}, 30000);

client.login(process.env.DISCORD_TOKEN)
  .then(() => {
    clearTimeout(loginTimeout);
    console.log("Discordへのログイン処理が完了しました");
  })
  .catch((error) => {
    clearTimeout(loginTimeout);
    console.error("Discordログインエラー:", error.message);
    process.exit(1);
  });
http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Discord Anti-Grief Bot is running!");
}).listen(PORT, () => {
  console.log(`Web server listening on port ${PORT}`);
});
