//Codice di ADMIN_admins.js

// Plugin fatto da Gabs & 333 Staff
const handler = async (m, { conn, participants, groupMetadata, args }) => {
    const groupAdmins = participants.filter(p => p.admin);
    const listAdmin = groupAdmins
        .map((v, i) => {
            // Estraiamo il numero pulito: se è un LID o un JID, prendiamo solo la parte numerica prima della @
            const id = v.id.split('@')[0];
            return `✧👑 ${i + 1}. @${id}`;
        })
        .join('\n');

    const owner = groupMetadata.owner || 
        groupAdmins.find(p => p.admin === 'superadmin')?.id || 
        `${m.chat.split('-')[0]}@s.whatsapp.net`;

    let pesan = args.join(' ');
    let message = pesan ? pesan : '❌ Nessun messaggio fornito';

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

    // Qui passiamo gli ID reali (compresi i @lid o @s.whatsapp.net) per attivare i tag
    conn.reply(m.chat, text, m, { 
        mentions: [...groupAdmins.map(v => v.id), owner] 
    });
};

handler.command = ['admins', '@admins', 'dmins'];
handler.tags = ['admin'];
handler.help = ['admins <messaggio>'];
handler.group = true;
handler.admin = true

export default handler;
