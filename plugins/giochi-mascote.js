import { createCanvas, loadImage } from 'canvas';

const specieMascot = {
    cane: {
        emoji: '🐶', label: 'Cane 🐶',
        versi: ['Bau! 🐾', '*muove la coda felice*', '*ti guarda fisso aspettando i croccantini* 🍖'],
        versiMalato: ['*guaisce molto debolmente... ha bisogno di cure* 😢'],
        immagini: { felice: 'https://i.imgur.com/w3X6N6Y.png', triste: 'https://i.imgur.com/rXb2Z91.png', malato: 'https://i.imgur.com/8Yv6Zg8.png' }
    },
    gatto: {
        emoji: '🐱', label: 'Gatto 🐱',
        versi: ['Miao~ 🐾', '*fa le fusa e si strofina sulle tue gambe*', '*ti fissa con superiorità* 🐟'],
        versiMalato: ['*miagola debolmente rannicchiato in un angolo* 😢'],
        immagini: { felice: 'https://i.imgur.com/vH9Z97G.png', triste: 'https://i.imgur.com/E8WbLka.png', malato: 'https://i.imgur.com/M6LgO0b.png' }
    },
    serpente: {
        emoji: '🐍', label: 'Serpente 🐍',
        versi: ['Sssss~ 🐍', '*striscia sinuosamente*', '*tira fuori la lingua biforcuta* 🐀'],
        versiMalato: ['*rimane immobile arrotolato su se stesso* 🥺'],
        immagini: { felice: 'https://i.imgur.com/4eNOnU9.png', triste: 'https://i.imgur.com/VkeB64z.png', malato: 'https://i.imgur.com/XkMvHwz.png' }
    },
    criceto: {
        emoji: '🐹', label: 'Criceto 🐹',
        versi: ['Squitt! 🐹', '*gira velocissimo sulla ruota*', '*riempie le guance di semi* 🌻'],
        versiMalato: ['*trema debolmente sotto la segatura* 😢'],
        immagini: { felice: 'https://i.imgur.com/2m6D8F8.png', triste: 'https://i.imgur.com/MhO7Awb.png', malato: 'https://i.imgur.com/pZqNrw9.png' }
    },
    coniglio: {
        emoji: '🐰', label: 'Coniglio 🐰',
        versi: ['*muove il nasino velocemente* 🐰', '*fa un piccolo balzo di gioia*', '*rosicchia una foglia* 🥕'],
        versiMalato: ['*tiene le orecchie basse e non si muove* 🥺'],
        immagini: { felice: 'https://i.imgur.com/wIitwKx.png', triste: 'https://i.imgur.com/uR27k4b.png', malato: 'https://i.imgur.com/5yGbKwD.png' }
    }
};

const shopConfig = {
    cibo: { nome: '🍖 Cibo Premium', prezzo: 20 },
    acqua: { nome: '💧 Acqua Fresca', prezzo: 10 },
    gioco: { nome: '🧸 Pallina / Gioco', prezzo: 15 }
};

const specieButtons = () => [
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Cane 🐶', id: '.mascot adotta cane' }) },
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Gatto 🐱', id: '.mascot adotta gatto' }) },
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Serpente 🐍', id: '.mascot adotta serpente' }) },
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Criceto 🐹', id: '.mascot adotta criceto' }) },
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Coniglio 🐰', id: '.mascot adotta coniglio' }) }
];

const giocoButtons = (cmd, isSleeping) => {
    if (isSleeping) return [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '💤 Shhh... Sta dormendo', id: `.${cmd}` }) }];
    return [
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🛒 Mascot Shop', id: `.${cmd} shop` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🧸 Gioca / Accudisci', id: `.${cmd} menu` }) }
    ];
};

