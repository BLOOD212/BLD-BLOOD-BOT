let unoSession = {}

const colori = { 'Rosso': '🔴', 'Blu': '🔵', 'Giallo': '🟡', 'Verde': '🟢' }

const playAgainButtons = () => [{
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text: 'Rigioca! 🃏', id: `.uno` })
}];

const gameButtons = () => [{
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text: '📥 Pesca', id: `pesca` })
}, {
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text: '❌ Chiudi', id: `enduno` })
}];

function creaMazzo() {
    let mazzo = []
    for (let c in colori) {
        for (let v = 0; v <= 9; v++) mazzo.push(`${c} ${v}`)
        mazzo.push(`${c} +2`)
    }
    for (let i = 0; i < 4; i++) {
        mazzo.push('Jolly')
        mazzo.push('Jolly +4')
    }
    for (let i = mazzo.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mazzo[i], mazzo[j]] = [mazzo[j], mazzo[i]]
    }
    return mazzo
}

function formattaCarta(carta) {
    if (carta === 'Jolly') return '🌈 *Jolly*'
    if (carta === 'Jolly +4') return '🌈 *Jolly +4*'
    let [c, v] = carta.split(' ')
    return `*${v}${colori[c]}*`
}

function puoGiocare(carta, tavolo, coloreScelto) {
    if (carta.includes('Jolly')) return true
    let [c_c, v_c] = carta.split(' ')
    let [c_t, v_t] = tavolo.split(' ')
    if (tavolo.includes('Jolly')) return c_c === coloreScelto
    return c_c === c_t || v_c === v_t || c_c === coloreScelto
}

function generaStato(s, nomeUtente, extraMsg = '') {
    let txt = `━━━━━━━━━━━━━━━━━━━━\n`
    txt += `🃏   *PARTITA DI UNO* 🃏\n`
    txt += `━━━━━━━━━━━━━━━━━━━━\n`
    txt += `*DESCRIZIONE:* Sfida il bot! Abbina colore o numero. Se peschi e non puoi giocare, il turno passa al bot.\n\n`
    if (extraMsg) txt += `${extraMsg}\n\n`
    txt += `📍 In Tavola: ${formattaCarta(s.tableCard)}\n`
    txt += `🎨 Colore Attivo: *${s.currentColor} ${colori[s.currentColor] || ''}*\n`
    txt += `🤖 Carte Bot: *${s.botHand.length}*\n\n`
    txt += `👤 *MANO DI ${nomeUtente.toUpperCase()}:*\n`
    s.playerHand.forEach((c, i) => {
        txt += `  *${i + 1}* ⮕ ${formattaCarta(c)}\n`
    })
    txt += `\n*AZIONI:* Scrivi il *numero* o usa i tasti.\n`
    txt += `━━━━━━━━━━━━━━━━━━━━`
    return txt
}

let handler = async (m, { conn, command }) => {
    let chat = m.chat
    if (command === 'uno') {
        if (unoSession[chat]) return m.reply('⚠️ Una partita è già in corso!')
        
        let mazzo = creaMazzo()
        let playerHand = mazzo.splice(0, 7)
        let botHand = mazzo.splice(0, 7)
        let tableIdx = mazzo.findIndex(c => !c.includes('Jolly') && !c.includes('+2'))
        let tableCard = mazzo.splice(tableIdx, 1)[0]

        unoSession[chat] = {
            player: m.sender,
            mazzo: mazzo,
            playerHand: playerHand,
            botHand: botHand,
            tableCard: tableCard,
            currentColor: tableCard.split(' ')[0]
        }

        let s = unoSession[chat]
        let name = conn.getName(m.sender)
        
        await conn.sendMessage(chat, {
            text: generaStato(s, name),
            footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙',
            interactiveButtons: gameButtons()
        }, { quoted: m })
    }
}

