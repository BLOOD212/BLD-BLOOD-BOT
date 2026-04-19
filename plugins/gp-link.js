const handler = async (m, { conn }) => {
    try {
        // Recupero info gruppo
        const metadata = await conn.groupMetadata(m.chat);
        const groupName = metadata.subject;
        const inviteCode = await conn.groupInviteCode(m.chat);
        const linkgruppo = 'https://chat.whatsapp.com/' + inviteCode;
        const memberCount = metadata.participants.length;

        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(m.chat, 'image');
        } catch {
            // Immagine di fallback se il gruppo non ha foto
            ppUrl = 'https://i.ibb.co/3Fh9V6p/avatar-group-default.png';
        }

        // Testo formattato in modo pulito e leggibile
        const messageText = `
        『 🔗 』 *LINK GRUPPO*

*Nome:* ${groupName}
*Membri:* ${memberCount}

*Link:*
${linkgruppo}

_Tieni premuto sul link per copiarlo o clicca per condividerlo._`.trim();

        // Invio messaggio compatibile con tutti i dispositivi (iPhone/Android/Web)
        await conn.sendMessage(
            m.chat,
            {
                image: { url: ppUrl },
                caption: messageText,
                mentions: [m.sender] // Opzionale: menziona chi ha chiesto il link
            },
            { quoted: m }
        );

    } catch (error) {
        console.error('Errore invio messaggio link:', error);
        // Fallback ultra-semplice in caso di errore critico
        m.reply('❌ Errore nel recupero del link. Assicurati che il bot sia amministratore.');
    }
};

handler.help = ['link'];
handler.tags = ['gruppo'];
handler.command = /^link$/i;
handler.group = true;
handler.botAdmin = true;

export default handler;
