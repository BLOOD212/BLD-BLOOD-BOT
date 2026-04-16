let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply('⚠ *_Inserisci l\'errore che desideri segnalare._*\n\n*Esempio:* .report il comando .play non funziona')
    
    if (text.length < 10) return m.reply('⚠️ *_Specifica bene l\'errore, minimo 10 caratteri._*')
    if (text.length > 1000) return m.reply('⚠️ *_Massimo 1000 caratteri per inviare l\'errore._*')

    let teks = `
╭━━━•❃°•°❀°•°❃•━━━╮
┃ *REPORT* ⚠️
┃━━━━━━━━━
┃ *Da:* wa.me/${m.sender.split('@')[0]}
┃ *Messaggio:* 
┃ ${text}
╰━━━•❃°•°❀°•°❃•━━━╯`
    const ownerNumber = '393701330693@s.whatsapp.net' // Numero diretto dell'owner
    
    await conn.sendMessage(ownerNumber, {
        text: teks,
        mentions: [m.sender]
    })

    return m.reply('✅ *_Report inviato al mio creatore_*\n⚠️ _I report falsi potrebbero causare ban_')
}

handler.help = ['report']
handler.tags = ['info']
handler.command = /^(report|segnala|bug|errore)$/i

export default handler
