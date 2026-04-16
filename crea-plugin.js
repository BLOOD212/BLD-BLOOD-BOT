import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
    if (!text) {
        return m.reply('❌ Inserisci la descrizione del plugin.\n\n📌 Esempio:\n.creaplugin comando che saluta quando scrivi ciao')
    }

    if (!global.openaiKey) {
        return m.reply('❌ OpenAI API key non configurata.')
    }

    try {

        m.reply('🧠 Creazione plugin in corso...')

        const prompt = `
Crea un plugin WhatsApp in JavaScript compatibile con questa struttura:

let handler = async (m, { conn }) => {
   // codice
}

handler.help = ['nomecomando']
handler.tags = ['categoria']
handler.command = ['nomecomando']

export default handler

Descrizione plugin: ${text}

Regole:
- Nessuna spiegazione
- Solo codice JS
- Compatibile con sistema handler
- Nessun testo fuori dal codice
`

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${global.openaiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "user", content: prompt }
                ],
                temperature: 0.7
            })
        })

        const data = await response.json()

        if (!data.choices) {
            return m.reply('❌ Errore nella generazione.')
        }

        let codice = data.choices[0].message.content

        await conn.sendMessage(m.chat, {
            text: codice
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        m.reply('❌ Errore durante la creazione del plugin.')
    }
}

handler.help = ['creaplugin <descrizione>']
handler.tags = ['owner']
handler.command = ['creaplugin']
handler.owner = true

export default handler
