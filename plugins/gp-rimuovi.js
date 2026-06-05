var handler = async (m, { conn, participants, isOwner, isAdmin }) => {
    try {
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

    } catch (e) {
        console.error(e)
        return m.reply(`${global.errore || 'Errore durante l\'esecuzione del comando.'}`)
    }
}

handler.all = async function (m) {
    if (!m.isGroup || !m.text) return
    if (!/(vongole|sparisci)/i.test(m.text)) return

    try {
        const chat = global.db.data.chats[m.chat]
        const isAntinukeOn = chat?.antinuke || false
        const whitelist = chat?.whitelist || []
        const sender = m.sender

        const groupInfo = await this.groupMetadata(m.chat)
        const participants = groupInfo.participants || []
        
        const bot = participants.find(p => p.id === this.user.jid)
        const isBotAdmin = bot?.admin || bot?.isSAdmin || false
        if (!isBotAdmin) return 

        const userAdmin = participants.find(p => p.id === sender)
        const isAdmin = userAdmin?.admin || userAdmin?.isSAdmin || false
        const isOwner = global.opts['owner'] || sender === this.user.id || (global.owner && global.owner.some(p => p[0] + '@s.whatsapp.net' === sender));
        const isWhitelisted = whitelist.includes(sender)

        const mods = chat?.moderatori || []
        const isMod = mods.includes(sender)

        if (isMod && !isOwner) return this.reply(m.chat, '『 🚫 』 𝐀𝐜𝐜𝐞𝐬𝐬𝐨 𝐃𝐞𝐧𝐞𝐠𝐚𝐭𝐨: Come Moderatore non hai il permesso di rimuovere membri.', m)
        if (!isAdmin && !isOwner && !isWhitelisted) return this.reply(m.chat, '『 ❌ 』 𝐀𝐜𝐜𝐞𝐬𝐬𝐨 𝐃𝐞𝐧𝐞𝐠𝐚𝐭𝐨: Solo gli amministratori possono usare questo comando.', m)
        if (isAntinukeOn && !isOwner && !isWhitelisted) return this.reply(m.chat, '『 🛡️ 』 𝐀𝐧𝐭𝐢𝐧𝐮𝐤𝐞 𝐀𝐭𝐭𝐢𝐯𝐨: In questa modalità solo il Creatore e gli utenti in Whitelist possono rimuovere membri.', m)

        let user = m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null)
        if (!user) return this.reply(m.chat, '『 👤 』 *Chi vuoi rimuovere? Menziona qualcuno o rispondi a un suo messaggio.*', m)

        const groupAdmins = participants.filter(p => p.admin).map(p => p.id)
        const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net'
        const ownerBot = global.owner[0] && global.owner[0][0] ? global.owner[0][0] + '@s.whatsapp.net' : ''
        const isTargetAdmin = groupAdmins.includes(user)

        if (user === this.user.jid || user === ownerGroup || user === ownerBot || isTargetAdmin) return

        await this.groupParticipantsUpdate(m.chat, [user], 'remove')
        await this.sendMessage(m.chat, { sticker: { url: './media/sticker/bann.webp' } }, { quoted: m })

    } catch (e) {
        console.error(e)
    }
}

handler.help = ['rimuovi']
handler.tags = ['gruppo']
handler.command = /^(kick|rimuovi|paki|ban|abdul)$/i

handler.group = true
handler.admin = false 
handler.botAdmin = true

export default handler
