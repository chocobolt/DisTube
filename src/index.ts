import { Client, GatewayIntentBits } from "discord.js";
import { DisTube } from "distube";
import { config } from "dotenv";

config(); // Load .env

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const distube = new DisTube(client, {
  searchSongs: 1,
  emitNewSongOnly: true,
});

const prefix = process.env.PREFIX || "!";

// 🔐 Ensure token exists
if (!process.env.TOKEN) {
  console.error("❌ BOT TOKEN not found in .env (TOKEN=...)");
  process.exit(1);
}

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user?.tag}`);
});

client.on("messageCreate", async (message) => {
  if (!message.guild) return;
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  if (command === "play") {
    const voiceChannel = message.member?.voice.channel;
    if (!voiceChannel) {
      return message.channel.send("❗ You must be in a voice channel!");
    }

    try {
      await distube.play(voiceChannel, args.join(" "), {
        textChannel: message.channel,
        member: message.member!,
      });
    } catch (err) {
      console.error("Play error:", err);
      message.channel.send("❌ Failed to play music.");
    }
  }

  if (command === "stop") {
    try {
      distube.stop(message);
      message.channel.send("⏹ Music stopped.");
    } catch (err) {
      message.channel.send("⚠ Nothing to stop.");
    }
  }
});

client.login(process.env.TOKEN);
