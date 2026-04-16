let handler = async (m, { conn, text }) => {
    try {
        if (!m.quoted) throw '*Rispondi al messaggio da modificare*'
        if (!text) throw '*E con cosa vuoi rimpiazzarlo negraccio?*'

        const key = {
            remoteJid: m.chat,
            fromMe: true,
            id: m.quoted.id
        }

        await conn.sendMessage(m.chat, { 
            text,
            edit: key
        })
        
        await conn.sendMessage(m.chat, { delete: m.key })

    } catch (e) {
        m.reply(`${global.errore}`)
    }
}

handler.help = ['editmsg']
handler.tags = ['creatore']
handler.command = /^(editmsg)$/i
handler.owner = true

export default handler