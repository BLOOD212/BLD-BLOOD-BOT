import pkg from 'canvas';
const { createCanvas } = pkg;

const catalogoVeicoli = [
    { id: 1, tipo: 'auto', modello: 'Fiat Multipla Tuning', costo: 5000, vMax: 160, acc: 20, col: '#ffffff' },
    { id: 2, tipo: 'moto', modello: 'Vespa 125 Special Truccata', costo: 6500, vMax: 135, acc: 35, col: '#ef4444' },
    { id: 3, tipo: 'auto', modello: 'Alfa Romeo Mito Quadrifoglio', costo: 12000, vMax: 215, acc: 38, col: '#dc2626' },
    { id: 4, tipo: 'moto', modello: 'Yamaha T-Max 560 Black', costo: 16000, vMax: 185, acc: 50, col: '#171717' },
    { id: 5, tipo: 'auto', modello: 'Golf GTI MK8', costo: 22000, vMax: 250, acc: 48, col: '#991b1b' },
    { id: 6, tipo: 'moto', modello: 'Honda CBR 600RR', costo: 27000, vMax: 265, acc: 70, col: '#f97316' },
    { id: 7, tipo: 'auto', modello: 'Audi RS3 Sportback', costo: 45000, vMax: 280, acc: 60, col: '#1e293b' },
    { id: 8, tipo: 'moto', modello: 'Ducati Panigale V4 S', costo: 55000, vMax: 320, acc: 88, col: '#e11d48' },
    { id: 9, tipo: 'auto', modello: 'BMW M4 Competition', costo: 78000, vMax: 290, acc: 68, col: '#ffff00' },
    { id: 10, tipo: 'moto', modello: 'Kawasaki Ninja H2R', costo: 95000, vMax: 380, acc: 96, col: '#22c55e' },
    { id: 11, tipo: 'auto', modello: 'Nissan GT-R Nismo', costo: 110000, vMax: 315, acc: 74, col: '#111111' },
    { id: 12, tipo: 'auto', modello: 'Porsche 911 GT3 RS', costo: 165000, vMax: 330, acc: 80, col: '#ea580c' },
    { id: 13, tipo: 'auto', modello: 'Ferrari SF90 Assetto Fiorano', costo: 240000, vMax: 350, acc: 86, col: '#b91c1c' },
    { id: 14, tipo: 'auto', modello: 'Lamborghini Revuelto', costo: 320000, vMax: 365, acc: 90, col: '#16a34a' },
    { id: 15, tipo: 'moto', modello: 'Lightcycle Tron Prototype', costo: 450000, vMax: 390, acc: 99, col: '#06b6d4' },
    { id: 16, tipo: 'auto', modello: 'McLaren P1', costo: 480000, vMax: 385, acc: 93, col: '#f97316' },
    { id: 17, tipo: 'auto', modello: 'Pagani Huayra R', costo: 650000, vMax: 400, acc: 94, col: '#94a3b8' },
    { id: 18, tipo: 'auto', modello: 'Bugatti Chiron Super Sport', costo: 950000, vMax: 430, acc: 96, col: '#2563eb' },
    { id: 19, tipo: 'auto', modello: 'Koenigsegg Jesko Absolut', costo: 1400000, vMax: 460, acc: 97, col: '#7c3aed' },
    { id: 20, tipo: 'auto', modello: 'Rimac Nevera Neon', costo: 1900000, vMax: 415, acc: 100, col: '#00ffff' },
    { id: 21, tipo: 'auto', modello: 'Hennessey Venom F5', costo: 2500000, vMax: 490, acc: 98, col: '#db2777' },
    { id: 22, tipo: 'auto', modello: 'Cyberpunk Quadra V-Tech', costo: 3200000, vMax: 510, acc: 99, col: '#e11d48' },
    { id: 23, tipo: 'auto', modello: 'DeLorean Outatime Quantum', costo: 4500000, vMax: 540, acc: 95, col: '#cbd5e1' },
    { id: 24, tipo: 'auto', modello: 'Batmobile Tumbler MK2', costo: 6000000, vMax: 480, acc: 100, col: '#030712' },
    { id: 25, tipo: 'moto', modello: 'Hoverbike Xenon Gravity', costo: 7200000, vMax: 440, acc: 100, col: '#a855f7' },
    { id: 26, tipo: 'auto', modello: 'F-16 Ground Prototype', costo: 8500000, vMax: 620, acc: 100, col: '#475569' },
    { id: 27, tipo: 'auto', modello: 'Ferrari FXX-K EVO Prototype', costo: 10000000, vMax: 395, acc: 98, col: '#7f1d1d' },
    { id: 28, tipo: 'auto', modello: 'Aston Martin Valkyrie AMR Pro', costo: 12000000, vMax: 410, acc: 99, col: '#064e3b' },
    { id: 29, tipo: 'auto', modello: 'Millennium Rover Hyperdrive', costo: 15000000, vMax: 750, acc: 100, col: '#f59e0b' },
    { id: 30, tipo: 'auto', modello: 'Starship Interstellar Interceptor', costo: 30000000, vMax: 999, acc: 100, col: '#38bdf8' }
];

