let unoSession = {}

const colori = { 'Rosso': '🔴', 'Blu': '🔵', 'Giallo': '🟡', 'Verde': '🟢' }
const nomiColori = Object.keys(colori)

const playAgainButtons = () => [{
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text: 'Mbare dinuovo! 🃏', id: '.uno' })
}];

const gameButtons = () => [{
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text: '📥 Pesca', id: 'pesca' })
}, {
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text: '❌ Chiudi', id: 'enduno' })
}];

// Crea un mazzo senza Salta e Cambio
function creaMazzo() {
    let mazzo = []
    nomiColori.forEach(c => {
        mazzo.push(`${c} 0`)
        for (let i = 0; i < 2; i++) {
            for (let v = 1; v <= 9; v++) mazzo.push(`${c} ${v}`)
            mazzo.push(`${c} +2`)
        }
    })
    for (let i = 0; i < 4; i++) {
        mazzo.push('Jolly')
        mazzo.push('Jolly +4')
    }
    return mazzo.sort(() => Math.random() - 0.5)
}

function formattaCarta(carta) {
    if (carta === 'Jolly') return '🌈 *Jolly*'
    if (carta === 'Jolly +4') return '🌈 *Jolly +4*'
    let [c, v] = carta.split(' ')
    return `*${v}${colori[c] || ''}*`
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

let handler = async (m, { conn, command, text }) => {
    let chat = m.chat
    let name = conn.getName(m.sender)
    
    delete unoSession[chat]
    let mazzo = creaMazzo()
    let playerHand = mazzo.splice(0, 7)
    let botHand = mazzo.splice(0, 7)
    let tableCard = ''
    
    for (let i = 0; i < mazzo.length; i++) {
        if (!mazzo[i].includes('Jolly') && !mazzo[i].includes('+2')) {
            tableCard = mazzo.splice(i, 1)[0]
            break
        }
    }

    unoSession[chat] = {
        player: m.sender,
        mazzo: mazzo,
        playerHand: playerHand,
        botHand: botHand,
        tableCard: tableCard,
        currentColor: tableCard.split(' ')[0]
    }

    await conn.sendMessage(chat, {
        text: generaStato(unoSession[chat], name),
        interactiveButtons: gameButtons()
    }, { quoted: m })
}

handler.before = async (m, { conn }) => {
    const chat = m.chat
    let msgText = (m.text || m.body || '').trim().toLowerCase()
    
    if (m.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson) {
        try {
            const params = JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson)
            msgText = params.id.toLowerCase()
        } catch (e) {}
    }

    if (msgText === '.uno') return false
    let s = unoSession[chat]
    if (!s || s.player !== m.sender) return
    let name = conn.getName(m.sender)

    if (msgText === 'enduno') {
        delete unoSession[chat]
        return m.reply('❌ Partita terminata.')
    }

    let report = ''

    if (msgText === 'pesca') {
        if (s.mazzo.length === 0) s.mazzo = creaMazzo()
        let p = s.mazzo.shift()
        s.playerHand.push(p)
        report = `📥 Hai pescato: ${formattaCarta(p)}`
        if (!puoGiocare(p, s.tableCard, s.currentColor)) {
            report += `\n❌ Non giocabile. Turno al Bot...`
            await botTurno(s)
        }
    } else {
        let index = parseInt(msgText) - 1
        if (!isNaN(index) && index >= 0 && index < s.playerHand.length) {
            let carta = s.playerHand[index]
            if (!puoGiocare(carta, s.tableCard, s.currentColor)) {
                await m.reply(`🚫 *Mossa non valida!*`)
                return true
            }

            s.playerHand.splice(index, 1)
            s.tableCard = carta
            
            if (carta.includes('Jolly')) {
                // Scelta automatica colore per il giocatore (il più presente in mano)
                let counts = {}
                s.playerHand.forEach(c => { if(!c.includes('Jolly')) { let col = c.split(' ')[0]; counts[col] = (counts[col] || 0) + 1 }})
                s.currentColor = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, nomiColori[Math.floor(Math.random() * 4)])
            } else {
                s.currentColor = carta.split(' ')[0]
            }

            report = `✅ Hai giocato ${formattaCarta(carta)}.`

            if (s.playerHand.length === 0) {
                delete unoSession[chat]
                await conn.sendMessage(chat, { text: `🏆 *HAI VINTO!*`, interactiveButtons: playAgainButtons() }, { quoted: m })
                return true
            }
            await botTurno(s)
        } else { return false }
    }

    async function botTurno(s) {
        if (s.mazzo.length < 10) s.mazzo = [...s.mazzo, ...creaMazzo()]
        let bIdx = s.botHand.findIndex(c => puoGiocare(c, s.tableCard, s.currentColor))
        
        if (bIdx !== -1) {
            let cBot = s.botHand.splice(bIdx, 1)[0]
            s.tableCard = cBot
            report += `\n🤖 Bot gioca: ${formattaCarta(cBot)}`
            
            if (cBot.includes('Jolly')) {
                let counts = {}
                s.botHand.forEach(c => { if(!c.includes('Jolly')) { let col = c.split(' ')[0]; counts[col] = (counts[col] || 0) + 1 }})
                s.currentColor = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, nomiColori[Math.floor(Math.random() * 4)])
                report += `\n🎨 Colore scelto: *${s.currentColor}*`
            } else {
                s.currentColor = cBot.split(' ')[0]
            }

            if (cBot.includes('+2')) {
                s.playerHand.push(s.mazzo.shift(), s.mazzo.shift())
                report += `\n⚠️ Hai ricevuto +2 carte!`
            } else if (cBot.includes('+4')) {
                for(let i=0; i<4; i++) s.playerHand.push(s.mazzo.shift())
                report += `\n💀 Jolly +4! Hai ricevuto 4 carte!`
            }
        } else {
            s.botHand.push(s.mazzo.shift())
            report += `\n🤖 Bot pesca.`
        }
    }

    if (s.botHand.length === 0) {
        delete unoSession[chat]
        await conn.sendMessage(chat, { text: `🤡 *SCONFITTA!*`, interactiveButtons: playAgainButtons() }, { quoted: m })
        return true
    }

    await conn.sendMessage(chat, {
        text: generaStato(s, name, report),
        interactiveButtons: gameButtons()
    }, { quoted: m })
    return true
}

handler.help = ['uno']
handler.tags = ['giochi']
handler.command = /^(uno)$/i
handler.group = true

export default handler
