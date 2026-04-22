let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (text) {
    global.db.data.chats[m.chat].sGoodbye = text
    m.reply(`✅ **Messaggio impostato!**\nOgni volta che qualcuno uscirà da **questo** gruppo, vedrà questo testo.`)
  } else {
    m.reply(`❓ **Guida Addio**\nUsa: \`${usedPrefix + command} <testo>\`\n\n*Tag disponibili:*\n- **@user** (Menziona l'utente)\n- **@group** (Nome gruppo)\n\n*Esempio:* \`${usedPrefix + command} @user è uscito dal gruppo.\``)
  }
}
handler.command = ['setgoodbye']
handler.tags = ['strumenti']
handler.admin = true
export default handler
