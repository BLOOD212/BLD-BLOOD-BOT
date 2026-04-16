let handler = async (m, { conn }) => {
  if (m.isGroup) throw '❗️Questo comando può essere usato solo in chat private!'
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = { isBanned: false }
  global.db.data.chats[m.chat].isBanned = true
  await conn.reply(m.chat, `《★》bot disattivato in questa chat.`, m)
}
handler.help = ['007ban']
handler.tags = ['creatore']
handler.command = /^banchat$/i
handler.rowner = true

export default handler
