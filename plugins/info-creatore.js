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

*───╼  SOCIAL LINKS  ╾───*
『 🔗 』*GitHub:* github.com/BLOOD212
『 📸 』*Instagram:* @blood_ilreal

━━━━━━━━━━━━━━━━━━━━
   *😈 BLD-BLOOD-BOT ⚡*
━━━━━━━━━━━━━━━━━━━━`.trim()

  const buttons = [
    {
      name: "cta_url",
      buttonParamsJson: JSON.stringify({
        display_text: "💻 GitHub",
        url: "https://github.com/BLOOD212/BLD-BLOOD-BOT"
      })
    },
    {
      name: "cta_url",
      buttonParamsJson: JSON.stringify({
        display_text: "📸 Instagram",
        url: "https://www.instagram.com/blood_ilreal"
      })
    },
    {
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
        display_text: "⚡ Status",
        id: `${usedPrefix}ping`
      })
    },
    {
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
        display_text: "🛡️ Menu",
        id: `${usedPrefix}menu`
      })
    }
  ]

  try {
    await conn.sendMessage(m.chat, {
      text: text,
      footer: 'ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙʟᴅ ʙʟᴏᴏᴅ ʙᴏᴛ',
      mentions: [m.sender],
      buttons: buttons,
      viewOnce: true // Fondamentale per le nuove versioni di WhatsApp
    }, { quoted: m })
  } catch (e) {
    console.error("Errore invio bottoni:", e)
    // Fallback in caso di errore totale
    await conn.reply(m.chat, text, m, { mentions: [m.sender] })
  }
}

handler.help = ['owner']
handler.tags = ['info']
handler.command = ['owner', 'creatore']

export default handler
