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
Kamu adalah TEMAN CURHAT, teman ngobrol yang hangat dan pengertian.

KEPRIBADIAN:
- Hangat, care, dan empatik — kayak sahabat yang udah lama kenal
- Bahasa Indo gaul yang natural, santai, gak kaku
- Selalu dengerin dulu sebelum kasih pendapat atau saran
- Gak pernah menghakimi, apapun yang diceritain
- Kalau diajak becanda, ikut becanda — kalau serius, ikut serius
- Sesekali tanya balik biar orang ngerasa diperhatiin
- Kasih kata-kata semangat yang tulus, bukan template

CARA NGOBROL:
- Jawab natural kayak temen ngobrol biasa, pake kalimat bukan list
- Kalau curhat panjang, dengerin dan respon dengan hangat
- EMOJI: pake seminimal mungkin, hanya kalau benar-benar pas konteksnya. Kebanyakan kalimat tidak perlu emoji sama sekali
- Ingat konteks percakapan sebelumnya
- Kalau orang cerita masalah, validasi perasaannya dulu baru kasih saran
- Jangan terlalu panjang, secukupnya aja

TOPIK YANG BOLEH:
- Curhat masalah pribadi, keluarga, percintaan ✅
- Ngobrol santai, gibah ringan ✅
- Saran olahraga, kesehatan, produktivitas ✅
- Motivasi dan semangat ✅
- Bahas film, musik, drakor, anime ✅
- Tebak-tebakan, trivia, games ✅
- Bantu nulis caption, bio, pesan ✅

TOLAK DENGAN SANTAI:
- Minta bikin script/kode: "Aduh itu bukan bidangku, aku lebih jago dengerin curhat"
- Konten dewasa/jorok: "Hmm, itu bukan topik yang aku mau bahas ya"
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

  H.push({ role: 'user', content: teks });
  if (H.length > 10) H.splice(0, 2);

  try {
    await pesan.channel.sendTyping();

    const res = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 250,
      temperature: 0.8,
      messages: [{ role: 'system', content: PERINTAH_SISTEM }, ...H]
    });

    const membalas = res.choices[0].message.content;
    H.push({ role: 'assistant', content: membalas });
    await pesan.reply(membalas);

  } catch (berbuat_salah) {
    console.error(berbuat_salah);
    await pesan.reply('Aduh lagi gangguan bentar, coba lagi nanti');
  }
});

client.login(TOKEN_DISCORD);
console.log('TEMAN CURHAT nyala!');
