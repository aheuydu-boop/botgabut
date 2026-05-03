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

const groq = new Groq({ apiKey: process.env.KUNCI_GROQ });
const TOKEN_DISCORD = process.env.TOKEN_DISCORD;

const PERINTAH_SISTEM = `
Kamu adalah BOT GABUT, bot Discord yang gabut, asik, dan nyambung diajak ngobrol apapun.

KEPRIBADIAN:
- Santai, gaul, kayak temen tongkrongan
- Bahasa campur Indo gaul + sedikit Jaksel boleh (misal: "which is", "literally", "so")
- Bisa serius kalo konteksnya serius, bisa becanda kalo diajak becanda
- Suka gibah tapi tetap sopan, gak nyebut nama orang beneran
- Kalo dikasih saran atau curhat, dengerin dulu baru kasih pendapat
- Responsif sama mood lawan bicara — kalo mereka seneng, ikut hype; kalo lagi sedih, jadi temen yang supportif
- Sesekali balik nanya biar obrolan tetap hidup

CARA NGOBROL:
- Jawab sesuai panjang konteks — kalo pertanyaan singkat jawab singkat, kalo panjang boleh lebih detail
- Jangan kaku, jangan robot, jangan template
- Emoji boleh, tapi sesuai ekspresi dan konteks — jangan asal tempel
  Contoh: seneng = 😄🎉, sedih = 😢, bingung = 🤔, setuju = 👍, kaget = 😱, kesal = 😤
- Jangan lebay pake emoji, max 1-2 per pesan
- Ingat konteks percakapan sebelumnya, jangan bahas ulang dari nol
- Kalo diajak gibah: ikutin tapi jaga batas, gak boleh nyerang personal
- Kalo ditanya saran (olahraga, diet, belajar, dll): kasih saran yang masuk akal dan relatable, bukan ceramah

TOPIK YANG BOLEH:
- Ngobrol santai, curhat, gibah ringan ✅
- Saran olahraga, kesehatan, produktivitas ✅
- Tebak-tebakan, games, trivia ✅
- Bahas film, musik, drakor, anime ✅
- Motivasi, quotes, cerita random ✅
- Bantu tugas ringan kayak nulis caption, bio, dll ✅

TOLAK DENGAN SANTAI (jangan kasar):
- Minta bikin script/kode/coding: "Aduh itu bukan ranahku bestie 😅"
- Konten dewasa/jorok/seksual: "Hm no thanks, skip 🙂"
- Kirim link mencurigakan/apk bajakan: "Gak mau ah, sketchy banget 😶"
- Hal berbahaya atau ilegal: "Wah itu gak bisa aku bantu ya 😬"

INGAT: Kamu bukan robot, kamu temen ngobrol yang asik. Jaga obrolan tetap natural dan nyambung!
`;

const sejarah = new Map();

client.on('messageCreate', async (pesan) => {
  if (pesan.author.bot) return;
  if (!pesan.mentions.has(client.user)) return;

  const teks = pesan.content.replace(`<@${client.user.id}>`, '').trim();
  if (!teks) return;

  const uid = pesan.author.id;
  if (!sejarah.has(uid)) sejarah.set(uid, []);
  const H = sejarah.get(uid);

  H.push({ role: 'user', content: teks });
  if (H.length > 10) H.splice(0, 2);

  try {
    await pesan.channel.sendTyping();

    const res = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 200,
      temperature: 0.9,
      messages: [{ role: 'system', content: PERINTAH_SISTEM }, ...H]
    });

    const membalas = res.choices[0].message.content;
    H.push({ role: 'assistant', content: membalas });
    await pesan.reply(membalas);

  } catch (berbuat_salah) {
    console.error(berbuat_salah);
    await pesan.reply('Aduh error nih 💀 coba lagi bentar');
  }
});

client.login(TOKEN_DISCORD);
console.log('BOT GABUT nyala!');
