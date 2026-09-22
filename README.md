# Discord 荒らし対策BOT

基本的な荒らし対策を行う Discord Bot です。

## 機能

- 短時間の大量メッセージ検知
- Discord招待リンクの自動削除
- @everyone / @here の検知
- 大量ユーザーメンションの検知
- 違反ユーザーの自動タイムアウト
- ログチャンネルへの記録
- Administrator権限ユーザーを対象外

## 1. Node.js

Node.js 18.18 以上をインストールしてください。

## 2. インストール

このフォルダでターミナルを開いて、

npm install

を実行します。

## 3. Botトークン

.env.example をコピーして .env を作成します。

Windowsなら、

.env.example → .env

に名前を変更してください。

.env の DISCORD_TOKEN にBotトークンを入れます。

例：

DISCORD_TOKEN=xxxxxxxx

## 4. Discord Developer Portal

Botの設定で以下を有効にしてください。

- Message Content Intent
- Server Members Intent

Botをサーバーに招待するときは、少なくとも以下の権限が必要です。

- View Channels
- Send Messages
- Manage Messages
- Moderate Members
- Read Message History

Botのロールは、タイムアウト対象ユーザーより上に置いてください。

## 5. ログチャンネル

ログを残したい場合、ログ用チャンネルを作成し、そのチャンネルIDを .env の

LOG_CHANNEL_ID=

に入力してください。

例：

LOG_CHANNEL_ID=123456789012345678

## 6. 起動

npm start

または

node index.js

## 設定変更

config.json を編集すると検知条件を変更できます。

初期設定：

- 8秒以内に6件以上 → スパム判定
- Discord招待リンク → 削除＋5分タイムアウト
- @everyone / @here → 削除＋10分タイムアウト
- ユーザーメンション5件以上 → 削除＋10分タイムアウト
