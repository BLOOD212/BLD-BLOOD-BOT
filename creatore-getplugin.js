import cp, { exec as _exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const exec = promisify(_exec).bind(cp);

const handler = async (m, { conn, isROwner, usedPrefix, command, text }) => {
  const ar = Object.keys(plugins);
  const ar1 = ar.map((v) => v.replace('.js', ''));

  if (!text) {
    return conn.reply(m.chat, `*🍬 Inserisci il nome di un plugin (file) esistente*\n\n*—◉ Esempio*\n*◉ ${usedPrefix + command}* info-infobot\n\n*—◉ Lista dei plugin (file) esistenti:*\n*◉* ${ar1.map((v) => ' ' + v).join`\n*◉*`}`, m);
  }

  if (!ar1.includes(text)) {
    return conn.reply(m.chat, `*🍭 Nessun plugin (file) trovato con il nome "${text}", inserisci un nome esistente*\n\n*==================================*\n\n*—◉ Lista dei plugin (file) esistenti:*\n*◉* ${ar1.map((v) => ' ' + v).join`\n*◉*`}`, m);
  }

  let o;
  try {
    o = await exec('cat plugins/' + text + '.js');
  } catch (e) {
    o = e;
  } finally {
    const { stdout, stderr } = o;
    if (stdout.trim()) {
      await conn.sendMessage(m.chat, { document: fs.readFileSync(`./plugins/${text}.js`), mimetype: 'application/javascript', fileName: `${text}.js` }, { quoted: m });
    }
    if (stderr.trim()) {
      await conn.sendMessage(m.chat, { document: fs.readFileSync(`./plugins/${text}.js`), mimetype: 'application/javascript', fileName: `${text}.js` }, { quoted: m });
    }
  }
};

handler.help = ['getplugin'];
handler.tags = ['creatore'];
handler.command = ['getplugin', 'plugin'];
handler.rowner = true;

export default handler;