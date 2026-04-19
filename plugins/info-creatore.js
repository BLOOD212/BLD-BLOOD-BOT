let handler = async (m, { conn, usedPrefix }) => {
  let mention = `@${m.sender.split('@')[0]}`
  let text = `
*╭───╼ ⚡ ╾───╮*
   *DEVELOPER INFO*
*╰───╼ 👑 ╾───╯*

👋 Ciao ${mention}, 
ecco i riferimenti ufficiali del mio creatore.

*┏━━━━━━━━━━━━━━━━┓*
*┃* 👤 *OWNER:* Blood
*┃* 🪐 *STATUS:* Online
*┃* 💻 *DEV:* JavaScript / Node.js
*┗━━━━━━━━━━━━━━━━┛*

━━━━━━━━━━━━━━━━━━━━
   *😈 𝖇𝖑𝖔𝖔𝖉 𝖉𝖔𝖒𝖎𝖓𝖆 ⚡*
━━━━━━━━━━━━━━━━━━━━`.trim()

  // Usiamo il prefisso direttamente nell'ID per attivare il comando
  const buttons = [
    { buttonId: `${usedPrefix}menu`, buttonText: { displayText: '🛡️ MENU' }, type: 1 },
    { buttonId: `${usedPrefix}ping`, buttonText: { displayText: '⚡ STATUS' }, type: 1 },
    { buttonId: `${usedPrefix}git`, buttonText: { displayText: '💻 GITHUB' }, type: 1 },
    { buttonId: `${usedPrefix}insta`, buttonText: { displayText: '📸 INSTAGRAM' }, type: 1 }
  ]

  const buttonMessage = {
      text: text,
      footer: 'ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙʟᴅ ʙʟᴏᴏᴅ ʙᴏᴛ',
      buttons: buttons,
      headerType: 1,
      mentions: [m.sender]
  }

  await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
}

// Invece di handler.before, usiamo handler.all o registriamo i comandi separatamente
handler.all = async (m) => {
  if (!m.text) return
  
  // Riconoscimento dei Button ID
  if (m.text.endsWith('git')) {
    await conn.reply(m.chat, '💻 *GitHub:* https://github.com/BLOOD212/BLD-BLOOD-BOT', m)
  }
  if (m.text.endsWith('insta')) {
    await conn.reply(m.chat, '📸 *Instagram:* https://www.instagram.com/blood_ilreal', m)
  }
}

handler.help = ['owner']
handler.tags = ['info']
handler.command = /^(owner|creatore|git|insta)$/i // Aggiunti i comandi qui

export default handler
