import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage, registerFont } from 'canvas';
import { getSenderLid } from '@realvare/based';

const marriagesFile = path.resolve('media/database/sposi.json');
let marriages = loadMarriages();

function loadMarriages() {
    try {
        return fs.existsSync(marriagesFile) 
            ? JSON.parse(fs.readFileSync(marriagesFile, 'utf8')) 
            : {};
    } catch (error) {
        console.error('Error loading marriages:', error.message);
        return {};
    }
}

function saveMarriages() {
    try {
        fs.writeFileSync(marriagesFile, JSON.stringify(marriages, null, 2));
    } catch (error) {
        console.error('Error saving marriages:', error.message);
    }
}

const design = {
    header: (title) => `ㅤ⋆｡˚『 ╭ \`${title}\` ╯ 』˚｡⋆\n╭`,
    line: "│",
    footer: "*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*",
    divider: "├─ׄ──⭒─ׄ─ׅ"
};

const messages = {
    marriage: [
        "Finché il Wi-Fi non vi separi! 💔",
        "Un altro paio di anime gemelle che si sono trovate su WhatsApp! 📱💖",
        "Un altro paio di anime unite dal destino... e WhatsApp! 📱",
        "Finché la batteria non vi separi! ⚡",
        "Due cuori e una connessione! 🌐"
    ],
    reject: [
        "Tranquillo, ci sono altri pesci nel mare... e su zozzap!",
        "Next! 💁‍♀️",
        "Non sei tu... sono io che merito di meglio.."
    ],
    friendzone: [
        "Amore virtuale? Non è cosa mia! 💔",
        "Proposta apprezzata, ma sono sposato con sam"
    ]
};

const getRandomMessage = (type) => {
    const messagesArray = messages[type] || [];
    return messagesArray[Math.floor(Math.random() * messagesArray.length)] || 'Messaggio non disponibile';
};

const formatMessage = (title, content) => {
    return `${design.header(title)}\n${content}\n${design.footer}`;
};

function normalizeString(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .trim();
}

function getCleanName(username) {
    return username?.split('@')[0] || 'Unknown';
}

async function getContactName(jid, conn) {
    try {
        const name = await conn.getName(jid);
        return name || getCleanName(jid);
    } catch (error) {
        console.error(`Error fetching name for ${jid}:`, error.message);
        return getCleanName(jid);
    }
}

