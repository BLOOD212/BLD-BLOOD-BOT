/*import fetch from 'node-fetch'

let dailyUsage = {};

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let who = m.quoted ? m.quoted.sender : m.mentionedJid?.[0] ? m.mentionedJid[0] : m.sender
    
    let msg = `⭔ \`Tagga qualcuno o rispondi a un messaggio\`\n\n*\`Esempio:\`* *${usedPrefix + command} @user*`
    if (!who) return m.reply(msg)

    let today = new Date().toDateString();
    let userId = m.sender;
    
    if (!dailyUsage[today]) dailyUsage[today] = {};
    if (!dailyUsage[today][userId]) dailyUsage[today][userId] = 0;
    
    if (dailyUsage[today][userId] >= 2) {
        return m.reply('🤕 Nuh uh, niente piu wanted per te, torna domani.');
    }

    try {
        let pp, username, groupName
        let hasProfilePicture = true;
        
        try {
            pp = await conn.profilePictureUrl(who, 'image')
            username = await conn.getName(who)
            groupName = m.isGroup ? (await conn.groupMetadata(m.chat)).subject : 'Chat Privata'
            if (!pp) throw 'Nessuna foto profilo trovata'
        } catch {
            hasProfilePicture = false;
        }

        if (!hasProfilePicture) {
            let notification = who === m.sender ? 
                'non hai una foto profilo 🤕' : 
                `@${who.split('@')[0]} non ha una foto profilo 🤕`;
            
            return m.reply(notification, null, { mentions: [who] });
        }

        let bounty = Math.floor(Math.random() * 1000000000)
        let formattedBounty = bounty.toLocaleString('it-IT')

        let res = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'image/*'
            }
        })
        
        if (!res.ok) throw `Errore API: ${res.status}`
        let buffer = await res.arrayBuffer()
        if (!buffer || buffer.length < 1000) throw 'Immagine non valida'

        let caption = `
『 👤 』 \`Nome:\` *${username}*
『 💰 』 \`Taglia:\` *${formattedBounty}B*
『 📍 』 \`avvistato in:\` *${groupName}*`

        dailyUsage[today][userId]++;
        await conn.sendFile(m.chat, buffer, 'wanted.jpg', caption, m, false, {
            mentions: [who],
            contextInfo: {
                mentionedJid: [who],
                externalAdReply: {
                    title: '🏴‍☠️ RICERCATO: ' + username,
                    body: `taglia di ${formattedBounty} Berry`,
                    thumbnailUrl: pp,
                    sourceUrl: global.gruppo,
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        })

    } catch (e) {
        console.error('Errore Wanted effect:', e)
        m.reply(`${global.errore}`)
    }
}

handler.help = ['wanted']
handler.tags = ['giochi']
handler.command = /^(wanted)$/i
handler.register = true
export default handler*/