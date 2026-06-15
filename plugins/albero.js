import fs from 'fs'
import path from 'path'
import { createCanvas, loadImage } from 'canvas'

const marriagesFile = path.resolve('media/database/sposi.json');
if (!fs.existsSync(path.dirname(marriagesFile))) fs.mkdirSync(path.dirname(marriagesFile), { recursive: true });

let marriages = loadMarriages();
global.db = global.db || { data: { users: {} } }

function loadMarriages() {
    try {
        return fs.existsSync(marriagesFile) ? JSON.parse(fs.readFileSync(marriagesFile, 'utf8')) : {};
    } catch (e) { return {}; }
}

function saveMarriages() {
    fs.writeFileSync(marriagesFile, JSON.stringify(marriages, null, 2));
}

const design = {
    header: (title) => `ㅤ⋆｡˚『 ╭ \`${title}\` ╯ 』˚｡⋆\n╭`,
    line: "│",
    footer: "*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*",
    divider: "├─ׄ──⭒─ׄ─ׅ"
};

const checkUser = (id) => {
    if (!id) return
    if (!global.db.data.users[id]) global.db.data.users[id] = {}
    let u = global.db.data.users[id]
    if (!Array.isArray(u.p)) u.p = []
    if (u.s === undefined) u.s = null
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

async function createMarriageImage(user1, user2, conn, isMarriage = true) {
    const canvas = createCanvas(800, 500);
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, 500);
    grad.addColorStop(0, isMarriage ? '#FF6F61' : '#4B5EAA');
    grad.addColorStop(1, isMarriage ? '#FFF5EE' : '#E6E6FA');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 800, 500);

    const drawAvatar = async (id, x, y) => {
        let img;
        try {
            let url = await conn.profilePictureUrl(id, 'image').catch(() => 'https://telegra.ph/file/2416c30c33306fa33c5e0.jpg');
            img = await loadImage(url);
        } catch { img = await loadImage('https://telegra.ph/file/2416c30c33306fa33c5e0.jpg'); }
        ctx.save();
        ctx.beginPath(); ctx.arc(x, y, 90, 0, Math.PI * 2); ctx.clip();
        ctx.drawImage(img, x - 90, y - 90, 180, 180);
        ctx.restore();
        ctx.strokeStyle = isMarriage ? '#FF69B4' : '#4B5EAA';
        ctx.lineWidth = 6; ctx.stroke();
    };

    await drawAvatar(user1, 200, 200);
    await drawAvatar(user2, 600, 200);

    ctx.fillStyle = isMarriage ? '#FF1493' : '#4B5EAA';
    ctx.font = 'bold 40px Arial'; ctx.textAlign = 'center';
    ctx.fillText(isMarriage ? 'Matrimonio Celebrato!' : 'Divorzio Completato', 400, 380);

    return canvas.toBuffer();
}

