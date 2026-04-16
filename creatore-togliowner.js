let handler = async (m, { conn, text, usedPrefix, command }) => {
    let isCreator = false
    try {
        const sender = m.sender.split('@')[0]
        isCreator = global.sam
            .map(entry => Array.isArray(entry) ? entry[0] : entry)
            .map(v => v.toString())
            .includes(sender)
    } catch (e) {
        console.error('Errore verifica creatore:', e)
    }

    if (!isCreator) return m.reply('*⚠️ Solo il creatore del bot può rimuovere owner*')
    if (!text) return m.reply(`*⚠️ Specifica il numero da rimuovere come owner*\n\n*Esempio:*\n${usedPrefix + command} @user`)

    let who
    if (m.isGroup) {
        who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    } else {
        who = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    }

    if (!who) return m.reply('*⚠️ Tagga un utente o specifica un numero*')

    const targetNumber = who.split('@')[0]
    if (!global.owner.map(([number]) => number).includes(targetNumber)) {
        return m.reply('*⚠️ Questo utente non è un owner*')
    }

    if (global.sam.map(([number]) => number).includes(targetNumber)) {
        return m.reply('*⚠️ Non puoi rimuovere il creatore del bot*')
    }

    try {
        global.owner = global.owner.filter(([number]) => number !== targetNumber)

        const fs = await import('fs')
        const path = await import('path')
        const configPath = path.join(process.cwd(), 'config.js')

        let configContent = await fs.promises.readFile(configPath, 'utf8')

        const ownerLineRegex = new RegExp(`\\[['"]${targetNumber}['"].*?\\],?\\n?`, 'g')
        configContent = configContent.replace(ownerLineRegex, '')

        await fs.promises.writeFile(configPath, configContent, 'utf8')

        if (global.db.data.users[who]) {
            global.db.data.users[who].role = 'user'
            global.db.data.users[who].premium = false
            global.db.data.users[who].premiumTime = 0
        }

        await m.reply(`*✅ @${targetNumber} è stato rimosso dagli owner*\n\n*Privilegi revocati:*\n• Accesso comandi owner\n• Premium\n• Badge owner\n\n*✓ Config.js aggiornato*`, null, {
            mentions: [who]
        })

    } catch (e) {
        console.error('Errore togliowner:', e)
        m.reply('*❌ Si è verificato un errore durante la rimozione dell\'owner*')
    }
}

handler.help = ['togliowner @user']
handler.tags = ['creatore']
handler.command = /^(togliowner|removeowner|delowner)$/i
handler.creatorebot = true
handler.rowner = true 
handler.mods = false

export default handler