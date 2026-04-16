import { createCanvas, loadImage } from 'canvas';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import https from 'https';

const TRANSFER_FEE = 0.03;
const MIN_AMOUNT = 100;

const downloadEmoji = async (emoji, size = 72) => {
    const url = `https://emojicdn.elk.sh/${emoji}?style=apple&size=${size}`;
    
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`emoji non caricata: ${response.statusCode}`));
                return;
            }
            
            const chunks = [];
            response.on('data', chunk => chunks.push(chunk));
            response.on('end', () => {
                resolve(Buffer.concat(chunks));
            });
        }).on('error', reject);
    });
};

const createAnimationFrame = async (frameNumber, totalFrames, senderName, receiverName) => {
    const canvas = createCanvas(800, 500);
    const ctx = canvas.getContext('2d');
    const bgGradient = ctx.createLinearGradient(0, 0, 800, 500);
    bgGradient.addColorStop(0, '#1a1a2e');
    bgGradient.addColorStop(0.3, '#16213e');
    bgGradient.addColorStop(0.6, '#0f3460');
    bgGradient.addColorStop(1, '#533483');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 800, 500);
    const time = frameNumber * 0.05;
    for (let i = 0; i < 100; i++) {
        const x = (i * 15 + time * 40) % 850;
        const y = (i * 13 + time * 25) % 550;
        const size = Math.sin(time + i * 0.1) * 0.8 + 1.2;
        const opacity = Math.sin(time + i * 0.2) * 0.3 + 0.15;
        
        ctx.fillStyle = `rgba(100, 200, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.save();
    ctx.globalAlpha = 0.1;
    for (let wave = 0; wave < 3; wave++) {
        const waveOffset = time + wave * 2;
        ctx.beginPath();
        ctx.moveTo(0, 250 + Math.sin(waveOffset) * 30);
        for (let x = 0; x <= 800; x += 10) {
            const y = 250 + Math.sin(waveOffset + x * 0.01) * 30 + wave * 20;
            ctx.lineTo(x, y);
        }
        ctx.strokeStyle = '#64c8ff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    ctx.restore();
    
    const progress = frameNumber / (totalFrames - 1);
    
    try {
        const cardEmojiBuffer = await downloadEmoji('💳', 40);
        const cardEmojiImage = await loadImage(cardEmojiBuffer);
        
        const diamondEmojiBuffer = await downloadEmoji('💎', 28);
        const diamondEmojiImage = await loadImage(diamondEmojiBuffer);
        
        const euroEmojiBuffer = await downloadEmoji('💰', 32);
        const euroEmojiImage = await loadImage(euroEmojiBuffer);
        ctx.save();
        ctx.shadowColor = 'rgba(100, 200, 255, 0.8)';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        
        const titleText = 'Trasferimento Euro';
        const titleMetrics = ctx.measureText(titleText);
        const titleWidth = titleMetrics.width;
        ctx.drawImage(cardEmojiImage, 400 - titleWidth/2 - 60, 40, 40, 40);
        ctx.fillText(titleText, 400, 75);
        ctx.drawImage(diamondEmojiImage, 400 + titleWidth/2 + 20, 48, 28, 28);
        ctx.restore();
        ctx.save();
        ctx.translate(150, 200);
        const cardTilt = Math.sin(time * 2) * 0.05;
        ctx.rotate(cardTilt);
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 25;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 8;
        const cardGradient = ctx.createLinearGradient(-80, -50, 80, 50);
        cardGradient.addColorStop(0, '#ff6b6b');
        cardGradient.addColorStop(0.5, '#ff8787');
        cardGradient.addColorStop(1, '#ff5252');
        ctx.fillStyle = cardGradient;
        ctx.fillRect(-80, -50, 160, 100);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(-80, -50, 160, 100);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(-70, -40, 140, 3);
        ctx.fillRect(-70, 30, 60, 3);
        ctx.drawImage(cardEmojiImage, -20, -35, 40, 40);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(senderName.length > 12 ? senderName.substring(0, 12) + '...' : senderName, 0, 30);
        ctx.restore();
        ctx.save();
        ctx.translate(650, 200);
        ctx.rotate(-cardTilt);
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 25;
        ctx.shadowOffsetX = -5;
        ctx.shadowOffsetY = 8;
        const cardGradient2 = ctx.createLinearGradient(-80, -50, 80, 50);
        cardGradient2.addColorStop(0, '#4ecdc4');
        cardGradient2.addColorStop(0.5, '#5ed3ca');
        cardGradient2.addColorStop(1, '#26a69a');
        ctx.fillStyle = cardGradient2;
        ctx.fillRect(-80, -50, 160, 100);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(-80, -50, 160, 100);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(-70, -40, 140, 3);
        ctx.fillRect(-70, 30, 60, 3);
        ctx.drawImage(cardEmojiImage, -20, -35, 40, 40);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(receiverName.length > 12 ? receiverName.substring(0, 12) + '...' : receiverName, 0, 30);
        ctx.restore();
        const connectionY = 200;
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.lineDashOffset = -time * 20;
        ctx.beginPath();
        ctx.moveTo(230, connectionY);
        ctx.lineTo(570, connectionY);
        ctx.stroke();
        ctx.restore();
        if (progress > 0.1 && progress < 0.9) {
            for (let wave = 0; wave < 6; wave++) {
                const waveProgress = (progress * 2 + wave * 0.3) % 1;
                if (waveProgress > 0 && waveProgress < 1) {
                    const waveX = 230 + (570 - 230) * waveProgress;
                    const waveOpacity = Math.sin(waveProgress * Math.PI) * 0.8;
                    ctx.save();
                    ctx.globalAlpha = waveOpacity;
                    const waveGradient = ctx.createRadialGradient(waveX, connectionY, 0, waveX, connectionY, 30);
                    waveGradient.addColorStop(0, '#ffd700');
                    waveGradient.addColorStop(0.5, '#ffed4e');
                    waveGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
                    ctx.fillStyle = waveGradient;
                    ctx.beginPath();
                    ctx.arc(waveX, connectionY, 30, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }
        }
        
        const coinCount = 20;
        for (let i = 0; i < coinCount; i++) {
            const coinDelay = i * 0.04;
            const coinProgress = Math.max(0, Math.min(1, (progress - coinDelay) / 0.6));
            
            if (coinProgress > 0) {
                const startX = 230;
                const endX = 570;
                const baseY = connectionY;
                const coinX = startX + (endX - startX) * coinProgress;
                const arc = Math.sin(coinProgress * Math.PI) * 80;
                const coinY = baseY - arc;
                const rotation = coinProgress * Math.PI * 8;
                const scale = 0.5 + Math.sin(coinProgress * Math.PI) * 0.4;
                ctx.save();
                ctx.translate(coinX, coinY);
                ctx.rotate(rotation);
                ctx.scale(scale, scale);
                ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                ctx.shadowBlur = 10;
                ctx.shadowOffsetY = 5;
                const coinGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 25);
                coinGradient.addColorStop(0, '#ffd700');
                coinGradient.addColorStop(0.4, '#ffed4e');
                coinGradient.addColorStop(0.7, '#f1c40f');
                coinGradient.addColorStop(1, '#d4ac0d');
                ctx.fillStyle = coinGradient;
                ctx.beginPath();
                ctx.arc(0, 0, 25, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#b7950b';
                ctx.lineWidth = 3;
                ctx.stroke();
                ctx.fillStyle = '#8b4513';
                ctx.font = 'bold 28px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('€', 0, 10);
                ctx.restore();
                if (coinProgress > 0.1) {
                    ctx.save();
                    ctx.globalAlpha = 0.6;
                    const trailGradient = ctx.createLinearGradient(coinX - 40, coinY, coinX, coinY);
                    trailGradient.addColorStop(0, 'rgba(255, 215, 0, 0)');
                    trailGradient.addColorStop(1, 'rgba(255, 215, 0, 0.8)');
                    
                    ctx.fillStyle = trailGradient;
                    ctx.fillRect(coinX - 40, coinY - 4, 40, 8);
                    ctx.restore();
                }
            }
        }
        const progressBarY = 350;
        const progressBarWidth = 500;
        const progressBarHeight = 12;
        const progressBarX = (800 - progressBarWidth) / 2;
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 8;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);
        const progressGradient = ctx.createLinearGradient(progressBarX, progressBarY, progressBarX + progressBarWidth, progressBarY);
        progressGradient.addColorStop(0, '#ff6b6b');
        progressGradient.addColorStop(0.5, '#ffd700');
        progressGradient.addColorStop(1, '#4ecdc4');
        ctx.fillStyle = progressGradient;
        ctx.fillRect(progressBarX, progressBarY, progressBarWidth * progress, progressBarHeight);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);
        ctx.restore();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 3;
        ctx.fillText(`${Math.round(progress * 100)}%`, 400, 340);
        if (progress > 0.85) {
            const sparkleEmojiBuffer = await downloadEmoji('✨', 20);
            const sparkleEmojiImage = await loadImage(sparkleEmojiBuffer);
            for (let i = 0; i < 30; i++) {
                const angle = (i / 30) * Math.PI * 2;
                const distance = (progress - 0.85) * 150;
                const particleX = 650 + Math.cos(angle) * distance;
                const particleY = 200 + Math.sin(angle) * distance;
                ctx.save();
                ctx.globalAlpha = Math.max(0, 1 - (progress - 0.85) * 6);
                ctx.drawImage(sparkleEmojiImage, particleX - 10, particleY - 10, 20, 20);
                ctx.restore();
            }
            ctx.save();
            ctx.globalAlpha = Math.max(0, 1 - (progress - 0.85) * 4);
            const successGradient = ctx.createRadialGradient(650, 200, 0, 650, 200, 100);
            successGradient.addColorStop(0, 'rgba(76, 205, 76, 0.3)');
            successGradient.addColorStop(1, 'rgba(76, 205, 76, 0)');
            ctx.fillStyle = successGradient;
            ctx.beginPath();
            ctx.arc(650, 200, 100, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        let statusText = '';
        let statusColor = '#ffffff';
        if (progress < 0.2) {
            statusText = '🔄 Inizializzazione trasferimento...';
        } else if (progress < 0.4) {
            statusText = '🔐 Verifica di sicurezza...';
        } else if (progress < 0.7) {
            statusText = '💰 Trasferimento in corso...';
        } else if (progress < 0.9) {
            statusText = '⚡ Finalizzazione operazione...';
        } else {
            statusText = '✅ Trasferimento completato!';
            statusColor = '#4caf50';
        }
        
        ctx.fillStyle = statusColor;
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 2;
        ctx.fillText(statusText, 400, 420);
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.translate(750, 450);
        ctx.rotate(Math.sin(time * 3) * 0.2);
        ctx.drawImage(euroEmojiImage, -16, -16, 32, 32);
        ctx.restore();
        
    } catch (error) {
        console.error('Errore caricamento emoji:', error);
        ctx.save();
        ctx.shadowColor = 'rgba(100, 200, 255, 0.8)';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('💳 Trasferimento Euro 💎', 400, 75);
        ctx.restore();
    }
    
    return canvas.toBuffer('image/png');
};

const createTransferAnimation = async (transactionId, senderName, receiverName) => {
    const totalFrames = 120;
    const outputPath = path.resolve(`./temp/transfer_${transactionId}.mp4`);
    const tempDir = path.resolve('./temp');
    
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const framePromises = [];
    for (let i = 0; i < totalFrames; i++) {
        framePromises.push(
            createAnimationFrame(i, totalFrames, senderName, receiverName)
                .then(frameBuffer => {
                    const framePath = path.resolve(tempDir, `frame_${i.toString().padStart(3, '0')}.png`);
                    fs.writeFileSync(framePath, frameBuffer);
                    return framePath;
                })
                .catch(error => {
                    console.error(`Errore creazione frame ${i}:`, error);
                    throw error;
                })
        );
    }
    
    try {
        const framePaths = await Promise.all(framePromises);
        
        return new Promise((resolve, reject) => {
            const inputPattern = path.resolve(tempDir, 'frame_%03d.png').replace(/\\/g, '/');
            
            ffmpeg()
                .input(inputPattern)
                .inputOptions([
                    '-framerate 24',
                    '-start_number 0'
                ])
                .outputOptions([
                    '-c:v libx264',
                    '-pix_fmt yuv420p',
                    '-t 5',
                    '-crf 18',
                    '-preset slow',
                    '-y'
                ])
                .output(outputPath)
                .on('end', () => {
                    for (let i = 0; i < totalFrames; i++) {
                        const framePath = path.resolve(tempDir, `frame_${i.toString().padStart(3, '0')}.png`);
                        try {
                            if (fs.existsSync(framePath)) {
                                fs.unlinkSync(framePath);
                            }
                        } catch (error) {
                        }
                    }
                    resolve(outputPath);
                })
                .on('error', (error) => {
                    for (let i = 0; i < totalFrames; i++) {
                        const framePath = path.resolve(tempDir, `frame_${i.toString().padStart(3, '0')}.png`);
                        try {
                            if (fs.existsSync(framePath)) {
                                fs.unlinkSync(framePath);
                            }
                        } catch (cleanupError) {
                        }
                    }
                    reject(error);
                })
                .run();
        });
    } catch (error) {
        console.error('Errore durante la creazione dei frames:', error);
        throw error;
    }
};

let handler = async (m, { conn, text, participants, args, usedPrefix, command }) => {
    const e = '*Euro* 🪙';
    
    if (!text) return m.reply(`
╭━━⊱「 『 ❌ 』 \`ERRORE\` 」
│  - _*Devi specificare quantità e utente!*_
│ 
│ 『 📝 』 \`Formato corretto:\`
│ ➸ *${usedPrefix}${command}* *<quantità> @utente*
│ 
│ 『 💡 』 \`Esempio:\`
│ ➸ *${usedPrefix}${command}* *1000 @utente*
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`);

    let mentioned = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : '';
    let amount = text.split(' ')[0];
    
    if (!mentioned) return m.reply(`
╭━━⊱「 『 ❌ 』 \`ERRORE\` 」
│ 
│ _*Devi menzionare un utente o*_
│ _*rispondere a un suo messaggio!*_
│ 
│ 『 📝 』 \`Modi corretti:\`
│ ➸ *${usedPrefix}${command}* *1000 @utente*
│ ➸ Rispondi a un messaggio con:
│     *${usedPrefix}${command} 1000*
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`);

    if (amount === 'all') {
        amount = global.db.data.users[m.sender].euro;
    } else if (amount === 'random') {
        amount = Math.floor(Math.random() * 1000) + 1;
    } else {
        if (isNaN(amount)) return m.reply(`
╭━━⊱「 『 ❌ 』 \`ERRORE\` 」
│ 
│ - _*Quantità non valida!*_
│ 
│ 『 📝 』 \`Formato corretto:\`
│ ➸ *Numero* (es: 1000)
│ ➸ *'all'* per tutti gli euro
│ ➸ *'random'* per importo casuale
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`);
        amount = parseInt(amount);
    }

    if (amount < 1) return m.reply(`『 💰 』 \`Minimo trasferibile:\` *1 ${e}*`);

    let users = global.db.data.users;
    if (!users[mentioned]) users[mentioned] = {
        euro: 0,
        lastclaim: 0
    };

    if (users[m.sender].euro < amount) return m.reply(`
╭━⊱「 『 💰 』 \`BILANCIO\` 」
│ 
│ -  _*Non hai abbastanza euro!*_
│ 
│ 『 👝 』 \`Il tuo saldo:\` *${users[m.sender].euro}* ${e}
│ 『 💸 』 \`Richiesto:\` *${amount}* ${e}
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`);

    let targetName;
    let senderName;
    try {
        targetName = await conn.getName(mentioned);
        senderName = await conn.getName(m.sender);
    } catch {
        targetName = '@' + mentioned.split('@')[0];
        senderName = '@' + m.sender.split('@')[0];
    }

    const transactionId = Math.random().toString(36).substring(2, 15);
    let fee = Math.floor(amount * TRANSFER_FEE);
    let finalAmount = amount - fee;

    try {
        await conn.sendMessage(m.chat, {
            react: {
                text: '⏳',
                key: m.key
            }
        });

        const animationPath = await createTransferAnimation(transactionId, senderName, targetName);
        
        if (!fs.existsSync(animationPath)) {
            throw new Error('File animazione non creato');
        }
        
        await conn.sendMessage(m.chat, {
            react: {
                text: '🔄',
                key: m.key
            }
        });

        await conn.sendMessage(m.chat, {
            video: fs.readFileSync(animationPath),
            caption: `
ㅤㅤ⋆｡˚『 ╭ \`TRASFERIMENTO\` ╯ 』˚｡⋆\n╭                                                                    
│ 『 👤 』 \`Da:\` *${senderName}*
│ 『 🎯 』 \`A:\` *${targetName}*  
│ 『 💰 』 \`Importo:\` *${formatNumber(amount)}* ${e}
│ 『 ⚡ 』 \`Stato:\` *In corso...*
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`,
            gifPlayback: true
        });
        
        await new Promise(resolve => setTimeout(resolve, 5500));
        
        try {
            if (fs.existsSync(animationPath)) {
                fs.unlinkSync(animationPath);
            }
        } catch (cleanupError) {
            // Ignora errori di pulizia
        }
        
        users[m.sender].euro -= amount;
        users[mentioned].euro += finalAmount;
        
        const transaction = {
            id: transactionId,
            type: 'transfer',
            amount: amount,
            fee: fee,
            timestamp: Date.now(),
            from: m.sender,
            to: mentioned
        };

        if (!users[m.sender].transactions) users[m.sender].transactions = [];
        if (!users[mentioned].transactions) users[mentioned].transactions = [];
        users[m.sender].transactions.push(transaction);
        users[mentioned].transactions.push(transaction);
        
        await conn.sendMessage(m.chat, {
            react: {
                text: '✅',
                key: m.key
            }
        });
        
        await conn.sendMessage(m.chat, {
            text: `
ㅤㅤ⋆｡˚『 ╭ \`RICEVUTA\` ╯ 』˚｡⋆
╭                                                                  
│ 『 🔄 』 _*Operazione:*_
│ • \`Mittente:\` *${senderName}*
│ • \`Destinatario:\` *${targetName}*
│                                                                     
│ 『 💎 』 _*Importi Elaborati:*_
│ • \`Inviato:\` *${formatNumber(amount)}* ${e}
│ • \`Commissione ${TRANSFER_FEE * 100}%:\`* ${formatNumber(fee)} ${e}  
│ • \`Ricevuto:\` *${formatNumber(finalAmount)}* ${e}
│ • \`Saldo ${senderName}:\` *${formatNumber(users[m.sender].euro)}* ${e}
│ • \`Saldo ${targetName}:\` *${formatNumber(users[mentioned].euro)}* ${e}
│                                                                     
│ 『 🔐 』 _*Dettagli*_
│ • \`Transizione:\` *#${transactionId}*
│ • \`Ora:\` *${new Date().toLocaleString('it-IT')}*
│ • \`Stato:\` 『 ✅ 』 *Verificato*
│                                                                   
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`
        }, { mentions: [mentioned] });

        await conn.sendMessage(m.chat, {
            react: {
                text: '🎉',
                key: m.key
            }
        });

    } catch (error) {
        console.error('❌ Errore durante il trasferimento:', error);
        
        await conn.sendMessage(m.chat, {
            react: {
                text: '❌',
                key: m.key
            }
        });
        
        await m.reply(`*Si è verificato un errore durante il trasferimento, Riprova.*`);
    }
};

function formatNumber(num) {
    return num.toLocaleString('it-IT');
}

handler.help = ['daieuro'];
handler.tags = ['euro'];
handler.command = ['givecoins', 'paga', 'daieuro', 'givecoin'];

export default handler;