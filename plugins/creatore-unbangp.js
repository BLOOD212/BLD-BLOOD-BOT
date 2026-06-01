let handler = async (m, { conn, args, isOwner }) => {
    if (!isOwner) {
        let errorMsg = `*❌ ERRORE COMANDO*\n`
        errorMsg += `━━━━━━━━━━━━━━━━\n\n`
        errorMsg += `*⚠️ Motivo:*\n`
        errorMsg += `└─⭓ Comando riservato al proprietario\n\n`
        errorMsg += `> 𝐁𝐋𝐎𝐎𝐃-𝐁𝐎𝐓`
        return m.reply(errorMsg)
    }

    if (!m.isGroup) {
        let errorMsg = `*❌ ERRORE COMANDO*\n`
        errorMsg += `━━━━━━━━━━━━━━━━\n\n`
        errorMsg += `*⚠️ Motivo:*\n`
        errorMsg += `└─⭓ Utilizzabile solo nei gruppi\n\n`
        errorMsg += `> 𝐁𝐋𝐎𝐎𝐃-𝐁𝐎𝐓`
        return m.reply(errorMsg)
    }

    let chat = global.db.data.chats[m.chat]
    if (!chat.banned) {
        let errorMsg = `*❌ ERRORE COMANDO*\n`
        errorMsg += `━━━━━━━━━━━━━━━━\n\n`
        errorMsg += `*⚠️ Motivo:*\n`
        errorMsg += `└─⭓ Questo gruppo non è bannato\n\n`
        errorMsg += `> 𝐁𝐋𝐎𝐎𝐃-𝐁𝐎𝐓`
        return m.reply(errorMsg)
    }

    chat.banned = false
    m.reply(`*✅ GRUPPO SBANNATO*
━━━━━━━━━━━━━━━━

*📝 Stato:* Sbannato
*👥 Gruppo:* ${await conn.getName(m.chat)}
*🔓 Azione:* Unban accesso bot
*📅 Data:* ${new Date().toLocaleString('it-IT')}

> 𝐁𝐋𝐎𝐎𝐃-𝐁𝐎𝐓`)
}

handler.help = ['unbangp']
handler.tags = ['creatore']
handler.command = /^unbangp$/i
handler.rowner = true
handler.group = true

export default handler