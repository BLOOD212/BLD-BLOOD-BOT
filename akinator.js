import { Aki } from 'aki-api'

const sessions = new Map()

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const chatId = m.chat

    if (command === 'akinator' || command === 'aki') {
        if (sessions.has(chatId)) return m.reply('Partita già in corso!')
        
        try {
            // Proviamo a inizializzare con 'it' ma senza childMode per stabilità
            const aki = new Aki({ region: 'it' })
            await aki.start()
            sessions.set(chatId, aki)

            await conn.sendMessage(m.chat, {
                text: `🤔 *Domanda:* ${aki.question}`,
                footer: 'Seleziona una risposta',
                buttons: [
                    { buttonId: `${usedPrefix}akiara 0`, buttonText: { displayText: 'Sì' }, type: 1 },
                    { buttonId: `${usedPrefix}akiara 1`, buttonText: { displayText: 'No' }, type: 1 },
                    { buttonId: `${usedPrefix}akiara 2`, buttonText: { displayText: 'Boh' }, type: 1 }
                ],
                headerType: 1
            }, { quoted: m })
        } catch (e) {
            // Se fallisce in italiano, proviamo automaticamente un server alternativo
            try {
                const aki = new Aki({ region: 'en' })
                await aki.start()
                sessions.set(chatId, aki)
                await m.reply('Server italiano instabile. Avvio in corso su server globale...')
                // Invio messaggi bottoni (stessa logica di sopra)
            } catch (err) {
                console.error(e)
                m.reply('*ERRORE:* I server di Akinator sono offline o hanno bloccato la connessione. Riprova più tardi.')
            }
        }
    }

    if (command === 'akiara') {
        const aki = sessions.get(chatId)
        if (!aki) return
        if (!text) return

        try {
            await aki.step(text.trim())

            if (aki.progress >= 80 || aki.currentStep >= 35) {
                await aki.win()
                const guess = aki.answers[0]
                
                let winTxt = `*L'HO TROVATO!*\n\n👤 *Personaggio:* ${guess.name}\n📝 *Descrizione:* ${guess.description}`
                
                await conn.sendMessage(m.chat, { 
                    image: { url: guess.absolute_picture_path }, 
                    caption: winTxt 
                }, { quoted: m })
                
                sessions.delete(chatId)
            } else {
                await conn.sendMessage(m.chat, {
                    text: `🤔 *Domanda:* ${aki.question}\n*Progresso:* ${Math.round(aki.progress)}%`,
                    footer: 'Rispondi per continuare',
                    buttons: [
                        { buttonId: `${usedPrefix}akiara 0`, buttonText: { displayText: 'Sì' }, type: 1 },
                        { buttonId: `${usedPrefix}akiara 1`, buttonText: { displayText: 'No' }, type: 1 },
                        { buttonId: `${usedPrefix}akiara 2`, buttonText: { displayText: 'Non lo so' }, type: 1 }
                    ],
                    headerType: 1
                }, { quoted: m })
            }
        } catch (e) {
            sessions.delete(chatId)
            m.reply('Connessione interrotta durante il gioco.')
        }
    }
}

handler.help = ['akinator']
handler.tags = ['game']
handler.command = /^(akinator|aki|akiara)$/i

export default handler
