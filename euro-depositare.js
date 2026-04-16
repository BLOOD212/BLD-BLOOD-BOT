import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const DEPOSIT_MESSAGES = [
    'Transazione sicura',
    'Crittografia dati',
    'Trasferimento nel caveau',
    'Finalizzazione'
];

// Funzione per convertire componente in HTML string
const renderDepositHTML = (props) => {
    const componentHTML = `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deposit</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', 'Segoe UI', 'Roboto', sans-serif; }
        
        @keyframes pulse-glow {
            0% { box-shadow: 0 5px 25px rgba(0,255,127,0.3), 0 0 0 0px rgba(0, 255, 127, 0.7); }
            50% { box-shadow: 0 5px 25px rgba(0,255,127,0.5), 0 0 0 10px rgba(0, 255, 127, 0.3); }
            100% { box-shadow: 0 5px 25px rgba(0,255,127,0.3), 0 0 0 0px rgba(0, 255, 127, 0); }
        }
        
        @keyframes glow {
            0%, 100% { text-shadow: 0 0 10px #7DF9FF, 0 0 20px #7DF9FF, 0 0 30px #7DF9FF; }
            50% { text-shadow: 0 0 20px #7DF9FF, 0 0 30px #7DF9FF, 0 0 40px #7DF9FF; }
        }
        
        @keyframes grid-move {
            0% { transform: translateX(0) translateY(0); }
            100% { transform: translateX(100px) translateY(100px); }
        }
        
        .container {
            width: 1080px;
            height: 1080px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            background: linear-gradient(145deg, #0d1120, #2c3e50);
            position: relative;
            overflow: hidden;
        }
        
        .bg-grid {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent 98px,
                    rgba(74, 0, 224, 0.1) 100px
                ),
                repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 98px,
                    rgba(74, 0, 224, 0.1) 100px
                );
            animation: grid-move 20s linear infinite;
            z-index: 0;
        }
        
        .checkmark {
            position: absolute;
            top: 40px;
            left: 40px;
            z-index: 10;
            filter: drop-shadow(0 0 8px #00ff7f);
        }
        
        .info-badge {
            position: absolute;
            top: 40px;
            right: 40px;
            background: rgba(255, 255, 255, 0.15);
            padding: 15px 20px;
            border-radius: 15px;
            font-size: 14px;
            text-align: center;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 10;
        }
        
        .main-content {
            z-index: 5;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
        }
        
        .profile-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 30px;
        }
        
        .profile-pic {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid #00ff7f;
            animation: pulse-glow 2.5s ease-out infinite;
        }
        
        .username {
            margin-top: 15px;
            font-size: 34px;
            font-weight: 600;
            text-shadow: 0 2px 5px rgba(0,0,0,0.5);
        }
        
        .amount-box {
            background: rgba(255, 255, 255, 0.05);
            padding: 25px 50px;
            border-radius: 20px;
            margin-bottom: 25px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        
        .amount-main {
            font-size: 52px;
            font-weight: bold;
            text-align: center;
            animation: glow 2s ease-in-out infinite;
        }
        
        .amount-sub {
            font-size: 22px;
            text-align: center;
            opacity: 0.8;
            margin-top: 8px;
        }
        
        .balance-box {
            background: rgba(0,0,0,0.25);
            padding: 30px;
            border-radius: 20px;
            width: 90%;
            max-width: 550px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        
        .balance-row {
            font-size: 26px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .balance-row:first-child {
            margin-bottom: 15px;
        }
        
        .wallet-amount { color: #7DF9FF; font-weight: bold; }
        .bank-amount { color: #00ff7f; font-weight: bold; }
        
        .footer {
            z-index: 5;
            position: absolute;
            bottom: 40px;
            text-align: center;
        }
        
        .footer-message {
            font-size: 20px;
            font-style: italic;
            opacity: 0.9;
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }
        
        .footer-timestamp {
            font-size: 16px;
            opacity: 0.7;
            margin-top: 5px;
        }
        
        .watermark {
            position: absolute;
            bottom: 15px;
            right: 20px;
            font-size: 14px;
            opacity: 0.4;
            font-weight: 500;
            z-index: 10;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="bg-grid"></div>
        
        <svg class="checkmark" width="60" height="60" viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="25" fill="#00ff7f" opacity="0.2"/>
            <path d="M14 27 L 22 35 L 38 18" fill="none" stroke="white" stroke-width="5" stroke-linecap="round"/>
        </svg>
        
        <div class="info-badge">
            💰 Deposito Sicuro<br/>
            🔒 Transazione Protetta
        </div>
        
        <div class="main-content">
            <div class="profile-section">
                <img src="${props.profilePictureUrl}" class="profile-pic" alt="Profile">
                <div class="username">${props.userName}</div>
            </div>
            
            <div class="amount-box">
                <div class="amount-main">${props.amount} 🌟</div>
                <div class="amount-sub">Importo Depositato</div>
            </div>
            
            <div class="balance-box">
                <div class="balance-row">
                    <span>💼 Portafoglio</span>
                    <span class="wallet-amount">${props.walletBalance} 🌟</span>
                </div>
                <div class="balance-row">
                    <span>🏦 In Banca</span>
                    <span class="bank-amount">${props.bankBalance} 🌟</span>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-message">${props.message}</div>
            <div class="footer-timestamp">${props.timestamp}</div>
        </div>
        
        <div class="watermark">✧˚🩸 varebot 🕊️˚✧</div>
    </div>
</body>
</html>`;
    return componentHTML;
};

