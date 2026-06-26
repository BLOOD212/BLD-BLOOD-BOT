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

const checkUser = (id) => {
    if (!id) return
    if (!global.db.data.users[id]) global.db.data.users[id] = {}
    let u = global.db.data.users[id]
    if (!Array.isArray(u.p)) u.p = []
    if (u.s === undefined) u.s = null
    if (u.role === undefined) u.role = null
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

let handler = async (m, { conn, text, command, usedPrefix }) => {
    let user = m.sender
    checkUser(user)

    // --- MENU PRINCIPALE CON BOTTONI ---
    if (command === 'famiglia') {
        const buttons = [
            { buttonId: `${usedPrefix}albero`, buttonText: { displayText: '🌳 VEDI ALBERO' }, type: 1 },
            { buttonId: `${usedPrefix}resetalbero`, buttonText: { displayText: '⚠️ RESETTA ALBERO' }, type: 1 }
        ]
        let txt = `*🌳 SISTEMA GENEALOGICO REALE 🌳*\n\n`
        txt += `Usa i pulsanti in basso per vedere il tuo albero o resettarlo.\n\n`
        txt += `*Comandi rapidi disponibili (con tag o risposta):*\n`
        txt += `👉 \`${usedPrefix}sposa @tag\`\n`
        txt += `👉 \`${usedPrefix}divorzia\`\n`
        txt += `👉 \`${usedPrefix}fratello @tag\`\n`
        txt += `👉 \`${usedPrefix}sorella @tag\`\n`
        txt += `👉 \`${usedPrefix}adotta @tag\`\n`
        txt += `👉 \`${usedPrefix}disereda @tag\`\n`
        txt += `👉 \`${usedPrefix}allontana @tag\``

        return conn.sendMessage(m.chat, {
            text: txt,
            footer: 'DINASTIA REALE',
            buttons: buttons,
            headerType: 1
        }, { quoted: m })
    }

    // --- RESET ALBERO ---
    if (command === 'resetalbero') {
        let u = global.db.data.users[user]
        if (u.s) {
            let padre = global.db.data.users[u.s]
            if (padre && padre.p) padre.p = padre.p.filter(id => id !== user)
        }
        if (u.p && u.p.length > 0) {
            u.p.forEach(figlioId => { if (global.db.data.users[figlioId]) global.db.data.users[figlioId].s = null })
        }
        if (marriages[user]) {
            let ex = marriages[user]
            delete marriages[user]; delete marriages[ex]; saveMarriages()
        }
        u.p = []; u.s = null; u.role = null
        return m.reply('*🗑️ Il tuo albero genealogico personale è stato resettato.*')
    }

    // --- MATRIMONIO ---
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
            { buttonId: `${usedPrefix}rifiutaproposta`, buttonText: { displayText: 'NO ❌' }, type: 1 }
        ]
        return conn.sendMessage(m.chat, {
            text: `*💍 PROPOSTA DI MATRIMONIO 💍*\n\n@${user.split('@')[0]} ha chiesto la mano di @${target.split('@')[0]}.\n\n*Vuoi accettare la proposta?*`,
            footer: 'SISTEMA GENEALOGICO',
            buttons: buttons,
            headerType: 1,
            mentions: [user, target]
        }, { quoted: m })
    }

    if (command === 'accettasposa') {
        let proposal = global.marriage_proposals[user]
        if (!proposal) return m.reply('*⚠️ Nessuna proposta di matrimonio pendente.*')
        let partner = proposal.proposer
        marriages[user] = partner; marriages[partner] = user; saveMarriages()
        clearTimeout(proposal.timeout); delete global.marriage_proposals[user]
        return m.reply(`*💖 VIVA GLI SPOSI!* @${user.split('@')[0]} e @${partner.split('@')[0]} sono ufficialmente uniti!`, null, { mentions: [user, partner] })
    }

    if (command === 'divorzia') {
        let ex = marriages[user]
        if (!ex) return m.reply('*⚠️ Non sei sposato.*')
        delete marriages[user]; delete marriages[ex]; saveMarriages()
        return m.reply(`*💔 Divorzio completato tra @${user.split('@')[0]} e @${ex.split('@')[0]}*`, null, { mentions: [user, ex] })
    }

    // --- FRATELLO / SORELLA CON BOTTONI DI RICHIESTA ---
    if (command === 'fratello' || command === 'sorella') {
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!target || target === user) return m.reply(`*⚠️ Tagga chi vuoi impostare come ${command}!*`)
        checkUser(target)

        let u = global.db.data.users[user]
        if (!u.s) return m.reply('*❌ Non puoi aggiungere fratelli/sorelle se prima non hai un Genitore nell\'albero (fatti adottare)!*')
        if (global.db.data.users[target].s) return m.reply(`*❌ Questa persona ha già un altro genitore associato.*`)

        global.sibling_proposals = global.sibling_proposals || {}
        global.sibling_proposals[target] = { 
            proposer: user, 
            type: command, 
            padreId: u.s,
            timeout: setTimeout(() => delete global.sibling_proposals[target], 60000) 
        }

        const buttons = [
            { buttonId: `${usedPrefix}accettafratello`, buttonText: { displayText: 'ACCETTA LEGAME ✅' }, type: 1 },
            { buttonId: `${usedPrefix}rifiutaproposta`, buttonText: { displayText: 'RIFIUTA ❌' }, type: 1 }
        ]
        return conn.sendMessage(m.chat, {
            text: `*👥 RICHIESTA DI LEGAME FAMILIARE 👥*\n\n@${user.split('@')[0]} ti ha inviato una richiesta per diventare suo/a *${command}* sotto lo stesso genitore.\n\n*Accetti di entrare nella famiglia?*`,
            footer: 'SISTEMA GENEALOGICO',
            buttons: buttons,
            headerType: 1,
            mentions: [user, target]
        }, { quoted: m })
    }

    if (command === 'accettafratello') {
        let proposal = global.sibling_proposals[user]
        if (!proposal) return m.reply('*⚠️ Nessuna richiesta familiare pendente.*')
        
        let padreId = proposal.padreId
        let proposer = proposal.proposer
        let type = proposal.type

        checkUser(padreId)
        global.db.data.users[padreId].p.push(user)
        global.db.data.users[user].s = padreId
        global.db.data.users[user].role = type

        clearTimeout(proposal.timeout); delete global.sibling_proposals[user]
        return m.reply(`*🎉 Legame stabilito! Ora sei ufficialmente ${type} di @${proposer.split('@')[0]}!*`, null, { mentions: [proposer] })
    }

    if (command === 'rifiutaproposta') {
        if (global.marriage_proposals && global.marriage_proposals[user]) {
            clearTimeout(global.marriage_proposals[user].timeout); delete global.marriage_proposals[user]
        }
        if (global.sibling_proposals && global.sibling_proposals[user]) {
            clearTimeout(global.sibling_proposals[user].timeout); delete global.sibling_proposals[user]
        }
        return m.reply('*❌ Richiesta rifiutata e annullata.*')
    }

    // --- ALTRI COMANDI GESTIONALI ---
    if (command === 'adotta') {
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!target || target === user) return m.reply('*⚠️ Tagga chi vuoi adottare!*')
        checkUser(target)
        if (global.db.data.users[target].s) return m.reply('*❌ Ha già un genitore!*')
        global.db.data.users[user].p.push(target); global.db.data.users[target].s = user
        m.reply(`*👶 Hai adottato @${target.split('@')[0]}!*`, null, { mentions: [target] })
    }

    if (command === 'disereda') {
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!target) return m.reply('*⚠️ Tagga il figlio!*')
        let figs = global.db.data.users[user].p || []
        if (!figs.includes(target)) return m.reply('*❌ Non è tuo figlio.*')
        global.db.data.users[user].p = figs.filter(id => id !== target); global.db.data.users[target].s = null
        m.reply(`*🚫 @${target.split('@')[0]} rimosso dalla famiglia.*`, null, { mentions: [target] })
    }

    if (command === 'allontana') {
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!target) return m.reply('*⚠️ Tagga chi vuoi allontanare!*')
        let u = global.db.data.users[user]
        if (!u.s) return m.reply('*❌ Non hai un genitore associato.*')
        let padreId = u.s
        let figliDelPadre = global.db.data.users[padreId]?.p || []
        if (!figliDelPadre.includes(target)) return m.reply('*❌ Questa persona non è tuo fratello/sorella.*')
        global.db.data.users[padreId].p = figs.filter(id => id !== target); global.db.data.users[target].s = null; global.db.data.users[target].role = null
        m.reply(`*🚫 @${target.split('@')[0]} rimosso dai fratelli.*`, null, { mentions: [target] })
    }

    // --- DISEGNO CANVAS GEOMETRICO ---
    if (command === 'albero' || command === 'famigliamia') {
        let target = m.mentionedJid[0] || user
        checkUser(target)
        await m.reply('⏳ *Generazione albero dinastico in corso...*')

        let u = global.db.data.users[target]
        let partner = marriages[target]
        let padre = u.s
        let nonno = null
        let zii = []
        let fratelli = []

        if (padre) {
            checkUser(padre)
            nonno = global.db.data.users[padre]?.s || null
            let tuttiIFigliDelPadre = global.db.data.users[padre]?.p || []
            fratelli = tuttiIFigliDelPadre.filter(id => id !== target).slice(0, 4)
            if (nonno) {
                checkUser(nonno)
                let tuttiIFigliDelNonno = global.db.data.users[nonno]?.p || []
                zii = tuttiIFigliDelNonno.filter(id => id !== padre).slice(0, 3) 
            }
        }
        let figli = (u.p || []).slice(0, 5)

        let activeLevels = []
        if (nonno) activeLevels.push('nonno')
        if (padre || zii.length > 0) activeLevels.push('genitori_zii')
        activeLevels.push('tu_e_fratelli')
        if (figli.length > 0) activeLevels.push('figli')

        let totalLevels = activeLevels.length
        let maxHorizontalElements = Math.max(1 + zii.length * 2, 2 + fratelli.length * 2, figli.length, 2)
        
        let canvasHeight = totalLevels * 280 + 120
        let canvasWidth = Math.max(maxHorizontalElements * 260 + 300, 1200)

        const canvas = createCanvas(canvasWidth, canvasHeight)
        const ctx = canvas.getContext('2d')
        
        const bgGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight)
        bgGrad.addColorStop(0, '#0f1115')
        bgGrad.addColorStop(1, '#050608')
        ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, canvasWidth, canvasHeight)

        let currentY = 120
        let positions = {}

        if (nonno) {
            positions['nonno'] = { x: canvasWidth / 2, y: currentY }
            currentY += 280
        }
        
        if (padre || zii.length > 0) {
            positions['padre'] = { x: canvasWidth / 2, y: currentY }
            positions['zii'] = []
            zii.forEach((z, i) => {
                let side = i % 2 === 0 ? -1 : 1
                let factor = Math.floor(i / 2) + 1
                let zx = (canvasWidth / 2) + (side * (factor * 320))
                positions['zii'].push({ id: z, x: zx, y: currentY })
            })
            currentY += 280
        }
        
        positions['fratelli'] = []
        if (partner) {
            positions['tu'] = { x: (canvasWidth / 2) - 100, y: currentY }
            positions['partner'] = { x: (canvasWidth / 2) + 100, y: currentY }
            fratelli.forEach((f, i) => {
                let side = i % 2 === 0 ? -1 : 1
                let factor = Math.floor(i / 2) + 1
                let fx = (canvasWidth / 2) + (side * (240 + (factor * 300)))
                positions['fratelli'].push({ id: f, x: fx, y: currentY })
            })
        } else {
            positions['tu'] = { x: canvasWidth / 2, y: currentY }
            fratelli.forEach((f, i) => {
                let side = i % 2 === 0 ? -1 : 1
                let factor = Math.floor(i / 2) + 1
                let fx = (canvasWidth / 2) + (side * (factor * 320))
                positions['fratelli'].push({ id: f, x: fx, y: currentY })
            })
        }
        currentY += 280

        if (figli.length > 0) {
            let spacing = 280
            let startX = (canvasWidth / 2) - ((figli.length - 1) * spacing) / 2
            positions['figli'] = []
            figli.forEach((f, i) => {
                positions['figli'].push({ id: f, x: startX + (i * spacing), y: currentY })
            })
        }

        const drawBox = async (id, x, y, label, color, textColor = '#fff') => {
            if (!id) return
            const w = 230, h = 140, r = 24 
            
            ctx.save()
            ctx.shadowColor = 'rgba(0, 0, 0, 0.7)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8
            ctx.fillStyle = color; drawRoundedRect(ctx, x - w/2, y - h/2, w, h, r); ctx.fill()
            ctx.restore()

            ctx.strokeStyle = '#f1c40f'; ctx.lineWidth = 3.5
            drawRoundedRect(ctx, x - w/2, y - h/2, w, h, r); ctx.stroke()

            ctx.fillStyle = '#f39c12'; ctx.font = 'bold 15px Arial'; ctx.textAlign = 'center'
            ctx.fillText(label, x, y - 46)

            let name = 'Utente'
            try { name = await conn.getName(id) } catch {}
            ctx.fillStyle = textColor; ctx.font = 'bold 15px Arial'
            ctx.fillText(name.substring(0, 16), x, y + 54)

            try {
                let url = await conn.profilePictureUrl(id, 'image').catch(() => 'https://telegra.ph/file/2416c30c33306fa33c5e0.jpg')
                let img = await loadImage(url)
                ctx.save(); ctx.beginPath(); ctx.arc(x, y - 5, 36, 0, Math.PI * 2); ctx.clip()
                ctx.drawImage(img, x - 36, y - 41, 72, 72); ctx.restore()
                
                ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 3
                ctx.beginPath(); ctx.arc(x, y - 5, 36, 0, Math.PI * 2); ctx.stroke()
            } catch {}
        }

        ctx.strokeStyle = 'rgba(241, 196, 15, 0.6)'; ctx.lineWidth = 4

        if (nonno && positions['padre']) {
            ctx.beginPath(); ctx.moveTo(positions['nonno'].x, positions['nonno'].y + 70); ctx.lineTo(positions['padre'].x, positions['padre'].y - 70); ctx.stroke()
            positions['zii'].forEach((zPos) => {
                ctx.beginPath(); ctx.moveTo(positions['nonno'].x, positions['nonno'].y + 70); ctx.lineTo(zPos.x, zPos.y - 70); ctx.stroke()
            })
        }

        if (positions['padre']) {
            ctx.beginPath(); ctx.moveTo(positions['padre'].x, positions['padre'].y + 70); ctx.lineTo(positions['tu'].x, positions['tu'].y - 70); ctx.stroke()
            positions['fratelli'].forEach((fPos) => {
                ctx.beginPath(); ctx.moveTo(positions['padre'].x, positions['padre'].y + 70); ctx.lineTo(fPos.x, fPos.y - 70); ctx.stroke()
            })
        }

        if (partner) {
            ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 5; ctx.beginPath()
            ctx.moveTo(positions['tu'].x + 115, positions['tu'].y); ctx.lineTo(positions['partner'].x - 115, positions['partner'].y); ctx.stroke()
            ctx.strokeStyle = 'rgba(241, 196, 15, 0.6)'; ctx.lineWidth = 4
        }

        if (figli.length > 0) {
            let originX = partner ? canvasWidth / 2 : positions['tu'].x
            let originY = partner ? positions['tu'].y : positions['tu'].y + 70
            positions['figli'].forEach((fPos) => {
                ctx.beginPath(); ctx.moveTo(originX, originY); ctx.lineTo(fPos.x, fPos.y - 70); ctx.stroke()
            })
        }

        let renderQueue = []
        if (nonno) renderQueue.push(drawBox(nonno, positions['nonno'].x, positions['nonno'].y, '👑 NONNO/A', '#8e44ad'))
        if (positions['padre']) renderQueue.push(drawBox(padre, positions['padre'].x, positions['padre'].y, '👨‍🍼 GENITORE', '#2980b9'))
        positions['zii']?.forEach((zPos) => renderQueue.push(drawBox(zPos.id, zPos.x, zPos.y, '👤 ZIO/A', '#d35400')))
        renderQueue.push(drawBox(target, positions['tu'].x, positions['tu'].y, '⭐ TU', '#2c3e50'))
        if (partner) renderQueue.push(drawBox(partner, positions['partner'].x, positions['partner'].y, '❤️ PARTNER', '#c0392b'))
        positions['fratelli'].forEach((fPos) => {
            let rUser = global.db.data.users[fPos.id]
            let exactRole = rUser && rUser.role === 'sorella' ? '👧 SORELLA' : '👦 FRATELLO'
            renderQueue.push(drawBox(fPos.id, fPos.x, fPos.y, exactRole, '#7f8c8d'))
        })
        if (figli.length > 0) {
            positions['figli'].forEach((fPos, i) => renderQueue.push(drawBox(fPos.id, fPos.x, fPos.y, `👶 FIGLIO ${i+1}`, '#27ae60')))
        }

        await Promise.all(renderQueue)
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `🌳 *ALBERO GENEALOGICO GEOMETRICO*`, mentions: [target] }, { quoted: m })
    }
}

handler.command = /^(sposa|accettasposa|accettafratello|rifiutaproposta|divorzia|adotta|disereda|fratello|sorella|allontana|resetalbero|albero|famigliamia|famiglia)$/i
handler.group = true
export default handler
