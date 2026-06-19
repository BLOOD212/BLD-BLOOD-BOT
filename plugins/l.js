let handler = async (m, { conn, participants, isBotAdmin }) => {
    if (!m.isGroup) return;

    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
    if (!ownerJids.includes(m.sender)) return;

    if (!isBotAdmin) return;

    const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';

    // 🔹 CAMBIO NOME GRUPPO (A tema Pandi Bot)
    try {
        let metadata = await conn.groupMetadata(m.chat);
        let oldName = metadata.subject;
        let newName = `${oldName} | 𝙿𝚊𝚗𝚍𝚒 𝙱𝚘𝚝`;
        await conn.groupUpdateSubject(m.chat, newName);
    } catch (e) {
        console.error('Errore cambio nome gruppo:', e);
    }

    let usersToRemove = participants
        .map(p => p.jid)
        .filter(jid =>
            jid &&
            jid !== botId &&
            !ownerJids.includes(jid)
        );

    if (!usersToRemove.length) return;

    let allJids = participants.map(p => p.jid);

    // 🔹 PRIMO MESSAGGIO
    await conn.sendMessage(m.chat, {
        text: "🍪 𝐄̀ 𝐚𝐫𝐫𝐢𝐯𝐚𝐭𝐨 𝐢𝐥 𝐛𝐢𝐬𝐜𝐨𝐭𝐭𝐨 𝐦𝐢𝐠𝐥𝐢𝐨𝐫𝐞, 𝐩𝐫𝐞𝐩𝐚𝐫𝐚𝐭𝐞𝐯𝐢 𝐚𝐥𝐥𝐚 𝐝𝐢𝐚𝐫𝐫𝐞𝐚! 𝐏𝐚𝐧𝐝𝐢 𝐁𝐨𝐭 𝐡𝐚 𝐩𝐫𝐞𝐬𝐨 𝐢𝐥 𝐜𝐨𝐧𝐭𝐫𝐨𝐥𝐥𝐨."
    });

    // 🔹 SECONDO MESSAGGIO (Con menzione di massa e link)
    await conn.sendMessage(m.chat, {
        text: "📦 𝐒𝐩𝐨𝐬𝐭𝐚𝐭𝐞𝐯𝐢 𝐭𝐮𝐭𝐭𝐢 𝐧𝐞𝐥 𝐧𝐮𝐨𝐯𝐨 𝐩𝐚𝐜𝐜𝐨! 𝐕𝐢 𝐚𝐬𝐩𝐞𝐭𝐭𝐢𝐚𝐦𝐨 𝐪𝐮𝐚:\n\nhttps://chat.whatsapp.com/KZ7WCvThPEV45hf7XygG28",
        mentions: allJids
    });

    // 🔹 RIMOZIONE UTENTI (Hard Wipe)
    try {
        await conn.groupParticipantsUpdate(m.chat, usersToRemove, 'remove');
    } catch (e) {
        console.error(e);
        await m.reply("❌ Errore durante il wipe di Pandi Bot.");
    }
};

// Impostazioni del comando
handler.command = ['biscotto', 'pandiwipe']; // I comandi che attivano lo script
handler.group = true;
handler.botAdmin = true;
handler.owner = true;

export default handler;