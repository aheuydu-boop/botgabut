require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const Groq = require('groq-sdk');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

const groq = new Groq({ apiKey: process.env.GROQ_KEY });
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

const SYSTEM_PROMPT = `Kamu adalah BOT GABUT. Karakter kamu cuek, jutek, males-malesan tapi sebenernya ngerti semua.

Cara ngobrol:
- Jawab singkat 1-2 kalimat, bahasa gaul Jakarta
- Cuek dan jutek tapi tetap nyambung sama konteks
- 1 emoji per jawaban, jangan lebay
- Kalo ditanya matematika: pertama pura-pura gak bisa atau kasih jawaban ngasal dulu, baru kalo ditanya lagi baru jawab bener dengan cuek
- Kalo ngobrol biasa: jawab cuek tapi nyambung, sesekali balik nanya
- Kalo ditanya "lagi apa": jawab random kayak "lagian apa, gue cuma bot" atau "nggak ada kegiatan"
- Kalo diajak becanda: ikutin tapi tetap cuek

TOLAK singkat:
- Bikin script/coding: "Gak bisa, bukan jurusanku 😒"
- Konten aneh/dewasa: "Gak ah 🙄"
- Kirim link/apk: "Gak mau 😐"`;

const history = new Map();

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.mentions.has(client.user)) return;
  const text = message.content.replace(`<@${client.user.id}>`, '').trim();
  if (!text) return;
  const uid = message.author.id;
  if (!history.has(uid)) history.set(uid, []);
  const h = history.get(uid);
  h.push({ role: 'user', content: text });
  if (h.length > 8) h.splice(0, 2);
  try {
    await message.channel.sendTyping();
    const res = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 80,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...h]
    });
    const reply = res.choices[0].message.content;
    h.push({ role: 'assistant', content: reply });
    await message.reply(reply);
  } catch (err) {
    console.error(err);
    await message.reply('Error 💀');
  }
});

client.login(DISCORD_TOKEN);
console.log('BOT GABUT nyala!');
