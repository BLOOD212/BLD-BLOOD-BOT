//by bonzino (AXION BOT)

import fs from 'fs'
const playAgainButtons = (usedPrefix, command) => [{
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text: 'Scommetti ancora!', id: `${usedPrefix + command}` })
}];

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const who = m.sender
    if (!global.db.data.users[who]) global.db.data.users[who] = { euro: 0 }
    const user = global.db.data.users[who]

    const puntata = parseInt(args[0])

    // MENU SELEZIONE PUNTATA (STILE BANDIERA)
    if (!puntata || isNaN(puntata) || puntata <= 0) {
        let menuText = `ㅤ⋆｡˚『 ╭ \`SCOMMESSE SPORTIVE\` ╯ 』˚｡⋆\n╭\n`;
        menuText += `│ 『 👤 』 \`Utente:\` @${who.split('@')[0]}\n`;
        menuText += `│ 『 💰 』 \`Bilancio:\` *${user.euro}€*\n`;
        menuText += `│ 『 📝 』 \`Usa:\` *${usedPrefix + command} [importo]*\n`;
        menuText += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;

        return conn.sendMessage(m.chat, {
            text: menuText,
            footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙',
            mentions: [who]
        }, { quoted: m })
    }

    if (user.euro < puntata) {
        let noMoney = `ㅤ⋆｡˚『 ╭ \`SALDO INSUFFICIENTE\` ╯ 』˚｡⋆\n╭\n`;
        noMoney += `│ 『 ❌ 』 \`Possiedi:\` *${user.euro}€*\n`;
        noMoney += `│ 『 💳 』 \`Richiesti:\` *${puntata}€*\n`;
        noMoney += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;
        return m.reply(noMoney)
    }

    // LOGICA PARTITA
    const squadre = ['Inter', 'Milan', 'Juventus', 'Napoli', 'Roma', 'Lazio', 'Atalanta', 'Fiorentina']
    const casa = squadre[Math.floor(Math.random() * squadre.length)]
    const trasf = squadre.filter(s => s !== casa)[Math.floor(Math.random() * (squadre.length - 1))]
    const quota = (Math.random() * (4.0 - 1.5) + 1.5).toFixed(2)
    const vittoria = Math.random() > 0.5 // 50% possibilità di vittoria

    user.euro -= puntata

    let startText = `ㅤ⋆｡˚『 ╭ \`MATCH CONFERMATO\` ╯ 』˚｡⋆\n╭\n`;
    startText += `│ 『 ⚔️ 』 \`Partita:\` *${casa} vs ${trasf}*\n`;
    startText += `│ 『 📈 』 \`Quota:\` *x${quota}*\n`;
    startText += `│ 『 💸 』 \`Puntata:\` *${puntata}€*\n`;
    startText += `│ 『 ⏳ 』 \`Stato:\` *Calcio d'inizio...*\n`;
    startText += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;

    const { key } = await conn.sendMessage(m.chat, { text: startText, footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙' }, { quoted: m })

    // SIMULAZIONE LIVE (STILE BANDIERA)
    const eventi = ['⚽ GOAL!', '🧤 PARATA!', '😱 PALO!', '🟨 AMMONIZIONE', '🖥️ VAR CHECK']
    for (let i = 0; i < 3; i++) {
        await new Promise(r => setTimeout(r, 2000))
        let ev = eventi[Math.floor(Math.random() * eventi.length)]
        await conn.sendMessage(m.chat, { 
            text: `${startText}\n\n🔔 *LIVE:* \`${ev}\``,
            edit: key 
        })
    }

    await new Promise(r => setTimeout(r, 2000))

    if (vittoria) {
        const vincita = Math.floor(puntata * quota)
        user.euro += vincita
        let winText = `ㅤ⋆｡˚『 ╭ \`SCHEDINA VINCENTE\` ╯ 』˚｡⋆\n╭\n`;
        winText += `│ 『 🏆 』 \`Risultato:\` *Vittoria!*\n`;
        winText += `│ 『 💰 』 \`Vinto:\` *+${vincita}€*\n`;
        winText += `│ 『 🏦 』 \`Saldo:\` *${user.euro}€*\n`;
        winText += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;
        await conn.sendMessage(m.chat, { text: winText, edit: key, footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙', interactiveButtons: playAgainButtons(usedPrefix, command) })
    } else {
        let loseText = `ㅤ⋆｡˚『 ╭ \`SCHEDINA PERSA\` ╯ 』˚｡⋆\n╭\n`;
        loseText += `│ 『 ❌ 』 \`Risultato:\` *Sconfitta*\n`;
        loseText += `│ 『 📉 』 \`Perso:\` *-${puntata}€*\n`;
        loseText += `│ 『 💼 』 \`Saldo:\` *${user.euro}€*\n`;
        loseText += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;
        await conn.sendMessage(m.chat, { text: loseText, edit: key, footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙', interactiveButtons: playAgainButtons(usedPrefix, command) })
    }
}

handler.help = ['bet']
handler.tags = ['giochi']
handler.command = /^(schedina|bet)$/i
handler.group = true

export default handler
