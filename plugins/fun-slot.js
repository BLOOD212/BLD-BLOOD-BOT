import { createCanvas, loadImage } from 'canvas'
import GIFEncoder from 'gif-encoder-2'

// --- CONFIGURAZIONI ---
// Usiamo PNG invece di SVG per evitare l'errore di node-canvas
const fruits = ['🍒', '🍋', '🍉', '🍇', '🍎', '🍓']
const fruitURLs = {
    '🍒': 'https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/png/72x72/1F352.png',
    '🍋': 'https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/png/72x72/1F34B.png',
    '🍉': 'https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/png/72x72/1F349.png',
    '🍇': 'https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/png/72x72/1F347.png',
    '🍎': 'https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/png/72x72/1F34E.png',
    '🍓': 'https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/png/72x72/1F353.png'
}
const cavalliConfig = [
    { nome: 'ROSSO', color: '#ff4d4d' },
    { nome: 'BLU', color: '#4d94ff' },
    { nome: 'VERDE', color: '#4dff88' },
    { nome: 'GIALLO', color: '#ffff4d' }
]

let handler = async (m, { conn, command, args, usedPrefix }) => {
    try {
        global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}
        let user = global.db.data.users[m.sender]
        if (user.euro === undefined) user.euro = 1000

        const checkMoney = (costo) => {
            if (user.euro < costo) {
                m.reply(`⚠️ Saldo insufficiente! Hai ${user.euro}€`)
                return false
            }
            return true
        }

        // --- MENU PRINCIPALE ---
        if (command === 'casino') {
            const buttons = [
                { buttonId: `${usedPrefix}slot`, buttonText: { displayText: '🎰 SLOT' }, type: 1 },
                { buttonId: `${usedPrefix}inforigore`, buttonText: { displayText: '⚽ RIGORI' }, type: 1 },
                { buttonId: `${usedPrefix}infocorsa`, buttonText: { displayText: '🏇 CORSA' }, type: 1 },
                { buttonId: `${usedPrefix}gratta`, buttonText: { displayText: '🎟️ GRATTA' }, type: 1 }
            ]
            return conn.sendMessage(m.chat, { 
                text: `*🎰 GRAND CASINÒ ANIMATO 🎰*\n\n💰 *Saldo:* ${user.euro}€`,
                buttons,
                headerType: 1
            }, { quoted: m })
        }

        // --- SOTTOMENU INFO ---
        if (command === 'inforigore') {
            const buttons = [
                { buttonId: `${usedPrefix}rigore sx`, buttonText: { displayText: '⬅️ SINISTRA' }, type: 1 },
                { buttonId: `${usedPrefix}rigore cx`, buttonText: { displayText: '⬆️ CENTRO' }, type: 1 },
                { buttonId: `${usedPrefix}rigore dx`, buttonText: { displayText: '➡️ DESTRA' }, type: 1 }
            ]
            return conn.sendMessage(m.chat, { text: '⚽ *Scegli dove tirare il rigore:*', buttons }, { quoted: m })
        }

        if (command === 'infocorsa') {
            const buttons = cavalliConfig.map(c => ({
                buttonId: `${usedPrefix}puntacorsa ${c.nome}`,
                buttonText: { displayText: `Punta su ${c.nome}` },
                type: 1
            }))
            return conn.sendMessage(m.chat, { text: '🏇 *Scegli il cavallo vincente (X3):*', buttons }, { quoted: m })
        }

        // --- LOGICA SLOT ---
        if (command === 'slot') {
            if (!checkMoney(100)) return
            const encoder = new GIFEncoder(600, 250)
            encoder.start(); encoder.setRepeat(0); encoder.setDelay(100); encoder.setQuality(10)
            const canvas = createCanvas(600, 250); const ctx = canvas.getContext('2d')
            
            let final = [fruits[Math.floor(Math.random()*6)], fruits[Math.floor(Math.random()*6)], fruits[Math.floor(Math.random()*6)]]
            let win = (final[0] === final[1] || final[1] === final[2] || final[0] === final[2])
            
            const imgs = {}; 
            for(let f of fruits) imgs[f] = await loadImage(fruitURLs[f])

            for(let i=0; i<8; i++) {
                ctx.fillStyle = '#111'; ctx.fillRect(0,0,600,250)
                for(let j=0; j<3; j++) {
                    let rand = fruits[Math.floor(Math.random()*6)]
                    ctx.drawImage(imgs[rand], 100+(j*150), 50, 100, 100)
                }
                encoder.addFrame(ctx)
            }
            
            ctx.fillStyle = '#111'; ctx.fillRect(0,0,600,250)
            ctx.drawImage(imgs[final[0]], 100, 50, 100, 100)
            ctx.drawImage(imgs[final[1]], 250, 50, 100, 100)
            ctx.drawImage(imgs[final[2]], 400, 50, 100, 100)
            for(let i=0; i<10; i++) encoder.addFrame(ctx)
            
            encoder.finish()
            user.euro += win ? 200 : -100
            
            const buttons = [
                { buttonId: `${usedPrefix}slot`, buttonText: { displayText: '🎰 RIGIOCA' }, type: 1 },
                { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }
            ]
            return conn.sendMessage(m.chat, { 
                video: encoder.out.getData(), 
                gifPlayback: true, 
                caption: win ? `✅ *VINTO!* (+200€)\nSaldo: ${user.euro}€` : `❌ *PERSO!*\nSaldo: ${user.euro}€`,
                buttons
            }, { quoted: m })
        }

        // --- LOGICA RIGORE ---
        if (command === 'rigore') {
            if (!checkMoney(100)) return
            let tiro = args[0] || 'cx'
            let parata = ['sx', 'cx', 'dx'][Math.floor(Math.random()*3)]
            let win = tiro !== parata
            const encoder = new GIFEncoder(600, 300)
            encoder.start(); encoder.setRepeat(0); encoder.setDelay(120)
            const canvas = createCanvas(600, 300); const ctx = canvas.getContext('2d')
            let pos = { sx: 150, cx: 300, dx: 450 }
            
            for(let f=0; f<7; f++) {
                ctx.fillStyle = '#2e7d32'; ctx.fillRect(0,0,600,300); 
                ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.strokeRect(100, 50, 400, 200)
                ctx.fillStyle = '#fff'; ctx.beginPath(); 
                ctx.arc(300 + (pos[tiro]-300)*(f/6), 250 - (150*(f/6)), 15, 0, Math.PI*2); ctx.fill()
                encoder.addFrame(ctx)
            }
            encoder.finish()
            user.euro += win ? 150 : -100
            const buttons = [
                { buttonId: `${usedPrefix}inforigore`, buttonText: { displayText: '⚽ RIGIOCA' }, type: 1 },
                { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }
            ]
            return conn.sendMessage(m.chat, { 
                video: encoder.out.getData(), 
                gifPlayback: true, 
                caption: win ? '⚽ *GOOOL!*' : '🧤 *PARATA!*',
                buttons
            }, { quoted: m })
        }

        // --- LOGICA CORSA ---
        if (command === 'puntacorsa') {
            if (!checkMoney(100)) return
            let scelta = args[0]?.toUpperCase()
            let winnerIdx = Math.floor(Math.random()*4)
            let win = scelta === cavalliConfig[winnerIdx].nome
            const encoder = new GIFEncoder(600, 300)
            encoder.start(); encoder.setRepeat(0); encoder.setDelay(150)
            const canvas = createCanvas(600, 300); const ctx = canvas.getContext('2d')
            
            for(let f=0; f<10; f++) {
                ctx.fillStyle = '#558b2f'; ctx.fillRect(0,0,600,300)
                cavalliConfig.forEach((c, i) => {
                    let x = 50 + (f === 9 && i === winnerIdx ? 450 : Math.random()*350)
                    ctx.fillStyle = c.color; ctx.beginPath(); ctx.arc(x, 60+(i*60), 15, 0, Math.PI*2); ctx.fill()
                    ctx.fillStyle = '#fff'; ctx.font = '12px Arial'; ctx.fillText(c.nome, 10, 65+(i*60))
                })
                encoder.addFrame(ctx)
            }
            encoder.finish()
            user.euro += win ? 300 : -100
            const buttons = [
                { buttonId: `${usedPrefix}infocorsa`, buttonText: { displayText: '🏇 RIGIOCA' }, type: 1 },
                { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }
            ]
            return conn.sendMessage(m.chat, { 
                video: encoder.out.getData(), 
                gifPlayback: true, 
                caption: win ? `🏆 *VINTO!* Vince il ${cavalliConfig[winnerIdx].nome}` : `❌ *PERSO!* Ha vinto il ${cavalliConfig[winnerIdx].nome}`,
                buttons
            }, { quoted: m })
        }

        // --- GRATTA E VINCI ---
        if (command === 'gratta') {
            if (!checkMoney(200)) return
            let premio = [0, 0, 500, 0, 1000, 5000][Math.floor(Math.random()*6)]
            const canvas = createCanvas(400, 200); const ctx = canvas.getContext('2d')
            ctx.fillStyle = '#ffd700'; ctx.fillRect(0,0,400,200)
            ctx.fillStyle = '#000'; ctx.font = 'bold 30px Arial'; ctx.textAlign = 'center'
            ctx.fillText(premio > 0 ? `HAI VINTO ${premio}€!` : 'NON HAI VINTO', 200, 110)
            user.euro += (premio - 200)
            const buttons = [
                { buttonId: `${usedPrefix}gratta`, buttonText: { displayText: '🎟️ RIGIOCA' }, type: 1 },
                { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }
            ]
            return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `Saldo: ${user.euro}€`, buttons }, { quoted: m })
        }

    } catch (e) {
        console.error(e)
        m.reply(`❌ Errore critico: ${e.message}`)
    }
}

handler.help = ['casino']
handler.tags = ['giochi']
handler.command = /^(casino|slot|rigore|inforigore|infocorsa|puntacorsa|gratta)$/i
handler.group = true

export default handler
