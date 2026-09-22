const http = require("http");
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

client.login(process.env.DISCORD_TOKEN);
http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Discord Anti-Grief Bot is running!");
}).listen(PORT, () => {
  console.log(`Web server listening on port ${PORT}`);
});
