// plugin by deadly

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Inserisci il numero da controllare.\nEsempio: ${usedPrefix + command} 393331234567`)
    
    let num = text.replace(/[^0-9]/g, '')
    
    try {
        let [result] = await conn.onWhatsApp(num)
        if (result?.exists) {
            m.reply(`✅ Il numero @${num} è attivo su WhatsApp.`, null, { mentions: [num + '@s.whatsapp.net'] })
        } else {
            m.reply(`❌ Il numero @${num} non è registrato o è stato bannato.`, null, { mentions: [num + '@s.whatsapp.net'] })
        }
    } catch (e) {
        m.reply(`[ERROR]: Impossibile verificare il numero.`)
    }
}

handler.help = ['checkban']
handler.tags = ['tools']
handler.command = ['checkban', 'check']

export default handler