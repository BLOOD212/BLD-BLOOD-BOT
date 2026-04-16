import moment from 'moment-timezone'

let handler = async (m, { conn, usedPrefix }) => {
    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
    
    if (!(who in global.db.data.users)) {
        return conn.reply(m.chat, `㌌ L'utente non si trova nel mio database.`, m)
    }
    let ppimg
    try {
        ppimg = await conn.profilePictureUrl(who, 'image')
    } catch {
        ppimg = 'https://i.ibb.co/BKHtdBNp/default-avatar-profile-icon-1280x1280.jpg'
    }

    let user = global.db.data.users[who]
    let name = await conn.getName(who)
    let premium = user.premium ? '✅' : '❌'
    const formatNumber = (num) => {
        return num.toLocaleString('it-IT')
    }
    let totalStars = (user.euro || 0) + (user.bank || 0)

    let text = `
ㅤㅤ⋆｡˚『 ╭ \`INVENTARIO\` ╯ 』˚｡⋆\n╭\n│
│ 『 👤 』 \`Nome:\` *${name}*
│ 『 🍥 』 \`Utente:\` *@${who.split('@')[0]}*
│
│ 『 💰 』 _*Risorse Principali:*_
│ • 『 🌟 』 \`euro:\` *${formatNumber(user.euro || 0)}*
│ • 『 🏦 』 \`In Banca:\` *${formatNumber(user.bank || 0)}*
│ • 『 💎 』 \`Totale:\` *${formatNumber(totalStars)}*
│
│ 『 📊 』 _*Statistiche:*_
│ • 『 ✨ 』 \`XP:\` *${formatNumber(user.exp || 0)}*
│ • 『 ❤️ 』 \`Salute:\` *${user.health || 100}/100*
│ • 『 ⚜️ 』 *\`Premium:\`* *${user.premium ? '✅' : '❌'}*
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

    await conn.sendFile(m.chat, ppimg, 'profile.jpg', text, m, false, { mentions: [who] })
}

handler.help = ['inventario [@user]']
handler.tags = ['euro']
handler.command = ['inventario', 'inv'] 
handler.register = true

export default handler
