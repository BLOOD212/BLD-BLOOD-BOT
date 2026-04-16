import axios from 'axios';

const query = [ 'perte', 'andiamoneiperte', 'virali', 'virale']; // fate voi query migliori 💔

global.sentTiktokVideos = global.sentTiktokVideos || new Set();

let handler = async (m, { conn, command, usedPrefix }) => {
  let tagRandom = query[Math.floor(Math.random() * query.length)];
  let tentativi = 0;
  let trovato = false;
  let video = null;
  while (!trovato && tentativi < 10) {
    try {
      let v = await tiktoks(tagRandom);
      if (!global.sentTiktokVideos.has(v.no_watermark)) {
        video = v;
        trovato = true;
        global.sentTiktokVideos.add(v.no_watermark);
      }
    } catch (e) {}
    tentativi++;
  }

  if (!video) return m.reply('『 ❌ 』- \`Nessun video nuovo trovato, riprova tra poco!\`');

  let caption = `> ${video.title.replace(/#[^\s#]+/g, '').trim() || ''}`;

  let buttons = [
    {
      buttonId: usedPrefix + command,
      buttonText: { displayText: 'scrolla' },
      type: 1
    },
  ];

  await conn.sendMessage(m.chat, {
    video: { url: video.no_watermark },
    caption: caption,
    gifPlayback: false,
    buttons,
    headerType: 4,
    contextInfo: {
      mentionedJid: [m.sender]
    }
  }, { quoted: m });
};

handler.help = ['ttrandom'];
handler.tags = ['giochi'];
handler.command = ['ttrandom', 'ttr', 'tiktokrandom'];
handler.register = true;

export default handler;

async function tiktoks(query) {
  try {
    const response = await axios({
      method: 'POST',
      url: 'https://tikwm.com/api/feed/search',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': 'current_language=it',
        'User-Agent': 'varebot'
      },
      data: {
        keywords: query,
        count: 40,
        cursor: 0,
        HD: 1
      }
    });

    const videos = response.data?.data?.videos;
    if (!videos?.length) throw '『 ❌ 』- \`Nessun video trovato.\`';

    const video = videos[Math.floor(Math.random() * videos.length)];
    return {
      title: video.title,
      cover: video.cover,
      no_watermark: video.play,
      watermark: video.wmplay,
      music: video.music
    };
  } catch (err) {
    throw `${global.errore}`;
  }
}