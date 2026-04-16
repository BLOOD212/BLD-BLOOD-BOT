let handler = async (m, { conn, text }) => {
   if (!text) return conn.reply(m.chat, '令 Ti manca il testo, negro', m, rcanal)
     try {
                await conn.updateProfileStatus(text).catch(_ => _)
                conn.reply(m.chat, `✅️ Info cambiata con successo!`, m, rcanal)
} catch {
       throw 'Ops, si è verificato un errore...'
     }
}
handler.help = ['setbotbio <testo>']
handler.tags = ['creatore'];
handler.command = /^botdesc|setbotbio$/i
handler.owner = true

export default handler
