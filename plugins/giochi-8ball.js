import { createCanvas } from 'canvas'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!m.isGroup) throw `『 🔮 』 \`Questo comando può essere usato solo nei gruppi.\``

        if (!text) throw `『 🔮 』 \`Fammi una domanda per interrogare l'oracolo!\`\n\n\`Esempio:\`\n*${usedPrefix + command} Domani ci sarà il sole?*`

        const risposte = [
            { testo: "SÌ", colore: "#00ff88", sub: "È certo." },
            { testo: "ASSOLUTAMENTE SÌ", colore: "#00ff88", sub: "Senza alcun dubbio." },
            { testo: "LE FONTI DICONO SÌ", colore: "#00ff88", sub: "I segnali sono positivi." },
            { testo: "NO", colore: "#ff3344", sub: "Non ci sperare." },
            { testo: "ASSOLUTAMENTE NO", colore: "#ff3344", sub: "Le possibilità sono zero." },
            { testo: "LE FONTI DICONO NO", colore: "#ff3344", sub: "Prospettive negative." },
            { testo: "FORSE", colore: "#ffaa00", sub: "Le stelle sono incerte." },
            { testo: "PUÒ DARSI", colore: "#ffaa00", sub: "Tutto può ancora cambiare." },
            { testo: "CONCENTRATI E RIPROVA", colore: "#ffaa00", sub: "Il destino è nebbioso." },
            { testo: "MEGLIO NON DIRTELO", colore: "#ffaa00", sub: "Resta nel dubbio." }
        ]

        const scelta = risposte[Math.floor(Math.random() * risposte.length)]

        const canvas = createCanvas(600, 600)
        const ctx = canvas.getContext('2d')

        ctx.fillStyle = '#121214'
        ctx.fillRect(0, 0, 600, 600)

        const pallaGrad = ctx.createRadialGradient(260, 260, 20, 300, 300, 260)
        pallaGrad.addColorStop(0, '#3a3a40')
        pallaGrad.addColorStop(0.3, '#141417')
        pallaGrad.addColorStop(1, '#050506')

        ctx.beginPath()
        ctx.arc(300, 300, 260, 0, Math.PI * 2)
        ctx.fillStyle = pallaGrad
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)'
        ctx.shadowBlur = 30
        ctx.shadowOffsetX = 10
        ctx.shadowOffsetY = 20
        ctx.fill()
        ctx.closePath()

        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0

        ctx.beginPath()
        ctx.arc(300, 300, 130, 0, Math.PI * 2)
        ctx.fillStyle = '#08080a'
        ctx.lineWidth = 4
        ctx.strokeStyle = scelta.colore
        ctx.stroke()
        ctx.fill()
        ctx.closePath()

        ctx.beginPath()
        ctx.moveTo(300, 390)
        ctx.lineTo(200, 230)
        ctx.lineTo(400, 230)
        ctx.closePath()
        ctx.fillStyle = 'rgba(15, 15, 20, 0.9)'
        ctx.lineWidth = 2
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
        ctx.stroke()
        ctx.fill()

        ctx.fillStyle = scelta.colore
        ctx.font = 'bold 24px Sans-Serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        const parole = scelta.testo.split(' ')
        let linea = ''
        let y = 285

        for (let n = 0; n < parole.length; n++) {
            let lineaTest = linea + parole[n] + ' '
            if (lineaTest.length > 10 && n > 0) {
                ctx.fillText(linea.trim(), 300, y)
                linea = parole[n] + ' '
                y += 28
            } else {
                linea = lineaTest
            }
        }
        ctx.fillText(linea.trim(), 300, y)

        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
        ctx.font = 'italic 13px Sans-Serif'
        ctx.fillText(scelta.sub, 300, 345)

        const buffer = canvas.toBuffer('image/png')

        let didascalia = `🔮 *L'ORACOLO HA PARLATO*\n\n`
        didascalia += `👤 *Domanda di:* @${m.sender.split('@')[0]}\n`
        didascalia += `💬 *Quesito:* _${text}_\n\n`
        didascalia += `✨ *Verdetto* .`

        await conn.sendMessage(m.chat, { 
            image: buffer, 
            caption: didascalia,
            mentions: [m.sender]
        }, { quoted: m })

    } catch (error) {
        console.error(error)
        if (typeof error === 'string') return m.reply(error)
        return m.reply(`⚠️ Errore nel calcolo del destino.`)
    }
}

handler.help = ['8ball [domanda]']
handler.tags = ['group', 'fun']
handler.command = /^(8ball|oracolo|palla8)$/i

handler.group = true
handler.owner = false

export default handler
