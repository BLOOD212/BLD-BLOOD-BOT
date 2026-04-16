let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, '🌠 Scrivi il suggerimento che vuoi inviare!', m)
    if (text.length < 5) return conn.reply(m.chat, '🌠 Il suggerimento deve essere di almeno 5 caratteri.', m)
    if (text.length > 500) return conn.reply(m.chat, '🌠 La lunghezza massima del suggerimento è di 500 caratteri.', m)

    const staffChatId = '393701330693@s.whatsapp.net'; // Owner/Staff
    const channelChatId = '120363418582531215@newsletter';

    const teks = `
╭─🌠 [ NUOVO SUGGERIMENTO ] 
│ 👤 *Utente:* @${m.sender.split('@')[0]}
│
│ 💡 *Suggerimento:*
│ ${text}
│
│ Vuoi pubblicare questo suggerimento nella newsletter?
│
│ ✅ per *confermare*
│ ❌ per *rifiutare*
╰─────────────`.trim();
    let sentMsg = await conn.sendMessage(staffChatId, { text: teks, mentions: [m.sender] }, { quoted: m });
    conn.suggerimenti = conn.suggerimenti || {};
    conn.suggerimenti[sentMsg.key.id] = {
        testo: text,
        autore: m.sender,
        channelChatId,
        staffChatId,
        originalMsg: m,
    };

    m.reply('🌠 Il tuo suggerimento è stato inviato allo Staff di varebot per approvazione!');
}
handler.before = async function (m, { conn }) {
    if (!conn.suggerimenti) return;
    if (!m.quoted || !conn.suggerimenti[m.quoted.id]) return;

    let sug = conn.suggerimenti[m.quoted.id];
    let risposta = m.text.trim().toLowerCase();

    if (risposta === '✅' || risposta === 'conferma' || risposta === 'si') {
        const testoNewsletter = `
╭─🌠 [ SUGGERIMENTO APPROVATO ] 
│ 🛡️ Da: @${sug.autore.split('@')[0]}
│
│ 💡 ${sug.testo}
╰───────────────`.trim();
        await conn.sendMessage(sug.channelChatId, { text: testoNewsletter, mentions: [sug.autore] });
        await conn.sendMessage(sug.staffChatId, { text: '✅ Suggerimento pubblicato nella newsletter!' }, { quoted: m });
        delete conn.suggerimenti[m.quoted.id];
    } else if (risposta === '❌' || risposta === 'rifiuta' || risposta === 'no') {
        await conn.sendMessage(sug.staffChatId, { text: '❌ Suggerimento rifiutato.' }, { quoted: m });
        delete conn.suggerimenti[m.quoted.id];
    }
};

handler.help = ['suggerimento'];
handler.tags = ['creatore'];
handler.command = ['suggerimento', 'suggerisci'];
handler.group = true;

export default handler;