async function createMarriageImage(user1, user2, conn, eventType) {
    const canvas = createCanvas(800, 500);
    const ctx = canvas.getContext('2d');
    const isMarriage = eventType === 'marriage';

    // Enhanced Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    if (isMarriage) {
        gradient.addColorStop(0, '#FF6F61');
        gradient.addColorStop(0.5, '#FFD1DC');
        gradient.addColorStop(1, '#FFF5EE');
    } else {
        gradient.addColorStop(0, '#4B5EAA');
        gradient.addColorStop(0.5, '#A3BFFA');
        gradient.addColorStop(1, '#E6E6FA');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Background Pattern
    if (isMarriage) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 5 + 5;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 15; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.stroke();
        }
    }

    // Load Avatars
    let img1, img2;
    const defaultAvatarUrl = 'https://i.ibb.co/BKHtdBNp/default-avatar-profile-icon-1280x1280.jpg';
    try {
        const [url1, url2] = await Promise.all([
            conn.profilePictureUrl(user1, 'image').catch(() => null),
            conn.profilePictureUrl(user2, 'image').catch(() => null)
        ]);
        img1 = url1 ? await loadImage(url1) : null;
        img2 = url2 ? await loadImage(url2) : null;
    } catch (error) {
        console.error('Error loading profile pictures:', error.message);
    }
    
    if (!img1 || !img2) {
        const defaultImg = await loadImage(defaultAvatarUrl).catch(() => null);
        img1 = img1 || defaultImg;
        img2 = img2 || defaultImg;
    }

    const leftX = 200, rightX = 600, centerY = 200, avatarRadius = 90;

    // Draw Avatar 1 with Glow
    ctx.save();
    ctx.beginPath();
    ctx.arc(leftX, centerY, avatarRadius, 0, Math.PI * 2);
    ctx.clip();
    if (img1) {
        const imgSize = Math.min(img1.width, img1.height);
        ctx.drawImage(
            img1,
            (img1.width - imgSize) / 2,
            (img1.height - imgSize) / 2,
            imgSize,
            imgSize,
            leftX - avatarRadius,
            centerY - avatarRadius,
            avatarRadius * 2,
            avatarRadius * 2
        );
    } else {
        ctx.fillStyle = isMarriage ? '#FF69B4' : '#4B5EAA';
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 50px CustomFont, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((await getContactName(user1, conn))[0]?.toUpperCase() || '?', leftX, centerY);
    }
    ctx.restore();
    // Avatar 1 Glow and Border
    ctx.beginPath();
    ctx.arc(leftX, centerY, avatarRadius, 0, Math.PI * 2);
    ctx.strokeStyle = isMarriage ? '#FF69B4' : '#4B5EAA';
    ctx.lineWidth = 6;
    ctx.shadowColor = isMarriage ? 'rgba(255, 105, 180, 0.5)' : 'rgba(75, 94, 170, 0.5)';
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw Avatar 2 with Glow
    ctx.save();
    ctx.beginPath();
    ctx.arc(rightX, centerY, avatarRadius, 0, Math.PI * 2);
    ctx.clip();
    if (img2) {
        const imgSize = Math.min(img2.width, img2.height);
        ctx.drawImage(
            img2,
            (img2.width - imgSize) / 2,
            (img2.height - imgSize) / 2,
            imgSize,
            imgSize,
            rightX - avatarRadius,
            centerY - avatarRadius,
            avatarRadius * 2,
            avatarRadius * 2
        );
    } else {
        ctx.fillStyle = isMarriage ? '#FF69B4' : '#4B5EAA';
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 50px CustomFont, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((await getContactName(user2, conn))[0]?.toUpperCase() || '?', rightX, centerY);
    }
    ctx.restore();
    // Avatar 2 Glow and Border
    ctx.beginPath();
    ctx.arc(rightX, centerY, avatarRadius, 0, Math.PI * 2);
    ctx.strokeStyle = isMarriage ? '#FF69B4' : '#4B5EAA';
    ctx.lineWidth = 6;
    ctx.shadowColor = isMarriage ? 'rgba(255, 105, 180, 0.5)' : 'rgba(75, 94, 170, 0.5)';
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Central Symbol with Glow
    ctx.shadowColor = isMarriage ? 'rgba(255, 20, 147, 0.7)' : 'rgba(105, 105, 105, 0.7)';
    ctx.shadowBlur = 20;
    if (isMarriage) {
        drawHeart(ctx, 400, 200, 50);
        // Rings with glow
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(375, 180, 25, 0, Math.PI * 2);
        ctx.stroke(); 
        ctx.beginPath();
        ctx.arc(425, 180, 25, 0, Math.PI * 2);
        ctx.stroke();
    } else {
        ctx.strokeStyle = '#696969';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(370, 170);
        ctx.lineTo(430, 230);
        ctx.moveTo(430, 170);
        ctx.lineTo(370, 230);
        ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Main Title
    ctx.fillStyle = isMarriage ? '#FF1493' : '#4B5EAA';
    ctx.font = 'bold 40px CustomFont, Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = isMarriage ? 'rgba(255, 20, 147, 0.5)' : 'rgba(75, 94, 170, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillText(isMarriage ? 'Matrimonio Celebrato!' : 'Divorzio Completato', 400, 350);
    ctx.shadowBlur = 0;

    // Names
    ctx.font = 'bold 28px CustomFont, Arial';
    ctx.fillStyle = '#2C2C2C';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 8;
    const user1Name = (await getContactName(user1, conn)).slice(0, 15);
    const user2Name = (await getContactName(user2, conn)).slice(0, 15);
    const separator = isMarriage ? ' ♥ ' : ' ✗ ';
    const text = `${user1Name}${separator}${user2Name}`;
    const maxWidth = 600;
    const textMetrics = ctx.measureText(text);
    if (textMetrics.width > maxWidth) {
        ctx.font = 'bold 24px CustomFont, Arial';
    }
    ctx.fillText(text, 400, 390);
    ctx.shadowBlur = 0;

    // Date
    ctx.font = '20px CustomFont, Arial';
    ctx.fillStyle = '#666666';
    const date = new Date().toLocaleDateString('it-IT');
    ctx.fillText(date, 400, 420);

    // Decorative Border with Glow
    ctx.strokeStyle = isMarriage ? '#FF69B4' : '#4B5EAA';
    ctx.lineWidth = 8;
    ctx.shadowColor = isMarriage ? 'rgba(255, 105, 180, 0.5)' : 'rgba(75, 94, 170, 0.5)';
    ctx.shadowBlur = 15;
    ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);
    ctx.shadowBlur = 0;

    return canvas.toBuffer('image/png');
}

