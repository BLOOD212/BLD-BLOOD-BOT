import pkg from 'canvas';
const { createCanvas } = pkg;

const catalogoAuto = [
    { id: 1, modello: 'Fiat Multipla Tuning', costo: 5000, vMax: 160, acc: 20, col: '#ffffff' },
    { id: 2, modello: 'Alfa Romeo Mito Quadrifoglio', costo: 12000, vMax: 215, acc: 38, col: '#dc2626' },
    { id: 3, modello: 'Golf GTI MK8', costo: 22000, vMax: 250, acc: 48, col: '#991b1b' },
    { id: 4, modello: 'Audi RS3 Sportback', costo: 45000, vMax: 280, acc: 60, col: '#1e293b' },
    { id: 5, modello: 'BMW M4 Competition', costo: 78000, vMax: 290, acc: 68, col: '#ffff00' },
    { id: 6, modello: 'Nissan GT-R Nismo', costo: 110000, vMax: 315, acc: 74, col: '#111111' },
    { id: 7, modello: 'Porsche 911 GT3 RS', costo: 165000, vMax: 330, acc: 80, col: '#ea580c' },
    { id: 8, modello: 'Ferrari SF90 Assetto Fiorano', costo: 240000, vMax: 350, acc: 86, col: '#b91c1c' },
    { id: 9, modello: 'Lamborghini Revuelto', costo: 320000, vMax: 365, acc: 90, col: '#16a34a' },
    { id: 10, modello: 'McLaren P1', costo: 480000, vMax: 385, acc: 93, col: '#f97316' },
    { id: 11, modello: 'Pagani Huayra R', costo: 650000, vMax: 400, acc: 94, col: '#94a3b8' },
    { id: 12, modello: 'Bugatti Chiron Super Sport', costo: 950000, vMax: 430, acc: 96, col: '#2563eb' },
    { id: 13, modello: 'Koenigsegg Jesko Absolut', costo: 1400000, vMax: 460, acc: 97, col: '#7c3aed' },
    { id: 14, modello: 'Rimac Nevera Neon', costo: 1900000, vMax: 415, acc: 100, col: '#06b6d4' },
    { id: 15, modello: 'Hennessey Venom F5', costo: 2500000, vMax: 490, acc: 98, col: '#db2777' },
    { id: 16, modello: 'Cyberpunk Quadra V-Tech', costo: 3200000, vMax: 510, acc: 99, col: '#e11d48' },
    { id: 17, modello: 'DeLorean Outatime Quantum', costo: 4500000, vMax: 540, acc: 95, col: '#cbd5e1' },
    { id: 18, modello: 'Batmobile Tumbler MK2', costo: 6000000, vMax: 480, acc: 100, col: '#030712' },
    { id: 19, modello: 'F-16 Ground Prototype', costo: 8500000, vMax: 620, acc: 100, col: '#475569' },
    { id: 20, modello: 'Millennium Rover Hyperdrive', costo: 15000000, vMax: 750, acc: 100, col: '#f59e0b' }
];

