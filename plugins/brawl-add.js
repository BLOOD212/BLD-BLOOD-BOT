import { Low, JSONFile } from 'lowdb';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../database/brawlstars.json');
const adapter = new JSONFile(dbPath);
const db = new Low(adapter, { users: {} });

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(
    `┏━━━━━━━━━━━━━━━━━━━┓\n` +
    `   🎮  *𝐁𝐑𝐀𝐖𝐋 𝐒𝐓𝐀𝐑𝐒 𝐒𝐄𝐓𝐔𝐏*\n` +
    `┗━━━━━━━━━━━━━━━━━━━┛\n\n` +
    `💡 _Usa:_ ${usedPrefix + command} #TAG NomeSupercellID\n` +
    `📌 _Esempio:_ ${usedPrefix + command} #ABC123 yNukeee`
  );

  const parts = text.trim().split(/\s+/);
  let tag = parts[0].toUpperCase().replace(/O/g, '0');
  if (!tag.startsWith('#')) tag = '#' + tag;

  if (!/^#[0-9A-Z]{3,10}$/.test(tag)) {
    return m.reply('⚠️ *Tag non valido!*\n_Esempio:_ `.addbs #ABC123 yNukeee`');
  }

  const scid = parts.slice(1).join(' ') || null;

  await db.read();
  db.data = db.data || { users: {} };

  const userData = { tag, scid };

  db.data.users[m.sender] = userData;
  const lid = m.key?.senderKeyDist?.key;
  if (lid) db.data.users[lid] = userData;

  if (m.isGroup) {
    const groupMetadata = await conn.groupMetadata(m.chat);
    const me = groupMetadata.participants.find(p => {
      return p.id && p.lid && (p.lid === m.sender || p.id === m.sender);
    });
    if (me && me.lid) db.data.users[me.lid] = userData;
    if (me && me.id) db.data.users[me.id] = userData;
  }

  await db.write();

  return m.reply(
    `┏━━━━━━━━━━━━━━━━━━━┓\n` +
    `   ✅  *𝐀𝐂𝐂𝐎𝐔𝐍𝐓 𝐂𝐎𝐋𝐋𝐄𝐆𝐀𝐓𝐎!*\n` +
    `┗━━━━━━━━━━━━━━━━━━━┛\n\n` +
    `◈ 🏷️ *Tag salvato:* ${tag}\n` +
    (scid ? `◈ 🆔 *Supercell ID:* ${scid}\n` : '') +
    `\n_Ora usa_ *.bsacc* _per vedere il tuo account!_`
  );
};

handler.help = ['addbs'];
handler.tags = ['giochi'];
handler.command = /^addbs$/i;
export default handler;

