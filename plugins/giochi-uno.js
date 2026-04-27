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
    return mazzo.sort(() => Math.random() - 0.5)
}

function formattaCarta(carta) {
    if (carta === 'Jolly') return '🌈 *Jolly*'
    if (carta === 'Jolly +4') return '🌈 *Jolly +4*'
    let [c, v] = carta.split(' ')
    return `*${v}${colori[c]}*`
}

function puoGiocare(carta, tavolo, coloreScelto) {
    if (carta.includes('Jolly')) return true
    let [c_c, c_v] = carta.split(' ')
    let [t_c, t_v] = tavolo.split(' ')
    return c_c === t_c || c_v === t_v || c_c === coloreScelto
}

function generaStato(s, nomeUtente, extraMsg = '') {
    let txt = `━━━━━━━━━━━━━━━━━━━━\n`
    txt += `🃏   *PARTITA DI UNO* 🃏\n`
    txt += `━━━━━━━━━━━━━━━━━━━━\n\n`
    if (extraMsg) txt += `${extraMsg}\n\n`
    txt += `📍 In Tavola: ${formattaCarta(s.tableCard)}\n`
    txt += `🎨 Colore Attivo: *${s.currentColor} ${colori[s.currentColor] || ''}*\n`
    txt += `🤖 Carte Bot: *${s.botHand.length}*\n\n`
    txt += `👤 *MANO DI ${nomeUtente.toUpperCase()}:*\n`
    s.playerHand.forEach((c, i) => {
        txt += `  *${i + 1}* ⮕ ${formattaCarta(c)}\n`
    })
    txt += `\n*COMANDI:*`
    txt += `\n⮕ Invia il *numero* per giocare`
    txt += `\n⮕ Scrivi *pesca* per nuove carte`
    txt += `\n⮕ Scrivi *enduno* per chiudere\n`
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
        let tableCard = mazzo.find(c => !c.includes('Jolly'))
        mazzo.splice(mazzo.indexOf(tableCard), 1)

        unoSession[chat] = {
            player: m.sender,
            mazzo,
            playerHand,
            botHand,
            tableCard,
            currentColor: tableCard.split(' ')[0]
        }

        let s = unoSession[chat]
        let name = conn.getName(m.sender)
        await conn.sendMessage(chat, { text: generaStato(s, name) }, { quoted: m })
    }
}

handler.before = async function (m, { conn }) {
    if (!m.chat || !m.sender || m.isBaileys) return
    let s = unoSession[m.chat]
    if (!s || s.player !== m.sender) return

    let msg = m.text.trim().toLowerCase()
    let name = conn.getName(m.sender)

    if (msg === 'enduno') {
        delete unoSession[m.chat]
        return m.reply('❌ Partita terminata. Alla prossima!')
    }

    if (msg === 'pesca') {
        if (s.mazzo.length === 0) s.mazzo = creaMazzo()
        let p = s.mazzo.shift()
        s.playerHand.push(p)
        return m.reply(generaStato(s, name, `📥 Hai pescato: ${formattaCarta(p)}`))
    }

    let index = parseInt(msg) - 1
    if (!isNaN(index) && index >= 0 && index < s.playerHand.length) {
        let cartaScelta = s.playerHand[index]

        if (!puoGiocare(cartaScelta, s.tableCard, s.currentColor)) {
            return m.reply(`🚫 *MOSSA NON VALIDA*\nNon puoi giocare ${formattaCarta(cartaScelta)} su ${formattaCarta(s.tableCard)}`)
        }

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
            return m.reply(`🏆 *CONGRATULAZIONI ${name.toUpperCase()}!*\n\nHai svuotato la mano e vinto la sfida contro il Bot!`)
        }

        let report = `✅ Hai giocato ${formattaCarta(cartaScelta)}.`
        
        if (cartaScelta.includes('+2') || cartaScelta.includes('+4')) {
            let num = cartaScelta.includes('+4') ? 4 : 2
            for(let i=0; i < num; i++) s.botHand.push(s.mazzo.shift())
            report += `\n🤖 Il bot subisce il colpo, pesca ${num} carte e salta il turno!`
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
                    for(let i=0; i < numB; i++) s.playerHand.push(s.mazzo.shift())
                    report += `\n⚠️ *ATTENZIONE!* Peschi ${numB} carte e salti il turno.`
                }
            } else {
                let pBot = s.mazzo.shift()
                s.botHand.push(pBot)
                report += `\n🤖 Il bot non ha mosse e pesca una carta.`
            }
        }

        if (s.botHand.length === 0) {
            delete unoSession[m.chat]
            return m.reply(`${report}\n\n🤡 *SCONFITTA!*\nIl bot ha finito le carte prima di te. Riprova!`)
        }

        return m.reply(generaStato(s, name, report))
    }
}

handler.help = ['uno']
handler.tags = ['giochi']
handler.command = /^(uno)$/i
handler.group = true

export default handler
