// Inizializzazione sicura dell'oggetto globale
if (!global.piazze) global.piazze = {}

const footer = '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙'

let handler = async (m, { conn, text, command, usedPrefix }) => {
    let chat = m.chat
    let user = m.sender
    let ora = Date.now()
    let oggi = new Date().toLocaleDateString('it-IT')

    // Inizializzazione piazza locale
    if (!global.piazze[chat]) {
        global.piazze[chat] = {
            boss: null,
            scadenza: 0,
            banca: 0,
            prezzi: { 
                '1': { n: 'Erba (3g)', p: 20, cat: 'leggera' },
                '2': { n: 'Haze (5g)', p: 50, cat: 'leggera' },
                '3': { n: 'Amnesia (3g)', p: 80, cat: 'leggera' },
                '4': { n: 'Cocaina (1g)', p: 150, cat: 'pesante' },
                '5': { n: 'Eroina (1g)', p: 200, cat: 'pesante' },
                '6': { n: 'Crystal Meth (2g)', p: 300, cat: 'pesante' }
            },
            storico: {} 
        }
    }

    let piazza = global.piazze[chat]
    global.db.data.users[user] = global.db.data.users[user] || { euro: 0 }
    let dbUser = global.db.data.users[user]

    // --- 1. DIVENTASPACCINO ---
    if (command === 'diventaspaccino') {
        let bossAttivo = piazza.boss && ora < piazza.scadenza
        if (bossAttivo) return conn.reply(chat, `⚠️ C'è già un boss: @${piazza.boss.split('@')[0]}`, m, { mentions: [piazza.boss] })
        if (piazza.storico[user] === oggi) return m.reply('🚫 Hai già gestito la piazza oggi.')

        piazza.boss = user
        piazza.scadenza = ora + (24 * 60 * 60 * 1000)
        piazza.storico[user] = oggi
        piazza.banca = 0

        return conn.sendMessage(chat, { 
            text: `👑 @${user.split('@')[0]} ora controlla la piazza!\nTutti gli acquisti arricchiranno lui.`, 
            mentions: [user],
            footer,
            interactiveButtons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📦 LISTINO', id: `${usedPrefix}spaccino` }) }]
        }, { quoted: m })
    }

    // --- 2. MENU SPACCINO ---
    if (command === 'spaccino') {
        if (!piazza.boss || ora > piazza.scadenza) return m.reply(`🏙️ Piazza libera. Usa \`${usedPrefix}diventaspaccino\``)

        let menu = `ㅤ⋆｡˚『 ╭ \`💊 BLACK MARKET @${piazza.boss.split('@')[0].toUpperCase()} 💊\` ╯ 』˚｡⋆\n╭\n`
        for (let key in piazza.prezzi) {
            menu += `│ 『 ${key} 』 ${piazza.prezzi[key].n} ➔ ${piazza.prezzi[key].p}€\n`
        }
        menu += `│ ──────────────────\n`
        menu += `│ 『 🪙 』 Incasso Boss: ${piazza.banca}€\n`
        menu += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

        const buttons = [
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🌿 COMPRA LEGGERA', id: `${usedPrefix}compra leggera` }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '💀 COMPRA PESANTE', id: `${usedPrefix}compra pesante` }) }
        ]
        return conn.sendMessage(chat, { text: menu, footer, mentions: [piazza.boss], interactiveButtons: buttons }, { quoted: m })
    }

    // --- 3. COMPRA ---
    if (command === 'compra') {
        if (!piazza.boss || ora > piazza.scadenza) return m.reply('❌ Piazza vuota.')
        
        let sub = text.toLowerCase()
        let lista = []
        if (sub === 'leggera') lista = ['1', '2', '3']
        else if (sub === 'pesante') lista = ['4', '5', '6']
        else if (piazza.prezzi[sub]) lista = [sub]
        else return m.reply(`Scegli una categoria: \`${usedPrefix}compra leggera\` o \`pesante\``)

        if (lista.length > 1) {
            let btnList = lista.map(id => ({
                name: 'quick_reply', 
                buttonParamsJson: JSON.stringify({ display_text: piazza.prezzi[id].n, id: `${usedPrefix}compra ${id}` })
            }))
            return conn.sendMessage(chat, { text: 'Scegli il prodotto specifico:', footer, interactiveButtons: btnList }, { quoted: m })
        }

        let id = lista[0]
        let prodotto = piazza.prezzi[id]
        if (dbUser.euro < prodotto.p) return m.reply('📉 Non hai abbastanza euro!')

        dbUser.euro -= prodotto.p
        piazza.banca += prodotto.p
        global.db.data.users[piazza.boss].euro += prodotto.p

        dbUser.inventario = { nome: prodotto.n, cat: prodotto.cat }

        let az = prodotto.cat === 'leggera' ? 'fuma' : 'pippa'
        const btnUsa = [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: `🚀 USA ORA`, id: `${usedPrefix}${az}` }) }]
        
        return conn.sendMessage(chat, { text: `✅ Hai comprato *${prodotto.n}*.\nUsa \`.${az}\` per consumare.`, footer, interactiveButtons: btnUsa }, { quoted: m })
    }

    // --- 4. FUMA / PIPPA ---
    if (command === 'fuma' || command === 'pippa') {
        if (!dbUser.inventario) return m.reply('🤷‍♂️ Non hai più niente, l\'hai già finita! Torna dallo .spaccino')
        
        let roba = dbUser.inventario
        if (command === 'fuma' && roba.cat !== 'leggera') return m.reply('🤨 Questa roba non si fuma, si pippa! Usa .pippa')
        if (command === 'pippa' && roba.cat !== 'pesante') return m.reply('🤨 Questa roba non si pippa, si fuma! Usa .fuma')

        let mood = ''
        if (command === 'fuma') {
            let moods = ['🚨 PARANOIA: La pula è sotto casa!', '🍔 FAME CHIMICA: Hai mangiato il gatto.', '☁️ RELAX: Non senti più le gambe.']
            mood = moods[Math.floor(Math.random() * moods.length)]
        } else {
            let moods = ['⚡ POWER: Ti senti il re del mondo!', '🕺 EUPHORIA: Stai ballando da solo da 3 ore.', '💔 CRASH: Ti senti uno straccio.']
            mood = moods[Math.floor(Math.random() * moods.length)]
        }

        let res = `ㅤ⋆｡˚『 ╭ \`🌬️ SESSIONE TERMINATA\` ╯ 』˚｡⋆\n`
        res += `│ 『 🧪 』 \`Usato:\` *${roba.nome}*\n`
        res += `│ 『 🎭 』 \`Effetto:\` *${mood}*\n`
        res += `│ ──────────────────\n`
        res += `│ ⚠️ *Roba finita. Se ne vuoi ancora, ricompra!*\n`
        res += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

        delete dbUser.inventario // RIMOZIONE DOPO L'USO
        return conn.sendMessage(chat, { text: res, footer }, { quoted: m })
    }
}

handler.help = ['diventaspaccino', 'spaccino', 'compra', 'fuma', 'pippa']
handler.tags = ['giochi']
handler.command = /^(diventaspaccino|spaccino|compra|fuma|pippa)$/i
handler.group = true

export default handler
