let handler = async (m, { conn }) => {
if (!(m.chat in global.db.data.chats)) return conn.reply(m.chat, '🎌 *Questo chat non è registrata!*', m, fake)
let chat = global.db.data.chats[m.chat]
if (!chat.isBanned) return conn.reply(m.chat, '《★》Il bot non è bannato in questa chat', m, fake)
chat.isBanned = false
await conn.reply(m.chat, `《★》varebot è stato sbannato in questa chat.`, m, fake)
}
handler.help = ['sbanchat'];
handler.tags = ['creatore'];
handler.command = ['007sban', 'sbannachat', 'sbanchat']
handler.rowner = true
handler.admin = true 
handler.botAdmin = false
handler.group = false

export default handler
