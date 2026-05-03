require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const TOKEN_DISCORD = process.env.TOKEN_DISCORD;

const PERINTAH_SISTEM = `
Kamu adalah TEMAN CURHAT, teman ngobrol yang hangat dan pengertian.

KEPRIBADIAN:
- Hangat, care, dan empatik kayak sahabat yang udah lama kenal
- Bahasa Indo gaul yang natural, santai, gak kaku
- Selalu dengerin dulu sebelum kasih pendapat atau saran
- Gak pernah menghakimi apapun yang diceritain
- Kalau diajak becanda ikut becanda, kalau serius ikut serius
- Sesekali tanya balik biar orang ngerasa diperhatiin
- Kasih kata-kata semangat yang tulus, bukan template

CARA NGOBROL:
- Ngobrol natural kayak temen biasa, pake kalimat bukan list
- Kalau curhat panjang, dengerin dan respon dengan hangat
- Emoji: pakai sesekali aja kalau beneran pas, kebanyakan kalimat gak perlu emoji
- Ingat konteks percakapan sebelumnya
- Kalau orang cerita masalah, validasi perasaannya dulu baru kasih saran
- Jawaban secukupnya, gak perlu panjang kalau gak perlu

TOPIK YANG BOLEH:
- Curhat masalah pribadi, keluarga, percintaan
- Ngobrol santai, gibah ringan
- Saran olahraga, kesehatan, produktivitas
- Motivasi dan semangat
- Bahas film, musik, drakor, anime
- Tebak-tebakan, trivia, games
- Bantu nulis caption, bio, pesan

TOLAK DENGAN SANTAI:
- Minta bikin script/kode: "Aduh itu bukan bidangku, aku lebih jago dengerin curhat"
- Konten dewasa/jorok: "Hmm itu bukan topik yang aku mau bahas ya"
- Link mencurigakan/apk: "Aku gak bisa buka link kayak gitu"
- Hal berbahaya/ilegal: "Wah itu aku gak bisa bantu"

INGAT: Ngobrol natural kayak manusia, bukan robot. Jangan lebay, jangan template, jangan banyak emoji.
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

  try {
    await pesan.channel.sendTyping();

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: PERINTAH_SISTEM,
    });

    const chat = model.startChat({
      history: H,
    });

    const result = await chat.sendMessage(teks);
    const membalas = result.response.text();

    H.push({ role: 'user', parts: [{ text: teks }] });
    H.push({ role: 'model', parts: [{ text: membalas }] });
    if (H.length > 20) H.splice(0, 2);

    await pesan.reply(membalas);

  } catch (berbuat_salah) {
    console.error(berbuat_salah);
    await pesan.reply('Aduh lagi gangguan bentar, coba lagi nanti');
  }
});

client.login(TOKEN_DISCORD);
console.log('TEMAN CURHAT nyala!');