const catalogoPezzi = [
    { id: 1, nome: 'Filtro Aria Sportivo', tipo: 'vMax', bonus: 10, costo: 1500 },
    { id: 2, nome: 'Candele all Iridio Racing', tipo: 'vMax', bonus: 15, costo: 3000 },
    { id: 3, nome: 'Centralina Rimappata Stage 1', tipo: 'vMax', bonus: 25, costo: 6000 },
    { id: 4, nome: 'Scarico Diretto in Titanio', tipo: 'vMax', bonus: 40, costo: 12000 },
    { id: 5, nome: 'Alberi a Camme Rilavorati', tipo: 'vMax', bonus: 55, costo: 25000 },
    { id: 6, nome: 'Turbocompressore Stage 3', tipo: 'vMax', bonus: 75, costo: 50000 },
    { id: 7, nome: 'Kit Bi-Turbo Forgiato', tipo: 'vMax', bonus: 110, costo: 150000 },
    { id: 8, nome: 'Reattore a Fusione Magnetica', tipo: 'vMax', bonus: 200, costo: 1000000 },
    { id: 9, nome: 'Gomme Mescola Morbida', tipo: 'acc', bonus: 10, costo: 2000 },
    { id: 10, nome: 'Pastiglie Freni in Carbon-Ceramica', tipo: 'acc', bonus: 14, costo: 4000 },
    { id: 11, nome: 'Frizione Rinforzata in Rame', tipo: 'acc', bonus: 18, costo: 8500 },
    { id: 12, nome: 'Assetto Regolabile a Ghiera', tipo: 'acc', bonus: 22, costo: 17000 },
    { id: 13, nome: 'Alleggerimento Scocca Carbonio', tipo: 'acc', bonus: 28, costo: 35000 },
    { id: 14, nome: 'Cambio Sequenziale da Gara', tipo: 'acc', bonus: 35, costo: 70000 },
    { id: 15, nome: 'Iniezione Protossido d Azoto (NOS)', tipo: 'acc', bonus: 45, costo: 180000 },
    { id: 16, nome: 'Propulsore Antimateria Quantistica', tipo: 'acc', bonus: 60, costo: 1200000 }
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
        let txt = `🏎️ *CONCESSIONARIA AUTOMOBILISTICA GLOBALE* 🏎️\n`;
        txt += `========================================\n\n`;
        txt += `Usa il comando \`${usedPrefix}compraauto [numero]\` per acquistare.\n`;
        txt += `Spazio Garage Attuale: *${user.parcoAuto.length}/${user.garageSlot}* auto.\n\n`;

        catalogoAuto.forEach(c => {
            txt += `*${c.id}. ${c.modello}*\n`;
            txt += `💰 Prezzo: *${c.costo.toLocaleString()}€*\n`;
            txt += `📊 V-Max: *${c.vMax} km/h* | Scatto: *${c.acc}/100*\n\n`;
        });

        return m.reply(txt);
    }

    if (command === 'shoppezzi') {
        let txt = `🛠️ *OFFICINA MECCANICA: ACQUISTO COMPONENTI* 🛠️\n`;
        txt += `========================================\n\n`;
        txt += `Migliora le performance della tua auto attiva con \`${usedPrefix}comprapezzo [numero]\`.\n\n`;

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
        if (isNaN(idScelto) || idScelto < 1 || idScelto > catalogoAuto.length) {
            return m.reply(`⚠️ Specifica un codice auto valido dal catalogo. Esempio: \`${usedPrefix}compraauto 5\``);
        }

        if (user.parcoAuto.length >= user.garageSlot) {
            let costoEsp = user.garageSlot * 50000;
            return m.reply(`❌ Il tuo garage è pieno (*${user.parcoAuto.length}/${user.garageSlot}* slots).\n\nUsa \`${usedPrefix}potenziagarage\` per sbloccare un nuovo slot a *${costoEsp.toLocaleString()}€*.`);
        }

        let autoSelezionata = catalogoAuto.find(c => c.id === idScelto);
        if (user.euro < autoSelezionata.costo) {
            return m.reply(`❌ Fondi insufficienti. Ti mancano *${(autoSelezionata.costo - user.euro).toLocaleString()}€*.`);
        }

        user.euro -= autoSelezionata.costo;
        let nuovaAuto = {
            modello: autoSelezionata.modello,
            vMax: autoSelezionata.vMax,
            acc: autoSelezionata.acc,
            colore: autoSelezionata.col,
            pezziInstallati: []
        };

        user.parcoAuto.push(nuovaAuto);
        user.autoAttiva = user.parcoAuto.length - 1;

        let buffer = await generaCanvasAuto(nuovaAuto, user.parcoAuto.length, user.garageSlot);
        return conn.sendMessage(chatId, { image: buffer, caption: `🔑 *COMPRA EFFETTUATA!*\n\nHai acquistato una **${nuovaAuto.modello}**. La trovi impostata come principale nel tuo garage.` }, { quoted: m });
    }

    if (command === 'comprapezzo') {
        if (user.autoAttiva === null || !user.parcoAuto[user.autoAttiva]) {
            return m.reply(`❌ Non hai nessuna auto impostata come attiva nel tuo garage.`);
        }

        let idPezzo = parseInt(args[0]);
        if (isNaN(idPezzo) || idPezzo < 1 || idPezzo > catalogoPezzi.length) {
            return m.reply(`⚠️ Inserisci un codice pezzo valido dalla lista.`);
        }

        let pezzo = catalogoPezzi.find(p => p.id === idPezzo);
        let auto = user.parcoAuto[user.autoAttiva];

        auto.pezziInstallati = auto.pezziInstallati || [];
        if (auto.pezziInstallati.includes(pezzo.nome)) {
            return m.reply(`❌ Questo veicolo monta già l'upgrade *${pezzo.nome}*.`);
        }

        if (user.euro < pezzo.costo) {
            return m.reply(`❌ Credito insufficiente. Costo pezzo: *${pezzo.costo.toLocaleString()}€*.`);
        }

        user.euro -= pezzo.costo;
        auto.pezziInstallati.push(pezzo.nome);

        if (pezzo.tipo === 'vMax') auto.vMax += pezzo.bonus;
        if (pezzo.tipo === 'acc') auto.acc = Math.min(100, auto.acc + pezzo.bonus);

        let buffer = await generaCanvasAuto(auto, user.parcoAuto.length, user.garageSlot);
        return conn.sendMessage(chatId, { image: buffer, caption: `🛠️ *MONTAGGIO COMPLETATO!*\n\nIl pezzo *${pezzo.nome}* è stato calibrato sulla tua *${auto.modello}*.\n📈 Statistiche incrementate!` }, { quoted: m });
    }

    if (command === 'potenziagarage') {
        let costoEspansione = user.garageSlot * 50000;
        if (user.euro < costoEspansione) {
            return m.reply(`❌ L'espansione strutturale per lo slot successivo richiede *${costoEspansione.toLocaleString()}€*.`);
        }

        user.euro -= costoEspansione;
        user.garageSlot += 1;

        return m.reply(`🏢 *GARAGE AMPLIATO!*\n\nNuova ala dell'officina sbloccata con successo. Slots massimi attuali: **${user.garageSlot}**.`);
    }

    if (command === 'garage') {
        if (user.parcoAuto.length === 0) {
            return m.reply(`⚠️ Il tuo garage è vuoto. Dai un'occhiata alle auto disponibili usando \`${usedPrefix}shopauto\`.`);
        }

        let auto = user.parcoAuto[user.autoAttiva];
        let buffer = await generaCanvasAuto(auto, user.parcoAuto.length, user.garageSlot);

        let cap = `🚘 *PROFILO GARAGE PRIVATO* 🚘\n`;
        cap += `========================================\n\n`;
        cap += `🏎️ *Veicolo Corrente:* ${auto.modello}\n`;
        cap += `📊 Velocità Massima: *${auto.vMax} km/h*\n`;
        cap += `⚡ Profilo Scatto: *${auto.acc}/100*\n\n`;
        cap += `📦 *Upgrades Modificati:* ${auto.pezziInstallati.length > 0 ? auto.pezziInstallati.join(', ') : 'Nessuno'}\n`;
        cap += `🏢 Occupazione Spazio: **${user.parcoAuto.length}/${user.garageSlot} vetture**\n\n`;
        cap += `💡 _Usa \`${usedPrefix}shoppezzi\` per esplorare l'officina dei potenziamenti hardware._`;

        return conn.sendMessage(chatId, { image: buffer, caption: cap }, { quoted: m });
    }
};