function drawHeart(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 20, size / 20);

    ctx.fillStyle = '#FF69B4';
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.bezierCurveTo(-6, 0, -6, -6, 0, -6);
    ctx.bezierCurveTo(6, -6, 6, 0, 0, 6);
    ctx.moveTo(0, 6);
    ctx.bezierCurveTo(6, 0, 6, -6, 0, -6);
    ctx.bezierCurveTo(-6, -6, -6, 0, 0, 6);
    ctx.fill();

    ctx.restore();
}

if (!global.pendingResponses) global.pendingResponses = {};
if (!global.marriage_proposals) global.marriage_proposals = {};

let handler = async (m, { conn, command }) => {
    try {
        if (command === 'sposa') {
            const proposee = m.quoted?.sender || m.mentionedJid?.[0];
            const proposer = m.sender;

            // Normalize JIDs to LID
            const senderInfo = getSenderLid(m);
            const proposerLid = conn.decodeJid(senderInfo.lid || proposer);
            const proposeeLid = proposee ? conn.decodeJid(proposee) : null;

            if (!proposee) {
                return m.reply(formatMessage('ERRORE ⚠️',
                    `${design.line} 『 ❗ 』 \`Errore:\` *Non hai taggato nessuno!*\n` +
                    `${design.line} 『 ❓ 』 \`Usa:\` *.sposa @utente*`
                ));
            }

            if (proposee === conn.user.jid) {
                return m.reply(formatMessage('FRIENDZONE 🤖',
                    `${design.line} 『 😅 』 \`Esito:\` *${getRandomMessage('friendzone')}*`
                ));
            }

            // Check if user is registered
            const proposerUser = global.db.data.users[proposerLid];
            if (!proposerUser || !proposerUser.registered) {
                return m.reply(formatMessage('NON REGISTRATO',
                    `${design.line} 『 ❗ 』 \`Errore:\` *Non sei registrato/a, registrati per usare questa funzione*\n` +
                    `${design.line} 『 ❓ 』 \`Formato:\` *nome età*\n` +
                    `${design.line} 『 📝 』 \`Esempio:\` *.reg Felix 26*`
                ));
            }

            if (marriages[proposerLid]) {
                const partnerName = await getContactName(marriages[proposerLid], conn);
                return m.reply(formatMessage('GIÀ SPOSATO 💑',
                    `${design.line} 『 💍 』 \`Stato:\` *Sei già sposato con*\n` +
                    `${design.line} 『 👤 』 \`Utente:\` *${partnerName}*`
                ), null, { mentions: [marriages[proposerLid]] });
            }

            if (Object.values(global.marriage_proposals).some(proposal => proposal.proposer === proposer)) {
                return m.reply(formatMessage('PROPOSTA IN CORSO ⏳',
                    `${design.line} 『 ❗ 』 \`Errore:\` *Hai già una proposta di matrimonio in corso!*\n` +
                    `${design.line} 『 ❓ 』 \`Attendi:\` *Aspetta che la proposta attuale scada o venga risposta.*`
                ));
            }

            const proposerName = await getContactName(proposer, conn);
            const proposeeName = await getContactName(proposee, conn);
            const proposalMsg = formatMessage('PROPOSTA DI MATRIMONIO 💍',
                `${design.line} 『 💌 』 \`Da:\` *${proposerName}* 🤵\n` +
                `${design.line} 『 💖 』 \`Per:\` *${proposeeName}* 👰\n` +
                `${design.divider}\n` +
                `${design.line} 『 ❓ 』 \`Rispondi con:\`\n` +
                `${design.line} 『 ✅ 』 \`SÌ:\` *per accettare* 💕\n` +
                `${design.line} 『 ❌ 』 \`NO:\` *per rifiutare* 💔\n` +
                `${design.line}\n` +
                `${design.line} 『 ⏳ 』 \`Tempo:\` *60 secondi rimanenti*`
            );

            const msg = await conn.sendMessage(m.chat, {
                text: proposalMsg,
                mentions: [proposer, proposee],
                footer: '',
                buttons: [
                    { buttonId: `accept_${proposee}`, buttonText: { displayText: 'Si, lo voglio.' }, type: 1 },
                    { buttonId: `reject_${proposee}`, buttonText: { displayText: 'NO 💔' }, type: 1 }
                ],
                headerType: 1
            }, { quoted: m });

            global.marriage_proposals[proposeeLid] = {
                proposer: proposerLid,
                msgId: msg.key.id,
                chat: m.chat,
                timeout: setTimeout(async () => {
                    delete global.marriage_proposals[proposeeLid];
                    await conn.reply(m.chat, formatMessage('TEMPO SCADUTO',
                        `${design.line} 『 🌸 』 \`Esito:\` *Proposta sfumata...*`
                    ), msg);
                }, 60000)
            };
        } else if (command === 'divorzia') {
            // Normalize JID to LID
            const senderInfo = getSenderLid(m);
            const senderLid = conn.decodeJid(senderInfo.lid || m.sender);

            // Check if user is registered
            const senderUser = global.db.data.users[senderLid];
            if (!senderUser || !senderUser.registered) {
                return m.reply(formatMessage('NON REGISTRATO',
                    `${design.line} 『 ❗ 』 \`Errore:\` *Non sei registrato/a, registrati per usare questa funzione*\n` +
                    `${design.line} 『 ❓ 』 \`Formato:\` *nome età*\n` +
                    `${design.line} 『 📝 』 \`Esempio:\` *.reg Felix 26*`
                ));
            }

            if (!marriages[senderLid]) {
                return m.reply(formatMessage('NON SPOSATO',
                    `${design.line} 『 ❗ 』 \`Stato:\` *Non sei sposato/a!*`
                ));
            }

            const partner = marriages[senderLid];
            const userName = await getContactName(m.sender, conn);
            const partnerName = await getContactName(partner, conn);
            delete marriages[senderLid];
            delete marriages[partner];
            saveMarriages();

            const divorceImage = await createMarriageImage(m.sender, partner, conn, 'divorce');
            await conn.sendMessage(m.chat, {
                image: divorceImage,
                caption: formatMessage('DIVORZIO',
                    `${design.line} 『 👤 』 \`Utente:\` *${userName}*\n` +
                    `${design.line} 『 👤 』 \`Ex-partner:\` *${partnerName}*\n` +
                    `${design.line} 『 ❗ 』 \`Stato:\` *non sono più sposati*\n` +
                    `${design.line}\n` +
                    `${design.line} 『 ✨ 』 \`Nota:\` *Troverete di meglio*`
                ),
                mentions: [m.sender, partner]
            });

            await m.react('💔');
        }
    } catch (e) {
        console.error('Error in handler:', e);
        await m.reply(formatMessage('ERRORE ❌',
            `${design.line} 『 ❗ 』 \`Errore:\` *Errore nell'esecuzione del comando*`
        ));
    }
};

