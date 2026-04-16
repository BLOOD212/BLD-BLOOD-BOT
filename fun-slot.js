import { createCanvas, loadImage } from 'canvas'

// --- CONFIGURAZIONI ---
const fruits = ['🍒', '🍋', '🍉', '🍇', '🍎', '🍓']
const fruitURLs = {
    '🍒': 'https://twemoji.maxcdn.com/v/latest/72x72/1f352.png',
    '🍋': 'https://twemoji.maxcdn.com/v/latest/72x72/1f34b.png',
    '🍉': 'https://twemoji.maxcdn.com/v/latest/72x72/1f349.png',
    '🍇': 'https://twemoji.maxcdn.com/v/latest/72x72/1f347.png',
    '🍎': 'https://twemoji.maxcdn.com/v/latest/72x72/1f34e.png',
    '🍓': 'https://twemoji.maxcdn.com/v/latest/72x72/1f353.png'
}
const cavalliConfig = [
    { nome: 'ROSSO', color: '#ff4d4d' },
    { nome: 'BLU', color: '#4d94ff' },
    { nome: 'VERDE', color: '#4dff88' },
    { nome: 'GIALLO', color: '#ffff4d' }
]

let handler = async (m, { conn, command, args, usedPrefix }) => {
    // --- SISTEMA EURO ---
    global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}
    let user = global.db.data.users[m.sender]
    if (user.euro === undefined) user.euro = 1000 // Inizializzazione se vuoto

    // Funzione rapida per controllare i soldi
    const checkMoney = (costo) => {
        if (user.euro < costo) {
            m.reply(`⚠️ Non hai abbastanza Euro! Ti servono ${costo}€ (Saldo: ${user.euro}€)`)
            return false
        }
        return true
    }

    // --- 1. MENU PRINCIPALE ---
    if (command === 'casino') {
        let intro = `*🎰 GRAND CASINÒ 🎰*\n*💰 SALDO:* *${user.euro}€*`
        const buttons = [
            { buttonId: `${usedPrefix}infoslot`, buttonText: { displayText: '🎰 SLOT' }, type: 1 },
            { buttonId: `${usedPrefix}infobj`, buttonText: { displayText: '🃏 BLACKJACK' }, type: 1 },
            { buttonId: `${usedPrefix}inforigore`, buttonText: { displayText: '⚽ RIGORI' }, type: 1 },
            { buttonId: `${usedPrefix}inforoulette`, buttonText: { displayText: '🎡 ROULETTE' }, type: 1 },
            { buttonId: `${usedPrefix}infogratta`, buttonText: { displayText: '🎟️ GRATTA&VINCI' }, type: 1 },
            { buttonId: `${usedPrefix}infocorsa`, buttonText: { displayText: '🏇 CORSA' }, type: 1 }
        ]
        return conn.sendMessage(m.chat, { text: intro, buttons }, { quoted: m })
    }

    // --- 2. GESTIONE INFO TASTI ---
    if (command === 'infoslot') return conn.sendMessage(m.chat, { text: `*🎰 SLOT*\nPunta 100€!`, buttons: [{ buttonId: `${usedPrefix}slot`, buttonText: { displayText: '🎰 TIRA' }, type: 1 }] })
    if (command === 'infobj') return conn.sendMessage(m.chat, { text: `*🃏 BLACKJACK*\nPunta 100€!`, buttons: [{ buttonId: `${usedPrefix}blackjack`, buttonText: { displayText: '🃏 GIOCA' }, type: 1 }] })
    if (command === 'infogratta') return conn.sendMessage(m.chat, { text: `*🎟️ GRATTA & VINCI*\nCosto: 200€!`, buttons: [{ buttonId: `${usedPrefix}gratta`, buttonText: { displayText: '🎟️ COMPRA' }, type: 1 }] })
    if (command === 'inforoulette') return conn.sendMessage(m.chat, { text: `*🎡 ROULETTE*\nScegli su cosa puntare (100€):`, buttons: [{ buttonId: `${usedPrefix}playroulette pari`, buttonText: { displayText: 'PARI' }, type: 1 }, { buttonId: `${usedPrefix}playroulette dispari`, buttonText: { displayText: 'DISPARI' }, type: 1 }] })
    if (command === 'inforigore') return conn.sendMessage(m.chat, { text: `*⚽ SFIDA AI RIGORI*\nScegli l'angolo del tiro (100€):`, buttons: [{ buttonId: `${usedPrefix}rigore sx`, buttonText: { displayText: '⬅️ SX' }, type: 1 }, { buttonId: `${usedPrefix}rigore cx`, buttonText: { displayText: '⬆️ CX' }, type: 1 }, { buttonId: `${usedPrefix}rigore dx`, buttonText: { displayText: '➡️ DX' }, type: 1 }] })
    if (command === 'infocorsa') return conn.sendMessage(m.chat, { text: `*🏇 CORSA CAVALLI*\nPunta 100€ sul vincitore (Paga X3):`, buttons: cavalliConfig.map(c => ({ buttonId: `${usedPrefix}puntacorsa ${c.nome}`, buttonText: { displayText: `${c.nome}` }, type: 1 })) })

    // --- 3. LOGICHE GIOCHI ---

    // ⚽ RIGORI
    if (command === 'rigore') {
        if (!checkMoney(100)) return
        let parata = ['sx', 'cx', 'dx'][Math.floor(Math.random() * 3)]
        let tiro = args[0], win = tiro !== parata
        user.euro += win ? 150 : -100
        const canvas = createCanvas(600, 350); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#2e7d32'; ctx.fillRect(0, 0, 600, 350)
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 10; ctx.strokeRect(100, 50, 400, 250)
        let pos = { sx: 160, cx: 300, dx: 440 }
        ctx.fillStyle = '#111'; ctx.fillRect(pos[parata]-40, 160, 80, 20)
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(pos[tiro] || 300, win ? 140 : 170, 15, 0, Math.PI*2); ctx.fill()
        const buttons = [{ buttonId: `${usedPrefix}inforigore`, buttonText: { displayText: '⚽ RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: win ? '*⚽ GOOOL!*' : '*🧤 PARATA!*', buttons })
    }

    // 🏇 CORSA CAVALLI
    if (command === 'puntacorsa') {
        if (!checkMoney(100)) return
        let vIdx = Math.floor(Math.random() * 4), win = args[0]?.toUpperCase() === cavalliConfig[vIdx].nome
        user.euro += win ? 200 : -100
        const canvas = createCanvas(700, 400); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#8d6e63'; ctx.fillRect(0, 0, 700, 400)
        for(let i=0; i<=4; i++) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(50, 50+(i*80)); ctx.lineTo(650, 50+(i*80)); ctx.stroke() }
        cavalliConfig.forEach((c, i) => {
            let xPos = (i === vIdx) ? 610 : Math.floor(Math.random() * 200) + 150
            ctx.fillStyle = c.color; ctx.beginPath(); ctx.arc(xPos, 90+(i*80), 25, 0, Math.PI*2); ctx.fill()
            ctx.fillStyle = '#fff'; ctx.font = 'bold 15px Arial'; ctx.fillText(c.nome, 60, 95+(i*80))
        })
        const buttons = [{ buttonId: `${usedPrefix}infocorsa`, buttonText: { displayText: '🏇 RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: win ? '*✅ HAI VINTO!*' : `*❌ PERSO! VINCE IL ${cavalliConfig[vIdx].nome}*`, buttons })
    }

    // 🎡 ROULETTE
    if (command === 'playroulette') {
        if (!checkMoney(100)) return
        let n = Math.floor(Math.random() * 37), win = (args[0] === 'pari' && n % 2 === 0 && n !== 0) || (args[0] === 'dispari' && n % 2 !== 0)
        user.euro += win ? 100 : -100
        const canvas = createCanvas(600, 400); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#064e3b'; ctx.fillRect(0, 0, 600, 400)
        ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(300, 180, 140, 0, Math.PI*2); ctx.stroke()
        ctx.fillStyle = n === 0 ? '#10b981' : (n % 2 === 0 ? '#e74c3c' : '#2c3e50')
        ctx.beginPath(); ctx.arc(300, 180, 60, 0, Math.PI*2); ctx.fill()
        ctx.fillStyle = '#fff'; ctx.font = 'bold 60px Arial'; ctx.textAlign = 'center'; ctx.fillText(n, 300, 200)
        const buttons = [{ buttonId: `${usedPrefix}inforoulette`, buttonText: { displayText: '🎡 RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: win ? '*✅ VINTO!*' : '*❌ PERSO!*', buttons })
    }

    // 🎟️ GRATTA & VINCI
    if (command === 'gratta') {
        if (!checkMoney(200)) return
        let v = [0, 0, 500, 0, 1000, 0, 5000][Math.floor(Math.random() * 7)]
        user.euro += (v - 200)
        const canvas = createCanvas(600, 300); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#d4af37'; ctx.fillRect(0,0,600,300)
        ctx.fillStyle = '#000'; ctx.font = 'bold 40px Arial'; ctx.textAlign = 'center'; ctx.fillText(v > 0 ? `VINTO ${v}€!` : 'NON HAI VINTO', 300, 160)
        const buttons = [{ buttonId: `${usedPrefix}infogratta`, buttonText: { displayText: '🎟️ RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `*SALDO:* ${user.euro}€`, buttons })
    }

    // 🃏 BLACKJACK
    if (command === 'blackjack' || command === 'blakjak') {
        if (!checkMoney(100)) return
        let tu = Math.floor(Math.random() * 11) + 11, banco = Math.floor(Math.random() * 10) + 12
        let win = (tu <= 21 && (tu > banco || banco > 21))
        user.euro += win ? 100 : -100
        const canvas = createCanvas(600, 300); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#1b5e20'; ctx.fillRect(0,0,600,300)
        ctx.fillStyle = '#fff'; ctx.font = 'bold 40px Arial'; ctx.textAlign = 'center'
        ctx.fillText(`TU: ${tu} | BANCO: ${banco}`, 300, 130); ctx.fillText(win ? 'VITTORIA!' : 'SCONFITTA!', 300, 220)
        const buttons = [{ buttonId: `${usedPrefix}infobj`, buttonText: { displayText: '🃏 RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `*SALDO:* ${user.euro}€`, buttons })
    }

    // 🎰 SLOT
    if (command === 'slot') {
        if (!checkMoney(100)) return
        let r = [fruits[Math.floor(Math.random() * 6)], fruits[Math.floor(Math.random() * 6)], fruits[Math.floor(Math.random() * 6)]]
        let win = (r[0] === r[1] || r[1] === r[2] || r[0] === r[2])
        user.euro += win ? 200 : -100
        const canvas = createCanvas(600, 250); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#111'; ctx.fillRect(0,0,600,250)
        try {
            const i1 = await loadImage(fruitURLs[r[0]]), i2 = await loadImage(fruitURLs[r[1]]), i3 = await loadImage(fruitURLs[r[2]])
            ctx.drawImage(i1, 100, 50, 100, 100); ctx.drawImage(i2, 250, 50, 100, 100); ctx.drawImage(i3, 400, 50, 100, 100)
        } catch (e) {}
        const buttons = [{ buttonId: `${usedPrefix}slot`, buttonText: { displayText: '🎰 RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `*SALDO:* ${user.euro}€`, buttons })
    }
}

handler.help = ['casino']
handler.tags = ['giochi']
handler.command = /^(casino|infoslot|infobj|infogratta|inforoulette|inforigore|infocorsa|slot|blackjack|blakjak|gratta|playroulette|rigore|puntacorsa)$/i
handler.group = true

export default handler