async function generaCanvasAuto(auto, usati, totali) {
    const canvas = createCanvas(620, 360);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, 620, 360);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 620; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 360); ctx.stroke();
    }

    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(360, 20, 240, 320);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(360, 20, 240, 320);

    ctx.shadowColor = auto.colore;
    ctx.shadowBlur = 20;
    ctx.fillStyle = auto.colore;
    ctx.fillRect(60, 180, 230, 65);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#060811';
    ctx.fillRect(80, 190, 50, 25);
    ctx.fillRect(190, 190, 80, 25);

    ctx.fillStyle = '#111111';
    ctx.beginPath(); ctx.arc(100, 245, 24, 0, 2 * Math.PI); ctx.fill();
    ctx.beginPath(); ctx.arc(250, 245, 24, 0, 2 * Math.PI); ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(auto.modello.slice(0, 22).toUpperCase(), 380, 55);

    ctx.fillStyle = '#ffffff';
    ctx.font = '11px sans-serif';
    ctx.fillText(`VELOCITÀ: ${auto.vMax} KM/H`, 380, 110);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(380, 120, 200, 8);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(380, 120, Math.min(200, (auto.vMax / 900) * 200), 8);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(`SCATTO: ${auto.acc}/100`, 380, 170);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(380, 180, 200, 8);
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(380, 180, (auto.acc / 100) * 200, 8);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText(`GARAGE SLOTS: ${usati}/${totali}`, 380, 240);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(380, 250, 200, 8);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(380, 250, (usati / totali) * 200, 8);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(20, 20, 160, 30);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('OFFICINA CENTRALIZZATA', 30, 38);

    return canvas.toBuffer('image/png');
}

handler.help = ['garage', 'shopauto', 'shoppezzi', 'compraauto', 'comprapezzo', 'potenziagarage'];
handler.tags = ['eco'];
handler.command = ['garage', 'shopauto', 'shoppezzi', 'compraauto', 'comprapezzo', 'potenziagarage'];
handler.group = true;

export default handler;
