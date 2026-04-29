//Codice di ADMIN_admins.js

// Plugin fatto da Gabs & 333 Staff
const handler = async (m, { conn, participants, groupMetadata, args }) => {
    const groupAdmins = participants.filter(p => p.admin);
    const mentionList = groupAdmins.map(p => p.id);
    const owner = groupMetadata.owner || 
        groupAdmins.find(p => p.admin === 'superadmin')?.id || 
        `${m.chat.split('-')[0]}@s.whatsapp.net`;

    let pesan = args.join(' ');
    let message = pesan ? pesan : '❌ Nessun messaggio fornito';

    // Costruiamo la lista usando solo i numeri (senza simboli strani tipo i LID)
    const listAdmin = groupAdmins
        .map((v, i) => `✧👑 ${i + 1}. @${v.id.split('@')[0]}`)
        .join('\n');

    let text = `
╭─────────╮
│ ⚠️ 𝐒𝐕𝐄𝐆𝐋𝐈𝐀 𝐀𝐃𝐌𝐈𝐍! 
━━━━━━━━━━━━━━
✎ 𝐌𝐄𝐒𝐒𝐀𝐆𝐆𝐈𝐎:
➥ ${message}

♔ *𝐋𝐈𝐒𝐓𝐀 𝐀𝐃𝐌𝐈𝐍:* ${listAdmin}

━━━━━━━━━━━━━━
> 𝟥𝟥𝟥 𝔹𝕆𝕋 
╰─────────╯
`.trim();

    // Usiamo sendMessage con contextInfo per assicurarci che i tag funzionino
    await conn.sendMessage(m.chat, {
        text: text,
        contextInfo: {
            mentionedJid: [...mentionList, owner],
            externalAdReply: {
                title: "『 🛎️ 』 𝐈𝐍𝐕𝐎𝐂𝐀𝐍𝐃𝐎 𝐆𝐋𝐈 𝐀𝐃𝐌𝐈𝐍",
                body: groupMetadata.subject,
                thumbnailUrl: await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || 'https://telegra.ph/file/0f336691459a936a75f1b.jpg',
                mediaType: 1,
                renderLargerThumbnail: false
            }
        }
    }, { quoted: m });
};

handler.command = ['admins', '@admins', 'dmins'];
handler.tags = ['admin'];
handler.help = ['admins <messaggio>'];
handler.group = true;
handler.admin = true;

export default handler;