// Funzione per creare screenshot con Puppeteer
const createDepositImage = async (props, browserInstance = null) => {
    let browser = browserInstance;
    let shouldCloseBrowser = !browser;

    if (!browser) {
        browser = await puppeteer.launch({ 
            headless: true, 
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox', 
                '--disable-dev-shm-usage', 
                '--disable-gpu',
                '--disable-web-security',
                '--font-render-hinting=none'
            ]
        });
    }

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });
        await page.setDefaultTimeout(15000);

        const html = renderDepositHTML(props);
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
        // Attendi che le animazioni CSS si carichino
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const screenshotPath = path.resolve(`./temp/deposit_${Date.now()}.png`);

        await page.screenshot({
            path: screenshotPath,
            type: 'png',
            fullPage: false,
            clip: {
                x: 0,
                y: 0,
                width: 1080,
                height: 1080
            }
        });

        await page.close();
        return screenshotPath;
    } finally {
        if (shouldCloseBrowser && browser) {
            await browser.close();
        }
    }
};

let handler = async (m, { args, conn }) => {
    let user = global.db.data.users[m.sender];
    const formatCurrency = (n) => n.toLocaleString('it-IT');

    if (!args[0]) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return m.reply(`
ㅤㅤ⋆｡˚『 ╭ \`DEPOSITO\` ╯ 』˚｡⋆\n╭\n│
│ 『 💎 』 *\`euro disponibili:\`* *${user.euro || 0}*
│ 『 🏦 』 *\`euro in banca:\`* *${user.bank || 0}*
│
│ 『 📝 』 _*Comandi disponibili:*_
│ • \`.deposita [quantità]\`
│ • \`.deposita all\`
│
│ 『 💡 』 _*Esempio:*_
│ \`.deposita 1000\`
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`);
    }

    let count;
    if (args[0].toLowerCase() === 'all') {
        count = parseInt(user.euro);
        if (!count || count < 1) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply('『 ❌ 』- Non hai euro da depositare.');
        }
    } else {
        count = parseInt(args[0].replace(/\./g, ''));
        if (isNaN(count) || count < 1) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply('『 ❌ 』- Quantità non valida.');
        }
        if (!user.euro || user.euro < count) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply(`『 ❌ 』- Fondi insufficienti. Disponibili: ${formatCurrency(user.euro || 0)}`);
        }
    }

    await conn.sendMessage(m.chat, { react: { text: '🏛️', key: m.key } });

    user.euro -= count;
    user.bank = (user.bank || 0) + count;

    const randomMessage = DEPOSIT_MESSAGES[Math.floor(Math.random() * DEPOSIT_MESSAGES.length)];
    const timestamp = new Date().toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' });
    const successMessage = `✅ *Deposito di ${formatCurrency(count)} 🌟 completato!*\n\n💰 *Nuovo saldo in banca:* ${formatCurrency(user.bank)} 🌟\n💳 *Rimasto nel portafoglio:* ${formatCurrency(user.euro)} 🌟`;

    const userName = user.name || m.pushName || 'Utente';
    let profilePictureUrl = 'https://i.ibb.co/3dBJbx8/default-avatar.png';

    try {
        const pfpBuffer = await conn.profilePictureUrl(m.sender, 'image');
        const response = await axios.get(pfpBuffer, { responseType: 'arraybuffer' });
        const base64 = Buffer.from(response.data, 'binary').toString('base64');
        profilePictureUrl = `data:image/jpeg;base64,${base64}`;
    } catch (e) {
        console.log('Usando immagine profilo di default');
    }

    const mediaProps = {
        amount: formatCurrency(count),
        walletBalance: formatCurrency(user.euro),
        bankBalance: formatCurrency(user.bank),
        message: randomMessage,
        timestamp,
        userName,
        profilePictureUrl
    };

    const buttons = [
        { buttonId: '.inventario', buttonText: { displayText: '💰 Vedi Saldo' }, type: 1 },
        { buttonId: '.ritira tutto', buttonText: { displayText: '🏧 Ritira Tutto' }, type: 1 },
    ];

    let mediaPath = null;
    try {
        // Crea la directory temp se non esiste
        const tempDir = path.resolve('./temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        mediaPath = await createDepositImage(mediaProps, conn.browser);
        const mediaBuffer = fs.readFileSync(mediaPath);
        
        await conn.sendMessage(m.chat, { 
            image: mediaBuffer, 
            caption: successMessage, 
            footer: '✧BloodBot✧', 
            buttons: buttons, 
            headerType: 4 
        }, { quoted: m });
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (error) {
        console.error("Errore nella creazione dell'immagine:", error);
        await conn.sendMessage(m.chat, { 
            text: successMessage, 
            footer: '✧BloodBot✧', 
            buttons: buttons, 
            headerType: 1 
        }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } finally {
        // Cleanup
        if (mediaPath && fs.existsSync(mediaPath)) {
            try { 
                fs.unlinkSync(mediaPath); 
            } catch (e) {
                console.log('Errore durante cleanup:', e.message);
            }
        }
    }
};

handler.help = ['depositare'];
handler.tags = ['euro'];
handler.command = ['deposita', 'depositare', 'dep'];
handler.register = true;

export default handler;
