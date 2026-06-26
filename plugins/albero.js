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
    if (!Array.isArray(u.p)) u.p = [] // p = Figli (Parents' children)
    if (u.s === undefined) u.s = null // s = Genitore (Spouse/Parent origin)
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

    // --- MENU PRINCIPALE ---
    if (command === 'famiglia') {
        const buttons = [
            { buttonId: `${usedPrefix}albero`, buttonText: { displayText: '🌳 MOSTRA ALBERO' }, type: 1 },
            { buttonId: `${usedPrefix}resetalbero`, buttonText: { displayText: '⚠️ RESETTA TUTTO' }, type: 1 }
        ]
        let txt = `*🌳 DINASTIA FAMILIARE REALE 🌳*\n\n`
        txt += `Gestisci la tua famiglia in modo chiaro e strutturato.\n\n`
        txt += `*📌 COMANDI DISPONIBILI (Tagga o rispondi a un messaggio):*\n`
        txt += `👉 \`${usedPrefix}adotta @tag\` ➔ Diventi il suo GENITORE (va sotto di te)\n`
        txt += `👉 \`${usedPrefix}fratello @tag\` ➔ Diventa tuo FRATELLO (stesso genitore, in diagonale)\n`
        txt += `👉 \`${usedPrefix}sorella @tag\` ➔ Diventa tua SORELLA (stesso genitore, in diagonale)\n`
        txt += `👉 \`${usedPrefix}sposa @tag\` ➔ Vi sposate (marito e moglie vicini)\n`
        txt += `👉 \`${usedPrefix}divorzia\` ➔ Sciogli il matrimonio\n`
        txt += `👉 \`${usedPrefix}disereda @tag\` ➔ Rimuovi un figlio da sotto di te\n`
        txt += `👉 \`${usedPrefix}allontana @tag\` ➔ Rimuovi un fratello/sorella`

        return conn.sendMessage(m.chat, {
            text: txt,
            footer: 'Generazioni: Nonni ➔ Genitori/Zii ➔ Tu/Fratelli ➔ Figli',
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
        return m.reply('*🗑️ Il tuo albero genealogico è stato azzerato. Ora sei un membro singolo.*')
    }

    // --- ADOZIONE CORRETTA (Tu diventi Genitore, l'adottato va SOTTO) ---
    if (command === 'adotta') {
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!target || target === user) return m.reply('*⚠️ Tagga la persona che vuoi adottare come figlio!*')
        checkUser(target)
        
        if (global.db.data.users[target].s) return m.reply('*❌ Questa persona ha già un genitore registrato nell\'albero.*')

        global.db.data.users[user].p.push(target) // Aggiunto ai tuoi figli
        global.db.data.users[target].s = user      // Tu sei il suo genitore
        
        let nomeFiglio = await conn.getName(target)
        return m.reply(`*👶 Complimenti! Hai adottato ufficialmente ${nomeFiglio}. Ora apparirà SOTTO di te nell'albero.*`, null, { mentions: [target] })
    }

    // --- MATRIMONIO ---
    if (command === 'sposa') {
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!target || target === user) return m.reply('*⚠️ Tagga la persona che vuoi sposare!*')
        checkUser(target)

        if (marriages[user]) return m.reply('*⚠️ Sei già sposato!*')
        if (marriages[target]) return m.reply('*⚠️ Questa persona è già sposata!*')

        global.marriage_proposals = global.marriage_proposals || {}
        global.marriage_proposals[target] = { proposer: user, timeout: setTimeout(() => delete global.marriage_proposals[target], 60000) }

        const buttons = [
            { buttonId: `${usedPrefix}accettasposa`, buttonText: { displayText: 'SÌ, LO VOGLIO ✅' }, type: 1 },
            { buttonId: `${usedPrefix}rifiutaproposta`, buttonText: { displayText: 'RIFIUTA ❌' }, type: 1 }
        ]
        return conn.sendMessage(m.chat, {
            text: `*💍 PROPOSTA DI MATRIMONIO 💍*\n\n@${user.split('@')[0]} ha chiesto la mano di @${target.split('@')[0]}.\n\n*Vuoi unirti in matrimonio e stare affiancato nell'albero?*`,
            footer: 'Legame di coppia ravvicinato',
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
        return m.reply(`*💖 MATRIMONIO CELEBRATO!* Ora siete partner ufficiali nell'albero genealogico!`, null, { mentions: [user, partner] })
    }

    if (command === 'divorzia') {
        let ex = marriages[user]
        if (!ex) return m.reply('*⚠️ Non sei sposato.*')
        delete marriages[user]; delete marriages[ex]; saveMarriages()
        return m.reply(`*💔 Matrimonio sciolto con successo.*`)
    }

    // --- FRATELLO / SORELLA (Stesso genitore, messi in diagonale) ---
    if (command === 'fratello' || command === 'sorella') {
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!target || target === user) return m.reply(`*⚠️ Tagga chi vuoi invitare come ${command}!*`)
        checkUser(target)

        let u = global.db.data.users[user]
        if (!u.s) return m.reply('*❌ Per avere fratelli/sorelle devi prima avere un Genitore nell\'albero (fatti adottare da qualcuno)!*')
        if (global.db.data.users[target].s) return m.reply(`*❌ Questa persona fa già parte di un altro nucleo familiare.*`)

        global.sibling_proposals = global.sibling_proposals || {}
        global.sibling_proposals[target] = { 
            proposer: user, 
            type: command, 
            padreId: u.s,
            timeout: setTimeout(() => delete global.sibling_proposals[target], 60000) 
        }

        const buttons = [
            { buttonId: `${usedPrefix}accettafratello`, buttonText: { displayText: 'ACCETTA FRATELLANZA ✅' }, type: 1 },
            { buttonId: `${usedPrefix}rifiutaproposta`, buttonText: { displayText: 'RIFIUTA ❌' }, type: 1 }
        ]
        return conn.sendMessage(m.chat, {
            text: `*👥 RICHIESTA DI PARENTELA 👥*\n\n@${user.split('@')[0]} ti ha invitato a diventare suo/a *${command}*.\n\nSe accetti, condividerete lo stesso genitore e sarete messi in diagonale al suo fianco.`,
            footer: 'SISTEMA GEOMETRICO PLESK',
            buttons: buttons,
            headerType: 1,
            mentions: [user, target]
        }, { quoted: m })
    }

    if (command === 'accettafratello') {
        let proposal = global.sibling_proposals[user]
        if (!proposal) return m.reply('*⚠️ Nessuna richiesta di parentela pendente.*')
        
        let padreId = proposal.padreId
        let proposer = proposal.proposer
        let type = proposal.type

        checkUser(padreId)
        global.db.data.users[padreId].p.push(user)
        global.db.data.users[user].s = padreId
        global.db.data.users[user].role = type

        clearTimeout(proposal.timeout); delete global.sibling_proposals[user]
        return m.reply(`*🎉 Richiesta accettata! Ora sei ufficialmente ${type} di @${proposer.split('@')[0]}.*`, null, { mentions: [proposer] })
    }

    if (command === 'rifiutaproposta') {
        if (global.marriage_proposals?.[user]) { clearTimeout(global.marriage_proposals[user].timeout); delete global.marriage_proposals[user] }
        if (global.sibling_proposals?.[user]) { clearTimeout(global.sibling_proposals[user].timeout); delete global.sibling_proposals[user] }
        return m.reply('*❌ Richiesta rifiutata.*')
    }

    // --- DISEREDA ED ALLONTANA ---
    if (command === 'disereda') {
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!target) return m.reply('*⚠️ Tagga il figlio da rimuovere!*')
        let figs = global.db.data.users[user].p || []
        if (!figs.includes(target)) return m.reply('*❌ Questo utente non si trova sotto di te come figlio.*')
        global.db.data.users[user].p = figs.filter(id => id !== target); global.db.data.users[target].s = null
        m.reply(`*🚫 Rimozione completata.*`)
    }

    if (command === 'allontana') {
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!target) return m.reply('*⚠️ Tagga chi vuoi allontanare dai tuoi fratelli!*')
        let u = global.db.data.users[user]
        if (!u.s) return m.reply('*❌ Non hai un genitore associato.*')
        let padreId = u.s
        let figliDelPadre = global.db.data.users[padreId]?.p || []
        if (!figliDelPadre.includes(target)) return m.reply('*❌ Non è tuo fratello/sorella.*')
        global.db.data.users[padreId].p = figliDelPadre.filter(id => id !== target); global.db.data.users[target].s = null; global.db.data.users[target].role = null
        m.reply(`*🚫 Parentela interrotta.*`)
    }

    // --- GENERAZIONE GRAFICA REALE ---
    if (command === 'albero' || command === 'famigliamia') {
        let target = m.mentionedJid[0] || user
        checkUser(target)
        await m.reply('⏳ *Generazione dell\'albero genealogico simmetrico...*')

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

        // LIVELLO 1: NONNO (In cima)
        if (nonno) {
            positions['nonno'] = { x: canvasWidth / 2, y: currentY }
            currentY += 280
        }
        
        // LIVELLO 2: GENITORI E ZII (Zii allargati diagonalmente)
        if (padre || zii.length > 0) {
            positions['padre'] = { x: canvasWidth / 2, y: currentY }
            positions['zii'] = []
            zii.forEach((z, i) => {
                let side = i % 2 === 0 ? -1 : 1
                let factor = Math.floor(i / 2) + 1
                let zx = (canvasWidth / 2) + (side * (factor * 340))
                positions['zii'].push({ id: z, x: zx, y: currentY })
            })
            currentY += 280
        }
        
        // LIVELLO 3: TU, SPOSO/A E FRATELLI (Coppia vicinissima al centro, fratelli esterni)
        positions['fratelli'] = []
        if (partner) {
            positions['tu'] = { x: (canvasWidth / 2) - 110, y: currentY }
            positions['partner'] = { x: (canvasWidth / 2) + 110, y: currentY }
            fratelli.forEach((f, i) => {
                let side = i % 2 === 0 ? -1 : 1
                let factor = Math.floor(i / 2) + 1
                let fx = (canvasWidth / 2) + (side * (260 + (factor * 320)))
                positions['fratelli'].push({ id: f, x: fx, y: currentY })
            })
        } else {
            positions['tu'] = { x: canvasWidth / 2, y: currentY }
            fratelli.forEach((f, i) => {
                let side = i % 2 === 0 ? -1 : 1
                let factor = Math.floor(i / 2) + 1
                let fx = (canvasWidth / 2) + (side * (factor * 340))
                positions['fratelli'].push({ id: f, x: fx, y: currentY })
            })
        }
        currentY += 280

        // LIVELLO 4: FIGLI (Sotto perfetti)
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

            let name = 'Membro'
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

        // --- DISEGNO DELLE LINEE ---
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
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `🌳 *ALBERO GENEALOGICO STRUTTURATO*`, mentions: [target] }, { quoted: m })
    }
}

handler.command = /^(sposa|accettasposa|accettafratello|rifiutaproposta|divorzia|adotta|disereda|fratello|sorella|allontana|resetalbero|albero|famigliamia|famiglia)$/i
handler.group = true
export default handler
