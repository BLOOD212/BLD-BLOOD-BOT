import { webp2png, webp2mp4 } from '../lib/webp2png.js';

let handler = async (m, { conn, usedPrefix, command }) => {
    let notSticker = `rispondi ad uno sticker con il comando ${usedPrefix + command}`;
    if (!m.quoted) throw notSticker;
    
    let q = m.quoted || m;
    let mime = q.mediaType || '';
    if (!/sticker/.test(mime)) throw notSticker;
    
    let media = await q.download();
    
    try {
        if (/toimg|convertiimmagine|foto/i.test(command)) {
            let out = await webp2png(media);
            await conn.sendFile(m.chat, out, 'out.png', '╰ *converted!*', m);
        } else if (/tovideo|convertivideo|video/i.test(command)) {
            let out = await webp2mp4(media);
            await conn.sendFile(m.chat, out, 'out.mp4', '╰ *converted!*', m);
        }
    } catch (e) {
        console.error(e)
        m.reply('Errore durante la conversione');
    }
};

handler.help = ['toimg', 'tovideo'];
handler.tags = ['sticker'];
handler.command = ['toimg', 'convertiimmagine', 'foto', 'tovideo', 'convertivideo', 'video'];

export default handler;
