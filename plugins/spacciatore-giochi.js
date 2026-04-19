if (!global.piazze) global.piazze = {}

const footer = '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙'

let handler = async (m, { conn, text, command, usedPrefix }) => {
    let chat = m.chat
    let user = m.sender
    let ora = Date.now()
    let oggi = new Date().toLocaleDateString('it-IT')

    // DEFINIZIONE LISTINO FISSO (Per evitare undefined)
    const listinoBase = { 
        '1': { n: 'Erba', g: '3g', p: 20, cat: 'leggera' },
        '2': { n: 'Haze', g: '5g', p: 50, cat: 'leggera' },
        '3': { n: 'Amnesia', g: '3g', p: 80, cat: 'leggera' },
        '4': { n: 'Cocaina', g: '1g', p: 150, cat: 'pesante' },
        '5': { n: 'Eroina', g: '1g', p: 200, cat: 'pesante' },
        '6': { n: 'Crystal Meth', g: '2g', p: 300, cat: 'pesante' }
    }

    // Inizializzazione o Riparazione della piazza
    if (!global.piazze[chat] || !global.piazze[chat].prezzi || !global.piazze[chat].prezzi['1'].n) {
        global.piazze[chat] = {
            boss: null,
            scadenza: 0,
            banca: 0,
            prezzi: listinoBase,
            storico: {} 
        }
    }

    let piazza = global.piazze[chat]
    global.db.data.users[user] = global.db.data.users[user] || { euro: 0 }
    let dbUser = global.db.data.users[user]

    // --- 1. DIVENTASPACCINO ---
    if (command === 'diventaspaccino') {
        let bossAttivo = piazza.boss && ora < piazza.scadenza
        if (bossAttivo) return conn.reply(chat, `⚠️ Piazza occupata da @${piazza.boss.split('@')[0]}`, m, { mentions: [piazza.boss] })
        if (piazza.storico[user] === oggi) return m.reply('🚫 Hai già gestito la piazza oggi.')

        piazza.boss = user
        piazza.scadenza = ora + (24 * 60 * 60 * 1000)
        piazza.storico[user] = oggi
        piazza.banca = 0

        return conn.sendMessage(chat, { 
            text: `👑 @${user.split('@')[0]} ora controlla la piazza!\nTutti i profitti vanno a lui.`, 
            mentions: [user],
            footer,
            interactiveButtons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📦 VEDI LISTINO', id: `${usedPrefix}spaccino` }) }]
        }, { quoted: m })
    }

    // --- 2. MENU SPACCINO (Fix Undefined) ---
    if (command === 'spaccino') {
        if (!piazza.boss || ora > piazza.scadenza) return m.reply(`🏙️ Piazza libera. Usa \`${usedPrefix}diventaspaccino\``)

        let menu = `ㅤ⋆｡˚『 ╭ \`💊 BLACK MARKET @${piazza.boss.split('@')[0].toUpperCase()} 💊\` ╯ 』˚｡⋆\n╭\n`
        
        // Usiamo Object.entries per essere sicuri di ciclare correttamente
        Object.entries(piazza.prezzi).forEach(([id, item]) => {
            menu += `│ 『 ${id} 』 *${item.n}* (${item.g}) ➔ *${item.p}€*\n`
        })
        
        menu += `│ ──────────────────\n`
        menu += `│ 『 🪙 』 Incasso Boss: ${piazza.banca}€\n`
        menu += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

        const buttons = [
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🌿 LEGGERA', id: `${usedPrefix}compra leggera` }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '💀 PESANTE', id: `${usedPrefix}compra pesante` }) }
        ]
        return conn.sendMessage(chat, { text: menu, footer, mentions: [piazza.boss], interactiveButtons: buttons }, { quoted: m })
    }

    // --- 3. COMPRA ---
    if (command === 'compra') {
        if (!piazza.boss || ora > piazza.scadenza) return m.reply('❌ Piazza vuota.')
        
        let sub = text.toLowerCase().trim()
        if (!sub) return m.reply(`Specifica cosa comprare!`)

        if (sub === 'leggera' || sub === 'pesante') {
            let ids = Object.keys(piazza.prezzi).filter(k => piazza.prezzi[k].cat === sub)
            let btnList = ids.map(id => ({
                name: 'quick_reply', 
                buttonParamsJson: JSON.stringify({ display_text: `${piazza.prezzi[id].n} (${piazza.prezzi[id].p}€)`, id: `${usedPrefix}compra ${id}` })
            }))
            return conn.sendMessage(chat, { text: `Scegli il prodotto ${sub}:`, footer, interactiveButtons: btnList }, { quoted: m })
        }

        let prodotto = piazza.prezzi[sub]
        if (!prodotto) return m.reply('❌ Codice errato.')

        if (dbUser.euro < prodotto.p) return m.reply(`📉 Ti servono ${prodotto.p}€!`)

        dbUser.euro -= prodotto.p
        piazza.banca += prodotto.p
        global.db.data.users[piazza.boss].euro = (global.db.data.users[piazza.boss].euro || 0) + prodotto.p

        dbUser.inventario = { nome: prodotto.n, grammi: prodotto.g, cat: prodotto.cat }

        let tipoAzione = prodotto.cat === 'leggera' ? 'fuma' : 'pippa'
        const btnUsa = [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: `🚀 USA ORA`, id: `${usedPrefix}${tipoAzione}` }) }]
        
        return conn.sendMessage(chat, { text: `✅ Hai comprato *${prodotto.n} (${prodotto.g})*.\nI soldi sono stati inviati al Boss.`, footer, interactiveButtons: btnUsa }, { quoted: m })
    }

    // --- 4. FUMA / PIPPA ---
    if (command === 'fuma' || command === 'pippa') {
        if (!dbUser.inventario) return m.reply('🤷‍♂️ Hai già finito tutto! Ricompra dallo .spaccino')
        
        let roba = dbUser.inventario
        if (command === 'fuma' && roba.cat !== 'leggera') return m.reply('🤨 Questa roba si pippa! Usa .pippa')
        if (command === 'pippa' && roba.cat !== 'pesante') return m.reply('🤨 Questa roba si fuma! Usa .fuma')

        let mood = ''
        if (command === 'fuma') {
            mood = ['🚨 PARANOIA TOTALE', '🍔 FAME CHIMICA ASSURDA', '☁️ RELAX ESTREMO'][Math.floor(Math.random() * 3)]
        } else {
            mood = ['⚡ POWER: SEI UN DIO', '🕺 EUPHORIA A MILLE', '💔 CRASH: CHE BOTTA'][Math.floor(Math.random() * 3)]
        }

        let res = `ㅤ⋆｡˚『 ╭ \`🌬️ SESSIONE TERMINATA\` ╯ 』˚｡⋆\n`
        res += `│ 『 🧪 』 \`Usato:\` *${roba.nome} (${roba.grammi})*\n`
        res += `│ 『 🎭 』 \`Effetto:\` *${mood}*\n`
        res += `│ ⚠️ *Roba finita!*\n`
        res += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

        delete dbUser.inventario 
        return conn.sendMessage(chat, { text: res, footer }, { quoted: m })
    }
}

handler.help = ['diventaspaccino', 'spaccino', 'compra', 'fuma', 'pippa']
handler.tags = ['giochi']
handler.command = /^(diventaspaccino|spaccino|compra|fuma|pippa)$/i
handler.group = true

export default handler
