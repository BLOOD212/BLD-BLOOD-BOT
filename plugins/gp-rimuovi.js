var handler = async (m, { conn, participants, isOwner, isAdmin }) => {
    try {
        const chat = global.db.data.chats[m.chat]
        const isAntinukeOn = chat?.antinuke || false
        const sender = m.sender

        // Recupera la lista dei moderatori dal database
        const mods = chat?.moderatori || []
        const isMod = mods.includes(sender)

        // --- 1. CONTROLLO AUTORIZZAZIONE (Logica Moderatori) ---
        
        // Se è un moderatore (ma non owner), gli vietiamo specificamente il kick
        if (isMod && !isOwner) {
            return conn.reply(m.chat, '『 🚫 』 𝐀𝐜𝐜𝐞𝐬𝐬𝐨 𝐃𝐞𝐧𝐞𝐠𝐚𝐭𝐨: Come Moderatore non hai il permesso di rimuovere membri (Kick).', m)
        }

        // Controllo standard per gli altri utenti (non admin e non owner)
        if (!isAdmin && !isOwner) {
            return conn.reply(m.chat, '『 ❌ 』 𝐀𝐜𝐜𝐞𝐬𝐬𝐨 𝐃𝐞𝐧𝐞𝐠𝐚𝐭𝐨: Solo gli amministratori possono usare questo comando.', m)
        }

        // --- 2. CONTROLLO ANTINUKE ---
        if (isAntinukeOn && !isOwner) {
            return conn.reply(m.chat, '『 🛡️ 』 𝐀𝐧𝐭𝐢𝐧𝐮𝐤𝐞 𝐀𝐭𝐭𝐢𝐯𝐨: In questa modalità solo il Creatore può rimuovere membri per sicurezza.', m)
        }

        // --- 3. IDENTIFICAZIONE UTENTE TARGET ---
        let user = m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null)

        if (!user) {
            return m.reply('『 👤 』 *Chi vuoi rimuovere? Menziona qualcuno o rispondi a un suo messaggio.*')
        }

        // --- 4. CONTROLLI DI SICUREZZA (Gerarchia) ---
        const groupInfo = await conn.groupMetadata(m.chat)
        const groupAdmins = participants.filter(p => p.admin).map(p => p.id)
        
        const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net'
        const ownerBot = global.owner[0] && global.owner[0][0] ? global.owner[0][0] + '@s.whatsapp.net' : ''
        const isTargetAdmin = groupAdmins.includes(user)

        // Impedisce al bot di auto-eliminarsi
        if (user === conn.user.jid) {
            return conn.reply(m.chat, '『 🤨 』 `Non posso rimuovermi da solo`', m);
        }

        // Impedisce di rimuovere il proprietario del gruppo (Creator)
        if (user === ownerGroup) {
            return conn.reply(m.chat, '『 🍥 』 `Non posso rimuovere il proprietario del gruppo`', m);
        }

        // Impedisce di rimuovere il proprietario del bot (Sviluppatore)
        if (user === ownerBot) {
            return conn.reply(m.chat, '『 ⁉️ 』 `A chi vuoi togliere????`', m);
        }

        // BLOCO RIMOZIONE ADMIN: Se l'utente target è un admin, il bot si ferma
        if (isTargetAdmin) {
            return conn.reply(m.chat, '『 🤒 』 `Non posso rimuovere un altro admin. Devi prima togliergli i privilegi.`', m);
        }

        // --- 5. ESECUZIONE DELLA RIMOZIONE ---
        await conn.groupParticipantsUpdate(m.chat, [user], 'remove');

        // Invio dello sticker di conferma
        await conn.sendMessage(m.chat, { 
            sticker: { url: './media/sticker/bann.webp' } 
        }, { quoted: m });

    } catch (e) {
        console.error(e)
        return m.reply(`${global.errore || 'Errore durante l\'esecuzione del comando.'}`)
    }
}

handler.help = ['rimuovi']
handler.tags = ['gruppo']
handler.command = /^(kick|rimuovi|paki|ban|abdul)$/i
handler.group = true
handler.admin = true // Lasciamo true per il middleware, ma il controllo interno gestisce i Moderatori
handler.botAdmin = true

export default handler
