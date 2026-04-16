import fetch from 'node-fetch'
import { createCanvas, loadImage } from 'canvas'

// --- HELPER: CUORE PREMIUM ---
function drawHeart(ctx, x, y, width, height) {
    const topCurveHeight = height * 0.3;
    ctx.save();
    let grad = ctx.createRadialGradient(x, y, 10, x, y, width);
    grad.addColorStop(0, '#ff4d4d');
    grad.addColorStop(1, '#b30000');
    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(x, y + topCurveHeight);
    ctx.bezierCurveTo(x, y, x - width / 2, y, x - width / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x - width / 2, y + (height + topCurveHeight) / 2, x, y + (height + topCurveHeight) / 2, x, y + height);
    ctx.bezierCurveTo(x, y + (height + topCurveHeight) / 2, x + width / 2, y + (height + topCurveHeight) / 2, x + width / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x + width / 2, y, x, y, x, y + topCurveHeight);
    ctx.fill();
    ctx.restore();
}

// --- RENDERING SBORRA "ULTRA" ---
function drawUltraSplat(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    
    // 1. Ombra interna/Bordo (per profondità)
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 8;

    // 2. Creazione forma viscosa irregolare
    ctx.beginPath();
    let points = 12;
    for (let i = 0; i <= points; i++) {
        let angle = (i / points) * Math.PI * 2;
        let pull = 0.8 + Math.random() * 0.5;
        let currX = Math.cos(angle) * (size * pull);
        let currY = Math.sin(angle) * (size * pull);
        if (i === 0) ctx.moveTo(currX, currY);
        else ctx.lineTo(currX, currY);
    }
    ctx.closePath();

    // Gradiente per l'effetto denso
    let grad = ctx.createRadialGradient(-size * 0.2, -size * 0.2, size * 0.1, 0, 0, size);
    grad.addColorStop(0, '#FFFFFF'); // Centro brillante
    grad.addColorStop(0.8, '#F2F2F2'); // Corpo denso
    grad.addColorStop(1, 'rgba(220, 220, 220, 0.8)'); // Bordo sfumato
    ctx.fillStyle = grad;
    ctx.fill();

    // 3. Punti luce speculari (l'effetto "bagnato")
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(-size * 0.35, -size * 0.35, size * 0.2, size * 0.1, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // 4. Colatura (Dripping)
    if (Math.random() > 0.4) {
        ctx.restore();
        ctx.save();
        ctx.translate(x, y);
        let len = size * (2 + Math.random() * 3);
        let width = size * (0.4 + Math.random() * 0.2);
        
        let dripGrad = ctx.createLinearGradient(0, 0, 0, len);
        dripGrad.addColorStop(0, '#FFFFFF');
        dripGrad.addColorStop(1, '#EAEAEA');
        
        ctx.fillStyle = dripGrad;
        ctx.beginPath();
        ctx.moveTo(-width / 2, 0);
        ctx.lineTo(-width / 3, len);
        // Goccia finale pesante
        ctx.arc(0, len, width * 0.8, 0, Math.PI * 2);
        ctx.lineTo(width / 2, 0);
        ctx.fill();
        
        // Luce sulla colatura
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-width/4, 5);
        ctx.lineTo(-width/4, len - 5);
        ctx.stroke();
    }
    ctx.restore();
}

const applicaEffetto = async (m, conn, tipoEffetto, usedPrefix, command) => {
    let who = m.quoted ? m.quoted.sender : m.mentionedJid?.[0] ? m.mentionedJid[0] : m.sender
    try {
        let bufferImmagine;
        if (m.quoted && (m.quoted.mtype === 'imageMessage' || m.quoted.mtype === 'viewOnceMessage')) {
            bufferImmagine = await m.quoted.download()
        } else {
            let pp = await conn.profilePictureUrl(who, 'image').catch(() => null)
            if (!pp) return m.reply('❌ Impossibile recuperare la foto.')
            let res = await fetch(pp)
            bufferImmagine = await res.arrayBuffer()
        }

        let img = await loadImage(Buffer.from(bufferImmagine))
        let canvas = createCanvas(img.width, img.height)
        let ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)

        if (tipoEffetto === 'sborra') {
            let density = 15 + Math.floor(Math.random() * 10);
            for (let i = 0; i < density; i++) {
                drawUltraSplat(ctx, Math.random() * img.width, Math.random() * img.height, (img.width * 0.05) + Math.random() * 15)
            }
        } else {
            const pride = {
                gay: ['#FF0000', '#FF8C00', '#FFEF00', '#008121', '#004CFF', '#760188'],
                trans: ['#5BCEFA', '#F5A9B8', '#FFFFFF', '#F5A9B8', '#5BCEFA']
            }
            let colors = pride[tipoEffetto]
            let grad = ctx.createLinearGradient(0, 0, img.width, img.height)
            colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c))
            
            ctx.globalAlpha = 0.35;
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, img.width, img.height);
            
            ctx.globalAlpha = 1.0;
            ctx.lineWidth = img.width * 0.03;
            ctx.strokeStyle = grad;
            ctx.strokeRect(0, 0, img.width, img.height);
        }

        let finalBuffer = canvas.toBuffer('image/jpeg')
        await conn.sendFile(m.chat, finalBuffer, 'result.jpg', `*Effetto ${tipoEffetto} applicato!*`, m)
    } catch (e) {
        m.reply('❌ Errore durante l\'elaborazione.')
    }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const cmd = command.toLowerCase()
    if (cmd === 'il' || cmd === 'ilove') {
        let name = m.mentionedJid?.[0] ? await conn.getName(m.mentionedJid[0]) : text
        if (!name) return m.reply('Specifica un nome!')
        const canvas = createCanvas(1000, 1000);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 1000, 1000);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 200px sans-serif';
        ctx.fillText('I', 350, 400);
        drawHeart(ctx, 600, 300, 250, 250);
        ctx.font = 'bold 150px sans-serif';
        ctx.fillText(name.toUpperCase(), 500, 750);
        await conn.sendFile(m.chat, canvas.toBuffer('image/jpeg'), 'love.jpg', '', m)
    } else {
        await applicaEffetto(m, conn, cmd, usedPrefix, command)
    }
}

handler.command = /^(gay|trans|sborra|il|ilove)$/i
export default handler
