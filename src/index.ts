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

client.on("ready", () => {
  console.log(`✅ Logged in as ${client.user?.tag}`);
});

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  if (command === "play" && args.length) {
    distube.play(message.member?.voice.channel, args.join(" "), {
      textChannel: message.channel,
      member: message.member!,
    });
  }

  if (command === "stop") {
    distube.stop(message);
    message.channel.send("⏹ Music stopped.");
  }
});

client.login(process.env.TOKEN);
