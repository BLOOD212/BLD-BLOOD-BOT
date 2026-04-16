import fs from 'fs';
let handler = async (m, { conn }) => {
  try {
    if (!fs.existsSync('./media/sticker/script.webp')) {
      return await m.reply('❌ File ./media/sticker/script.webp non trovato.');
    }
    let buffer = fs.readFileSync('./media/sticker/script.webp');
    await conn.sendMessage(m.chat, { 
      sticker: buffer,
    }, { quoted: m });
    await m.reply('https://github.com/BLOOD212/BLD-BLOOD1');
  } catch (err) {
    console.error(err);
    await m.reply('❌ Errore nell\'invio dello sticker.');
  }
};

handler.help = ['script'];
handler.tags = ['main'];
handler.command = ['script'];
handler.register = true;

export default handler;