import { createCanvas, registerFont } from 'canvas'

let unoSession = {}

const coloriHex = { 
    'Rosso': '#FF3B30', 
    'Blu': '#007AFF', 
    'Giallo': '#FFCC00', 
    'Verde': '#4CD964', 
    'Jolly': '#1C1C1E' 
}

const gameButtons = () => [
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📥 PESCA', id: 'pesca' }) },
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🛑 CHIUDI', id: 'enduno' }) }
]

async function generaGrafica(s) {
    const canvas = createCanvas(1000, 600)
    const ctx = canvas.getContext('2d')

    const gradiente = ctx.createRadialGradient(500, 300, 50, 500, 300, 600)
    gradiente.addColorStop(0, '#1e1e1e')
    gradiente.addColorStop(1, '#000000')
    ctx.fillStyle = gradiente
    ctx.fillRect(0, 0, 1000, 600)

    const drawCard = (x, y, label, color, isHidden = false, scale = 1) => {
        const w = 80 * scale
        const h = 120 * scale
        
        ctx.shadowColor = 'rgba(0,0,0,0.5)'
        ctx.shadowBlur = 15
        ctx.shadowOffsetY = 5

        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.roundRect(x, y, w, h, 8)
        ctx.fill()

        ctx.shadowBlur = 0
        ctx.shadowOffsetY = 0

        if (isHidden) {
            ctx.fillStyle = '#2c2c2e'
            ctx.beginPath()
            ctx.roundRect(x + 4, y + 4, w - 8, h - 8, 5)
            ctx.fill()
            ctx.fillStyle = '#ffffff'
            ctx.font = `bold ${30 * scale}px Arial`
            ctx.fillText('?', x + (w/3), y + (h/1.7))
        } else {
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.roundRect(x + 4, y + 4, w - 8, h - 8, 5)
            ctx.fill()
            
            ctx.fillStyle = 'rgba(255,255,255,0.2)'
            ctx.beginPath()
            ctx.ellipse(x + w/2, y + h/2, w/2.5, h/3.5, Math.PI / 4, 0, Math.PI * 2)
            ctx.fill()

            ctx.fillStyle = '#ffffff'
            ctx.textAlign = 'center'
            ctx.font = `bold ${24 * scale}px Arial`
            let val = label.split(' ')[1] || 'UNO'
            ctx.fillText(val, x + w/2, y + h/2 + 10)
        }
    }

    drawCard(50, 240, 'Mazzo', '#3a3a3c', true, 0.9)
    ctx.fillStyle = '#8e8e93'
    ctx.font = '16px Arial'
    ctx.fillText('MAZZO', 85, 380)

    let botX = 500 - (Math.min(s.botHand.length, 10) * 15)
    s.botHand.slice(0, 12).forEach((_, i) => {
        drawCard(botX + (i * 30), 40, '', '', true, 0.7)
    })
    ctx.fillStyle = '#ff3b30'
    ctx.font = 'bold 20px Arial'
    ctx.fillText(`AVVERSARIO: ${s.botHand.length} CARTE`, 500, 30)

    let tColore = coloriHex[s.tableCard.split(' ')[0]] || coloriHex['Jolly']
    drawCard(460, 230, s.tableCard, tColore, false, 1.2)

    let handW = s.playerHand.length * 90
    let startX = 500 - (handW / 2)
    s.playerHand.forEach((c, i) => {
        let col = coloriHex[c.split(' ')[0]] || coloriHex['Jolly']
        drawCard(startX + (i * 90), 420, c, col, false, 1)
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 18px Arial'
        ctx.fillText(i + 1, startX + (i * 90) + 40, 560)
    })

    return canvas.toBuffer()
}

let handler = async (m, { conn }) => {
    let chat = m.chat
    let name = conn.getName(m.sender)

    let mazzo = []
    let cols = ['Rosso', 'Blu', 'Giallo', 'Verde']
    cols.forEach(c => {
        for (let v = 0; v <= 9; v++) mazzo.push(`${c} ${v}`)
        mazzo.push(`${c} +2`)
    })
    for (let i = 0; i < 4; i++) mazzo.push('Jolly', 'Jolly +4')
    mazzo = mazzo.sort(() => Math.random() - 0.5)

    let s = unoSession[chat] = {
        player: m.sender,
        mazzo: mazzo,
        playerHand: mazzo.splice(0, 7),
        botHand: mazzo.splice(0, 7),
        tableCard: mazzo.find(c => !c.includes('Jolly')),
        currentColor: ''
    }
    s.currentColor = s.tableCard.split(' ')[0]

    let img = await generaGrafica(s)
    await conn.sendMessage(chat, {
        image: img,
        caption: `🃏 *UNO MATCH: ${name.toUpperCase()} vs BOT*\n\nScrivi il numero della carta per giocare o usa i tasti sotto.`,
        footer: 'Gemini Uno Engine',
        buttons: gameButtons(),
        headerType: 4
    }, { quoted: m })
}

handler.command = /^(uno)$/i
export default handler
