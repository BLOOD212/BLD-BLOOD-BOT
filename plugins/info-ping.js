import fs from 'fs';
import os from 'os';
import { performance } from 'perf_hooks';

const toMathematicalAlphanumericSymbols = number => {
  const map = {
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒',
    '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗', '.': '.'
  };
  return number.toString().split('').map(digit => map[digit] || digit).join('');
};

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
  
  // Data di avvio (puoi personalizzare questo valore se necessario)
  const avvio = new Date().toLocaleString('it-IT');

  const image = fs.readFileSync('./icone/ping.png');
  let nomeDelBot = global.db.data.nomedelbot || 'ʙʟᴏᴏᴅ-ʙᴏᴛ';

  const prova = {
    key: { participants: "0@s.whatsapp.net", fromMe: false, id: "Halo" },
    message: {
      documentMessage: {
        title: `✨ ᴘɪɴɢ ✨`,
        jpegThumbnail: image
      }
    },
    participant: "0@s.whatsapp.net"
  };

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

  await conn.sendMessage(m.chat, {
    text: info,
    footer: "𝟑𝟑𝟑 𝐁𝐨𝐭 𝐯𝐞𝐫𝐬𝐢𝐨𝐧𝐞 𝟏𝟎.𝟏",
    buttons: [
      { buttonId: ".ds", buttonText: { displayText: "🧹 Elimina Sessioni" }, type: 1 }
    ],
    headerType: 1
  }, { quoted: prova });
};

handler.command = /^(ping)$/i;
export default handler;
