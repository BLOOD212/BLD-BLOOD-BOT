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
    gradiente.addColorStop(0, '#1e1e1e')
    gradiente.addColorStop(1, '#000000')
    ctx.fillStyle = gradiente
    ctx.fillRect(0, 0, 1000, 600)

    const drawCard = (x, y, label, color, isHidden = false, scale = 1) => {
        const w = 80 * scale
        const h = 120 * scale
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.roundRect(x, y, w, h, 8)
        ctx.fill()
        if (isHidden) {
            ctx.fillStyle = '#2c2c2e'
            ctx.beginPath()
            ctx.roundRect(x + 4, y + 4, w - 8, h - 8, 5)
            ctx.fill()
        } else {
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.roundRect(x + 4, y + 4, w - 8, h - 8, 5)
            ctx.fill()
            ctx.fillStyle = '#ffffff'
            ctx.textAlign = 'center'
            ctx.font = `bold ${24 * scale}px Arial`
            ctx.fillText(label.split(' ')[1] || 'UNO', x + w/2, y + h/2 + 10)
        }
    }

    drawCard(50, 240, 'Mazzo', '#3a3a3c', true, 0.9)
    let botX = 500 - (Math.min(s.botHand.length, 10) * 15)
    s.botHand.slice(0, 12).forEach((_, i) => drawCard(botX + (i * 30), 40, '', '', true, 0.7))
    let tColore = coloriHex[s.tableCard.split(' ')[0]] || coloriHex['Jolly']
    drawCard(460, 230, s.tableCard, tColore, false, 1.2)
    let startX = 500 - (s.playerHand.length * 45)
    s.playerHand.forEach((c, i) => {
        let col = coloriHex[c.split(' ')[0]] || coloriHex['Jolly']
        drawCard(startX + (i * 90), 420, c, col, false, 1)
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 18px Arial'
        ctx.fillText(i + 1, startX + (i * 90) + 40, 565)
    })
    return canvas.toBuffer()
}

let handler = async (m, { conn }) => {
    let chat = m.chat
    try {
        let name = conn.getName(m.sender)
        let mazzo = []
        let cols = ['Rosso', 'Blu', 'Giallo', 'Verde']
        cols.forEach(c => {
            for (let v = 0; v <= 9; v++) mazzo.push(`${c} ${v}`)
            mazzo.push(`${c} +2`)
        })
        for (let i = 0; i < 4; i++) mazzo.push('Jolly', 'Jolly +4')
        mazzo = mazzo.sort(() => Math.random() - 0.5)

        unoSession[chat] = {
            player: m.sender,
            mazzo: mazzo,
            playerHand: mazzo.splice(0, 7),
            botHand: mazzo.splice(0, 7),
            tableCard: mazzo.find(c => !c.includes('Jolly')),
        }
        
        let imgBuffer = await generaGrafica(unoSession[chat])

        // Proviamo a inviare con i bottoni
        await conn.sendMessage(chat, {
            interactiveMessage: {
                header: {
                    title: `🃏 *UNO MATCH: ${name.toUpperCase()}*`,
                    hasMediaAttachment: true,
                    imageMessage: (await conn.prepareMessageMedia({ image: imgBuffer }, { upload: conn.waUploadToServer })).imageMessage
                },
                body: { text: "Tocca un bottone o scrivi il numero della carta!" },
                footer: { text: "Gemini Uno Engine" },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({ display_text: "📥 PESCA", id: "pesca" })
                        },
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({ display_text: "🛑 ABBANDONA", id: "enduno" })
                        }
                    ]
                }
            }
        }, { quoted: m })

    } catch (e) {
        console.error("Errore Bottoni:", e)
        // Se i bottoni falliscono (TypeError), invia immagine classica
        if (unoSession[chat]) {
            let backupImg = await generaGrafica(unoSession[chat])
            await conn.sendMessage(chat, { 
                image: backupImg, 
                caption: `🃏 *UNO MATCH*\n\n📥 Scrivi *pesca* per pescare\n🛑 Scrivi *enduno* per uscire\n\n🔢 Invia il *numero* della carta per giocare!` 
            }, { quoted: m })
        }
    }
}

handler.command = /^(uno)$/i
export default handler