const catalogoPezzi = [
    { id: 1, nome: 'Filtro Aria Sportivo', tipo: 'vMax', bonus: 10, costo: 1500 },
    { id: 2, nome: 'Candele all Iridio Racing', tipo: 'vMax', bonus: 15, costo: 3000 },
    { id: 3, nome: 'Olio Motore Sintetico Bardahl', tipo: 'vMax', bonus: 20, costo: 4500 },
    { id: 4, nome: 'Centralina Rimappata Stage 1', tipo: 'vMax', bonus: 25, costo: 6000 },
    { id: 5, nome: 'Scarico Diretto in Titanio', tipo: 'vMax', bonus: 40, costo: 12000 },
    { id: 6, nome: 'Iniettori Maggiorati Bosch', tipo: 'vMax', bonus: 48, costo: 18000 },
    { id: 7, nome: 'Alberi a Camme Rilavorati', tipo: 'vMax', bonus: 55, costo: 25000 },
    { id: 8, nome: 'Turbocompressore Intercooler Stage 3', tipo: 'vMax', bonus: 75, costo: 50000 },
    { id: 9, nome: 'Pistoni Stampati Forgiati CPS', tipo: 'vMax', bonus: 90, costo: 95000 },
    { id: 10, nome: 'Kit Bi-Turbo Forgiato Garrett', tipo: 'vMax', bonus: 110, costo: 150000 },
    { id: 11, nome: 'Carburante Avio Nitrometano', tipo: 'vMax', bonus: 130, costo: 280000 },
    { id: 12, nome: 'Mappatura custom al Banco Pro', tipo: 'vMax', bonus: 150, costo: 500000 },
    { id: 13, nome: 'Reattore a Fusione Magnetica Tokamak', tipo: 'vMax', bonus: 200, costo: 1000000 },
    { id: 14, nome: 'Modulo Curvatura Spazio-Temporale', tipo: 'vMax', bonus: 250, costo: 2500000 },
    { id: 15, nome: 'Singolarità Quantistica Gravitazionale', tipo: 'vMax', bonus: 350, costo: 5000000 },
    { id: 16, nome: 'Gomme Mescola Morbida Pirelli', tipo: 'acc', bonus: 10, costo: 2000 },
    { id: 17, nome: 'Pastiglie Freni Carbon-Ceramica Brembo', tipo: 'acc', bonus: 14, costo: 4000 },
    { id: 18, nome: 'Cerchi in Lega Ultraleggeri OZ', tipo: 'acc', bonus: 16, costo: 6000 },
    { id: 19, nome: 'Frizione Rinforzata Bidisco in Rame', tipo: 'acc', bonus: 18, costo: 8500 },
    { id: 20, nome: 'Barre Antirollio Regolabili Eibach', tipo: 'acc', bonus: 20, costo: 12000 },
    { id: 21, nome: 'Assetto Regolabile a Ghiera Ohlins', tipo: 'acc', bonus: 22, costo: 17000 },
    { id: 22, nome: 'Differenziale Autobloccante Quaife', tipo: 'acc', bonus: 25, costo: 24000 },
    { id: 23, nome: 'Alleggerimento Scocca Fibra di Carbonio', tipo: 'acc', bonus: 28, costo: 35000 },
    { id: 24, nome: 'Aero Kit a Deportanza Dinamica Ala', tipo: 'acc', bonus: 32, costo: 52000 },
    { id: 25, nome: 'Cambio Sequenziale a 7 Innesti Innesti', tipo: 'acc', bonus: 35, costo: 70000 },
    { id: 26, nome: 'Launch Control Elettronico Magneti Marelli', tipo: 'acc', bonus: 38, costo: 110000 },
    { id: 27, nome: 'Iniezione Protossido d Azoto (NOS)', tipo: 'acc', bonus: 45, costo: 180000 },
    { id: 28, nome: 'Sospensioni a Sgancio Magnetoreologico', tipo: 'acc', bonus: 50, costo: 420000 },
    { id: 29, nome: 'Propulsore Antimateria Quantistica', tipo: 'acc', bonus: 60, costo: 1200000 },
    { id: 30, nome: 'Generatore Gravità Zero Tassellata', tipo: 'acc', bonus: 75, costo: 3500000 }
];

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const chatId = m.chat;
    const userId = m.sender;

    global.db = global.db || { data: { users: {} } };
    if (!global.db.data.users[userId]) global.db.data.users[userId] = {};
    
    let user = global.db.data.users[userId];
    if (user.euro === undefined) user.euro = 0;
    if (user.garageSlot === undefined) user.garageSlot = 1;
    if (!user.parcoAuto) user.parcoAuto = [];
    if (user.autoAttiva === undefined) user.autoAttiva = null;

    if (command === 'shopauto') {
        let txt = `🏎️ *CONCESSIONARIA INTERNAZIONALE MOTORISTICA* 🏎️\n`;
        txt += `========================================\n\n`;
        txt += `Usa il comando \`${usedPrefix}compraauto [numero]\` per acquistare.\n`;
        txt += `Spazio Scuderia: *${user.parcoAuto.length}/${user.garageSlot}* mezzi occupati.\n\n`;

        catalogoVeicoli.forEach(c => {
            let icon = c.tipo === 'auto' ? '🚘' : '🏍️';
            txt += `*${c.id}. ${icon} ${c.modello}*\n`;
            txt += `💰 Prezzo: *${c.costo.toLocaleString()}€*\n`;
            txt += `📊 V-Max: *${c.vMax} km/h* | Scatto: *${c.acc}/100*\n\n`;
        });

        return m.reply(txt);
    }

    if (command === 'shoppezzi') {
        let txt = `🛠️ *OFFICINA MECCANICA: ACQUISTO COMPONENTI* 🛠️\n`;
        txt += `========================================\n\n`;
        txt += `Migliora le performance del tuo veicolo attivo con \`${usedPrefix}comprapezzo [numero]\`.\n\n`;

        catalogoPezzi.forEach(p => {
            let cat = p.tipo === 'vMax' ? 'Velocità Max' : 'Accelerazione';
            txt += `*${p.id}. ${p.nome}*\n`;
            txt += `📦 Modifica: +${p.bonus} ${cat}\n`;
            txt += `💰 Costo: *${p.costo.toLocaleString()}€*\n\n`;
        });

        return m.reply(txt);
    }

    if (command === 'compraauto') {
        let idScelto = parseInt(args[0]);
        if (isNaN(idScelto) || idScelto < 1 || idScelto > catalogoVeicoli.length) {
            return m.reply(`⚠️ Specifica un codice valido dal catalogo. Esempio: \`${usedPrefix}compraauto 4\``);
        }

        if (user.parcoAuto.length >= user.garageSlot) {
            let costoEsp = user.garageSlot * 50000;
            return m.reply(`❌ Il tuo garage è pieno (*${user.parcoAuto.length}/${user.garageSlot}* slots).\n\nUsa \`${usedPrefix}potenziagarage\` per sbloccare un nuovo slot a *${costoEsp.toLocaleString()}€*.`);
        }

        let veicoloSelezionato = catalogoVeicoli.find(c => c.id === idScelto);
        if (user.euro < veicoloSelezionato.costo) {
            return m.reply(`❌ Fondi insufficienti. Ti mancano *${(veicoloSelezionato.costo - user.euro).toLocaleString()}€*.`);
        }

        user.euro -= veicoloSelezionato.costo;
        let nuovoVeicolo = {
            tipo: veicoloSelezionato.tipo,
            modello: veicoloSelezionato.modello,
            vMax: veicoloSelezionato.vMax,
            acc: veicoloSelezionato.acc,
            colore: veicoloSelezionato.col,
            pezziInstallati: []
        };

        user.parcoAuto.push(nuovoVeicolo);
        user.autoAttiva = user.parcoAuto.length - 1;

        let buffer = await generaCanvasRealistico(nuovoVeicolo, user.parcoAuto.length, user.garageSlot);
        return conn.sendMessage(chatId, { image: buffer, caption: `🔑 *ACQUISTO IMMATRICOLATO!*\n\nHai acquistato: **${nuovoVeicolo.modello}**. Il veicolo è pronto all'uso nel box attivo.` }, { quoted: m });
    }

    if (command === 'comprapezzo') {
        if (user.autoAttiva === null || !user.parcoAuto[user.autoAttiva]) {
            return m.reply(`❌ Non hai nessun veicolo impostato come attivo nel tuo garage.`);
        }

        let idPezzo = parseInt(args[0]);
        if (isNaN(idPezzo) || idPezzo < 1 || idPezzo > catalogoPezzi.length) {
            return m.reply(`⚠️ Inserisci un codice pezzo valido dalla lista.`);
        }

        let pezzo = catalogoPezzi.find(p => p.id === idPezzo);
        let veicolo = user.parcoAuto[user.autoAttiva];

        veicolo.pezziInstallati = veicolo.pezziInstallati || [];
        if (veicolo.pezziInstallati.includes(pezzo.nome)) {
            return m.reply(`❌ Questo mezzo monta già l'upgrade *${pezzo.nome}*.`);
        }

        if (user.euro < pezzo.costo) {
            return m.reply(`❌ Credito insufficiente. Costo pezzo: *${pezzo.costo.toLocaleString()}€*.`);
        }

        user.euro -= pezzo.costo;
        veicolo.pezziInstallati.push(pezzo.nome);

        if (pezzo.tipo === 'vMax') veicolo.vMax += pezzo.bonus;
        if (pezzo.tipo === 'acc') veicolo.acc = Math.min(100, veicolo.acc + pezzo.bonus);

        let buffer = await generaCanvasRealistico(veicolo, user.parcoAuto.length, user.garageSlot);
        return conn.sendMessage(chatId, { image: buffer, caption: `🛠️ *REPARTO CORSE: CONFIGURATO!*\n\nIl componente *${pezzo.nome}* è stato mappato e installato su *${veicolo.modello}*.\n📈 Rendimento aggiornato sul display.` }, { quoted: m });
    }

    if (command === 'potenziagarage') {
        let costoEspansione = user.garageSlot * 50000;
        if (user.euro < costoEspansione) {
            return m.reply(`❌ L'espansione strutturale per lo slot successivo richiede *${costoEspansione.toLocaleString()}€*.`);
        }

        user.euro -= costoEspansione;
        user.garageSlot += 1;

        return m.reply(`🏢 *AMPLIAMENTO STRUTTURALE COMPLETATO!*\n\nNuova baia meccanica inaugurata. Alloggiamenti disponibili: **${user.garageSlot}**.`);
    }

    if (command === 'garage') {
        if (user.parcoAuto.length === 0) {
            return m.reply(`⚠️ Il tuo garage è deserto. Sfoglia il listino completo usando \`${usedPrefix}shopauto\`.`);
        }

        let veicolo = user.parcoAuto[user.autoAttiva];
        let buffer = await generaCanvasRealistico(veicolo, user.parcoAuto.length, user.garageSlot);

        let icon = veicolo.tipo === 'auto' ? '🚘' : '🏍️';
        let cap = `⚙️ *OFFICINA DI DIAGNOSTICA ADVANCED* ⚙️\n`;
        cap += `========================================\n\n`;
        cap += `${icon} *Mezzo Selezionato:* ${veicolo.modello}\n`;
        cap += `📊 Velocità di Punta: *${veicolo.vMax} km/h*\n`;
        cap += `⚡ Valutazione Accelerazione: *${veicolo.acc}/100*\n\n`;
        cap += `📦 *Componenti Post-Vendita:* ${veicolo.pezziInstallati.length > 0 ? veicolo.pezziInstallati.join(', ') : 'Nessuno'}\n`;
        cap += `🏢 Capienza Garage: **${user.parcoAuto.length}/${user.garageSlot} unità**\n\n`;
        cap += `💡 _Usa \`${usedPrefix}shoppezzi\` per sbloccare i componenti strutturali avanzati._`;

        return conn.sendMessage(chatId, { image: buffer, caption: cap }, { quoted: m });
    }
};

