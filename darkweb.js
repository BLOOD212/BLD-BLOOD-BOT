import { createCanvas } from 'canvas'

const footer = '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙'

let handler = async (m, { conn, command, args, usedPrefix }) => {
    let who = m.sender
    global.db.data.users[who] = global.db.data.users[who] || {}
    let user = global.db.data.users[who]
    if (!user.inventory) user.inventory = {}
    if (user.euro === undefined) user.euro = 50

    // --- DATABASE OGGETTI ---
    const shop = {
        "1": { nome: "SPOOF_GPS", prezzo: 400, rischio: 10, uso: "🛡️ Riduce del 50% il rischio di sanzioni della Polizia." },
        "2": { nome: "BITCOIN_MIXER", prezzo: 800, rischio: 25, uso: "🧼 Pulisce euro sporchi generando tra 1000€ e 2500€." },
        "3": { nome: "EXPLOIT_KIT", prezzo: 1500, rischio: 40, uso: "🏴‍☠️ Sblocca il comando .hack @tag per rubare il 20% del saldo altrui." },
        "4": { nome: "GHOST_DRIVE", prezzo: 300, rischio: 5, uso: "💾 Protegge i tuoi EXP durante le retate della Polizia." },
        "5": { nome: "ROOT_ACCESS", prezzo: 3500, rischio: 65, uso: "🔑 Reset istantaneo dei cooldown dei giochi (In arrivo)." }
    }

    // --- 1. COMANDO: DARKWEB (GUIDA E NEGOZIO) ---
    if (command === 'darkweb' || command === 'negozio') {
        let help = `ㅤ⋆｡˚『 ╭ \`🕵️ BENVENUTO NEL DARKWEB \` ╯ 』˚｡⋆\n╭\n`
        help += `│ 『 🌐 』 \`Info:\` Qui puoi comprare strumenti illegali per dominare l'economia del bot.\n`
        help += `│ 『 👮 』 \`Rischio:\` Ogni acquisto può essere tracciato. Se la Polizia ti becca, pagherai una multa del 150%!\n`
        help += `│ ──────────────────\n`
        help += `│ 📑 *LISTA COMANDI:* \n`
        help += `│ • \`${usedPrefix}buy [ID]\` -> Compra un oggetto.\n`
        help += `│ • \`${usedPrefix}hack @tag\` -> Ruba euro (Richiede ID 3).\n`
        help += `│ • \`${usedPrefix}zaino\` -> Guarda i tuoi strumenti.\n`
        help += `│ • \`${usedPrefix}regala [euro] @tag\` -> Invia soldi.\n`
        help += `│ • \`${usedPrefix}cedi [NOME] @tag\` -> Passa un oggetto.\n`
        help += `│ ──────────────────\n`
        help += `│ 🛒 *CATALOGO DISPONIBILE:* \n`
        
        Object.keys(shop).forEach(id => {
            help += `│ *ID: ${id}* - ${shop[id].nome}\n`
            help += `│ 💰 \`${shop[id].prezzo}€\` | ⚠️ \`Rischio: ${shop[id].rischio}%\`\n`
            help += `│ 📖 ${shop[id].uso}\n│\n`
        })
        
        help += `│ 『 👛 』 \`Il tuo Saldo:\` *${user.euro}€*\n`
        help += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

        const buttons = [
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎒 APRI ZAINO', id: `${usedPrefix}zaino` }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🛰️ COMPRA SPOOF (ID 1)', id: `${usedPrefix}buy 1` }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🏴‍☠️ COMPRA EXPLOIT (ID 3)', id: `${usedPrefix}buy 3` }) }
        ]
        
        return conn.sendMessage(m.chat, { text: help, footer, interactiveButtons: buttons }, { quoted: m })
    }

    // --- 2. COMANDO: BUY (ACQUISTO) ---
    if (command === 'buy') {
        let id = args[0]
        if (!id || !shop[id]) return m.reply(`🛍️ Seleziona un ID corretto! Esempio: \`${usedPrefix}buy 1\``)
        let item = shop[id]
        if (user.euro < item.prezzo) return m.reply(`📉 Saldo insufficiente!`)

        let chance = Math.floor(Math.random() * 100)
        let rischioEffettivo = user.inventory["SPOOF_GPS"] > 0 ? item.rischio / 2 : item.rischio

        const canvas = createCanvas(600, 300); const ctx = canvas.getContext('2d')
        if (chance < rischioEffettivo) {
            ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, 600, 300)
            ctx.fillStyle = '#ff0000'; ctx.fillRect(0, 0, 300, 15); ctx.fillStyle = '#0000ff'; ctx.fillRect(300, 0, 300, 15)
            ctx.fillStyle = '#fff'; ctx.font = 'bold 40px Arial'; ctx.textAlign = 'center'; ctx.fillText('INTERCETTATO', 300, 140)
            let multa = Math.floor(item.prezzo * 1.5)
            user.euro = Math.max(0, user.euro - multa)
            if (user.inventory["SPOOF_GPS"] > 0) user.inventory["SPOOF_GPS"] -= 1
            return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `⚠️ *RETATA DELLA POLIZIA:* Il tuo ordine di \`${item.nome}\` è stato tracciato. Multa pagata: *${multa}€*.`, footer })
        } else {
            ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 600, 300)
            ctx.strokeStyle = '#0f0'; ctx.lineWidth = 5; ctx.strokeRect(20, 20, 560, 260)
            ctx.fillStyle = '#0f0'; ctx.font = '30px Courier New'; ctx.textAlign = 'center'
            ctx.fillText('ENCRYPTED DOWNLOAD', 300, 120); ctx.fillText(item.nome, 300, 180)
            user.euro -= item.prezzo
            user.inventory[item.nome] = (user.inventory[item.nome] || 0) + 1
            if (id === "2") {
                let bonus = Math.floor(Math.random() * 1501) + 1000
                user.euro += bonus
                return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `💰 *MIXER BITCOIN:* Hai ripulito il denaro con successo! Guadagno netto: *${bonus}€*.`, footer })
            }
            return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `✅ *ORDINE COMPLETATO:* L'oggetto \`${item.nome}\` è ora nel tuo zaino.`, footer })
        }
    }

    // --- 3. COMANDO: HACK (ATTACCO) ---
    if (command === 'hack') {
        if (!user.inventory["EXPLOIT_KIT"] || user.inventory["EXPLOIT_KIT"] <= 0) return m.reply("🚫 *ACCESSO NEGATO:* Ti serve un `EXPLOIT_KIT`. Compralo nel `.darkweb`!")
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!target || target === who) return m.reply("🎯 Tagga la vittima dell'attacco!")
        let targetUser = global.db.data.users[target]
        if (!targetUser || targetUser.euro < 100) return m.reply("📉 La vittima è troppo povera per essere hackerata.")

        let rubati = Math.floor(targetUser.euro * 0.20)
        targetUser.euro -= rubati
        user.euro += rubati
        user.inventory["EXPLOIT_KIT"] -= 1

        const canvas = createCanvas(600, 300); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 600, 300)
        ctx.fillStyle = '#0f0'; ctx.font = 'bold 30px Courier New'; ctx.textAlign = 'center'
        ctx.fillText('HACK SUCCESSFUL', 300, 100); ctx.fillText(`STOLEN: ${rubati}€`, 300, 180)
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `🏴‍☠️ *SISTEMA COMPROMESSO:* Hai rubato *${rubati}€* a @${target.split('@')[0]}!`, mentions: [target] })
    }

    // --- 4. COMANDO: REGALA/CEDI (SCAMBIO) ---
    if (command === 'regala') {
        let amount = parseInt(args[0])
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!amount || amount <= 0 || !target || target === who) return m.reply(`💸 *Uso:* \`${usedPrefix}regala 100 @tag\``)
        if (user.euro < amount) return m.reply("📉 Euro insufficienti.")
        user.euro -= amount
        global.db.data.users[target].euro = (global.db.data.users[target].euro || 0) + amount
        return m.reply(`💰 Hai inviato *${amount}€* a @${target.split('@')[0]}!`, null, { mentions: [target] })
    }

    if (command === 'cedi') {
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        let itemName = args.filter(a => !a.includes('@')).join('_').toUpperCase()
        if (!target || !itemName || !user.inventory[itemName]) return m.reply(`🎒 *Uso:* \`${usedPrefix}cedi NOME_OGGETTO @tag\``)
        user.inventory[itemName] -= 1
        global.db.data.users[target].inventory[itemName] = (global.db.data.users[target].inventory[itemName] || 0) + 1
        return m.reply(`📦 Hai passato *1x ${itemName}* a @${target.split('@')[0]}!`, null, { mentions: [target] })
    }

    // --- 5. COMANDO: ZAINO ---
    if (command === 'zaino' || command === 'inventario') {
        let inv = Object.keys(user.inventory).filter(i => user.inventory[i] > 0)
        let text = `ㅤ⋆｡˚『 ╭ \`🎒 IL TUO ZAINO \` ╯ 』˚｡⋆\n╭\n│ 『 👤 』 \`User:\` @${who.split('@')[0]}\n│ 『 💰 』 \`Euro:\` *${user.euro}€*\n│ ──────────────────\n`
        inv.forEach(i => { text += `│ • ${i}: x${user.inventory[i]}\n` })
        if (inv.length === 0) text += `│  _Il tuo zaino è vuoto._\n`
        text += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`
        return m.reply(text, null, { mentions: [who] })
    }
}

handler.help = ['darkweb']
handler.tags = ['giochi']
handler.command = /^(darkweb|buy|hack|regala|cedi|zaino|inventario|negozio)$/i
handler.group = true
handler.register = true

export default handler
