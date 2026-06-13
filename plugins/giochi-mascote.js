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
    gioco: { nome: '🧸 Pallina Gioco', prezzo: 15 }
};

const specieButtons = () => [
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🐶 Cane', id: '.mascot adotta cane' }) },
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🐱 Gatto', id: '.mascot adotta gatto' }) },
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🐍 Serpente', id: '.mascot adotta serpente' }) },
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🐹 Criceto', id: '.mascot adotta criceto' }) },
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🐰 Coniglio', id: '.mascot adotta coniglio' }) }
];

const homeButtons = (cmd, isSleeping) => {
    if (isSleeping) return [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '💤 Sta dormendo...', id: `.${cmd}` }) }];
    return [
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🛒 Apri Shop', id: `.${cmd} shop` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🧸 Zaino / Interagisci', id: `.${cmd} menu` }) }
    ];
};

const shopButtons = (cmd) => [
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🍖 Compra Cibo (€20)', id: `.${cmd} compra cibo` }) },
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '💧 Compra Acqua (€10)', id: `.${cmd} compra acqua` }) },
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🧸 Compra Gioco (€15)', id: `.${cmd} compra gioco` }) },
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🔙 Torna alla Mascotte', id: `.${cmd}` }) }
];

const interactButtons = (cmd) => [
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🍖 Nutri con Cibo', id: `.${cmd} dai cibo` }) },
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '💧 Offri Acqua', id: `.${cmd} dai acqua` }) },
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🧸 Fai Giocare', id: `.${cmd} dai gioco` }) },
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🔙 Pannello Principale', id: `.${cmd}` }) }
];

