const kickUser = async (m, { conn, participants, isOwner, isAdmin }) => {
    const chat = global.db.data.chats[m.chat]
    const isAntinukeOn = chat?.antinuke || false
    const whitelist = chat?.whitelist || []
    const sender = m.sender

    const mods = chat?.moderatori || []
    const isMod = mods.includes(sender)
    const isWhitelisted = whitelist.includes(sender)

    if (isMod && !isOwner) {
        return conn.reply(m.chat, '『 🚫 』 𝐀𝐜𝐜𝐞𝐬𝐬𝐨 𝐃𝐞𝐧𝐞𝐠𝐚𝐭𝐨: Come Moderatore non hai il permesso di rimuovere membri (Kick).', m)
    }

    if (!isAdmin && !isOwner && !isWhitelisted) {
        return conn.reply(m.chat, '『 ❌ 』 𝐀𝐜𝐜𝐞𝐬𝐬𝐨 𝐃𝐞𝐧𝐞𝐠𝐚𝐭𝐨: Solo gli amministratori possono usare questo comando.', m)
    }

    if (isAntinukeOn && !isOwner && !isWhitelisted) {
        return conn.reply(m.chat, '『 🛡️ 』 𝐀𝐧𝐭𝐢𝐧𝐮𝐤𝐞 𝐀𝐭𝐭𝐢𝐯𝐨: In questa modalità solo il Creatore e gli utenti in Whitelist possono rimuovere membri per sicurezza.', m)
    }

    let user = m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null)

    if (!user) {
        return m.reply('『 👤 』 *Chi vuoi rimuovere? Menziona qualcuno o rispondi a un suo messaggio.*')
    }

    const groupInfo = await conn.groupMetadata(m.chat)
    const groupAdmins = participants.filter(p => p.admin).map(p => p.id)

    const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net'
    const ownerBot = global.owner[0] && global.owner[0][0] ? global.owner[0][0] + '@s.whatsapp.net' : ''
    const isTargetAdmin = groupAdmins.includes(user)

    if (user === conn.user.jid) {
        return conn.reply(m.chat, '『 🤨 』 `Non posso rimuovermi da solo`', m);
    }

    if (user === ownerGroup) {
        return conn.reply(m.chat, '『 🍥 』 `Non posso rimuovere il proprietario del gruppo`', m);
    }

    if (user === ownerBot) {
        return conn.reply(m.chat, '『 ⁉️ 』 `A chi vuoi togliere????`', m);
    }

    if (isTargetAdmin) {
        return conn.reply(m.chat, '『 🤒 』 `Non posso rimuovere un altro admin. Devi prima togliergli i privilegi.`', m);
    }

    await conn.groupParticipantsUpdate(m.chat, [user], 'remove');

    await conn.sendMessage(m.chat, { 
        sticker: { url: './media/sticker/bann.webp' } 
    }, { quoted: m });
}

var handler = async (m, { conn, participants, isOwner, isAdmin }) => {
    try {
        await kickUser(m, { conn, participants, isOwner, isAdmin })
    } catch (e) {
        console.error(e)
        return m.reply(`${global.errore || 'Errore durante l\'esecuzione del comando.'}`)
    }
}

handler.before = async function (m, { conn, participants, isOwner, isAdmin }) {
    if (!m.isGroup) return false
    if (!m.text) return false
    
    // Controlla se la frase contiene "vongole" o "sparisci" senza bisogno di simboli o punti
    if (/(vongole|sparisci)/i.test(m.text)) {
        try {
            await kickUser(m, { conn, participants, isOwner, isAdmin })
        } catch (e) {
            console.error(e)
        }
        return true
    }
    return false
}

handler.help = ['rimuovi']
handler.tags = ['gruppo']
handler.command = /^(kick|rimuovi|paki|ban|abdul)$/i
handler.group = true
handler.admin = false 
handler.botAdmin = true

export default handler