let handler = async (m, { conn, args, usedPrefix, command, isAdmin }) => {
    global.fufiStats = global.fufiStats || {};
    let fufi = global.fufiStats[m.chat];
    let sottoComando = args[0]?.toLowerCase();

    let oraCorrente = new Date().getHours();
    let isSleeping = oraCorrente >= 0 && oraCorrente < 10;

    if (!fufi) {
        if (sottoComando === 'adotta') {
            if (!isAdmin && !m.fromMe) return m.reply('❌ *Solo gli admin possono avviare l\'adozione!*');
            let scelta = args[1]?.toLowerCase();
            if (!scelta || !specieMascot[scelta]) return m.reply('⚠️ *Specie non valida!*');

            global.fufiStats[m.chat] = {
                attivo: false, faseNome: true, specie: scelta, morto: false, nome: 'Mascotte', salute: 100,
                ultimoPasto: Date.now(), ultimoBeveraggio: Date.now(), ultimoGioco: Date.now(),
                inventario: { cibo: 0, acqua: 0, gioco: 0 }
            };

            let setupText = `ㅤ⋆｡˚『 ╭ \`✨ ADOZIONE AVVIATA!\` ╯ 』˚｡⋆\n╭\n`;
            setupText += `│ ${specieMascot[scelta].emoji} *Avete scelto un ${specieMascot[scelta].label}!*\n│\n`;
            setupText += `│ 📝 Scegliete il suo nome digitando: \`${usedPrefix}${command} [Nome]\`\n`;
            setupText += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;
            return m.reply(setupText);
        }

        let introText = `ㅤ⋆｡˚『 ╭ \`🐾 IL TAMAGOTCHI DEL GRUPPO 🐾\` ╯ 』˚｡⋆\n╭\n`;
        introText += `│ 🤔 *Questo gruppo non ha ancora adottato una mascotte!*\n│\n`;
        introText += `│ _Scegli quale animale accudire tramite i bottoni qui sotto:_ \n`;
        introText += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;
        return await conn.sendMessage(m.chat, { text: introText, footer: ' can𝐁𝐋𝐎𝐎𝐃-𝐁𝐎𝐓', interactiveButtons: specieButtons() }, { quoted: m });
    }

    if (fufi.faseNome) {
        let nomeScelto = args.join(' ').trim();
        if (!nomeScelto || sottoComando === 'adotta') return m.reply(`⚠️ Usa: \`${usedPrefix}${command} [Nome]\``);
        if (nomeScelto.length > 15) return m.reply('❌ Nome troppo lungo (Max 15 caratteri).');

        fufi.nome = nomeScelto; fufi.faseNome = false; fufi.attivo = true;
        fufi.ultimoPasto = Date.now(); fufi.ultimoBeveraggio = Date.now(); fufi.ultimoGioco = Date.now();

        let sp = specieMascot[fufi.specie];
        return m.reply(`🎉 *${fufi.nome}* (${sp.emoji}) è ora la mascotte ufficiale del gruppo!\nUsa \`${usedPrefix}${command}\` per vedere la scheda.`);
    }

    const treOre = 3 * 60 * 60 * 1000; 
    const oraAttuale = Date.now();
    let infoSpecie = specieMascot[fufi.specie];

    if (!fufi.morto && !isSleeping) {
        let oreSenzaCibo = (oraAttuale - fufi.ultimoPasto) / treOre;
        let oreSenzaAcqua = (oraAttuale - fufi.ultimoBeveraggio) / treOre;
        let oreSenzaGioco = (oraAttuale - fufi.ultimoGioco) / treOre;

        let danno = 0;
        if (oreSenzaCibo > 1) danno += Math.floor((oreSenzaCibo - 1) * 15);
        if (oreSenzaAcqua > 1) danno += Math.floor((oreSenzaAcqua - 1) * 15);
        if (oreSenzaGioco > 1.5) danno += Math.floor((oreSenzaGioco - 1.5) * 5);

        if (danno > 0) fufi.salute = Math.max(0, fufi.salute - danno);
        if (fufi.salute <= 0) fufi.morto = true;
    } else if (isSleeping) {
        fufi.ultimoPasto = oraAttuale; fufi.ultimoBeveraggio = oraAttuale; fufi.ultimoGioco = oraAttuale;
    }

    if (fufi.morto) {
        if (sottoComando === 'rianima') {
            if (!isAdmin && !m.fromMe) return m.reply('❌ Solo gli admin.');
            let costoRianima = 200;
            let soldiUtente = global.db.data.users[m.sender]?.bandiere || 0;
            if (soldiUtente < costoRianima) return m.reply(`❌ Ti servono ${costoCianima} bandiere 🚩.`);
            global.db.data.users[m.sender].bandiere -= costoRianima;
            fufi.morto = false; fufi.salute = 60; fufi.ultimoPasto = Date.now(); fufi.ultimoBeveraggio = Date.now(); fufi.ultimoGioco = Date.now();
            return m.reply(`❤️ *Veterinario:* Rianimato con successo! (-${costoCianima} 🚩)`);
        }
        return m.reply(`💀 *${fufi.nome}* è morto. Digita \`${usedPrefix}${command} rianima\` (Costo: 200 🚩) per salvarlo.`);
    }

    if (isSleeping && ['dai', 'shop', 'compra', 'gioca', 'menu'].includes(sottoComando)) {
        return m.reply(`💤 *${fufi.nome} sta dormendo profondamente...* Lascialo riposare fino alle 10:00 del mattino!`);
    }

    if (sottoComando === 'shop') {
        let shopText = `ㅤ⋆｡˚『 ╭ \`🛒 MASCOT SHOP - DI BLOOD-BOT\` ╯ 』˚｡⋆\n╭\n`;
        shopText += `│ 🚩 *Bilancio Personale:* ${global.db.data.users[m.sender]?.bandiere || 0} 🚩\n│\n`;
        shopText += `│ 🍖 *${shopConfig.cibo.nome}* -> ${shopConfig.cibo.prezzo} 🚩 \n│ └ Comando: \`${usedPrefix}${command} compra cibo\`\n`;
        shopText += `│ 💧 *${shopConfig.acqua.nome}* -> ${shopConfig.acqua.prezzo} 🚩 \n│ └ Comando: \`${usedPrefix}${command} compra acqua\`\n`;
        shopText += `│ 🧸 *${shopConfig.gioco.nome}* -> ${shopConfig.gioco.prezzo} 🚩 \n│ └ Comando: \`${usedPrefix}${command} compra gioco\`\n│\n`;
        shopText += `│ 🎒 \`Dispensa di gruppo:\` Cibo: [${fufi.inventario.cibo}] | Acqua: [${fufi.inventario.acqua}] | Giochi: [${fufi.inventario.gioco}]\n`;
        shopText += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;
        return m.reply(shopText);
    }

    if (sottoComando === 'compra') {
        let item = args[1]?.toLowerCase();
        if (!item || !shopConfig[item]) return m.reply(`⚠️ Scegli cosa comprare: \`cibo\`, \`acqua\` o \`gioco\`.`);
        let costo = shopConfig[item].prezzo;
        let soldiUtente = global.db.data.users[m.sender]?.bandiere || 0;
        if (soldiUtente < costo) return m.reply(`❌ Non hai abbastanza bandiere (${costo} 🚩 necessarie).`);

        if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {};
        global.db.data.users[m.sender].bandiere -= costo;
        fufi.inventario[item] += 1;
        return m.reply(`🛒 Acquistato 1x *${shopConfig[item].nome}*! Aggiunto alla dispensa. Usa \`${usedPrefix}${command} dai ${item}\``);
    }

    if (sottoComando === 'dai') {
        let item = args[1]?.toLowerCase();
        if (!item || !shopConfig[item]) return m.reply(`⚠️ Specifica cosa dare: \`cibo\`, \`acqua\` o \`gioco\`.`);
        if (fufi.inventario[item] <= 0) return m.reply(`❌ Dispensa vuota per questo oggetto! Compralo prima nel \`${usedPrefix}${command} shop\``);

        fufi.inventario[item] -= 1;
        let outputMsg = '';

        if (item === 'cibo') {
            fufi.ultimoPasto = Date.now(); fufi.salute = Math.min(100, fufi.salute + 15);
            outputMsg = `🍖 *@${m.sender.split('@')[0]}* ha dato da mangiare a ${fufi.nome}!`;
        } else if (item === 'acqua') {
            fufi.ultimoBeveraggio = Date.now(); fufi.salute = Math.min(100, fufi.salute + 10);
            outputMsg = `💧 *@${m.sender.split('@')[0]}* ha dissetato ${fufi.nome}!`;
        } else if (item === 'gioco') {
            fufi.ultimoGioco = Date.now(); fufi.salute = Math.min(100, fufi.salute + 5);
            outputMsg = `🧸 *@${m.sender.split('@')[0]}* ha usato un gioco per far felice ${fufi.nome}!`;
        }

        return await conn.sendMessage(m.chat, { text: outputMsg, mentions: [m.sender] }, { quoted: m });
    }

    if (sottoComando === 'menu') {
        let mText = `📦 *AZIONI DISPONIBILI PER ${fufi.nome.toUpperCase()}*\n\n`;
        mText += `🍖 Nutri: \`${usedPrefix}${command} dai cibo\` (Disponibili: ${fufi.inventario.cibo})\n`;
        mText += `💧 Disseta: \`${usedPrefix}${command} dai acqua\` (Disponibili: ${fufi.inventario.acqua})\n`;
        mText += `🧸 Diverti: \`${usedPrefix}${command} dai gioco\` (Disponibili: ${fufi.inventario.gioco})\n`;
        return m.reply(mText);
    }

    try {
        let percCibo = isSleeping ? 100 : Math.max(0, Math.min(100, Math.floor(((treOre - (oraAttuale - fufi.ultimoPasto)) / treOre) * 100)));
        let percAcqua = isSleeping ? 100 : Math.max(0, Math.min(100, Math.floor(((treOre - (oraAttuale - fufi.ultimoBeveraggio)) / treOre) * 100)));
        let percGioco = isSleeping ? 100 : Math.max(0, Math.min(100, Math.floor(((treOre - (oraAttuale - fufi.ultimoGioco)) / treOre) * 100)));
        let percFelice = Math.floor((percCibo + percAcqua + percGioco) / 3);

        const canvas = createCanvas(620, 390);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = isSleeping ? '#0b0b16' : '#111116';
        ctx.fillRect(0, 0, 620, 390);
        
        ctx.strokeStyle = isSleeping ? '#1f3d7a' : '#bc0606';
        ctx.lineWidth = 6;
        ctx.strokeRect(12, 12, 596, 366);

        let avatarUrl = infoSpecie.immagini.felice;
        let statoUmore = 'Felice e Sazio ✨';

        if (isSleeping) {
            statoUmore = 'Sta dormendo... 💤';
        } else {
            if (fufi.salute < 40) { avatarUrl = infoSpecie.immagini.malato; statoUmore = 'Pessimo / Sta male 🤒'; }
            else if (percFelice < 40) { avatarUrl = infoSpecie.immagini.triste; statoUmore = 'Triste / Annoiato 🥺'; }
            else if (percCibo < 30) { avatarUrl = infoSpecie.immagini.triste; statoUmore = 'Molta fame 🥺'; }
            else if (percAcqua < 30) { avatarUrl = infoSpecie.immagini.triste; statoUmore = 'Molta sete 💧'; }
        }

        try {
            const avatar = await loadImage(avatarUrl);
            ctx.drawImage(avatar, 45, 60, 150, 150);
        } catch {
            ctx.fillStyle = isSleeping ? '#1f3d7a' : '#bc0606';
            ctx.beginPath(); ctx.arc(120, 135, 65, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffffff'; ctx.font = 'bold 22px Arial'; ctx.fillText(fufi.nome.substring(0,6).toUpperCase(), 85, 142);
        }

        if (isSleeping) {
            ctx.fillStyle = '#4da6ff'; ctx.font = 'bold 20px Arial'; ctx.fillText('z', 175, 65);
            ctx.font = 'bold 26px Arial'; ctx.fillText('Z', 190, 50);
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 26px Arial';
        ctx.fillText(`${infoSpecie.emoji} ${fufi.nome.toUpperCase()}`, 225, 65);

        ctx.font = '15px Arial'; ctx.fillStyle = '#aaaaaa';
        ctx.fillText(`Razza: ${infoSpecie.label}  |  Umore: `, 225, 95);
        ctx.fillStyle = isSleeping ? '#4da6ff' : (fufi.salute < 40 ? '#ff3333' : '#33ff33');
        ctx.fillText(statoUmore, ctx.measureText(`Razza: ${infoSpecie.label}  |  Umore: `).width + 225, 95);

        const drawBar = (label, value, x, y) => {
            ctx.fillStyle = '#ffffff'; ctx.font = '13px Arial';
            ctx.fillText(`${label}: ${value}%`, x, y - 5);
            ctx.fillStyle = '#1c1c24'; ctx.fillRect(x, y, 340, 14);
            
            let color = '#33ff33';
            if (!isSleeping) {
                if (value <= 25) color = '#ff3333';
                else if (value <= 55) color = '#ffcc00';
            } else { color = '#1f3d7a'; }
            
            ctx.fillStyle = color;
            ctx.fillRect(x, y, (value / 100) * 340, 14);
        };

        drawBar('🩺 SALUTE GENERALE', fufi.salute, 225, 135);
        drawBar('🍖 SAZIETÀ (FAME)', percCibo, 225, 185);
        drawBar('💧 IDRATAZIONE (SETE)', percAcqua, 225, 235);
        drawBar('🧸 FELICITÀ / DIVERTIMENTO', percGioco, 225, 285);

        ctx.fillStyle = '#1c1c24'; ctx.fillRect(35, 325, 545, 32);
        ctx.fillStyle = '#ffffff'; ctx.font = '13px Arial';
        ctx.fillText(`🎒 DISPENSA DI GRUPPO ->  🍖 Cibo: ${fufi.inventario.cibo}  |  💧 Acqua: ${fufi.inventario.acqua}  |  🧸 Giochi: ${fufi.inventario.gioco}`, 55, 345);

        const buffer = canvas.toBuffer('image/png');

        let caption = `ㅤ⋆｡˚『 ╭ \`🐾 GESTIONE TAMAGOTCHI\` ╯ 』˚｡⋆\n`;
        caption += `│ 🛒 \`${usedPrefix}${command} shop\` (Negozio scorte)\n`;
        caption += `│ 🧸 \`${usedPrefix}${command} menu\` (Usa scorte ed accudisci)\n`;
        caption += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;

        await conn.sendMessage(m.chat, {
            image: buffer,
            caption: caption,
            footer: '<b>BLOOD-BOT</b>',
            interactiveButtons: giocoButtons(command, isSleeping)
        }, { quoted: m });

    } catch (err) {
        console.error(err);
        m.reply('❌ Errore durante la generazione grafica del Canvas.');
    }
};

handler.before = async (m) => {
    if (!m.isGroup || !m.text || m.key.fromMe) return;
    let fufi = global.fufiStats?.[m.chat];
    if (!fufi || !fufi.attivo || fufi.morto) return;

    if (m.text.toLowerCase().includes(fufi.nome.toLowerCase()) && !m.text.startsWith('.') && !m.text.startsWith('!')) {
        let oraCorrente = new Date().getHours();
        if (oraCorrente >= 0 && oraCorrente < 10) {
            return await conn.reply(m.chat, `*${fufi.nome}*: Zzz... Sto dormendo... 💤`, m);
        }
        let info = specieMascot[fufi.specie];
        let listaVersi = fufi.salute < 40 ? info.versiMalato : info.versi;
        await conn.reply(m.chat, `*${fufi.nome}*: ${listaVersi[Math.floor(Math.random() * listaVersi.length)]}`, m);
    }
};

handler.help = ['mascot'];
handler.tags = ['fun'];
handler.command = /^(mascot|mascotte|animale)$/i;
handler.group = true;

export default handler;