let handler = async (m, { conn, args, usedPrefix, command, isAdmin }) => {
    global.fufiStats = global.fufiStats || {};
    let fufi = global.fufiStats[m.chat];
    let sottoComando = args[0]?.toLowerCase();

    let oraCorrente = new Date().getHours();
    let isSleeping = oraCorrente >= 0 && oraCorrente < 10;

    if (sottoComando === 'elimina' || sottoComando === 'cancella') {
        if (!isAdmin && !m.fromMe) return m.reply('❌ *Solo gli amministratori o il proprietario possono eliminare la mascotte!*');
        if (!fufi) return m.reply('⚠️ Nessuna mascotte attiva in questa stanza da poter cancellare.');
        
        delete global.fufiStats[m.chat];
        return m.reply('🗑️ *Mascotte rimossa!* Il dispositivo virtuale è stato formattato, potrete adottarne una nuova quando volete.');
    }

    if (!fufi) {
        if (sottoComando === 'adotta') {
            if (!isAdmin && !m.fromMe) return m.reply('❌ *Solo gli amministratori del gruppo possono avviare un\'adozione!*');
            let scelta = args[1]?.toLowerCase();
            if (!scelta || !specieMascot[scelta]) return m.reply('⚠️ *Scegli una specie valida tra quelle proposte!*');

            global.fufiStats[m.chat] = {
                attivo: false, faseNome: true, specie: scelta, morto: false, nome: 'Mascotte', salute: 100,
                ultimoPasto: Date.now(), ultimoBeveraggio: Date.now(), ultimoGioco: Date.now(),
                inventario: { cibo: 0, acqua: 0, gioco: 0 }
            };

            let setupText = `📟 *TAMAGOTCHI OS v1.0*\n\n`;
            setupText += `🥚 *Uovo schiuso!* Avete ottenuto un ${specieMascot[scelta].label}.\n\n`;
            setupText += `📝 Inserite adesso un nome digitando:\n\`${usedPrefix}${command} [Nome che desideri]\``;
            return m.reply(setupText);
        }

        let introText = `📟 *TAMAGOTCHI CONSOLE v1.0*\n\n`;
        introText += `👾 *Nessuna mascotte trovata in questa chat!*\n`;
        introText += `Scegliete un uovo da far schiudere cliccando su una delle opzioni qui sotto:`;
        return await conn.sendMessage(m.chat, { text: introText, footer: '👾 Tamagotchi Core System', interactiveButtons: specieButtons() }, { quoted: m });
    }

    if (fufi.faseNome) {
        let nomeScelto = args.join(' ').trim();
        if (!nomeScelto || sottoComando === 'adotta') return m.reply(`⚠️ Usa: \`${usedPrefix}${command} [Nome]\``);
        if (nomeScelto.length > 15) return m.reply('❌ Scegli un nome più corto! (Massimo 15 caratteri).');

        fufi.nome = nomeScelto; fufi.faseNome = false; fufi.attivo = true;
        fufi.ultimoPasto = Date.now(); fufi.ultimoBeveraggio = Date.now(); fufi.ultimoGioco = Date.now();

        let sp = specieMascot[fufi.specie];
        return m.reply(`🎉 *${fufi.nome}* (${sp.emoji}) è stato registrato nel circuito virtuale di questo gruppo!\nInvia \`${usedPrefix}${command}\` per accenderlo.`);
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
            if (!isAdmin && !m.fromMe) return m.reply('❌ Operazione consentita solo agli amministratori.');
            let costoRianima = 200;
            let soldiUtente = global.db.data.users[m.sender]?.euro || 0;
            if (soldiUtente < costoRianima) return m.reply(`❌ Crediti insufficienti. La clinica richiede €${costoRianima} EUR.`);
            global.db.data.users[m.sender].euro -= costoRianima;
            fufi.morto = false; fufi.salute = 60; fufi.ultimoPasto = Date.now(); fufi.ultimoBeveraggio = Date.now(); fufi.ultimoGioco = Date.now();
            return m.reply(`⚡ *Defibrillatore Virtuale:* ${fufi.nome} è tornato in vita! (-€${costoRianima} EUR)`);
        }
        return m.reply(`💀 *GAME OVER* 💀\n*${fufi.nome}* è andato al creatore per mancanza di cure.\nDigita \`${usedPrefix}${command} rianima\` (Spesa: €200 EUR) per resuscitarlo.`);
    }

    if (isSleeping && ['dai', 'shop', 'compra', 'gioca', 'menu'].includes(sottoComando)) {
        return m.reply(`💤 *Shhh... ${fufi.nome} sta dormendo nel suo guscio.* Tornerà attivo alle ore 10:00.`);
    }

    if (sottoComando === 'shop') {
        let shopText = `🛒 *TAMAGOTCHI APPMARKET*\n\n`;
        shopText += `🪙 *I tuoi Euro:* €${global.db.data.users[m.sender]?.euro || 0} EUR\n`;
        shopText += `🎒 *Dispensa Attuale:* Cibo: [${fufi.inventario.cibo}] | Acqua: [${fufi.inventario.acqua}] | Giochi: [${fufi.inventario.gioco}]\n\n`;
        shopText += `Seleziona l'oggetto da acquistare premendo i pulsanti qui sotto:`;
        return await conn.sendMessage(m.chat, { text: shopText, footer: '🛒 Negozio di Gruppo', interactiveButtons: shopButtons(command) }, { quoted: m });
    }

    if (sottoComando === 'compra') {
        let item = args[1]?.toLowerCase();
        if (!item || !shopConfig[item]) return m.reply(`⚠️ Specifica l'oggetto da comprare.`);
        let costo = shopConfig[item].prezzo;
        let soldiUtente = global.db.data.users[m.sender]?.euro || 0;
        if (soldiUtente < costo) return m.reply(`❌ Saldo insufficiente! Ti servono €${costo} EUR per questo articolo.`);

        if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {};
        global.db.data.users[m.sender].euro -= costo;
        fufi.inventario[item] = (fufi.inventario[item] || 0) + 1;

        let resText = `🛍️ *Acquisto completato!*\nSpesi €${costo} EUR per 1x *${shopConfig[item].nome}*.\n\n`;
        resText += `🎒 Dispensa aggiornata: *${item.toUpperCase()}: ${fufi.inventario[item]}*`;
        return await conn.sendMessage(m.chat, { text: resText, footer: '🛒 Prosegui gli acquisti', interactiveButtons: shopButtons(command) }, { quoted: m });
    }

    if (sottoComando === 'dai') {
        let item = args[1]?.toLowerCase();
        if (!item || !shopConfig[item]) return m.reply(`⚠️ Cosa vorresti estrarre dallo zaino?`);
        if ((fufi.inventario[item] || 0) <= 0) return m.reply(`❌ Oggetto non disponibile nello zaino! Compralo prima visitando il Market.`);

        fufi.inventario[item] -= 1;
        let outputMsg = '';

        if (item === 'cibo') {
            fufi.ultimoPasto = Date.now(); fufi.salute = Math.min(100, fufi.salute + 15);
            outputMsg = `🍖 *@${m.sender.split('@')[0]}* ha riempito la ciotola! *${fufi.nome}* ringrazia felice.`;
        } else if (item === 'acqua') {
            fufi.ultimoBeveraggio = Date.now(); fufi.salute = Math.min(100, fufi.salute + 10);
            outputMsg = `💧 *@${m.sender.split('@')[0]}* ha versato dell'acqua fresca a *${fufi.nome}*!`;
        } else if (item === 'gioco') {
            fufi.ultimoGioco = Date.now(); fufi.salute = Math.min(100, fufi.salute + 5);
            outputMsg = `🧸 *@${m.sender.split('@')[0]}* ha tirato fuori la pallina! *${fufi.nome}* si sta divertendo un mondo!`;
        }

        return await conn.sendMessage(m.chat, { text: outputMsg, mentions: [m.sender], footer: '🎒 Gestisci Zaino', interactiveButtons: interactButtons(command) }, { quoted: m });
    }

    if (sottoComando === 'menu') {
        let mText = `🎒 *ZAINO DEL GRUPPO & INTERAZIONI*\n\n`;
        mText += `Usa gli oggetti in possesso istantaneamente premendo i bottoni qui in basso:`;
        return await conn.sendMessage(m.chat, { text: mText, footer: '🎒 Inventario Tamagotchi', interactiveButtons: interactButtons(command) }, { quoted: m });
    }

    try {
        let percCibo = isSleeping ? 100 : Math.max(0, Math.min(100, Math.floor(((treOre - (oraAttuale - fufi.ultimoPasto)) / treOre) * 100)));
        let percAcqua = isSleeping ? 100 : Math.max(0, Math.min(100, Math.floor(((treOre - (oraAttuale - fufi.ultimoBeveraggio)) / treOre) * 100)));
        let percGioco = isSleeping ? 100 : Math.max(0, Math.min(100, Math.floor(((treOre - (oraAttuale - fufi.ultimoGioco)) / treOre) * 100)));
        let percFelice = Math.floor((percCibo + percAcqua + percGioco) / 3);

        const canvas = createCanvas(620, 390);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#ff6b81'; 
        ctx.fillRect(0, 0, 620, 390);

        ctx.fillStyle = '#f7f1e3';
        ctx.beginPath();
        ctx.arc(310, 195, 240, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isSleeping ? '#1e272e' : '#dcdde1';
        ctx.fillRect(140, 80, 340, 200);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#2f3542';
        ctx.strokeRect(140, 80, 340, 200);

        ctx.fillStyle = '#2f3542';
        ctx.beginPath(); ctx.arc(100, 330, 20, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(310, 345, 20, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(520, 330, 20, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 11px Arial';
        ctx.fillText('A', 96, 334); ctx.fillText('B', 306, 349); ctx.fillText('C', 516, 334);

        let statoUmore = 'OTTIMO ✨';
        if (isSleeping) {
            statoUmore = 'SONNO 💤';
        } else {
            if (fufi.salute < 40) statoUmore = 'MALATO 🤒';
            else if (percFelice < 40) statoUmore = 'ANNOIATO 🥺';
            else if (percCibo < 30) statoUmore = 'FAME 🍖';
            else if (percAcqua < 30) statoUmore = 'SETE 💧';
        }

        infoSpecie.draw(ctx, 15, 100);

        if (isSleeping) {
            ctx.fillStyle = '#70a1ff'; ctx.font = 'bold 20px Arial'; ctx.fillText('z', 145, 110);
            ctx.font = 'bold 26px Arial'; ctx.fillText('Z', 160, 95);
        }

        ctx.fillStyle = '#2f3542';
        ctx.font = 'bold 20px "Courier New"';
        ctx.fillText(fufi.nome.toUpperCase(), 160, 115);

        ctx.font = 'bold 11px "Courier New"';
        ctx.fillText(`MODELLO: ${fufi.specie.toUpperCase()}`, 160, 135);
        ctx.fillText(`STATO: ${statoUmore}`, 160, 150);

        const drawPixelBar = (label, value, x, y) => {
            ctx.fillStyle = '#2f3542'; ctx.font = 'bold 10px "Courier New"';
            ctx.fillText(label, x, y - 4);
            
            ctx.fillStyle = '#718093';
            ctx.fillRect(x, y, 200, 10);
            
            let color = '#4cd137';
            if (!isSleeping) {
                if (value <= 25) color = '#e84118';
                else if (value <= 55) color = '#fbc531';
            } else { color = '#00a8ff'; }
            
            ctx.fillStyle = color;
            ctx.fillRect(x, y, (value / 100) * 200, 10);
            ctx.strokeRect(x, y, 200, 10);
        };

        drawPixelBar('🩺 VITA', fufi.salute, 160, 180);
        drawPixelBar('🍖 FAME', percCibo, 160, 215);
        drawPixelBar('💧 SETE', percAcqua, 160, 250);

        ctx.fillStyle = '#2f3542'; ctx.fillRect(100, 15, 420, 28);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 12px "Courier New"';
        ctx.fillText(`🎒 DISPENSA: 🍖 Cibo x${fufi.inventario.cibo} | 💧 Acqua x${fufi.inventario.acqua} | 🧸 Giochi x${fufi.inventario.gioco}`, 115, 33);

        const buffer = canvas.toBuffer('image/png');

        let caption = `📟 *SCHERMO DISPOSITIVO PRIVATO*\n\n`;
        caption += `Utilizza la pulsantiera interattiva sotto l'immagine per aprire i menu dedicati, comprare sostentamento o accudire l'animale.`;

        await conn.sendMessage(m.chat, {
            image: buffer,
            caption: caption,
            footer: '👾 Tamagotchi Console v1.0',
            interactiveButtons: homeButtons(command, isSleeping)
        }, { quoted: m });

    } catch (err) {
        console.error(err);
        m.reply('❌ Errore durante il rendering del display analogico.');
    }
};

handler.before = async (m) => {
    if (!m.isGroup || !m.text || m.key.fromMe) return;
    let fufi = global.fufiStats?.[m.chat];
    if (!fufi || !fufi.attivo || fufi.morto) return;

    if (m.text.toLowerCase().includes(fufi.nome.toLowerCase()) && !m.text.startsWith('.') && !m.text.startsWith('!')) {
        let oraCorrente = new Date().getHours();
        if (oraCorrente >= 0 && oraCorrente < 10) {
            return await conn.reply(m.chat, `💤 *${fufi.nome}*: Zzz... Sto dormendo nel mio guscio...`, m);
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