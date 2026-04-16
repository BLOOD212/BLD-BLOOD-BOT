let handler = async (m, { conn, text, usedPrefix, command, participants }) => {
    try {
        // Controllo se il comando viene usato in un gruppo
        if (!m.isGroup) throw `『 📎 』 \`Questo comando può essere usato solo nei gruppi per menzionare tutti.\``
        
        if (!text) throw `『 📎 』 \`Inserisci il testo da spammare\`\n\n\`Esempio:\`\n*${usedPrefix + command} sveglia!*`

        const spamCount = 40 
        const messageToSpam = text.trim()
        
        // Estraiamo tutti gli ID dei partecipanti per il tag
        const users = participants.map(u => u.id)
        
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

        for (let i = 0; i < spamCount; i++) {
            // Invio il messaggio con l'array di tutte le menzioni
            await conn.sendMessage(m.chat, { 
                text: messageToSpam, 
                mentions: users 
            })
            
            // Intervallo di sicurezza di 100ms
            await delay(100)
        }

        return m.reply(`✅ Spam di 40 messaggi con menzione globale completato.`)

    } catch (error) {
        console.error('Errore nel comando spam:', error)
        if (typeof error === 'string') return m.reply(error)
        return m.reply(`⚠️ Errore durante l'invio dello spam.`)
    }
}

handler.help = ['spam [testo]']
handler.tags = ['strumenti']
handler.command = /^spam$/i
hadler.owner = true
handler.group = true // Forza l'uso solo nei gruppi
handler.register = true 

export default handler
