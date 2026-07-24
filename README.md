# 🌐 ARK Society Bot — Setup Guide

## 📁 Project Structure
```
ark-society-bot/
├── commands/
│   ├── moderation/    (ban, kick, timeout, warn, clear, lock, unlock, slowmode, warnings)
│   ├── giveaway/      (giveaway start/end/reroll)
│   ├── music/         (play, skip, pause, queue, stop)
│   ├── ai/            (ai chat)
│   ├── utility/       (rank, userinfo, serverinfo, help, ticket, suggest, leaderboard)
│   └── config/        (setup, blacklist)
├── events/            (ready, interactionCreate, messageCreate, guildMemberAdd/Remove)
├── handlers/          (commandHandler, eventHandler, deployCommands)
├── models/            (GuildSettings, User, Giveaway)
├── utils/             (embedBuilder, helpers, aiHandler, giveawayHandler, ticketHandler)
├── config/            (config.js)
├── index.js
├── package.json
├── .env.example
└── Dockerfile
```

---

## ⚙️ Step 1 — Create Your Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application** → Name it `ARK Society Bot`
3. Go to **Bot** tab → Click **Add Bot**
4. Enable ALL three privileged intents:
   - ✅ **MESSAGE CONTENT INTENT**
   - ✅ **SERVER MEMBERS INTENT**
   - ✅ **PRESENCE INTENT**
5. Click **Reset Token** and copy your bot token

---

## 🔗 Step 2 — Invite Bot to Server

1. Go to **OAuth2 → URL Generator**
2. Select scopes: `bot` + `applications.commands`
3. Select permissions: **Administrator**
4. Copy and open the generated URL to invite the bot

---

## 🗄️ Step 3 — MongoDB Database (Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account → **Create Free Cluster**
3. Go to **Database Access** → Add a database user with a password
4. Go to **Network Access** → Add IP `0.0.0.0/0` (allow all)
5. Go to **Connect** → **Drivers** → Copy the connection string
6. Replace `<password>` with your database user password

Example URI:
```
mongodb+srv://arkadmin:yourpassword@cluster0.xxxxx.mongodb.net/arkbot
```

---

## 🤖 Step 4 — Free AI Setup (OpenRouter)