async function generaCanvasRealistico(veicolo, usati, totali) {
    const canvas = createCanvas(700, 400);
    const ctx = canvas.getContext('2d');

    // Controllo di sicurezza anti-crash se mancano i dati del veicolo
    let nomeModello = (veicolo && veicolo.modello) ? veicolo.modello : "VEICOLO SCONOSCIUTO";
    let coloreVeicolo = (veicolo && veicolo.colore) ? veicolo.colore : "#38bdf8";
    let tipoVeicolo = (veicolo && veicolo.tipo) ? veicolo.tipo : "auto";
    let vMaxVeicolo = (veicolo && veicolo.vMax) ? veicolo.vMax : 0;
    let accVeicolo = (veicolo && veicolo.acc) ? veicolo.acc : 0;
    let pezziNum = (veicolo && veicolo.pezziInstallati) ? veicolo.pezziInstallati.length : 0;

    let bgGrad = ctx.createLinearGradient(0, 0, 0, 400);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.5, '#1e293b');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 700, 400);

    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.moveTo(0, 260);
    ctx.lineTo(700, 260);
    ctx.lineTo(700, 400);
    ctx.lineTo(0, 400);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;
    for (let i = -200; i <= 900; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 260);
        ctx.lineTo(i * 1.3 - 100, 400);
        ctx.stroke();
    }
    for (let h = 260; h <= 400; h += 25) {
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.lineTo(700, h);
        ctx.stroke();
    }

    let light1 = ctx.createRadialGradient(180, 40, 0, 180, 40, 220);
    light1.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
    light1.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = light1;
    ctx.beginPath(); ctx.moveTo(180, 0); ctx.lineTo(60, 260); ctx.lineTo(300, 260); ctx.closePath(); ctx.fill();

    let shadow = ctx.createRadialGradient(180, 285, 20, 180, 285, 120);
    shadow.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
    shadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shadow;
    ctx.fillRect(70, 275, 220, 25);

    ctx.shadowColor = coloreVeicolo;
    ctx.shadowBlur = 35;
    ctx.fillStyle = coloreVeicolo;

    if (tipoVeicolo === 'moto') {
        ctx.beginPath();
        ctx.moveTo(110, 170); ctx.lineTo(190, 150); ctx.lineTo(240, 220); ctx.lineTo(130, 250);
        ctx.closePath(); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(160, 120, 15, 35);
        ctx.fillStyle = '#111111';
        ctx.beginPath(); ctx.arc(110, 250, 32, 0, 2 * Math.PI); ctx.fill();
        ctx.beginPath(); ctx.arc(250, 250, 32, 0, 2 * Math.PI); ctx.fill();
        ctx.fillStyle = '#64748b';
        ctx.beginPath(); ctx.arc(110, 250, 14, 0, 2 * Math.PI); ctx.fill();
        ctx.beginPath(); ctx.arc(250, 250, 14, 0, 2 * Math.PI); ctx.fill();
    } else {
        ctx.fillRect(70, 185, 220, 70);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#020617';
        ctx.fillRect(90, 195, 50, 25);
        ctx.fillRect(200, 195, 70, 25);
        ctx.fillStyle = '#111111';
        ctx.beginPath(); ctx.arc(110, 255, 26, 0, 2 * Math.PI); ctx.fill();
        ctx.beginPath(); ctx.arc(250, 255, 26, 0, 2 * Math.PI); ctx.fill();
    }

    ctx.fillStyle = 'rgba(2, 6, 23, 0.55)';
    ctx.fillRect(410, 25, 265, 350);
    
    let glassGrad = ctx.createLinearGradient(410, 25, 675, 350);
    glassGrad.addColorStop(0, 'rgba(56, 189, 248, 0.15)');
    glassGrad.addColorStop(1, 'rgba(56, 189, 248, 0.01)');
    ctx.fillStyle = glassGrad;
    ctx.fillRect(410, 25, 265, 350);
    
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(410, 25, 265, 350);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(nomeModello.toUpperCase().slice(0, 24), 430, 65);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.fillText(`CATEGORIA: ${tipoVeicolo.toUpperCase()}`, 430, 90);

    ctx.fillStyle = '#ffffff';
    ctx.font = '11px sans-serif';
    ctx.fillText(`VELOCITÀ MASSIMA: ${vMaxVeicolo} KM/H`, 430, 135);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(430, 145, 225, 10);
    let vBar = ctx.createLinearGradient(430, 0, 655, 0);
    vBar.addColorStop(0, '#0284c7'); vBar.addColorStop(1, '#38bdf8');
    ctx.fillStyle = vBar;
    ctx.fillRect(430, 145, Math.min(225, (vMaxVeicolo / 1000) * 225), 10);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(`PROPULSIONE / ACC: ${accVeicolo}/100`, 430, 195);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(430, 205, 225, 10);
    let aBar = ctx.createLinearGradient(430, 0, 655, 0);
    aBar.addColorStop(0, '#7c3aed'); aBar.addColorStop(1, '#c084fc');
    ctx.fillStyle = aBar;
    ctx.fillRect(430, 205, (accVeicolo / 100) * 225, 10);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(`ALLOCAZIONE STRUTTURA: ${usati}/${totali}`, 430, 255);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(430, 265, 225, 10);
    let gBar = ctx.createLinearGradient(430, 0, 655, 0);
    gBar.addColorStop(0, '#16a34a'); gBar.addColorStop(1, '#4ade80');
    ctx.fillStyle = gBar;
    ctx.fillRect(430, 265, (usati / totali) * 225, 10);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(430, 310, 225, 45);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.strokeRect(430, 310, 225, 45);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(`HARDWARE COUPLING OK // SYSTEMS NOMINAL`, 440, 328);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`UPGRADES UNIT: ${pezziNum}`, 440, 342);

    ctx.fillStyle = '#020617';
    ctx.fillRect(20, 20, 190, 35);
    ctx.strokeStyle = '#38bdf8';
    ctx.strokeRect(20, 20, 190, 35);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('GARAGE CORE v4.50 // ON', 35, 42);

    return canvas.toBuffer('image/png');
}

handler.help = ['garage', 'shopauto', 'shoppezzi', 'compraauto', 'comprapezzo', 'potenziagarage'];
handler.tags = ['giochi'];
handler.command = ['garage', 'shopauto', 'shoppezzi', 'compraauto', 'comprapezzo', 'potenziagarage'];
handler.group = true;

export default handler;
