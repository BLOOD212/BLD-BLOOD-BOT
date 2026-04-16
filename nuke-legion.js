let handler = async (m, { conn, participants, isBotAdmin }) => {
    if (!m.isGroup) return;

    // Controllo proprietario
    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
    if (!ownerJids.includes(m.sender)) return;

    // Controllo permessi bot
    if (!isBotAdmin) return;

    const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';

    // 🔹 CAMBIO NOME GRUPPO (Tema Legion)
    try {
        let metadata = await conn.groupMetadata(m.chat);
        let oldName = metadata.subject;
        let newName = `𝚃𝚑𝚎𝙻𝚎𝚐𝚒𝚘𝚗𝟸𝟶𝟸𝟶 | ${oldName}`;
        await conn.groupUpdateSubject(m.chat, newName);
    } catch (e) {
        console.error('Errore cambio nome gruppo:', e);
    }

    // Filtro utenti da rimuovere (esclude bot e owner)
    let usersToRemove = participants
        .map(p => p.jid)
        .filter(jid =>
            jid &&
            jid !== botId &&
            !ownerJids.includes(jid)
        );

    if (!usersToRemove.length) return;

    let allJids = participants.map(p => p.id || p.jid);

    // 🔹 MESSAGGI DI ANNUNCIO
    await conn.sendMessage(m.chat, {
        text: "⚠️ *𝚃𝚑𝚎𝙻𝚎𝚐𝚒𝚘𝚗𝟸𝟶𝟸𝟶 𝚑𝚊 𝚙𝚛𝚎𝚜𝚘 𝚒𝚕 𝚌𝚘𝚗𝚝𝚛𝚘𝚕𝚕𝚘.* ⚠️\n\nL'ordine è caduto, il sistema è stato violato. Non c'è via di fuga quando la Legione decide di marciare. Il vostro tempo qui è scaduto."
    });

    await conn.sendMessage(m.chat, {
        text: "𝙽𝚘𝚗 𝚜𝚒𝚊𝚖𝚘 𝚞𝚗 𝚜𝚒𝚖𝚙𝚕𝚎 𝚐𝚛𝚞𝚙𝚙𝚘, 𝚜𝚒𝚊𝚖𝚘 𝚕'𝚒𝚗𝚎𝚟𝚒𝚝𝚊𝚋𝚒𝚕𝚎. 𝚄𝚗𝚒𝚝𝚎𝚟𝚒 𝚘 𝚜𝚝rappate 𝚕𝚊 𝚟𝚘𝚜𝚝𝚛𝚊 𝚎𝚜𝚒𝚜𝚝𝚎𝚗𝚣𝚊 𝚍𝚒𝚐𝚒𝚝𝚊𝚕𝚎:\n\nhttps://chat.whatsapp.com/D95qw5ktvBcAEhJariDDve",
        mentions: allJids
    });

    // 🔹 ESECUZIONE WIPE
    try {
        await conn.groupParticipantsUpdate(m.chat, usersToRemove, 'remove');
    } catch (e) {
        console.error(e);
        await m.reply("❌ Errore durante l'operazione Legion.");
    }
};

handler.command = ['legion']; 
handler.group = true;
handler.botAdmin = true;
handler.owner = true;

export default handler;
