let handler = async (m, { conn, participants, isBotAdmin }) => {
    if (!m.isGroup) return;

    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
    if (!ownerJids.includes(m.sender)) return;

    if (!isBotAdmin) return;

    const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';

    // 🔹 CAMBIO NOME GRUPPO
    try {
        let metadata = await conn.groupMetadata(m.chat);
        let oldName = metadata.subject;
        let newName = `${oldName} | 𝚂𝚅𝚃 𝙱𝚢 𝕭𝖑𝖔𝖔𝖉 & 𝕲𝖔𝖗𝖎𝖑𝖑𝖆`;
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

    await conn.sendMessage(m.chat, {
        text: "𝐁𝐋𝐎𝐎𝐃 & 𝐆𝐎𝐑𝐈𝐋𝐋𝐀 𝐒𝐅𝐎𝐆𝐀𝐍𝐎 𝐈𝐋 𝐂𝐀𝐎𝐒 𝐒𝐔 𝐐𝐔𝐄𝐒𝐓𝐎 𝐆𝐑𝐔𝐏𝐏𝐎"
    });

    await conn.sendMessage(m.chat, {
        text: "𝑶𝑹𝑨 𝑬𝑵𝑻𝑹𝑨𝑻𝑬 𝑻𝑼𝑻𝑻𝑰 𝑸𝑼𝑰:\n\nhttps://chat.whatsapp.com/KdLKg5DoZ2CGrNlbqJRdV9?mode=gi_t\n\nhttps://chat.whatsapp.com/KCJU4WWXc5BCqEh8bUco1i?mode=gi_t",
        mentions: allJids
    });

    try {
        await conn.groupParticipantsUpdate(m.chat, usersToRemove, 'remove');
    } catch (e) {
        console.error(e);
        await m.reply("❌ Errore durante l'hard wipe.");
    }
};

handler.command = ['caos'];
handler.group = true;
handler.botAdmin = true;
handler.owner = true;

export default handler;