import { Low, JSONFile } from 'lowdb';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../database/brawlstars.json');
const adapter = new JSONFile(dbPath);
const db = new Low(adapter, { users: {} });

const BS_API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6ImZhMzUyYzg2LWM5ZGItNGE0Mi05ODRkLWVhZGI1ZDNhNmJmZiIsImlhdCI6MTc4MTgxMTg4Mywic3ViIjoiZGV2ZWxvcGVyL2M4YTViZmQyLWE1ZjUtOGEx OS1kNDVhLWM0NWEyYTljZWJkMiIsInNjb3BlcyI6WyJicmF3bHN0YXJzIl0sImxpbWl0cyI6W3sidGllciI6ImRldmVsb3Blci9zaWx2ZXIiLCJ0eXBlIjoidGhyb3R0bGluZyJ9LHsiY2lkcnMiOlsiODUuMTU1LjE1MS42MiJdLCJ0eXBlIjoiY2xpZW50In1dfQ.cgTQsyj_1usHc7fgv-LpgLjmJc07S9X1jz1nnmGnwnjqUzPrDFWknjcy2o11G_nMOooTZkpWBskj52URocXvLw';

let handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('⚠️ *Questo comando funziona solo nei gruppi!*');

  await db.read();
  db.data = db.data || { users: {} };

  const groupMetadata = await conn.groupMetadata(m.chat);
  const members = groupMetadata.participants.map(p => p.jid || p.id);
  const linked = members.filter(id => db.data.users[id]);

  if (linked.length === 0) {
    return m.reply(
      `⚠️ *Nessun membro ha collegato il proprio account Brawl Stars!*\n\n` +
      `Usa *.addbs #TAG* per collegarlo.`
    );
  }

  await conn.sendMessage(m.chat, { react: { text: "🎮", key: m.key } });
  await m.reply(`⏳ *Caricamento classifica...* (${linked.length} giocatori)`);

  const results = [];

  for (const id of linked) {
    const tag = db.data.users[id].tag;
    try {
      const encodedTag = tag.replace('#', '%23');
      const res = await axios.get(
        `https://api.brawlstars.com/v1/players/${encodedTag}`,
        {
          headers: {
            Authorization: `Bearer ${BS_API_KEY}`,
            'Accept-Encoding': 'gzip'
          }
        }
      );

      const brawlers = res.data.brawlers;

      const best = brawlers.reduce((a, b) => a.trophies > b.trophies ? a : b);

      const p1 = brawlers.filter(b => b.prestigeLevel === 1).length;
      const p2 = brawlers.filter(b => b.prestigeLevel === 2).length;
      const p3 = brawlers.filter(b => b.prestigeLevel >= 3).length;

      results.push({
        name: res.data.name,
        tag: res.data.tag,
        trophies: res.data.trophies,
        bestBrawlerName: best.name,
        bestBrawlerTrophies: best.trophies,
        prestige1: p1,
        prestige2: p2,
        prestige3: p3
      });
    } catch (e) {
      console.error(`Errore per ${tag}:`, e.message);
    }
  }

  if (results.length === 0) {
    return m.reply('❌ *Errore nel recuperare i dati. Riprova tra poco.*');
  }

  results.sort((a, b) => b.trophies - a.trophies);

  const medals = ['🥇', '🥈', '🥉'];

  let msg =
    `┏━━━━━━━━━━━━━━━━━━━┓\n` +
    `   🏆  *𝐁𝐒 𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀 𝐆𝐑𝐔𝐏𝐏𝐎*\n` +
    `┗━━━━━━━━━━━━━━━━━━━┛\n\n`;

  results.forEach((p, i) => {
    const icon = medals[i] || `${i + 1}.`;
    msg += `${icon} *${p.name}* — 🏆 ${p.trophies.toLocaleString()}\n`;
    msg += `   🏷️ ${p.tag}\n`;
    msg += `   ⭐ *Best Brawler:* ${p.bestBrawlerName} — ${p.bestBrawlerTrophies.toLocaleString()} coppe\n`;
    msg += `   🎖️ *Prestigio 1:* ${p.prestige1}\n`;
    msg += `   🎖️ *Prestigio 2:* ${p.prestige2}\n`;
    msg += `   🎖️ *Prestigio 3:* ${p.prestige3}\n\n`;
  });

  msg += `_𝐁𝐋𝐎𝐎𝐃 𝐁𝐎𝐓_`;

  await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  return m.reply(msg);
};

handler.help = ['bsrank'];
handler.tags = ['giochi'];
handler.command = /^bsrank$/i;

export default handler;