const handler = async (m, { conn }) => {
    try {
        const metadata = await conn.groupMetadata(m.chat);
        const groupName = metadata.subject;
        const inviteCode = await conn.groupInviteCode(m.chat);
        const linkgruppo = 'https://chat.whatsapp.com/' + inviteCode;
        let ppUrl;
        
        try {
            ppUrl = await conn.profilePictureUrl(m.chat, 'image');
        } catch {
            ppUrl = 'https://i.ibb.co/3Fh9V6p/avatar-group-default.png';
        }

        const linkCard = {
            image: { url: ppUrl },
            title: `『 🔗 』 *\`link gruppo:\`*`,
            body: `- *${metadata.participants.length} Membri* \n- *${linkgruppo}*`,
            footer: '',
            buttons: [
                {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📎 Copia Link',
                        copy_code: linkgruppo
                    })
                },
            ]
        }
        await conn.sendMessage(
            m.chat,
            {
                text: `*${groupName}*`,
                footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙',
                cards: [linkCard]
            },
            { quoted: m }
        )

    } catch (error) {
        console.error('Errore invio messaggio link:', error);
        const metadata = await conn.groupMetadata(m.chat);
        const groupName = metadata.subject;
        const inviteCode = await conn.groupInviteCode(m.chat);
        const linkgruppo = 'https://chat.whatsapp.com/' + inviteCode;
        let ppUrl;
        
        try {
            ppUrl = await conn.profilePictureUrl(m.chat, 'image');
        } catch {
            ppUrl = null;
        }

        const interactiveButtons = [
            {
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                    display_text: "Copia link 📎",
                    id: linkgruppo,
                    copy_code: linkgruppo
                })
            },
        ];

        const messageText = `*\`Link gruppo:\`*\n- *${groupName}*\n- *${linkgruppo}*`;

        if (ppUrl) {
            await conn.sendMessage(m.chat, {
                image: { url: ppUrl },
                caption: messageText,
                interactiveButtons
            }, { quoted: m });
        } else {
            const interactiveMessage = {
                text: messageText,
                interactiveButtons
            };
            await conn.sendMessage(m.chat, interactiveMessage, { quoted: m });
        }
    }
};

handler.help = ['link'];
handler.tags = ['gruppo'];
handler.command = /^link$/i;
handler.group = true;
handler.botAdmin = true;

export default handler;