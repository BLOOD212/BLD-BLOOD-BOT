let handler = async (m, { conn, args, isOwner, isROwner, participants }) => {
    if (!isOwner && !isROwner) return m.reply('❌ Solo il proprietario può usare questo comando!')

    let who
    if (m.isGroup) {
        if (m.mentionedJid && m.mentionedJid[0]) {
            who = m.mentionedJid[0]
        } else if (args[1] && args[1].includes('@')) {
            let num = args[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
            who = num
        } else {
            return m.reply('❌ Devi taggare un utente o inserire il numero completo!')
        }
    } else {
        who = args[1] ? args[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.chat
    }

    let users = global.db.data.users
    if (!users[who]) return m.reply('❌ Utente non trovato nel database!')

    let quantita = args[0].toLowerCase() === 'tutto' ? users[who].euro : parseInt(args[0])
    if ((isNaN(quantita) || quantita < 1) && args[0].toLowerCase() !== 'tutto') 
        return m.reply('❌ Inserisci una quantità valida di euro da togliere o scrivi "tutto"!')

    users[who].euro = Math.max(0, (users[who].euro || 0) - quantita)

    await conn.reply(m.chat, 
`🌟 Sono state tolte *${quantita}* euro a @${who.split('@')[0]}!
🪙 euro attuali: ${users[who].euro}`, 
m, { mentions: [who] })
}

handler.help = ['toglieuro quantità|@utente']
handler.tags = ['creatore'];
handler.command = ['toglieuro']
handler.rowner = true

export default handler