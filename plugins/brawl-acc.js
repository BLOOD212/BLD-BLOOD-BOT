
import { Low, JSONFile } from 'lowdb';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../database/brawlstars.json');
const adapter = new JSONFile(dbPath);
const db = new Low(adapter, { users: {} });

const BS_API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6ImZhMzUyYzg2LWM5ZGItNGE0Mi05ODRkLWVhZGI1ZDNhNmJmZiIsImlhdCI6MTc4MTgxMTg4Mywic3ViIjoiZGV2ZWxvcGVyL2M4YTViZmQyLWE1ZjUtOGEx OS1kNDVhLWM0NWEyYTljZWJkMiIsInNjb3BlcyI6WyJicmF3bHN0YXJzIl0sImxpbWl0cyI6W3sidGllciI6ImRldmVsb3Blci9zaWx2ZXIiLCJ0eXBlIjoidGhyb3R0bGluZyJ9LHsiY2lkcnMiOlsiODUuMTU1LjE1MS42MiJdLCJ0eXBlIjoiY2xpZW50In1dfQ.cgTQsyj_1usHc7fgv-LpgLjmJc07S9X1jz1nnmGnwnjqUzPrDFWknjcy2o11G_nMOooTZkpWBskj52URocXvLw';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  await db.read();
db.data = db.data || { users: {} };

  const sender = m.sender;
  const userData = db.data.users[sender];

  if (!userData) {
    return m.reply(
      `⚠️ *Account non collegato!*\n\n` +
      `Usa prima il comando:\n` +
      `📌 *.addbs #TUOTAG*\n\n` +
      `_per collegare il tuo account Brawl Stars._`
    );
  }

  const tag = userData.tag;

  try {
    await conn.sendMessage(m.chat, { react: { text: "🎮", key: m.key } });

    const encodedTag = tag.replace('#', '%23');
    const response = await axios.get(
      `https://api.brawlstars.com/v1/players/${encodedTag}`,
      {
        headers: {
          Authorization: `Bearer ${BS_API_KEY}`,
          'Accept-Encoding': 'gzip'
        }
      }
    );

    const p = response.data;
    const trophyIcon = p.trophies >= 50000 ? '🏆' : p.trophies >= 20000 ? '🥇' : p.trophies >= 5000 ? '🥈' : '🥉';

    const msg =
      `┏━━━━━━━━━━━━━━━━━━━┓\n` +
      `   🎮  *𝐁𝐑𝐀𝐖𝐋 𝐒𝐓𝐀𝐑𝐒 𝐀𝐂𝐂𝐎𝐔𝐍𝐓*\n` +
      `┗━━━━━━━━━━━━━━━━━━━┛\n\n` +
      `◈ 👤 *Nome:* ${p.name}\n` +
      `◈ 🏷️ *Tag:* ${p.tag}\n` +
      `◈ ${trophyIcon} *Coppe:* ${p.trophies.toLocaleString()}\n` +
      `◈ 🏅 *Coppe massime:* ${p.highestTrophies.toLocaleString()}\n` +
      `◈ ⚔️ *Brawler sbloccati:* ${p.brawlers.length}\n` +
      `◈ 🎯 *Vittorie 3v3:* ${p['3vs3Victories'].toLocaleString()}\n` +
      `◈ 🥊 *Vittorie Solo:* ${p.soloVictories.toLocaleString()}\n` +
      `◈ 👥 *Vittorie Duo:* ${p.duoVictories.toLocaleString()}\n` +
      (p.club?.name ? `◈ 🏰 *Club:* ${p.club.name}\n` : `◈ 🏰 *Club:* Nessuno\n`) +
      `\n_𝐁𝐋𝐎𝐎𝐃 𝐁𝐎𝐓_`;

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    return m.reply(msg);

  } catch (e) {
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });

    if (e.response?.status === 404) {
      return m.reply(`❌ *Giocatore non trovato!*\nControlla il tag: *${tag}*\n\nRicollega l'account con *.addbs #TUOTAG*`);
    }
    if (e.response?.status === 403) {
      return m.reply(`❌ *API Key non valida o IP non autorizzato.*\nContatta l'admin del bot.`);
    }

    console.error('Brawl Stars API error:', e.message);
    return m.reply('⚠️ *Errore nel recuperare i dati.* Riprova tra poco.');
  }
};

handler.help = ['bsacc'];
handler.tags = ['giochi'];
handler.command = /^bsacc$/i;

export default handler;