handler.before = async (m, { conn }) => {
    // Normalize sender JID to LID
    const senderInfo = getSenderLid(m);
    const senderLid = conn.decodeJid(senderInfo.lid || m.sender);

    if (!global.marriage_proposals || !global.marriage_proposals[senderLid]) return;

    const proposal = global.marriage_proposals[senderLid];
    let proposalHandled = false;

    const buttonId = m.message?.buttonsResponseMessage?.selectedButtonId;
    if (buttonId) {
        if (buttonId === `accept_${m.sender}`) {
            clearTimeout(proposal.timeout);
            marriages[proposal.proposer] = m.sender;
            marriages[m.sender] = proposal.proposer;
            saveMarriages();

            const proposerName = await getContactName(proposal.proposer, conn);
            const proposeeName = await getContactName(m.sender, conn);
            const marriageImage = await createMarriageImage(proposal.proposer, m.sender, conn, 'marriage');
            await m.react('💝');
            await conn.sendMessage(proposal.chat, {
                image: marriageImage,
                caption: formatMessage('MATRIMONIO',
                    `${design.line} 『 👰 』 \`Sposa:\` *${proposeeName}*\n` +
                    `${design.line} 『 🤵 』 \`Sposo:\` *${proposerName}*\n` +
                    `${design.line}\n` +
                    `${design.line} 『 🎈 』 \`Messaggio:\` *${getRandomMessage('marriage')}*`
                ),
                mentions: [m.sender, proposal.proposer]
            });

            proposalHandled = true;
            delete global.marriage_proposals[senderLid];
        } else if (buttonId === `reject_${m.sender}`) {
            clearTimeout(proposal.timeout);
            const proposerName = await getContactName(proposal.proposer, conn);
            const proposeeName = await getContactName(m.sender, conn);
            await conn.reply(proposal.chat, formatMessage('RIFIUTATA',
                `${design.line} 『 👤 』 \`Utente:\` *${proposeeName}* ha rifiutato\n` +
                `${design.line} 『 💌 』 \`Proposta di:\` *${proposerName}*\n` +
                `${design.line}\n` +
                `${design.line} 『 😔 』 \`Messaggio:\` *${getRandomMessage('reject')}*`
            ), null, { mentions: [m.sender, proposal.proposer] });

            proposalHandled = true;
            delete global.marriage_proposals[senderLid];
        }
        return;
    }

    if (!proposalHandled && m.quoted && m.quoted.id === proposal.msgId && m.message?.conversation) {
        const answer = normalizeString(m.text);
        if (answer === 'si' || answer === 'sì') {
            clearTimeout(proposal.timeout);
            marriages[proposal.proposer] = m.sender;
            marriages[m.sender] = proposal.proposer;
            saveMarriages();

            const proposerName = await getContactName(proposal.proposer, conn);
            const proposeeName = await getContactName(m.sender, conn);
            const marriageImage = await createMarriageImage(proposal.proposer, m.sender, conn, 'marriage');
            await m.react('💝');
            await conn.sendMessage(proposal.chat, {
                image: marriageImage,
                caption: formatMessage('MATRIMONIO',
                    `${design.line} 『 👰 』 \`Sposa:\` *${proposeeName}*\n` +
                    `${design.line} 『 🤵 』 \`Sposo:\` *${proposerName}*\n` +
                    `${design.line}\n` +
                    `${design.line} 『 ❗ 』 \`Messaggio:\` *${getRandomMessage('marriage')}*`
                ),
                mentions: [m.sender, proposal.proposer]
            });

            delete global.marriage_proposals[senderLid];
        } else if (answer === 'no') {
            clearTimeout(proposal.timeout);
            const proposerName = await getContactName(proposal.proposer, conn);
            const proposeeName = await getContactName(m.sender, conn);
            await conn.reply(proposal.chat, formatMessage('RIFIUTATA',
                `${design.line} 『 👤 』 \`Utente:\` *${proposeeName}* ha rifiutato\n` +
                `${design.line} 『 💌 』 \`Proposta di:\` *${proposerName}*\n` +
                `${design.line}\n` +
                `${design.line} 『 😔 』 \`Messaggio:\` *${getRandomMessage('reject')}*`
            ), null, { mentions: [m.sender, proposal.proposer] });

            delete global.marriage_proposals[senderLid];
        }
    }
};

handler.help = ['sposa @tag', 'divorzia'];
handler.tags = ['giochi'];
handler.command = /^(sposa|marry|divorzia)$/i;
handler.group = true;
handler.register = true;
export default handler;
