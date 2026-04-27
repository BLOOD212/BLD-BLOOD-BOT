import { createCanvas } from 'canvas'

let unoSession = {}

const coloriHex = { 
    'Rosso': '#FF3B30', 
    'Blu': '#007AFF', 
    'Giallo': '#FFCC00', 
    'Verde': '#4CD964', 
    'Jolly': '#1C1C1E' 
}

async function generaGrafica(s) {
    const canvas = createCanvas(1000, 600)
    const ctx = canvas.getContext('2d')
    const gradiente = ctx.createRadialGradient(500, 300, 50, 500, 300, 600)
    gradiente.addColorStop(0, '#1a1a1d'); gradiente.addColorStop(1, '#000000')
    ctx.fillStyle = gradiente; ctx.fillRect(0, 0, 1000, 600)

    const drawCard = (x, y, label, color, isHidden = false, scale = 1) => {
        const w = 80 * scale, h = 120 * scale
        ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 10;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(x, y, w, h, 8); ctx.fill()
        ctx.shadowBlur = 0;
        if (isHidden) {
            ctx.fillStyle = '#2c2c2e'; ctx.beginPath(); ctx.roundRect(x + 4, y + 4, w - 8, h - 8, 5); ctx.fill()
        } else {
            ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x + 4, y + 4, w - 8, h - 8, 5); ctx.fill()
            ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.font = `bold ${22 * scale}px Arial`
            ctx.fillText(label.split(' ')[1] || label, x + (w/2), y + (h/2) + 10)
        }
    }

    drawCard(50, 240, 'Mazzo', '#3a3a3c', true, 0.9)
    let botX = 500 - (Math.min(s.botHand.length, 10) * 15)
    s.botHand.slice(0, 12).forEach((_, i) => drawCard(botX + (i * 30), 40, '', '', true, 0.7))
    let tColore = coloriHex[s.currentColor] || coloriHex['Jolly']
    drawCard(460, 230, s.tableCard, tColore, false, 1.2)
    let startX = 500 - (s.playerHand.length * 45)
    s.playerHand.forEach((c, i) => {
        let col = coloriHex[c.split(' ')[0]] || coloriHex['Jolly']
        drawCard(startX + (i * 90), 420, c, col, false, 1)
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 18px Arial'; ctx.textAlign = 'center'
        ctx.fillText(i + 1, startX + (i * 90) + 40, 565)
    })
    return canvas.toBuffer()
}

// Funzione di invio tramite LIST MESSAGE (Compatibile iPhone)
async function sendUnoList(conn, chat, s, caption, m) {
    const img = await generaGrafica(s)
    
    const sections = [
        {
            title: "Azioni di Gioco",
            rows: [
                { title: "📥 PESCA", rowId: "pesca", description: "Pesca una carta dal mazzo" },
                { title: "🛑 ABBANDONA", rowId: "enduno", description: "Termina la partita" }
            ]
        }
    ]

    const listMessage = {
        text: caption,
        footer: "Seleziona un'azione dal menu qui sotto",
        title: "🃏 MENU UNO",
        buttonText: "AZIONI GIOCO",
        sections
    }

    return await conn.sendMessage(chat, { 
        image: img, 
        caption: caption,
        footer: "Usa il menu o scrivi il numero della carta",
        buttonText: "Scegli un'opzione",
        sections: sections,
        headerType: 4
    }, { quoted: m })
}

let handler = async (m, { conn }) => {
    let chat = m.chat
    let mazzo = creaMazzo()
    unoSession[chat] = {
        player: m.sender, mazzo,
        playerHand: mazzo.splice(0, 7),
        botHand: mazzo.splice(0, 7),
        tableCard: mazzo.find(c => !c.includes('Jolly') && !c.includes('+')),
        currentColor: ''
    }
    unoSession[chat].currentColor = unoSession[chat].tableCard.split(' ')[0]

    await sendUnoList(conn, chat, unoSession[chat], `🃏 *UNO MATCH*\n🎨 Colore attuale: *${unoSession[chat].currentColor}*`, m)
}

