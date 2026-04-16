import fs from 'fs'
const DB_PATH = '../database.json'

let handler = async (m, { conn, args, usedPrefix, command, text }) => {
    const isOwner = m.fromMe || global.owner
        .filter(v => v) // Rimuove valori null/undefined
        .map(v => {
            if (typeof v !== 'string') return String(v).replace(/[^0-9]/g, '')
            return v.replace(/[^0-9]/g, '')
        })
        .map(v => v + '@s.whatsapp.net')
        .includes(m.sender)

    if (!isOwner) return m.reply(`╭━━━•❃°•°❀°•°❃•━━━╮
┃ 🚫 *ACCESSO NEGATO*
┃ Solo il proprietario può
┃ usare questo comando
╰━━━•❃°•°❀°•°❃•━━━╯`)

    try {
        if (!args[0]) {
            return m.reply(`╭━━━•❃°•°❀°•°❃•━━━╮
┃ 📋 *DATABASE MANAGER*
┃
┃ 1️⃣ *Visualizza Valori*
┃ • ${usedPrefix}db money @user
┃ • ${usedPrefix}db level @user
┃ • ${usedPrefix}db premium @user
┃
┃ 2️⃣ *Modifica Valori* 
┃ • ${usedPrefix}db set @user money 1000
┃ • ${usedPrefix}db set @user premium true
┃
┃ 3️⃣ *Vedi Tutto*
┃ • ${usedPrefix}db list users
┃ • ${usedPrefix}db list all
╰━━━•❃°•°❀°•°❃•━━━╯`)
        }

        let db = JSON.parse(fs.readFileSync(DB_PATH))
        const mentionedJid = m.mentionedJid[0] || m.quoted?.sender || ''
        if (args[0] === 'list') {
            const category = args[1] || 'all'
            let output = `╭━━━•❃°•°❀°•°❃•━━━╮\n┃ 📊 *DATABASE ${category.toUpperCase()}*\n`
            
            if (category === 'all' || category === 'users') {
                for (let [user, data] of Object.entries(db.users)) {
                    const name = `@${user.split('@')[0]}`
                    output += `┃\n┃ 👤 *${name}*\n`
                    output += `┃ • Money: ${data.money || 0}\n`
                    output += `┃ • Level: ${data.level || 0}\n`
                    output += `┃ • Premium: ${data.premium ? '✅' : '❌'}\n`
                }
            }
            output += `╰━━━•❃°•°❀°•°❃•━━━╯`
            return m.reply(output)
        }
        if (!args[0].startsWith('set')) {
            const path = args[0]
            const user = mentionedJid
            if (!user) throw 'Tag un utente o rispondi a un messaggio'
            
            const value = db.users[user]?.[path]
            return m.reply(`╭━━━•❃°•°❀°•°❃•━━━╮
┃ 📊 *VALORE ${path.toUpperCase()}*
┃
┃ 👤 User: @${user.split('@')[0]}
┃ 📝 ${path}: ${value ?? 'Non impostato'}
╰━━━•❃°•°❀°•°❃•━━━╯`, null, { mentions: [user] })
        }
        if (args[0] === 'set') {
            const user = mentionedJid
            const [_, __, path, ...valueArr] = args
            if (!user || !path || !valueArr.length) throw 'Formato: .db set @user path valore'

            let value = valueArr.join(' ')
            if (value === 'true') value = true
            if (value === 'false') value = false
            if (!isNaN(value)) value = Number(value)

            if (!db.users[user]) db.users[user] = {}
            db.users[user][path] = value
            fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))

            return m.reply(`╭━━━•❃°•°❀°•°❃•━━━╮
┃ ✅ *VALORE MODIFICATO*
┃
┃ 👤 User: @${user.split('@')[0]}
┃ 📝 ${path}: ${value}
╰━━━•❃°•°❀°•°❃•━━━╯`, null, { mentions: [user] })
        }

    } catch (e) {
        console.error(e)
        await m.reply(`❌ Errore: ${e.message}`)
    }
}

handler.help = ['database']
handler.tags = ['owner']
handler.command = /^db$/i
handler.rowner = true

export default handler