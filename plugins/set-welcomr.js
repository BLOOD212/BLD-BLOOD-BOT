let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (text) {
    global.db.data.chats[m.chat].sWelcome = text
    m.reply(`✅ *Messaggio impostato!*\nOgni volta che qualcuno entrerà in *
*questo* gruppo, vedrà questo testo.`)
  } else {
    m.reply(`❓ *Guida Benvenuto*\nUsa: \`${usedPrefix + command} <testo>\`\n\n*Tag disponibili:*\n- *@user* (Menziona l'utente)\n- *@group** (Nome gruppo)\n\n*Esempio:* \`${usedPrefix + command} Ciao @user benvenuto in @group!\``)
  }
}
handler.command = ['setwelcome']
handler.tags = ['strumenti']
handler.admin = true
export default handler