let handler = async (m, { conn, text, command, usedPrefix }) => {
    let user = m.sender
    checkUser(user)

    if (command === 'famiglia') {
        let menu = `*🌳 SISTEMA GENEALOGICO REALE 🌳*\n\n`
        menu += `👉 *${usedPrefix}sposa @tag* - Proposta di matrimonio\n`
        menu += `👉 *${usedPrefix}divorzia* - Sciogli l'unione\n`
        menu += `👉 *${usedPrefix}adotta @tag* - Adotta un figlio\n`
        menu += `👉 *${usedPrefix}disereda @tag* - Rimuovi un figlio\n`
        menu += `👉 *${usedPrefix}albero* - Visualizza la dinastia completa\n`
        return m.reply(menu)
    }

    if (command === 'sposa') {
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!target || target === user) return m.reply('*⚠️ Tagga il partner!*')
        checkUser(target)

        if (marriages[user]) return m.reply('*⚠️ Sei già sposato!*')
        if (marriages[target]) return m.reply('*⚠️ Questa persona è già impegnata!*')

        global.marriage_proposals = global.marriage_proposals || {}
        global.marriage_proposals[target] = { proposer: user, timeout: setTimeout(() => delete global.marriage_proposals[target], 60000) }

        const buttons = [
            { buttonId: `${usedPrefix}accettasposa`, buttonText: { displayText: 'SÌ, LO VOGLIO ✅' }, type: 1 },
            { buttonId: `${usedPrefix}rifiutasposa`, buttonText: { displayText: 'NO ❌' }, type: 1 }
        ]

        return conn.sendMessage(m.chat, {
            text: `*💍 PROPOSTA DI MATRIMONIO 💍*\n\n@${user.split('@')[0]} ha chiesto la mano di @${target.split('@')[0]}.\n\n*Vuoi accettare?*`,
            footer: 'SISTEMA GENEALOGICO',
            buttons: buttons,
            headerType: 1,
            mentions: [user, target]
        }, { quoted: m })
    }

    if (command === 'accettasposa') {
        let proposal = global.marriage_proposals[user]
        if (!proposal) return m.reply('*⚠️ Nessuna proposta pendente.*')

        let partner = proposal.proposer
        marriages[user] = partner
        marriages[partner] = user
        saveMarriages()
        clearTimeout(proposal.timeout)
        delete global.marriage_proposals[user]

        let img = await createMarriageImage(user, partner, conn, true)
        return conn.sendMessage(m.chat, { image: img, caption: `*💖 VIVA GLI SPOSI!* @${user.split('@')[0]} e @${partner.split('@')[0]} sono ora uniti!`, mentions: [user, partner] })
    }

    if (command === 'divorzia') {
        let ex = marriages[user]
        if (!ex) return m.reply('*⚠️ Non sei sposato.*')

        delete marriages[user]
        delete marriages[ex]
        saveMarriages()

        let img = await createMarriageImage(user, ex, conn, false)
        return conn.sendMessage(m.chat, { image: img, caption: `*💔 Divorzio completato tra @${user.split('@')[0]} e @${ex.split('@')[0]}*`, mentions: [user, ex] })
    }

    if (command === 'adotta') {
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!target || target === user) return m.reply('*⚠️ Tagga chi vuoi adottare!*')
        checkUser(target)
        if (global.db.data.users[target].s) return m.reply('*❌ Ha già un genitore!*')

        global.db.data.users[user].p.push(target)
        global.db.data.users[target].s = user
        m.reply(`*👶 Hai adottato @${target.split('@')[0]}!*`, null, { mentions: [target] })
    }

    if (command === 'disereda') {
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!target) return m.reply('*⚠️ Tagga il figlio!*')
        let figli = global.db.data.users[user].p || []
        if (!figli.includes(target)) return m.reply('*❌ Non è tuo figlio.*')

        global.db.data.users[user].p = figli.filter(id => id !== target)
        global.db.data.users[target].s = null
        m.reply(`*🚫 @${target.split('@')[0]} rimosso dalla famiglia.*`, null, { mentions: [target] })
    }

    if (command === 'albero' || command === 'famigliamia') {
        let target = m.mentionedJid[0] || user
        checkUser(target)
        await m.reply('⏳ *Generazione albero dinastico in corso...*')

        let u = global.db.data.users[target]
        let partner = marriages[target]
        let padre = u.s
        let nonno = null
        if (padre) {
            checkUser(padre)
            nonno = global.db.data.users[padre]?.s || null
        }
        let figli = (u.p || []).slice(0, 5)

        let activeLevels = []
        if (nonno) activeLevels.push('nonno')
        if (padre) activeLevels.push('padre')
        activeLevels.push('tu')
        if (figli.length > 0) activeLevels.push('figli')

        let totalLevels = activeLevels.length
        let canvasHeight = totalLevels * 220 + 100
        let canvasWidth = figli.length > 3 ? figli.length * 260 + 100 : 1000

        const canvas = createCanvas(canvasWidth, canvasHeight)
        const ctx = canvas.getContext('2d')
        
        const bgGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight)
        bgGrad.addColorStop(0, '#111318')
        bgGrad.addColorStop(1, '#060709')
        ctx.fillStyle = bgGrad
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)

        let currentY = 120
        let positions = {}

        if (nonno) {
            positions['nonno'] = { x: canvasWidth / 2, y: currentY }
            currentY += 220
        }
        if (padre) {
            positions['padre'] = { x: canvasWidth / 2, y: currentY }
            currentY += 220
        }
        
        if (partner) {
            positions['tu'] = { x: (canvasWidth / 2) - 150, y: currentY }
            positions['partner'] = { x: (canvasWidth / 2) + 150, y: currentY }
        } else {
            positions['tu'] = { x: canvasWidth / 2, y: currentY }
        }
        currentY += 220

        if (figli.length > 0) {
            let spacing = 270
            let startX = (canvasWidth / 2) - ((figli.length - 1) * spacing) / 2
            positions['figli'] = []
            figli.forEach((f, i) => {
                positions['figli'].push({ id: f, x: startX + (i * spacing), y: currentY })
            })
        }

        const drawBox = async (id, x, y, label, color, textColor = '#fff') => {
            if (!id) return
            const w = 240, h = 130, r = 24 
            
            ctx.save()
            ctx.shadowColor = 'rgba(0, 0, 0, 0.6)'
            ctx.shadowBlur = 16
            ctx.shadowOffsetY = 6
            ctx.fillStyle = color
            drawRoundedRect(ctx, x - w/2, y - h/2, w, h, r)
            ctx.fill()
            ctx.restore()

            ctx.strokeStyle = '#f1c40f'
            ctx.lineWidth = 3.5
            drawRoundedRect(ctx, x - w/2, y - h/2, w, h, r)
            ctx.stroke()

            ctx.fillStyle = '#f39c12'
            ctx.font = 'bold 16px Arial'
            ctx.textAlign = 'center'
            ctx.fillText(label, x, y - 38)

            let name = 'Utente'
            try { name = await conn.getName(id) } catch {}
            ctx.fillStyle = textColor
            ctx.font = 'bold 15px Arial'
            ctx.fillText(name.substring(0, 18), x, y + 48)

            try {
                let url = await conn.profilePictureUrl(id, 'image').catch(() => 'https://telegra.ph/file/2416c30c33306fa33c5e0.jpg')
                let img = await loadImage(url)
                ctx.save()
                ctx.beginPath()
                ctx.arc(x, y + 2, 38, 0, Math.PI * 2)
                ctx.clip()
                ctx.drawImage(img, x - 38, y - 36, 76, 76)
                ctx.restore()
                
                ctx.strokeStyle = 'rgba(255,255,255,0.7)'
                ctx.lineWidth = 3
                ctx.beginPath()
                ctx.arc(x, y + 2, 38, 0, Math.PI * 2)
                ctx.stroke()
            } catch {}
        }

        ctx.strokeStyle = 'rgba(241, 196, 15, 0.5)'
        ctx.lineWidth = 4.5

        if (nonno && padre) {
            ctx.beginPath()
            ctx.moveTo(positions['nonno'].x, positions['nonno'].y + 65)
            ctx.lineTo(positions['padre'].x, positions['padre'].y - 65)
            ctx.stroke()
        }

        if (padre) {
            let targetX = partner ? positions['tu'].x : positions['tu'].x
            ctx.beginPath()
            ctx.moveTo(positions['padre'].x, positions['padre'].y + 65)
            ctx.bezierCurveTo(positions['padre'].x, positions['tu'].y - 100, targetX, positions['tu'].y - 100, targetX, positions['tu'].y - 65)
            ctx.stroke()
        }

        if (partner) {
            ctx.strokeStyle = '#e74c3c'
            ctx.lineWidth = 5
            ctx.beginPath()
            ctx.moveTo(positions['tu'].x + 120, positions['tu'].y)
            ctx.lineTo(positions['partner'].x - 120, positions['partner'].y)
            ctx.stroke()
            ctx.strokeStyle = 'rgba(241, 196, 15, 0.5)'
            ctx.lineWidth = 4.5
        }

        if (figli.length > 0) {
            let originX = canvasWidth / 2
            let originY = partner ? positions['tu'].y : positions['tu'].y + 65
            
            positions['figli'].forEach((fPos) => {
                ctx.beginPath()
                ctx.moveTo(originX, originY)
                ctx.bezierCurveTo(originX, fPos.y - 100, fPos.x, fPos.y - 100, fPos.x, fPos.y - 65)
                ctx.stroke()
            })
        }

        let renderQueue = []

        if (nonno) renderQueue.push(drawBox(nonno, positions['nonno'].x, positions['nonno'].y, '👑 NONNO/A', '#8e44ad'))
        if (padre) renderQueue.push(drawBox(padre, positions['padre'].x, positions['padre'].y, '👨‍🍼 GENITORE', '#2980b9'))
        
        renderQueue.push(drawBox(target, positions['tu'].x, positions['tu'].y, '⭐ TU', '#2c3e50'))
        if (partner) renderQueue.push(drawBox(partner, positions['partner'].x, positions['partner'].y, '❤️ PARTNER', '#c0392b'))

        if (figli.length > 0) {
            positions['figli'].forEach((fPos, i) => {
                renderQueue.push(drawBox(fPos.id, fPos.x, fPos.y, `👶 FIGLIO ${i+1}`, '#27ae60'))
            })
        }

        await Promise.all(renderQueue)

        return conn.sendMessage(m.chat, { 
            image: canvas.toBuffer(), 
            caption: `🌳 *ALBERO GENEALOGICO REALE*\n\nVisualizzazione dei legami diretti di @${target.split('@')[0]}`, 
            mentions: [target] 
        }, { quoted: m })
    }
}

handler.command = /^(sposa|accettasposa|rifiutasposa|divorzia|adotta|disereda|albero|famigliamia|famiglia)$/i
handler.group = true
export default handler