handler.before = async (m, { conn }) => {
    const chat = m.chat
    let s = unoSession[chat]
    let name = conn.getName(m.sender)

    let msgText = m.text || ''
    if (m.message?.interactiveResponseMessage) {
        const response = m.message.interactiveResponseMessage
        if (response.nativeFlowResponseMessage?.paramsJson) {
            const params = JSON.parse(response.nativeFlowResponseMessage.paramsJson)
            msgText = params.id
        }
    }

    if (msgText === '.uno' && !s) {
        const fakeMessage = { ...m, text: '.uno', body: '.uno' }
        return handler(fakeMessage, { conn, command: 'uno' })
    }

    if (!s || s.player !== m.sender) return

    let msg = msgText.trim().toLowerCase()

    if (msg === 'enduno') {
        delete unoSession[chat]
        return m.reply('❌ Partita terminata!')
    }

    if (msg === 'pesca') {
        if (s.mazzo.length === 0) s.mazzo = creaMazzo()
        let p = s.mazzo.shift()
        s.playerHand.push(p)
        let reportP = `📥 Hai pescato: ${formattaCarta(p)}`
        
        if (!puoGiocare(p, s.tableCard, s.currentColor)) {
            reportP += `\n❌ Non giocabile. Turno al Bot...`
            let bIdx = s.botHand.findIndex(c => puoGiocare(c, s.tableCard, s.currentColor))
            if (bIdx !== -1) {
                let cBot = s.botHand.splice(bIdx, 1)[0]
                s.tableCard = cBot
                s.currentColor = cBot.includes('Jolly') ? s.currentColor : cBot.split(' ')[0]
                reportP += `\n🤖 Bot gioca: ${formattaCarta(cBot)}`
            } else {
                if (s.mazzo.length === 0) s.mazzo = creaMazzo()
                s.botHand.push(s.mazzo.shift())
                reportP += `\n🤖 Bot pesca.`
            }
        } else {
            reportP += `\n✅ Giocabile! Puoi usarla ora.`
        }

        return conn.sendMessage(chat, {
            text: generaStato(s, name, reportP),
            footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙',
            interactiveButtons: gameButtons()
        }, { quoted: m })
    }

    let index = parseInt(msg) - 1
    if (!isNaN(index) && index >= 0 && index < s.playerHand.length) {
        let cartaScelta = s.playerHand[index]
        if (!puoGiocare(cartaScelta, s.tableCard, s.currentColor)) return m.reply(`🚫 *MOSSA NON VALIDA*`)

        s.playerHand.splice(index, 1)
        s.tableCard = cartaScelta
        s.currentColor = cartaScelta.includes('Jolly') ? s.currentColor : cartaScelta.split(' ')[0]

        if (s.playerHand.length === 0) {
            delete unoSession[chat]
            return conn.sendMessage(chat, {
                text: `🏆 *HAI VINTO!*`,
                footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙',
                interactiveButtons: playAgainButtons()
            }, { quoted: m })
        }

        let report = `✅ Hai giocato ${formattaCarta(cartaScelta)}.`
        let bIdx = s.botHand.findIndex(c => puoGiocare(c, s.tableCard, s.currentColor))
        
        if (bIdx !== -1) {
            let cBot = s.botHand.splice(bIdx, 1)[0]
            s.tableCard = cBot
            s.currentColor = cBot.includes('Jolly') ? s.currentColor : cBot.split(' ')[0]
            report += `\n🤖 Bot gioca: ${formattaCarta(cBot)}`
        } else {
            if (s.mazzo.length === 0) s.mazzo = creaMazzo()
            s.botHand.push(s.mazzo.shift())
            report += `\n🤖 Bot pesca.`
        }

        if (s.botHand.length === 0) {
            delete unoSession[chat]
            return conn.sendMessage(chat, {
                text: `${report}\n\n🤡 *SCONFITTA!*`,
                footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙',
                interactiveButtons: playAgainButtons()
            }, { quoted: m })
        }

        return conn.sendMessage(chat, {
            text: generaStato(s, name, report),
            footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙',
            interactiveButtons: gameButtons()
        }, { quoted: m })
    }
}

handler.help = ['uno']
handler.tags = ['giochi']
handler.command = /^(uno)$/i
handler.group = true

export default handler
