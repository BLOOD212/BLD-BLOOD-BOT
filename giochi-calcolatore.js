import { createCanvas, loadImage } from 'canvas';
import fetch from 'node-fetch';

const DEFAULT_AVATAR_URL = 'https://i.ibb.co/jH0VpAv/default-avatar-profile-icon-of-social-media-user-vector.jpg';

// Helper per testo neon
function drawNeonText(ctx, text, x, y, fontSize, color, align = 'center') {
    ctx.save();
    ctx.font = `bold ${fontSize}px Impact, sans-serif`;
    ctx.textAlign = align;
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.strokeText(text, x, y);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(text, x, y);
    ctx.restore();
}

// Sfondo Cyberpunk
function generateCyberBackground(ctx, width, height, colors) {
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0a0a0c');
    bgGrad.addColorStop(1, colors[1]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = `${colors[0]}22`;
    ctx.lineWidth = 2;
    for (let i = 0; i < width; i += 60) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
    }
}

// DISEGNO DINAMICO DEL MEMBRO (Comando Cazzo)
function drawMembro(ctx, x, y, size) {
    const baseSize = 55;
    const length = Math.max(40, size * 14); 
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#FFB6C1';
    ctx.shadowColor = 'rgba(255, 105, 180, 0.4)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(-baseSize / 1.5, 0, baseSize, 0, Math.PI * 2);
    ctx.arc(baseSize / 1.5, 0, baseSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-baseSize / 1.2, -length, baseSize * 1.6, length);
    ctx.fillStyle = '#FF69B4';
    ctx.beginPath();
    ctx.arc(0, -length, baseSize * 1.1, Math.PI, 0);
    ctx.fill();
    ctx.restore();
}

// DISEGNO DINAMICO DELLE TETTE (Comando Tette)
function drawBoobs(ctx, x, y, size) {
    const radius = 60 + (size * 8); // Il raggio cresce con la misura
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#FFD1DC';
    ctx.shadowColor = 'rgba(255, 182, 193, 0.5)';
    ctx.shadowBlur = 15;

    // Sinistra
    ctx.beginPath();
    ctx.arc(-radius * 0.9, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    // Destra
    ctx.beginPath();
    ctx.arc(radius * 0.9, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // Capezzoli
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.arc(-radius * 0.9, -radius * 0.1, radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(radius * 0.9, -radius * 0.1, radius * 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

async function generateMeterImage({ title, percentage, avatarUrl, description, themeColors, type }) {
    const width = 1080;
    const height = 1080;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    generateCyberBackground(ctx, width, height, themeColors);
    const avatar = await loadImage(avatarUrl).catch(() => loadImage(DEFAULT_AVATAR_URL));

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.roundRect(50, 50, width - 100, height - 100, 60);
    ctx.fill();
    ctx.restore();

    drawNeonText(ctx, title, width / 2, 160, 130, themeColors[0]);

    const avatarSize = 280;
    ctx.save();
    ctx.beginPath();
    ctx.arc(width / 2, 380, avatarSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, width / 2 - avatarSize / 2, 380 - avatarSize / 2, avatarSize, avatarSize);
    ctx.restore();

    if (type === 'cazzo') {
        const drawX = width / 2 - 150;
        const drawY = 880;
        drawMembro(ctx, drawX, drawY, percentage); 
        drawNeonText(ctx, `${percentage}`, drawX + 250, drawY - (percentage * 7), 180, themeColors[0], 'left');
        drawNeonText(ctx, `CM`, drawX + 250, drawY - (percentage * 7) + 90, 70, themeColors[0], 'left');
    } else if (type === 'tette') {
        const drawY = 750;
        drawBoobs(ctx, width / 2, drawY, percentage);
        drawNeonText(ctx, `MISURA: ${percentage}ª`, width / 2, 920, 110, themeColors[0]);
    } else {
        const barW = 800;
        const barX = (width - barW) / 2;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.roundRect(barX, 750, barW, 60, 30); ctx.fill();
        const pWidth = (barW * percentage) / 100;
        ctx.fillStyle = themeColors[0];
        ctx.roundRect(barX, 750, pWidth, 60, 30); ctx.fill();
        drawNeonText(ctx, `${percentage}%`, width / 2, 920, 110, themeColors[0]);
    }

    ctx.font = 'italic 42px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(description, width / 2, 1020);

    return canvas.toBuffer('image/jpeg');
}

const commandConfig = {
    gaymetro: { title: 'GAY-SCAN', colors: ['#FF00FF', '#4a004a'], desc: p => "Analisi orientamento completata." },
    lesbiometro: { title: 'LESBO-SCAN', colors: ['#FF1493', '#4B0082'], desc: p => "Vibe rilevata dal sistema." },
    masturbometro: { title: 'FAP-METER', colors: ['#FF4500', '#2F4F4F'], desc: p => "Attenzione: polso a rischio." },
    fortunometro: { title: 'LUCK-SCAN', colors: ['#00FF00', '#004400'], desc: p => "Probabilità calcolate." },
    intelligiometro: { title: 'BRAIN-SCAN', colors: ['#00FFFF', '#00008B'], desc: p => "QI sopra la media." },
    bellometro: { title: 'BEAUTY-CHECK', colors: ['#FFD700', '#8B4513'], desc: p => "Estetica approvata." },
    sottomessometro: { title: 'SUB-SCANNER', colors: ['#C0C0C0', '#2C3E50'], desc: p => "Livello ubbidienza: " + p + "%" },
    cazzo: { title: 'DICK-SIZE', colors: ['#FFB6C1', '#C71585'], desc: p => p > 20 ? "Un vero mostro!" : "Misure rilevate." },
    tette: { title: 'BOOBS-SIZE', colors: ['#FFD1DC', '#FF69B4'], desc: p => p > 4 ? "Un bel davanzale!" : "Piccole ma sode." }
};

const handler = async (m, { conn, command, text }) => {
    const config = commandConfig[command];
    if (!config) return;

    const targetUser = m.mentionedJid?.[0] || m.quoted?.sender || m.sender;
    const targetName = text.trim() || conn.getName(targetUser);

    try {
        await conn.reply(m.chat, `🔍 *Analisi per ${targetName}...*`, m);
        const avatar = await conn.profilePictureUrl(targetUser, 'image').catch(() => DEFAULT_AVATAR_URL);
        
        let percentage;
        if (command === 'cazzo') percentage = Math.floor(Math.random() * 32) + 3;
        else if (command === 'tette') percentage = Math.floor(Math.random() * 6) + 1;
        else percentage = Math.floor(Math.random() * 101);

        const imageBuffer = await generateMeterImage({
            title: config.title,
            percentage,
            avatarUrl: avatar,
            description: config.desc(percentage),
            themeColors: config.colors,
            type: command
        });

        await conn.sendMessage(m.chat, {
            image: imageBuffer,
            caption: `✅ *Analisi finita per ${targetName}!*`,
            mentions: [targetUser]
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        await conn.reply(m.chat, `❌ Errore sistema.`, m);
    }
};

handler.command = Object.keys(commandConfig);
export default handler;
