import { createCanvas } from 'canvas'

global.navale = global.navale || {}
const footer = '𝐁𝐋𝐎𝐎𝐃-𝐁𝐎𝐓'

let handler = async (m, { conn, text, command, usedPrefix }) => {
    let chat = m.chat
    let user = m.sender

    // Inizializzazione Database
    global.db.data.users[user] = global.db.data.users[user] || {}
    let dbUser = global.db.data.users[user]

    // --- 1. INIZIO SFIDA ---
    if (command === 'battaglia') {
        if (global.navale[chat]) return m.reply('⚠️ Una battaglia è già in corso!')
        
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!target) return m.reply('⚓ *Tagga l\'avversario che vuoi affondare!*')
        if (target === user) return m.reply('🤔 Non puoi sparare alle tue stesse navi!')

        // Costo sfida: 100€
        if (dbUser.euro < 100) return m.reply(`📉 Non hai abbastanza euro! Ti servono 100€ per armare la flotta.`)

        global.navale[chat] = {
            p1: user,
            p2: target,
            status: 'WAITING',
            turno: user,
            board1: generateBoard(),
            board2: generateBoard(),
            hits1: [], 
            hits2: [],
            scommessa: 100
        }

        let intro = `ㅤ⋆｡˚『 ╭ \`⚓ BATTAGLIA NAVALE HD ⚓\` ╯ 』˚｡⋆\n╭\n`
        intro += `│ 『 ⚔️ 』 *SFIDANTE:* @${user.split('@')[0]}\n`
        intro += `│ 『 🎯 』 *AVVERSARIO:* @${target.split('@')[0]}\n`
        intro += `│ 『 💰 』 *POSTA IN GIOCO:* 200€\n`
        intro += `│ ──────────────────\n`
        intro += `│ 『 🛡️ 』 \`Accetti lo scontro?\`\n`
        intro += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

        const buttons = [
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'ACCETTA ✅', id: `${usedPrefix}accetta` }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'RIFIUTA ❌', id: `${usedPrefix}rifiuta` }) }
        ]

        return conn.sendMessage(chat, { text: intro, footer, mentions: [user, target], interactiveButtons: buttons }, { quoted: m })
    }

    if (command === 'rifiuta') {
        if (!global.navale[chat] || user !== global.navale[chat].p2) return
        delete global.navale[chat]
        return m.reply('🏳️ La sfida è stata rifiutata. Codardi!')
    }

    if (command === 'endgame' || command === 'fine') { 
        if (!global.navale[chat]) return
        delete global.navale[chat]
        return m.reply('🏁 *Battaglia terminata forzatamente.*') 
    }

    if (command === 'accetta') {
        let game = global.navale[chat]
        if (!game || game.status !== 'WAITING' || user !== game.p2) return
        
        // Controllo soldi avversario
        if (global.db.data.users[game.p2].euro < 100) {
            delete global.navale[chat]
            return m.reply('📉 L\'avversario non ha abbastanza euro per giocare!')
        }

        // Detrazione soldi
        global.db.data.users[game.p1].euro -= 100
        global.db.data.users[game.p2].euro -= 100
        
        game.status = 'PLAYING'
        return m.reply(`🚢 *FLOTTE SCHIERATE!*\n\nTurno di @${game.p1.split('@')[0]}\nUsa: *.fuoco A1* (Griglia A-E, 1-5)`, null, { mentions: [game.p1] })
    }

    // --- 2. LOGICA DI FUOCO ---
    if (command === 'fuoco') {
        let game = global.navale[chat]
        if (!game || game.status !== 'PLAYING') return m.reply('⚠️ Nessuna battaglia attiva.')
        if (user !== game.turno) return m.reply(`⏳ Aspetta il tuo turno, comandante!`)

        let coord = text.toUpperCase().trim()
        if (!/^[A-E][1-5]$/.test(coord)) return m.reply('📝 *Esempio: .fuoco B2*')

        let isP1 = user === game.p1
        let opponentBoard = isP1 ? game.board2 : game.board1
        let hits = isP1 ? game.hits2 : game.hits1 

        if (hits.includes(coord)) return m.reply('❌ Hai già sparato in quelle coordinate!')
        hits.push(coord)

        let isHit = opponentBoard.includes(coord)
        let win = opponentBoard.every(ship => hits.includes(ship))

        // DISEGNO CANVAS
        const canvas = createCanvas(500, 500)
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#003366'; ctx.fillRect(0, 0, 500, 500)
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3
        for (let i = 0; i <= 5; i++) {
            ctx.beginPath(); ctx.moveTo(70 + i * 80, 70); ctx.lineTo(70 + i * 80, 470); ctx.stroke()
            ctx.beginPath(); ctx.moveTo(70, 70 + i * 80); ctx.lineTo(470, 70 + i * 80); ctx.stroke()
        }
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 35px Arial'; ctx.textAlign = 'center'
        let letters = ['A', 'B', 'C', 'D', 'E']
        for (let i = 0; i < 5; i++) {
            ctx.fillText(i + 1, 110 + i * 80, 50)
            ctx.fillText(letters[i], 35, 125 + i * 80)
        }

        letters.forEach((l, row) => {
            for (let col = 1; col <= 5; col++) {
                let currentCoord = l + col
                if (hits.includes(currentCoord)) {
                    let x = 110 + (col - 1) * 80
                    let y = 115 + row * 80
                    if (opponentBoard.includes(currentCoord)) {
                        ctx.fillStyle = '#ff0000'; ctx.beginPath(); ctx.arc(x, y, 30, 0, Math.PI * 2); ctx.fill()
                    } else {
                        ctx.strokeStyle = '#00ccff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, 20, 0, Math.PI * 2); ctx.stroke()
                    }
                }
            }
        })

        if (win) {
            let vincitore = user;
            let premio = 200; // 100 propri + 100 dell'avversario
            let exp = 150;
            
            global.db.data.users[vincitore].euro += premio
            global.db.data.users[vincitore].exp += exp
            
            let winText = `ㅤ⋆｡˚『 ╭ \`💥 VITTORIA TOTALE! 💥\` ╯ 』˚｡⋆\n╭\n`
            winText += `│ 『 🏆 』 @${vincitore.split('@')[0]} ha affondato la flotta!\n`
            winText += `│ 『 💰 』 \`Bottino di guerra:\` *${premio}€*\n`
            winText += `│ 『 🆙 』 \`Esperienza:\` *${exp} EXP*\n`
            winText += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`
            
            delete global.navale[chat]
            return conn.sendMessage(chat, { image: canvas.toBuffer(), caption: winText, footer, mentions: [vincitore] }, { quoted: m })
        }

        game.turno = isP1 ? game.p2 : game.p1
        let cap = `ㅤ⋆｡˚『 ╭ \`${isHit ? '🔥 COLPITO!' : '💦 ACQUA!'}\` ╯ 』˚｡⋆\n╭\n`
        cap += `│ 『 📍 』 \`Coordinate:\` *${coord}*\n`
        cap += `│ 『 ⏳ 』 \`Prossimo turno:\` @${game.turno.split('@')[0]}\n`
        cap += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

        return conn.sendMessage(chat, { image: canvas.toBuffer(), caption: cap, footer, mentions: [game.turno] }, { quoted: m })
    }
}

function generateBoard() {
    let coords = [], letters = ['A', 'B', 'C', 'D', 'E']
    while (coords.length < 3) {
        let c = letters[Math.floor(Math.random() * 5)] + (Math.floor(Math.random() * 5) + 1)
        if (!coords.includes(c)) coords.push(c)
    }
    return coords
}

handler.help = ['battaglia @tag']
handler.tags = ['giochi']
handler.command = /^(battaglia|accetta|rifiuta|fuoco|endgame|fine)$/i
handler.group = true
handler.register = false

export default handler
