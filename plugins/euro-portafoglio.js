import { createCanvas, loadImage } from 'canvas';

let handler = async (m, { conn, usedPrefix }) => {
    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender;
    if (who == conn.user.jid) return;
    if (!(who in global.db.data.users)) return conn.reply(m.chat, '『 🏦 』• _Non sei registrato nel database._', m);

    let user = global.db.data.users[who];
    const formatNumber = (num) => num.toLocaleString('it-IT');
    
    if (!user.highestBalance || user.euro > user.highestBalance) {
        user.highestBalance = user.euro;
    }
    
    const rank = getRank(user.euro);
    const nextRank = getNextRank(user.euro);
    const totalBalance = user.euro + (user.bank || 0);
    const name = conn.getName(who);

    // --- GENERAZIONE CANVAS ---
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext('2d');

    // Sfondo Scuro Elegante
    ctx.fillStyle = '#1e1e24';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bordo Neon Acqua
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Testo: Nome Utente e Grado
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(name.toUpperCase(), 50, 60);

    ctx.fillStyle = '#00e5ff';
    ctx.font = '24px sans-serif';
    ctx.fillText(`${rank.emoji} ${rank.name.replace(/\*/g, '')}`, 50, 100);

    // Linea di divisione
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 130);
    ctx.lineTo(750, 130);
    ctx.stroke();

    // Dati Finanziari (Contanti e Banca)
    ctx.fillStyle = '#a0a0a5';
    ctx.font = '20px sans-serif';
    ctx.fillText('CONTANTI', 50, 175);
    ctx.fillText('BANCA', 400, 175);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(`${formatNumber(user.euro)} €`, 50, 210);
    ctx.fillText(`${formatNumber(user.bank || 0)} €`, 400, 210);

    // Calcolo progresso per la barra
    let currentRankMin = getRankMin(user.euro);
    let neededForNext = nextRank.required - currentRankMin;
    let progressCurrent = user.euro - currentRankMin;
    let progressPercent = neededForNext > 0 ? Math.min(1, Math.max(0, progressCurrent / neededForNext)) : 1;

    // Disegno Barra di Progresso Grado
    ctx.fillStyle = '#2a2a35';
    ctx.roundRect ? ctx.roundRect(50, 270, 700, 15, 7) : ctx.fillRect(50, 270, 700, 15);
    ctx.fill();

    ctx.fillStyle = '#00e5ff';
    if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(50, 270, 700 * progressPercent, 15, 7);
        ctx.fill();
    } else {
        ctx.fillRect(50, 270, 700 * progressPercent, 15);
    }

    // Testo sotto la barra (Mancanti / Target)
    ctx.fillStyle = '#a0a0a5';
    ctx.font = '18px sans-serif';
    if (nextRank.required > 0) {
        ctx.fillText(`Prossimo: ${nextRank.name} (Mancano: ${formatNumber(Math.max(0, nextRank.required - user.euro))} €)`, 50, 315);
    } else {
        ctx.fillText(`Grado Massimo Raggiunto 👑`, 50, 315);
    }

    // Totale in basso a destra
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`TOTALE: ${formatNumber(totalBalance)} €`, 750, 360);
    ctx.textAlign = 'left'; // Reset alignment

    const buffer = canvas.toBuffer();

    // --- TESTO COMPATTO DI ACCOMPAGNAMENTO ---
    let messaggio = `
📊 *BILANCIO DI:* @${who.split('@')[0]}
${rank.emoji} *Grado Attuale:* ${rank.name}

🔹 *Contanti:* \`${formatNumber(user.euro)} €\`
🔹 *In Banca:* \`${formatNumber(user.bank || 0)} €\`
💳 *Totale:* \`${formatNumber(totalBalance)} €\`

👉 _Usa *${usedPrefix}casino* per sfidare la sorte!_`.trim();

    // Invia l'immagine generata dal canvas insieme al testo
    await conn.sendFile(m.chat, buffer, 'wallet.png', messaggio, m, false, { mentions: [who] });
};

function getRank(euro) {
    if (euro >= 1000000) return { name: '*ELON MUSK*', emoji: '🌌' };
    if (euro >= 500000) return { name: '*MILIONARIO*', emoji: '💎' };
    if (euro >= 250000) return { name: '*IMPRENDITORE*', emoji: '🏢' };
    if (euro >= 100000) return { name: '*CEO*', emoji: '💼' };
    if (euro >= 50000) return { name: '*INVESTITORE*', emoji: '📈' };
    if (euro >= 25000) return { name: '*AVVOCATO*', emoji: '⚖️' };
    if (euro >= 15000) return { name: '*INGEGNERE*', emoji: '🛠️' };
    if (euro >= 8000) return { name: '*COMMESSO*', emoji: '🛍️' };
    if (euro >= 3000) return { name: '*TIROCINANTE*', emoji: '🧑‍💼' };
    if (euro >= 1000) return { name: '*DISOCCUPATO*', emoji: '📦' };
    return { name: '*SINDACATO BARBONI*', emoji: '🗑️' };
}

function getRankMin(euro) {
    if (euro >= 1000000) return 1000000;
    if (euro >= 500000) return 500000;
    if (euro >= 250000) return 250000;
    if (euro >= 100000) return 100000;
    if (euro >= 50000) return 50000;
    if (euro >= 25000) return 25000;
    if (euro >= 15000) return 15000;
    if (euro >= 8000) return 8000;
    if (euro >= 3000) return 3000;
    if (euro >= 1000) return 1000;
    return 0;
}

function getNextRank(euro) {
    if (euro >= 1000000) return { name: 'DIVINITÀ', emoji: '🌌', required: 0 };
    if (euro >= 500000) return { name: 'ELON MUSK', emoji: '👑', required: 1000000 };
    if (euro >= 250000) return { name: 'MILIONARIO', emoji: '💎', required: 500000 };
    if (euro >= 100000) return { name: 'IMPRENDITORE', emoji: '🏢', required: 250000 };
    if (euro >= 50000) return { name: 'CEO', emoji: '💼', required: 100000 };
    if (euro >= 25000) return { name: 'INVESTITORE', emoji: '📈', required: 50000 };
    if (euro >= 15000) return { name: 'AVVOCATO', emoji: '⚖️', required: 25000 };
    if (euro >= 8000) return { name: 'INGEGNERE', emoji: '🛠️', required: 15000 };
    if (euro >= 3000) return { name: 'COMMESSO', emoji: '🛍️', required: 8000 };
    if (euro >= 1000) return { name: 'TIROCINANTE', emoji: '🧑‍💼', required: 3000 };
    return { name: 'DISOCCUPATO', emoji: '📦', required: 1000 };
}

handler.help = ['portafoglio'];
handler.tags = ['euro'];
handler.command = ['wallet', 'portafoglio', 'bilancio'];
handler.register = false;
export default handler;