1. Go to [OpenRouter.ai](https://openrouter.ai)
2. Sign up for a free account
3. Go to **Keys** → Create an API key
4. Free models available: `mistralai/mistral-7b-instruct:free`, `deepseek/deepseek-chat:free`

---

## 📦 Step 5 — Local Setup

```bash
# Clone or download the project
cd ark-society-bot

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your values
nano .env

# Deploy slash commands to your server
npm run deploy

# Start the bot
npm start
```

---

## 🚀 Step 6 — Free Hosting on Railway (24/7)

### Create GitHub Repo
1. Go to [GitHub](https://github.com) → **New Repository**
2. Name it `ark-society-bot`
3. Upload all bot files (or use `git push`)

### Deploy to Railway
1. Go to [Railway.app](https://railway.app)
2. Sign in with **GitHub**
3. Click **New Project** → **Deploy from GitHub repo**
4. Select your `ark-society-bot` repository
5. Railway auto-detects Node.js and deploys

### Add Environment Variables
In Railway dashboard → Your project → **Variables** tab:
```
TOKEN              = your_discord_bot_token
CLIENT_ID          = your_bot_client_id
GUILD_ID           = your_server_id
MONGO_URI          = your_mongodb_uri
OPENROUTER_API_KEY = your_openrouter_key
AI_MODEL           = mistralai/mistral-7b-instruct:free
```

### Keep It Running
Railway keeps your bot online 24/7 automatically.
Free tier includes **$5/month credits** — enough for a bot.

---

## 🎯 Alternative Free Hosts

| Platform | Free Tier | Notes |
|----------|-----------|-------|
| **Railway** | $5/mo credits | ✅ Best option |
| **Render** | 750hrs/month | ✅ Good backup |
| **Koyeb** | Always-free tier | ✅ Works well |
| **Replit** | Limited free | ⚠️ Not 24/7 |

---

## 🔧 Bot Configuration (after hosting)

Use `/setup` commands in your Discord server:

```
/setup view               → See all current settings
/setup logchannel         → Set mod log channel
/setup welcomechannel     → Set welcome channel
/setup autorole           → Set auto-assign role
/setup security level:high → Enable all security features
/setup aichannel          → Set AI chat channel
/setup raidmode           → Toggle raid protection
```

---

## 🛡️ Security Features Explained

| Feature | What it does |
|---------|-------------|
| **Anti-Spam** | Detects rapid message sending, auto-timeouts |
| **Anti-Raid** | Kick all new joins during raids (toggle with `/setup raidmode`) |
| **Anti-Links** | Blocks unauthorized URLs |
| **Anti-Mention** | Prevents mass @mentions (5+ per message) |
| **Token Detection** | Auto-deletes Discord tokens and API keys |
| **Scam Detection** | Removes fake Nitro and Steam scam links |
| **Word Blacklist** | Block custom words with `/blacklist add` |
| **Escalating Punishments** | 3 infractions = 5min timeout, 5 = 1hr timeout |

---

## 🎵 Music Setup

Music uses `discord-player` which supports YouTube out of the box.

For Spotify support, add these env variables:
```
SPOTIFY_CLIENT_ID     = your_spotify_client_id
SPOTIFY_CLIENT_SECRET = your_spotify_client_secret
```

Get Spotify credentials at [developer.spotify.com](https://developer.spotify.com)

---

## 🎉 Giveaway System

```
/giveaway start prize:RTX 4090 duration:24h winners:1
/giveaway start prize:Nitro duration:1d winners:3 required_role:@Member
/giveaway end message_id:123456789
/giveaway reroll message_id:123456789
```

---

## 📋 All Commands

### 🛡️ Moderation
| Command | Description | Permission |
|---------|-------------|------------|
| `/ban` | Ban a member | Ban Members |
| `/kick` | Kick a member | Kick Members |
| `/timeout` | Temporarily mute | Moderate Members |
| `/warn` | Warn a member | Moderate Members |
| `/warnings` | View user warnings | Moderate Members |
| `/clear` | Bulk delete messages | Manage Messages |
| `/lock` | Lock a channel | Manage Channels |
| `/unlock` | Unlock a channel | Manage Channels |
| `/slowmode` | Set message cooldown | Manage Channels |

### 🎉 Giveaways
| Command | Description |
|---------|-------------|
| `/giveaway start` | Start a new giveaway |
| `/giveaway end` | End a giveaway early |
| `/giveaway reroll` | Pick new winners |

### 🎵 Music
| Command | Description |
|---------|-------------|
| `/play` | Play a song (YouTube/Spotify) |
| `/skip` | Skip current song |
| `/pause` | Pause/resume playback |
| `/queue` | View song queue |
| `/stop` | Stop and clear queue |

### 🤖 AI
| Command | Description |
|---------|-------------|
| `/ai` | Chat with ARK AI |

### 📊 Utility
| Command | Description |
|---------|-------------|
| `/rank` | View your XP rank |
| `/leaderboard` | Top 10 members |
| `/userinfo` | User details |
| `/serverinfo` | Server details |
| `/ticket open` | Open a support ticket |
| `/ticket panel` | Post ticket panel (Admin) |
| `/suggest` | Submit a suggestion |
| `/help` | All commands list |

### ⚙️ Config (Admin only)
| Command | Description |
|---------|-------------|
| `/setup view` | View all settings |
| `/setup logchannel` | Set log channel |
| `/setup welcomechannel` | Set welcome channel |
| `/setup autorole` | Set auto role |
| `/setup security` | Set security level |
| `/setup antispam` | Toggle anti-spam |
| `/setup antilinks` | Toggle anti-links |
| `/setup aichannel` | Set AI chat channel |
| `/setup welcomemsg` | Custom welcome message |
| `/setup raidmode` | Toggle raid mode |
| `/blacklist add/remove/list` | Word blacklist |

---

## ❓ Troubleshooting

**Bot not responding to slash commands?**
→ Run `npm run deploy` to register commands

**MongoDB connection failed?**
→ Check your `MONGO_URI` and that `0.0.0.0/0` is whitelisted in Atlas

**Music not playing?**
→ Make sure you're in a voice channel and the bot has Connect + Speak permissions

**AI not responding?**
→ Check your `OPENROUTER_API_KEY` is valid and has credits

---

## 🆓 Total Cost

| Service | Cost |
|---------|------|
| Discord Bot | Free |
| Railway Hosting | Free ($5 credits/mo) |
| MongoDB Atlas | Free (512MB) |
| OpenRouter AI | Free (rate limited) |
| **Total** | **$0/month** |
