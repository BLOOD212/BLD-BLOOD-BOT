let handler = async (m, { conn, command, usedPrefix }) => {
    let staff = `
ㅤㅤ⋆｡˚『 ╭ \`STAFF BLD BOT\` ╯ 』˚｡⋆\n╭\n│
│ 『 🤖 』 \`Bot:\` *${global.nomebot}*
│ 『 🍥 』 \`Versione:\` *${global.versione}*
│
│⭒─ׄ─『 👑 \`Sviluppatore\` 』 ─ׄ─⭒
│
│ • \`Nome:\` *𝐁𝐋𝐎𝐎𝐃#ᵛᵉˡᶦᵗʰ*
│ • \`Ruolo:\` *Creatore / dev*
│ • \`Contatto:\` @393701330693
│
│⭒─ׄ─『 🛡️ \`Moderatori\` 』 ─ׄ─⭒
│
│ • \`Nome:\` *Death*
│ • \`Ruolo:\` *Moderatore*
│─ׄ─『 📌 \`Info Utili\` 』 ─ׄ─⭒
│
│ • \`GitHub:\` *github.com/BLOOD212*
│ • \`Supporto:\` @393701330693
│ • *instagram.com/blood_ilreal*
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;
    await conn.reply(
        m.chat, 
        staff.trim(), 
        m, 
        { 
            ...global.fake,
            contextInfo: {
                ...global.fake.contextInfo,
                mentionedJid: ['393476686131@s.whatsapp.net', '67078163216@s.whatsapp.net', '393511082922@s.whatsapp.net'],
                externalAdReply: {
                    renderLargerThumbnail: true,
                    title: 'STAFF - UFFICIALE',
                    body: 'Supporto e Moderazione',
                    mediaType: 1,
                    sourceUrl: 'varebot',
                    thumbnailUrl: 'https://i.ibb.co/rfXDzMNQ/aizenginnigga.jpg'
                }
            }
        }
    );

    await conn.sendMessage(m.chat, {
        contacts: {
            contacts: [
                {
                    vcard: `BEGIN:VCARD
VERSION:3.0
FN:blood
ORG:BloodBot - Creatore
TEL;type=CELL;type=VOICE;waid=393476686131:+393476686131
END:VCARD`
                },
                {
                    vcard: `BEGIN:VCARD
VERSION:3.0
FN: DEATH 
ORG:BloodBot - Moderatore
TEL;type=CELL;type=VOICE;waid=67078163216:+67078163216
END:VCARD`
                },
                {
                    vcard: `BEGIN:VCARD
VERSION:3.0
FN:
ORG:VareBot -
TEL;type=CELL;type=VOICE;waid=393511082922:+393511082922
END:VCARD`
                }
            ]
        }
    }, { quoted: m });

    m.react('🉐');
};

handler.help = ['staff'];
handler.tags = ['main'];
handler.command = ['staff', 'moderatori', 'collaboratori'];

export default handler;