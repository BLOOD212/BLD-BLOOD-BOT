var handler = async (m, { conn, participants }) => {
    try {
        // 1. Identificazione dell'utente da rimuovere (menzionato o quotato)
        let user = m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null)

        if (!user) {
            return m.reply('*Chi vuoi rimuovere? Menziona qualcuno o rispondi a un suo messaggio.*')
        }

        // 2. Recupero info gruppo e ruoli
        const groupInfo = await conn.groupMetadata(m.chat)
        const groupAdmins = participants.filter(p => p.admin).map(p => p.id)
        
        // Definiamo i "protetti"
        const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net'
        const ownerBot = global.owner[0] && global.owner[0][0] ? global.owner[0][0] + '@s.whatsapp.net' : ''
        const isTargetAdmin = groupAdmins.includes(user)

        // 3. Controlli di sicurezza (Gerarchia)
        
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

        // 4. Esecuzione della rimozione
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
handler.command = /^(kick|rimuovi|paki|ban|abdul)$/i // Aggiunto 'abdul' qui per pulizia
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
