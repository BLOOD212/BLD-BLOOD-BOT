let handler = async (m, { conn }) => {
let text = `
╭━━━━━━━━━━━╮
┃   👑 *OWNER* 👑   
╰━━━━━━━━━━━╯

✨ *Contatti ufficiali*

📞 *WhatsApp*
wa.me/393701330693

📸 *Instagram*
@bloodvelith

💻 *GitHub*
https://github.com/BLOOD212/BLD-BLOOD1

📧 *Email*
blooddomina@gmail.com

━━━━━━━━━━━━━━━━━━━━
😈 *BLOOD DOMINA*
⚡ Potere. Stile. Controllo.
━━━━━━━━━━━━━━━━━━━━
`

await conn.sendMessage(m.chat, { text }, { quoted: m })
}

handler.help = ['owner']
handler.tags = ['info']
handler.command = ['owner']

export default handler
