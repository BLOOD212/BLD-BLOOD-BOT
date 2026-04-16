import fetch from 'node-fetch';
import { sticker } from '../lib/sticker.js';

const fetchJson = async (url, options) => {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Errore HTTP: ${response.status}`);
    return response.json();
};

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`『 🪄 』- \`Scegli due emoji da mixare.\`\n> 『 💡 』- \`Esempio:\` ${usedPrefix + command} 🤓🤒 oppure ${usedPrefix + command} 🤓+🤒`);
    }
    const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)/gu;
    let matches = [...text.matchAll(emojiRegex)].map(match => match[0]);

    let emoji1 = matches[0];
    let emoji2 = matches[1];

    if (!emoji1 || !emoji2 || matches.length !== 2) {
        return m.reply(`『 🪄 』- \`Formato non corretto.\`\n> 『 💡 』- \`Esempio:\` ${usedPrefix + command} 🤓🤒 oppure ${usedPrefix + command} 🤓+🤒`);
    }
    
    try {
        const url = `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`;
        
        const anu = await fetchJson(url);

        if (!anu.results || anu.results.length === 0) {
            return m.reply(`『 ❌ 』- \`Mi dispiace, non riesco a mixare\` ${emoji1} \`e\` ${emoji2}.\n\n『 💡 』- \`Prova un'altra combinazione!\``);
        }
        
        for (const res of anu.results) {
            const stiker = await sticker(false, res.url, global.autore, global.nomepack);
            await conn.sendFile(m.chat, stiker, null, { asSticker: true }, m);
        }

    } catch (e) {
        console.error(e);
        if (e.message.includes('403')) {
            m.reply(`${global.errore} `);
        } else {
            m.reply(`${global.errore}`);
        }
    }
};

handler.help = ['emojimix'];
handler.tags = ['giochi'];
handler.command = ['emojimix'];
handler.register = true;

export default handler;