let handler = async (m, { conn, command }) => {
    try {
        if (!m.isGroup) throw `『 🔤 』 \`Questo comando può essere usato solo nei gruppi.\``

        conn.anagramma = conn.anagramma || {}

        if (conn.anagramma[m.chat]) {
            return m.reply(`⚠️ C'è già un anagramma attivo in questo gruppo!\nParola: *${conn.anagramma[m.chat].scrambled}*`)
        }

        const difficoltaDisponibili = ['facile', 'medio', 'difficile', 'impossibile']
        const sceltaDifficolta = difficoltaDisponibili[Math.floor(Math.random() * difficoltaDisponibili.length)]

        const dizionario = {
            facile: ["PIZZA", "CANE", "GATTO", "SOLE", "MARE", "CASA", "PANE", "RISO", "VINO", "ERBA", "LIBRO", "AUTO", "MOTO", "FUMO", "LUCE", "ARTE"],
            medio: ["TELEFONO", "WHATSAPP", "GRUPPO", "AMICI", "DIVANO", "SERIE", "CALCIO", "MUSICA", "ESTATE", "LAVORO", "SCUOLA", "VIAGGIO", "CUCINA", "TAVOLO", "STRADA"],
            difficile: ["MESSAGGIO", "TASTIERA", "STICKER", "CALCETTO", "VACANZE", "COMPUTER", "SCHERMO", "BOTTIGLIA", "OROLOGIO", "QUADERNO", "CHITARRA", "STAZIONE", "OMBRELONE"],
            impossibile: ["INFORMATICA", "PROGRAMMAZIONE", "TELECOMUNICAZIONI", "CRYPTOCURRENCY", "AMMINISTRATORE", "SOPRALLUOGO", "CONTRADDITORIO", "PARTICOLARITÀ", "SPROPORZIONATO"]
        }

        const maxErrori = {
            facile: 2,
            medio: 3,
            difficile: 5,
            impossibile: 6
        }

        const premi = {
            facile: 10,
            medio: 25,
            difficile: 50,
            impossibile: 100
        }

        const paroleLivello = dizionario[sceltaDifficolta]
        const parolaOriginale = paroleLivello[Math.floor(Math.random() * paroleLivello.length)]
        
        let lettere = parolaOriginale.split('')
        for (let i = lettere.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [lettere[i], lettere[j]] = [lettere[j], lettere[i]]
        }
        const parolaMescolata = lettere.join('')

        let indizioIniziale = Array(parolaOriginale.length).fill("_")

        conn.anagramma[m.chat] = {
            original: parolaOriginale,
            scrambled: parolaMescolata,
            level: sceltaDifficolta,
            errorsLeft: maxErrori[sceltaDifficolta],
            reward: premi[sceltaDifficolta],
            hint: indizioIniziale,
            revealedIndexes: [],
            timeout: setTimeout(() => {
                if (conn.anagramma[m.chat]) {
                    conn.sendMessage(m.chat, { text: `⏳ *TEMPO SCADUTO!*\n\nNessuno ha indovinato in tempo. La parola corretta era: *${conn.anagramma[m.chat].original}*` })
                    delete conn.anagramma[m.chat]
                }
            }, 90000) 
        }

        let messaggio = `🔤 *SFIDA ANAGRAMMA ESTRATTA*\n\n`
        messaggio += `📊 Difficoltà: *${sceltaDifficolta.toUpperCase()}*\n`
        messaggio += `🧠 Riordina le lettere per formare la parola:\n`
        messaggio += `👉 *${parolaMescolata}*\n\n`
        messaggio += `📌 Indizio: \`${indizioIniziale.join(' ')}\`\n`
        messaggio += `💰 Premio in palio: *${premi[sceltaDifficolta]}€*\n`
        messaggio += `❤️ Errori rimasti al gruppo: *${maxErrori[sceltaDifficolta]}*\n\n`
        messaggio += `⏱️ Avete 90 secondi per rispondere scrivendo la parola direttamente in chat!`

        return m.reply(messaggio)

    } catch (error) {
        console.error(error)
        if (typeof error === 'string') return m.reply(error)
        return m.reply(`⚠️ Errore durante l'avvio del gioco.`)
    }
}

handler.before = async function (m, { conn }) {
    conn.anagramma = conn.anagramma || {}
    
    if (!m.isGroup || !conn.anagramma[m.chat] || !m.text) return true

    const rispostaUtente = m.text.trim().toUpperCase()
    const datiGioco = conn.anagramma[m.chat]

    if (m.text.startsWith('.')) return true

    if (rispostaUtente === datiGioco.original) {
        clearTimeout(datiGioco.timeout)
        
        global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}
        global.db.data.users[m.sender].euro = (global.db.data.users[m.sender].euro || 0) + datiGioco.reward
        
        let vittoria = `🎉 *COMPLIMENTI!*\n\n`
        vittoria += `👤 @${m.sender.split('@')[0]} ha indovinato la parola prima di tutti!\n`
        vittoria += `🎯 Parola: *${datiGioco.original}*\n`
        vittoria += `💰 Ricompensa: *+${datiGioco.reward}€* aggiunti al tuo portafoglio!`
        
        delete conn.anagramma[m.chat]
        await conn.sendMessage(m.chat, { text: vittoria, mentions: [m.sender] }, { quoted: m })
        return true
    }

    if (rispostaUtente.length === datiGioco.original.length && rispostaUtente !== datiGioco.original) {
        datiGioco.errorsLeft--

        if (datiGioco.errorsLeft <= 0) {
            clearTimeout(datiGioco.timeout)
            delete conn.anagramma[m.chat]
            await conn.sendMessage(m.chat, { text: `💀 *GAME OVER!*\n\nIl gruppo ha esaurito i tentativi disponibili. La parola corretta era: *${datiGioco.original}*` }, { quoted: m })
            return true
        }

        let indiciDisponibili = []
        for (let i = 0; i < datiGioco.original.length; i++) {
            if (!datiGioco.revealedIndexes.includes(i)) {
                indiciDisponibili.push(i)
            }
        }

        if (indiciDisponibili.length > 0) {
            const indiceScelto = indiciDisponibili[Math.floor(Math.random() * indiciDisponibili.length)]
            datiGioco.hint[indiceScelto] = datiGioco.original[indiceScelto]
            datiGioco.revealedIndexes.push(indiceScelto)
        }

        let erroreMsg = `❌ *Sbagliato!* Una lettera è andata al suo posto.\n\n`
        erroreMsg += `👉 Anagramma: *${datiGioco.scrambled}*\n`
        erroreMsg += `📌 Indizio aggiornato: \`${datiGioco.hint.join(' ')}\`\n`
        erroreMsg += `❤️ Tentativi rimasti al gruppo: *${datiGioco.errorsLeft}*`

        await conn.sendMessage(m.chat, { text: erroreMsg }, { quoted: m })
    }
    return true
}

handler.help = ['anagramma']
handler.tags = ['giochi']
handler.command = /^\.anagramma|\.scramble$/i

handler.group = true
handler.owner = false

export default handler
