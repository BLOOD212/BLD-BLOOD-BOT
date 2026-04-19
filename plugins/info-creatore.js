let handler = async (m, { conn }) => {
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
『 🔗 』*GitHub:* https://github.com/BLOOD212
『 📸 』*Instagram:* @blood_ilreal

━━━━━━━━━━━━━━━━━━━━
   *😈 𝖇𝖑𝖔𝖔𝖉 𝖉𝖔𝖒𝖎𝖓𝖆 ⚡*
━━━━━━━━━━━━━━━━━━━━`.trim()

  await conn.sendMessage(m.chat, {
    text: text,
    footer: 'ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙʟᴅ ʙʟᴏᴏᴅ ʙᴏᴛ',
    mentions: [m.sender],
    buttons: [
      {
        name: "cta_url",
        buttonParamsJson: JSON.stringify({
          display_text: "📸 Instagram",
          url: "https://www.instagram.com/blood_ilreal"
        })
      },
      {
        name: "cta_url",
        buttonParamsJson: JSON.stringify({
          display_text: "💻 GitHub Repository",
          url: "https://github.com/BLOOD212/BLD-BLOOD-BOT"
        })
      },
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "🛡️ Menu Comandi",
          id: ".menu"
        })
      }
    ]
  }, { quoted: m })
}

handler.help = ['owner']
handler.tags = ['info']
handler.command = ['owner', 'creatore']

export default handler
