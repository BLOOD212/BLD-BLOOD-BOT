import { performance } from 'perf_hooks';

const clockString = ms => {
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

const handler = async (m, { conn }) => {
  const _uptime = process.uptime() * 1000;
  const uptime = clockString(_uptime);

  const old = performance.now();
  const neww = performance.now();
  const speed = (neww - old).toFixed(3);
  
  const avvio = new Date().toLocaleString('it-IT');
  let nomeDelBot = global.db.data.nomedelbot || 'ʙʟᴏᴏᴅ-ʙᴏᴛ';

  const info = `╭━━━━━━•✦•━━━━━━╮
              ✨ ᴘɪɴɢ ✨
            ${nomeDelBot}
╰━━━━━━•✦•━━━━━━╯

◈ 𝖴ptim𝖾: \`${uptime}\`
◈ 𝖫𝖺𝗍𝖾𝗇𝗓𝖺: \`${speed} ms\`
◈ 𝖠𝗏𝗏𝗂𝗈: \`${avvio}\`

╭━━━━━━•✦•━━━━━━╮
   𝖮𝗐𝗇𝖾𝗋: *BLOOD*
   𝖲𝗍𝖺𝗍𝗈: _Online_
╰━━━━━━•✦•━━━━━━╯`.trim();

  await conn.sendMessage(m.chat, { text: info }, { quoted: m });
};

handler.command = /^(ping)$/i;
export default handler;
