const handler = async (m, { conn, text }) => {
    const numberPattern = /\d+/g;
    let user = '';
    const numberMatches = text.match(numberPattern);
    if (numberMatches) {
        const number = numberMatches.join('');
        user = number + '@s.whatsapp.net';
    } else if (m.quoted && m.quoted.sender) {
        const quotedNumberMatches = m.quoted.sender.match(numberPattern);
        if (quotedNumberMatches) {
            const number = quotedNumberMatches.join('');
            user = number + '@s.whatsapp.net';
        } else {
        return conn.sendMessage(m.chat, {text: `*⚠️ Formato utente non riconosciuto. Rispondi a un messaggio, tagga un utente o scrivi il suo numero.*`}, {quoted: fkontak});
    }
    } else {
        return conn.sendMessage(m.chat, {text: `令 *Formato utente non riconosciuto. Rispondi a un messaggio, tagga un utente o scrivi il suo numero.*`}, {quoted: fkontak});
    }        
        const groupMetadata = m.isGroup ? await conn.groupMetadata(m.chat) : {};
        const participants = m.isGroup ? groupMetadata.participants : [];
        const users = m.isGroup ? participants.find(u => u.jid == user) : {};
        const userNumber = user.split('@')[0];
        if (!global.global.db.data.users[user] || global.global.db.data.users[user] == '') {
            return conn.sendMessage(m.chat, {text: `令 *L'utente @${userNumber} non si trova nel mio database.*`, mentions: [user]}, {quoted: fkontak});
         }
        delete global.global.db.data.users[user];
        conn.sendMessage(m.chat, {text: `令 *Successo! Tutti i dati dell'utente @${userNumber} sono stati eliminati dal mio database.*`, mentions: [user]}, {quoted: fkontak});
};
handler.tags = ['creatore'];
handler.command = /(resetdati|deletedatauser|resetuser|cancelladati|restartuser)$/i;
handler.mods = true;

export default handler;
