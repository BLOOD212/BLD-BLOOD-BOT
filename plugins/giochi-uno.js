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

// ... (creaMazzo, puoGiocare, botTurno rimangono identiche alle precedenti)

async function sendUno(conn, chat, s, text, m) {
    const img = await generaGrafica(s)
    
    // Formato ad altissima compatibilità per iOS (Template Buttons)
    return await conn.sendMessage(chat, {
        image: img,
        caption: text,
        footer: 'Scrivi il numero della carta o usa i tasti',
        templateButtons: [
            { index: 1, quickReplyButton: { displayText: '📥 PESCA', id: 'pesca' } },
            { index: 2, quickReplyButton: { displayText: '🛑 ABBANDONA', id: 'enduno' } }
        ]
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

    await sendUno(conn, chat, unoSession[chat], `🃏 *UNO MATCH*\n🎨 Colore: *${unoSession[chat].currentColor}*`, m)
}

handler.before = async (m, { conn }) => {
    let chat = m.chat, s = unoSession[chat]
    if (!s || s.player !== m.sender) return

    // Rileva sia testo che bottoni template
    let msgText = (m.text || m.body || m.selectedId || m.selectedDisplayText || '').trim().toLowerCase()
    
    // ... (Logica di gioco pesca/gioca identica)
    // Se non vuoi riscrivere tutto, incolla qui la logica dell'handler.before precedente
    // Cambiando solo la chiamata finale con:
    // await sendUno(conn, chat, s, report, m)
}

handler.command = /^(uno)$/i
export default handler
