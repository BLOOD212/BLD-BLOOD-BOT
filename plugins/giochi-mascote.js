import { createCanvas } from 'canvas';

const specieMascot = {
    cane: {
        emoji: '🐶', label: 'Cane 🐶',
        versi: ['Bau! 🐾', '*muove la coda felice*', '*ti guarda fisso aspettando i croccantini* 🍖'],
        versiMalato: ['*guaisce molto debolmente... ha bisogno di cure* 😢'],
        draw: (ctx, x, y) => {
            ctx.fillStyle = '#d7a15c'; ctx.beginPath(); ctx.arc(x + 75, y + 75, 55, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#a67238';
            ctx.beginPath(); ctx.ellipse(x + 30, y + 70, 15, 35, Math.PI / 6, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(x + 120, y + 70, 15, 35, -Math.PI / 6, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(x + 55, y + 65, 10, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + 95, y + 65, 10, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#000000';
            ctx.beginPath(); ctx.arc(x + 55, y + 65, 5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + 95, y + 65, 5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + 75, y + 85, 8, 0, Math.PI); ctx.fill();
            ctx.fillStyle = '#ff6666'; ctx.beginPath(); ctx.ellipse(x + 75, y + 100, 7, 10, 0, 0, Math.PI * 2); ctx.fill();
        }
    },
    gatto: {
        emoji: '🐱', label: 'Gatto 🐱',
        versi: ['Miao~ 🐾', '*fa le fusa e si strofina sulle tue gambe*', '*ti fissa con superiorità* 🐟'],
        versiMalato: ['*miagola debolmente rannicchiato in un angolo* 😢'],
        draw: (ctx, x, y) => {
            ctx.fillStyle = '#9e9e9e'; ctx.beginPath(); ctx.arc(x + 75, y + 75, 55, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#757575';
            ctx.beginPath(); ctx.moveTo(x + 30, y + 35); ctx.lineTo(x + 55, y + 25); ctx.lineTo(x + 45, y + 55); ctx.fill();
            ctx.beginPath(); ctx.moveTo(x + 120, y + 35); ctx.lineTo(x + 95, y + 25); ctx.lineTo(x + 105, y + 55); ctx.fill();
            ctx.fillStyle = '#ffff66';
            ctx.beginPath(); ctx.arc(x + 55, y + 70, 10, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + 95, y + 70, 10, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#000000';
            ctx.beginPath(); ctx.ellipse(x + 55, y + 70, 3, 9, 0, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(x + 95, y + 70, 3, 9, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ff9999'; ctx.beginPath(); ctx.moveTo(x + 71, y + 85); ctx.lineTo(x + 79, y + 85); ctx.lineTo(x + 75, y + 89); ctx.fill();
        }
    },
    serpente: {
        emoji: '🐍', label: 'Serpente 🐍',
        versi: ['Sssss~ 🐍', '*striscia sinuosamente*', '*tira fuori la lingua biforcuta* 🐀'],
        versiMalato: ['*rimane immobile arrotolato su se stesso* 🥺'],
        draw: (ctx, x, y) => {
            ctx.fillStyle = '#4caf50'; ctx.beginPath(); ctx.arc(x + 75, y + 75, 55, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ff3333';
            ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + 75, y + 95); ctx.lineTo(x + 75, y + 115); ctx.stroke();
            ctx.lineTo(x + 70, y + 122); ctx.moveTo(x + 75, y + 115); ctx.lineTo(x + 80, y + 122); ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(x + 55, y + 65, 12, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + 95, y + 65, 12, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffeb3b';
            ctx.beginPath(); ctx.arc(x + 55, y + 65, 9, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + 95, y + 65, 9, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#000000';
            ctx.beginPath(); ctx.ellipse(x + 55, y + 65, 2, 8, 0, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(x + 95, y + 65, 2, 8, 0, 0, Math.PI * 2); ctx.fill();
        }
    },
    criceto: {
        emoji: '🐹', label: 'Criceto 🐹',
        versi: ['Squitt! 🐹', '*gira velocissimo sulla ruota*', '*riempie le guance di semi* 🌻'],
        versiMalato: ['*trema debolmente sotto la segatura* 😢'],
        draw: (ctx, x, y) => {
            ctx.fillStyle = '#ffb74d'; ctx.beginPath(); ctx.arc(x + 75, y + 75, 55, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffe082'; ctx.beginPath(); ctx.arc(x + 75, y + 90, 35, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ff8a65';
            ctx.beginPath(); ctx.arc(x + 35, y + 35, 14, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + 115, y + 35, 14, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ff80ab';
            ctx.beginPath(); ctx.arc(x + 35, y + 85, 10, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + 115, y + 85, 10, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(x + 55, y + 65, 8, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + 95, y + 65, 8, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#000000';
            ctx.beginPath(); ctx.arc(x + 55, y + 65, 4, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + 95, y + 65, 4, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + 75, y + 78, 5, 0, Math.PI * 2); ctx.fill();
        }
    },
    coniglio: {
        emoji: '🐰', label: 'Coniglio 🐰',
        versi: ['*muove il nasino velocemente* 🐰', '*fa un piccolo balzo di gioia*', '*rosicchia una foglia* 🥕'],
        versiMalato: ['*tiene le orecchie basse e non si muove* 🥺'],
        draw: (ctx, x, y) => {
            ctx.fillStyle = '#e0e0e0'; ctx.beginPath(); ctx.arc(x + 75, y + 85, 50, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#b0bec5';
            ctx.beginPath(); ctx.ellipse(x + 50, y + 35, 14, 35, 0, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(x + 100, y + 35, 14, 35, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ff80ab';
            ctx.beginPath(); ctx.ellipse(x + 50, y + 38, 8, 25, 0, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(x + 100, y + 38, 8, 25, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#000000';
            ctx.beginPath(); ctx.arc(x + 55, y + 78, 5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + 95, y + 78, 5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ff80ab'; ctx.beginPath(); ctx.moveTo(x + 72, y + 88); ctx.lineTo(x + 78, y + 88); ctx.lineTo(x + 75, y + 92); ctx.fill();
        }
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

    if (sottoComando === 'elimina' || sottoComando === 'cancella') {
        if (!isAdmin && !m.fromMe) return m.reply('❌ *Solo gli admin o il proprietario del bot possono eliminare la mascotte!*');
        if (!fufi) return m.reply('⚠️ Non c\'è nessuna mascotte da eliminare in questo gruppo.');
        
        delete global.fufiStats[m.chat];
        return m.reply('🗑️ *Mascotte eliminata correttamente!* I dati e la dispensa di questo gruppo sono stati azzerati.');
    }

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
            setupText += `*╰⭒─瞬─瞬─瞬─⭒─瞬─瞬─瞬─*`;
            return m.reply(setupText);
        }

        let introText = `ㅤ⋆｡˚『 ╭ \`🐾 IL TAMAGOTCHI DEL GRUPPO 🐾\` ╯ 』˚｡⋆\n╭\n`;
        introText += `│ 🤔 *Questo gruppo non ha ancora adottato una mascotte!*\n│\n`;
        introText += `│ _Scegli quale animale accudire tramite i bottoni qui sotto:_ \n`;
        introText += `*╰⭒─瞬─瞬─瞬─⭒─瞬─瞬─瞬─*`;
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
            let soldiUtente = global.db.data.users[m.sender]?.euro || 0;
            if (soldiUtente < costoRianima) return m.reply(`❌ Ti servono €${costoRianima} EUR.`);
            global.db.data.users[m.sender].euro -= costoRianima;
            fufi.morto = false; fufi.salute = 60; fufi.ultimoPasto = Date.now(); fufi.ultimoBeveraggio = Date.now(); fufi.ultimoGioco = Date.now();
            return m.reply(`❤️ *Veterinario:* Rianimato con successo! (-€${costoRianima} EUR)`);
        }
        return m.reply(`💀 *${fufi.nome}* è morto. Digita \`${usedPrefix}${command} rianima\` (Costo: €200 EUR) per salvarlo.`);
    }

    if (isSleeping && ['dai', 'shop', 'compra', 'gioca', 'menu'].includes(sottoComando)) {
        return m.reply(`💤 *${fufi.nome} sta dormendo profondamente...* Lascialo riposare fino alle 10:00 del mattino!`);
    }

    if (sottoComando === 'shop') {
        let shopText = `ㅤ⋆｡˚『 ╭ \`🛒 MASCOT SHOP - DI BLOOD-BOT\` ╯ 』˚｡⋆\n╭\n`;
        shopText += `│ 💶 *Bilancio Personale:* €${global.db.data.users[m.sender]?.euro || 0} EUR\n│\n`;
        shopText += `│ 🍖 *${shopConfig.cibo.nome}* -> €${shopConfig.cibo.prezzo} EUR \n│ └ Comando: \`${usedPrefix}${command} compra cibo\`\n`;
        shopText += `│ 💧 *${shopConfig.acqua.nome}* -> €${shopConfig.acqua.prezzo} EUR \n│ └ Comando: \`${usedPrefix}${command} compra acqua\`\n`;
        shopText += `│ 🧸 *${shopConfig.gioco.nome}* -> €${shopConfig.gioco.prezzo} EUR \n│ └ Comando: \`${usedPrefix}${command} compra gioco\`\n│\n`;
        shopText += `│ 🎒 \`Dispensa di gruppo:\` Cibo: [${fufi.inventario.cibo}] | Acqua: [${fufi.inventario.acqua}] | Giochi: [${fufi.inventario.gioco}]\n`;
        shopText += `*╰⭒─瞬─瞬─瞬─⭒─瞬─瞬─瞬─*`;
        return m.reply(shopText);
    }

    if (sottoComando === 'compra') {
        let item = args[1]?.toLowerCase();
        if (!item || !shopConfig[item]) return m.reply(`⚠️ Scegli cosa comprare: \`cibo\`, \`acqua\` o \`gioco\`.`);
        let costo = shopConfig[item].prezzo;
        let soldiUtente = global.db.data.users[m.sender]?.euro || 0;
        if (soldiUtente < costo) return m.reply(`❌ Non hai abbastanza soldi (€${costo} EUR necessari).`);

        if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {};
        global.db.data.users[m.sender].euro -= costo;
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

        let statoUmore = 'Felice e Sazio ✨';
        if (isSleeping) {
            statoUmore = 'Sta dormendo... 💤';
        } else {
            if (fufi.salute < 40) { statoUmore = 'Pessimo / Sta male 🤒'; }
            else if (percFelice < 40) { statoUmore = 'Triste / Annoiato 🥺'; }
            else if (percCibo < 30) { statoUmore = 'Molta fame 🥺'; }
            else if (percAcqua < 30) { statoUmore = 'Molta sete 💧'; }
        }

        infoSpecie.draw(ctx, 45, 60);

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
        caption += `│ 🗑️ \`${usedPrefix}${command} elimina\` (Cancella mascotte)\n`;
        caption += `*╰⭒─瞬─瞬─瞬─⭒─瞬─瞬─瞬─*`;

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