handler.before = async (m, { conn }) => {
    let chat = m.chat, s = unoSession[chat]
    if (!s || s.player !== m.sender) return

    // Rileva input da lista (rowId) o testo
    let msgText = (m.text || m.body || m.msg?.singleSelectReply?.selectedRowId || '').trim().toLowerCase()

    if (msgText === '.uno' || msgText === 'uno') return
    if (msgText === 'enduno') { 
        delete unoSession[chat]; return m.reply('🛑 Partita terminata.') 
    }

    let report = ""
    if (msgText === 'pesca') {
        if (s.mazzo.length === 0) s.mazzo = creaMazzo()
        let p = s.mazzo.shift(); s.playerHand.push(p)
        report = `📥 Hai pescato: ${p}`
        if (!puoGiocare(p, s.tableCard, s.currentColor)) {
            report += `\n❌ Non giocabile. Passi il turno.`
            report += botTurno(s)
        }
    } else {
        let idx = parseInt(msgText) - 1
        if (isNaN(idx) || idx < 0 || idx >= s.playerHand.length) return
        let carta = s.playerHand[idx]
        if (!puoGiocare(carta, s.tableCard, s.currentColor)) return m.reply('❌ Mossa non valida!')

        s.playerHand.splice(idx, 1); s.tableCard = carta
        s.currentColor = carta.includes('Jolly') ? s.currentColor : carta.split(' ')[0]
        report = `✅ Hai giocato ${carta}`

        if (carta.includes('+2')) { 
            for(let i=0; i<2; i++) s.botHand.push(s.mazzo.shift())
            report += `\n⚠️ Bot +2! Salta turno.`
        } else if (carta.includes('+4')) { 
            for(let i=0; i<4; i++) s.botHand.push(s.mazzo.shift())
            report += `\n🔥 Bot +4! Salta turno.`
        } else {
            report += botTurno(s)
        }
    }

    if (s.playerHand.length === 0) { delete unoSession[chat]; return m.reply('🏆 HAI VINTO!') }
    if (s.botHand.length === 0) { delete unoSession[chat]; return m.reply('💀 IL BOT HA VINTO!') }

    await sendUnoList(conn, chat, s, `${report}\n🎨 Colore attuale: *${s.currentColor}*`, m)
}

// ... (Funzioni creaMazzo, puoGiocare, botTurno invariate) ...

function creaMazzo() {
    let colori = ['Rosso', 'Blu', 'Giallo', 'Verde'], mazzo = []
    colori.forEach(c => {
        mazzo.push(`${c} 0`)
        for (let v = 1; v <= 9; v++) { mazzo.push(`${c} ${v}`); mazzo.push(`${c} ${v}`) }
        for (let i = 0; i < 2; i++) mazzo.push(`${c} +2`)
    })
    for (let i = 0; i < 4; i++) { mazzo.push('Jolly'); mazzo.push('Jolly +4') }
    return mazzo.sort(() => Math.random() - 0.5)
}

function puoGiocare(carta, tavolo, coloreScelto) {
    if (carta.includes('Jolly')) return true
    let [c_c, v_c] = carta.split(' '), [c_t, v_t] = tavolo.split(' ')
    return c_c === coloreScelto || v_c === v_t
}

function botTurno(s) {
    let mosse = s.botHand.filter(c => puoGiocare(c, s.tableCard, s.currentColor))
    if (mosse.length > 0) {
        let scelta = mosse.find(c => !c.includes('Jolly')) || mosse[0]
        s.botHand.splice(s.botHand.indexOf(scelta), 1); s.tableCard = scelta
        s.currentColor = scelta.includes('Jolly') ? ['Rosso','Blu','Verde','Giallo'][Math.floor(Math.random()*4)] : scelta.split(' ')[0]
        let res = `\n🤖 Bot gioca: *${scelta}*`
        if (scelta.includes('+2')) { for(let i=0; i<2; i++) s.playerHand.push(s.mazzo.shift()); res += botTurno(s) }
        else if (scelta.includes('+4')) { for(let i=0; i<4; i++) s.playerHand.push(s.mazzo.shift()); res += botTurno(s) }
        return res
    } else {
        s.botHand.push(s.mazzo.shift()); return `\n🤖 Bot pesca.`
    }
}

handler.command = /^(uno)$/i
export default handler
