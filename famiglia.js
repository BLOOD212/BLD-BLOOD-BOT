import { createCanvas, loadImage } from 'canvas'

global.db = global.db || {}
global.db.data = global.db.data || {}
global.db.data.users = global.db.data.users || {}

let handler = async (m, { conn, text, command, usedPrefix }) => {
    let chat = m.chat
    let user = m.sender
    let users = global.db.data.users

    const checkUser = (id) => {
        if (!id) return
        if (!users[id]) users[id] = {}
        if (!Array.isArray(users[id].p)) users[id].p = []
        if (users[id].c === undefined) users[id].c = null
        if (users[id].s === undefined) users[id].s = null
    }

    checkUser(user)

    // --- 1. MENU GENERALE ---
    if (command === 'famiglia') {
        let menu = `*🌳 SISTEMA GENEALOGICO REALE 🌳*\n\n`
        menu += `👉 *${usedPrefix}unione @tag* - Chiedi unione\n`
        menu += `👉 *${usedPrefix}sciogli* - Divorzia\n`
        menu += `👉 *${usedPrefix}adotta @tag* - Adotta un figlio\n`
        menu += `👉 *${usedPrefix}disereda @tag* - Rimuovi un figlio\n`
        menu += `👉 *${usedPrefix}famigliamia* - Vedi l'albero (IMG)\n`
        return m.reply(menu)
    }

    // --- 2. LOGICA UNIONE CON PULSANTI ---
    if (command === 'unione') {
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!target || target === user) return m.reply('*⚠️ Tagga il tuo partner!*')
        checkUser(target)

        if (users[user].c) return m.reply('*⚠️ Sei già unito a qualcuno!*')
        if (users[target].c) return m.reply('*⚠️ Questa persona è già impegnata!*')

        users[target].propostaUnione = user

        const buttons = [
            { buttonId: `${usedPrefix}accettaunione`, buttonText: { displayText: 'ACCETTA ✅' }, type: 1 },
            { buttonId: `${usedPrefix}rifiutaunione`, buttonText: { displayText: 'RIFIUTA ❌' }, type: 1 }
        ]

        const buttonMessage = {
            text: `*💍 PROPOSTA DI UNIONE 💍*\n\n@${user.split('@')[0]} ha chiesto di unirsi ufficialmente a @${target.split('@')[0]}.\n\n*Vuoi accettare la proposta?*`,
            footer: 'SISTEMA GENEALOGICO',
            buttons: buttons,
            headerType: 1,
            mentions: [user, target]
        }

        return conn.sendMessage(chat, buttonMessage, { quoted: m })
    }

    if (command === 'accettaunione') {
        let proponente = users[user].propostaUnione
        if (!proponente) return m.reply('*⚠️ Non hai richieste di unione in sospeso.*')
        
        users[user].c = proponente
        users[proponente].c = user
        delete users[user].propostaUnione
        
        return m.reply(`*✨ UNIONE CONFERMATA! Siete ora partner ufficiali!*`, null, { mentions: [user, proponente] })
    }

    if (command === 'rifiutaunione') {
        let proponente = users[user].propostaUnione
        if (!proponente) return
        delete users[user].propostaUnione
        return m.reply(`*💔 La proposta di unione è stata rifiutata.*`)
    }

    // --- 3. LOGICA DISEREDA (FIXATA) ---
    if (command === 'disereda') {
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!target) return m.reply('*⚠️ Tagga il figlio da rimuovere!*')
        
        checkUser(user)
        let figli = users[user].p
        
        if (!figli.includes(target)) return m.reply('*❌ Questo utente non è tuo figlio.*')

        users[user].p = figli.filter(id => id !== target)
        if (users[target]) users[target].s = null
        
        return m.reply(`*🚫 @${target.split('@')[0]} è stato rimosso dalla famiglia.*`, null, { mentions: [target] })
    }

    // --- 4. ALBERO GRAFICO CON FOTO E NUMERO ---
    if (command === 'famigliamia' || command === 'albero') {
        let target = (command === 'famigliamia') ? user : (m.mentionedJid[0] || (m.quoted ? m.quoted.sender : user))
        checkUser(target)

        await m.reply('⏳ *Generazione albero in corso...*')

        const canvas = createCanvas(800, 800)
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#121212'; ctx.fillRect(0, 0, canvas.width, canvas.height)

        const drawUserBox = async (id, x, y, label, color) => {
            if (!id) return
            ctx.fillStyle = color; ctx.fillRect(x - 90, y - 60, 180, 120)
            ctx.strokeStyle = '#f1c40f'; ctx.lineWidth = 3; ctx.strokeRect(x - 90, y - 60, 180, 120)
            ctx.fillStyle = '#000000'; ctx.font = 'bold 16px Arial'; ctx.textAlign = 'center'; ctx.fillText(label, x, y - 40)

            try {
                let ppUrl
                try { ppUrl = await conn.profilePictureUrl(id, 'image') } catch { ppUrl = 'https://telegra.ph/file/2416c30c33306fa33c5e0.jpg' }
                const pp = await loadImage(ppUrl)
                ctx.save(); ctx.beginPath(); ctx.arc(x, y + 5, 30, 0, Math.PI * 2); ctx.clip()
                ctx.drawImage(pp, x - 30, y - 25, 60, 60); ctx.restore()
            } catch { ctx.fillStyle = '#7f8c8d'; ctx.beginPath(); ctx.arc(x, y + 5, 30, 0, Math.PI * 2); ctx.fill() }

            ctx.fillStyle = '#000000'; ctx.font = 'bold 13px Arial'
            let name = conn.getName(id)
            let cleanName = name ? name.replace(/[^\x20-\x7E]/g, '').trim() : ''
            if (!cleanName) cleanName = id.split('@')[0]
            ctx.fillText(cleanName.substring(0, 16), x, y + 50)
        }

        let u = users[target], partner = u.c, padre = u.s
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 30px Arial'; ctx.textAlign = 'center'
        ctx.fillText(`ALBERO DI ${conn.getName(target).toUpperCase()}`, canvas.width / 2, 50)

        if (padre) {
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(400, 210); ctx.lineTo(400, 300); ctx.stroke()
            await drawUserBox(padre, 400, 150, 'GENITORE', '#3498db')
        }

        if (partner) {
            ctx.strokeStyle = '#e74c3c'; ctx.beginPath(); ctx.moveTo(310, 360); ctx.lineTo(490, 360); ctx.stroke()
            await drawUserBox(target, 310, 360, 'TU', '#ffffff'); await drawUserBox(partner, 490, 360, 'PARTNER', '#ff7675')
        } else { await drawUserBox(target, 400, 360, 'TU', '#ffffff') }

        if (u.p && u.p.length > 0) {
            ctx.strokeStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(400, 420); ctx.lineTo(400, 520); ctx.stroke()
            let figliMostrati = u.p.slice(0, 4)
            let startX = 400 - (figliMostrati.length - 1) * 200 / 2
            for (let i = 0; i < figliMostrati.length; i++) {
                let fx = startX + (i * 200)
                ctx.beginPath(); ctx.moveTo(400, 520); ctx.lineTo(fx, 580); ctx.stroke()
                await drawUserBox(figliMostrati[i], fx, 640, 'FIGLIO', '#2ecc71')
            }
        }
        const buffer = canvas.toBuffer()
        return conn.sendMessage(chat, { image: buffer, caption: `*🌳 Dinastia di @${target.split('@')[0]}*`, mentions: [target] }, { quoted: m })
    }

    // --- ALTRI COMANDI ---
    if (command === 'adotta') {
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!target || target === user) return m.reply('*⚠️ Tagga chi vuoi adottare!*')
        checkUser(target)
        if (users[target].s) return m.reply('*❌ Ha già un genitore!*')
        users[user].p.push(target)
        users[target].s = user
        m.reply('*👶 Adottato!*')
    }

    if (command === 'sciogli') {
        let ex = users[user].c
        if (!ex) return m.reply('*⚠️ Sei single.*')
        users[user].c = null; if (users[ex]) users[ex].c = null
        m.reply('*📄 Divorzio completato.*')
    }
}

handler.help = ['famiglia', 'unione', 'adotta', 'disereda']
handler.tags = ['giochi']
handler.command = /^(unione|accettaunione|rifiutaunione|adotta|disereda|albero|famigliamia|sciogli|famiglia)$/i
handler.group = true

export default handler
