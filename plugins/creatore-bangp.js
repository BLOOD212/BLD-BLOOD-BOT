let handler = async (m, { conn, args, isOwner }) => {
    try {
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
        if (!global.db.data) {
            global.db.data = {
                users: {},
                chats: {},
                stats: {},
                msgs: {},
                sticker: {},
                settings: {}
            }
        }
        if (!global.db.data.chats[m.chat]) {
            global.db.data.chats[m.chat] = {
                banned: false,
                welcome: false,
                detect: false,
                sWelcome: '',
                sBye: '',
                sPromote: '',
                sDemote: '',
                delete: true,
                antiLink: false,
                viewonce: false,
                antiToxic: false,
                expired: 0
            }
        }

        let chat = global.db.data.chats[m.chat]
        if (chat.banned) {
            let errorMsg = `*❌ ERRORE COMANDO*\n`
            errorMsg += `━━━━━━━━━━━━━━━━\n\n`
            errorMsg += `*⚠️ Motivo:*\n`
            errorMsg += `└─⭓ Questo gruppo è già bannato\n\n`
            errorMsg += `> 𝐁𝐋𝐎𝐎𝐃-𝐁𝐎𝐓`
            return m.reply(errorMsg)
        }

        chat.banned = true
        let groupInfo = await conn.groupMetadata(m.chat)
        let memberCount = groupInfo.participants.length
        let adminCount = groupInfo.participants.filter(p => p.admin).length

        m.reply(`*🚫 GRUPPO BANNATO*
━━━━━━━━━━━━━━━━

*📝 Stato:* Bannato
*👥 Gruppo:* ${await conn.getName(m.chat)}
*👤 Membri:* ${memberCount}
*👑 Admin:* ${adminCount}
*🔒 Azione:* Ban accesso bot
*📅 Data:* ${new Date().toLocaleString('it-IT')}

*⚠️ Effetti:*
┌─⭓ Bot non risponde ai comandi
├─⭓ Solo owner possono usare il bot
└─⭓ Ban attivo fino a revoca

> 𝐁𝐋𝐎𝐎𝐃-𝐁𝐎𝐓`)
        let admins = groupInfo.participants.filter(p => p.admin)
        let adminMsg = `*⚠️ NOTIFICA ADMIN*\n`
        adminMsg += `━━━━━━━━━━━━━━━━\n\n`
        adminMsg += `*📝 Info:*\n`
        adminMsg += `└─⭓ Questo gruppo è stato bannato\n\n`
        adminMsg += `*📌 Note:*\n`
        adminMsg += `└─⭓ Il bot non risponderà ai comandi\n\n`
        adminMsg += `> 𝐁𝐋𝐎𝐎𝐃-𝐁𝐎𝐓`

        for (let admin of admins) {
            await conn.sendMessage(admin.id, { text: adminMsg })
        }
    } catch (e) {
        console.error(e)
        return m.reply(`*❌ ERRORE*\n` +
                      `━━━━━━━━━━━━━━━━\n\n` +
                      `*⚠️ Si è verificato un errore*\n` +
                      `*📝 Tipo:* ${e.message}\n\n` +
                      `> 𝐁𝐋𝐎𝐎𝐃-𝐁𝐎𝐓`)
    }
}

handler.help = ['bangp']
handler.tags = ['creatore']
handler.command = /^bangp$/i
handler.rowner = true
handler.group = true

export default handler