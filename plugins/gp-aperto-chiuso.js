let handler = async (m, { conn, command }) => {
    let isOpen = command === 'aperto'
    await conn.groupSettingUpdate(m.chat, isOpen ? 'not_announcement' : 'announcement')
    await conn.sendMessage(m.chat, {
        text: isOpen ? '𝐩𝐚𝐫𝐥𝐚𝐭𝐞 𝐩𝐥𝐞𝐛𝐞𝐢' : '𝐨𝐫𝐚 𝐩𝐚𝐫𝐥𝐚𝐧𝐨 𝐠𝐥𝐢 𝐢𝐝𝐞𝐢',
        contextInfo: {
            forwardingScore: 99,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '',
                serverMessageId: '',
                newsletterName: global.db.data.nomedelbot || `𝐁𝐋𝐎𝐎𝐃-𝐁𝐎𝐓`
            }
        }
    }, { quoted: m })
}

handler.help = ['aperto', 'chiuso']
handler.tags = ['group']
handler.command = /^(aperto|chiuso)$/i
handler.admin = true
handler.botAdmin = true

export default handler
