let unoSession = {}

const colori = { 'Rosso': '🔴', 'Blu': '🔵', 'Giallo': '🟡', 'Verde': '🟢' }
const nomiColori = ['Rosso', 'Blu', 'Giallo', 'Verde']

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
    txt += `*DESCRIZIONE:* Sfida il bot a UNO! L'obiettivo è restare senza carte. Abbina colore o numero. Se peschi una carta non utilizzabile, il turno passerà automaticamente al bot.\n\n`
    if (extraMsg) txt += `${extraMsg}\n\n`
    txt += `📍 In Tavola: ${formattaCarta(s.tableCard)}\n`
    txt += `🎨 Colore Attivo: *${s.currentColor} ${colori[s.currentColor] || ''}*\n`
    txt += `🤖 Carte Bot: *${s.botHand.length}*\n`
    txt += `🎴 Carte nel mazzo: *${s.mazzo.length}*\n\n`
    txt += `👤 *MANO DI ${nomeUtente.toUpperCase()}:*\n`
    s.playerHand.forEach((c, i) => {
        txt += `  *${i + 1}* ⮕ ${formattaCarta(c)}\n`
    })
    txt += `\n*COMANDI:*`
    txt += `\n⮕ Scrivi il *numero* della carta`
    txt += `\n⮕ Usa il tasto *Pesca* se sei bloccato`
    txt += `\n━━━━━━━━━━━━━━━━━━━━`
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
            footer: 'Uno Bot Game',
            buttons: [
                { buttonId: 'pesca', buttonText: { displayText: '📥 Pesca' }, type: 1 },
                { buttonId: 'enduno', buttonText: { displayText: '❌ Chiudi' }, type: 1 }
            ],
            headerType: 1
        }, { quoted: m })
    }
}

handler.before = async function (m, { conn }) {
    if (!m.chat || !m.sender || m.isBaileys) return
    let s = unoSession[m.chat]
    if (!s || s.player !== m.sender) return

    let msg = (m.text || m.selectedButtonId || '').trim().toLowerCase()
    let name = conn.getName(m.sender)

    if (msg === 'enduno') {
        delete unoSession[m.chat]
        return m.reply('❌ Partita terminata!')
    }

    if (msg === 'pesca') {
        if (s.mazzo.length === 0) s.mazzo = creaMazzo()
        let p = s.mazzo.shift()
        s.playerHand.push(p)
        
        let reportP = `📥 Hai pescato: ${formattaCarta(p)}`
        
        if (puoGiocare(p, s.tableCard, s.currentColor)) {
            reportP += `\n✅ La carta è giocabile! Puoi usarla ora.`
        } else {
            reportP += `\n❌ Non puoi giocare questa carta. Turno passato al Bot...`
            
            let bIdx = s.botHand.findIndex(c => puoGiocare(c, s.tableCard, s.currentColor))
            if (bIdx !== -1) {
                let cBot = s.botHand.splice(bIdx, 1)[0]
                s.tableCard = cBot
                s.currentColor = cBot.includes('Jolly') ? s.currentColor : cBot.split(' ')[0]
                reportP += `\n🤖 Il bot risponde con: ${formattaCarta(cBot)}`
            } else {
                if (s.mazzo.length === 0) s.mazzo = creaMazzo()
                s.botHand.push(s.mazzo.shift())
                reportP += `\n🤖 Il bot non ha mosse e pesca.`
            }
        }

        return conn.sendMessage(m.chat, {
            text: generaStato(s, name, reportP),
            buttons: [
                { buttonId: 'pesca', buttonText: { displayText: '📥 Pesca' }, type: 1 },
                { buttonId: 'enduno', buttonText: { displayText: '❌ Chiudi' }, type: 1 }
            ]
        }, { quoted: m })
    }

    let index = parseInt(msg) - 1
    if (!isNaN(index) && index >= 0 && index < s.playerHand.length) {
        let cartaScelta = s.playerHand[index]
        if (!puoGiocare(cartaScelta, s.tableCard, s.currentColor)) return m.reply(`🚫 *MOSSA NON VALIDA*`)

        s.playerHand.splice(index, 1)
        s.tableCard = cartaScelta
        
        if (cartaScelta.includes('Jolly')) {
            let cP = { 'Rosso': 0, 'Blu': 0, 'Giallo': 0, 'Verde': 0 }
            s.playerHand.forEach(c => { if(!c.includes('Jolly')) cP[c.split(' ')[0]]++ })
            s.currentColor = Object.keys(cP).reduce((a, b) => cP[a] > cP[b] ? a : b)
        } else {
            s.currentColor = cartaScelta.split(' ')[0]
        }

        if (s.playerHand.length === 0) {
            delete unoSession[m.chat]
            return m.reply(`🏆 *HAI VINTO!*`)
        }

        let report = `✅ Hai giocato ${formattaCarta(cartaScelta)}.`
        
        if (cartaScelta.includes('+2') || cartaScelta.includes('+4')) {
            let num = cartaScelta.includes('+4') ? 4 : 2
            for(let i=0; i < num; i++) {
                if (s.mazzo.length === 0) s.mazzo = creaMazzo()
                s.botHand.push(s.mazzo.shift())
            }
            report += `\n🤖 Il bot pesca ${num} e salta il turno!\n👉 Tocca ancora a te!`
        } else {
            let bIdx = s.botHand.findIndex(c => puoGiocare(c, s.tableCard, s.currentColor))
            if (bIdx !== -1) {
                let cBot = s.botHand.splice(bIdx, 1)[0]
                s.tableCard = cBot
                if (cBot.includes('Jolly')) {
                    let cB = { 'Rosso': 0, 'Blu': 0, 'Giallo': 0, 'Verde': 0 }
                    s.botHand.forEach(c => { if(!c.includes('Jolly')) cB[c.split(' ')[0]]++ })
                    s.currentColor = Object.keys(cB).reduce((a, b) => cB[a] > cB[b] ? a : b)
                } else {
                    s.currentColor = cBot.split(' ')[0]
                }
                report += `\n🤖 Il bot risponde con: ${formattaCarta(cBot)}`
                if (cBot.includes('+2') || cBot.includes('+4')) {
                    let numB = cBot.includes('+4') ? 4 : 2
                    for(let i=0; i < numB; i++) {
                        if (s.mazzo.length === 0) s.mazzo = creaMazzo()
                        s.playerHand.push(s.mazzo.shift())
                    }
                    report += `\n⚠️ Hai dovuto pescare ${numB} e saltare il turno!`
                }
            } else {
                if (s.mazzo.length === 0) s.mazzo = creaMazzo()
                s.botHand.push(s.mazzo.shift())
                report += `\n🤖 Il bot non ha mosse e pesca una carta.`
            }
        }

        if (s.botHand.length === 0) {
            delete unoSession[m.chat]
            return m.reply(`${report}\n\n🤡 *SCONFITTA!*`)
        }

        return conn.sendMessage(m.chat, {
            text: generaStato(s, name, report),
            buttons: [
                { buttonId: 'pesca', buttonText: { displayText: '📥 Pesca' }, type: 1 },
                { buttonId: 'enduno', buttonText: { displayText: '❌ Chiudi' }, type: 1 }
            ]
        }, { quoted: m })
    }
}

handler.help = ['uno']
handler.tags = ['giochi']
handler.command = /^(uno)$/i
handler.group = true

export default handler
