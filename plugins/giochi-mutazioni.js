import pkg from 'canvas';
const { createCanvas } = pkg;

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const chatId = m.chat;
    const userId = m.sender;

    global.db = global.db || { data: { users: {} } };
    global.db.data.users[userId] = global.db.data.users[userId] || { euro: 0, creatura: null };
    let user = global.db.data.users[userId];

    if (user.creatura) {
        let ora = Date.now();
        let ultimoRilascio = user.creatura.ultimoGuadagno || ora;
        let millisecondiTrascorsi = ora - ultimoRilascio;
        let minutiTrascorsi = Math.floor(millisecondiTrascorsi / 60000);

        if (minutiTrascorsi > 0) {
            let renditaMinuto = 0;
            if (user.creatura.rarita === '🟢 COMUNE') renditaMinuto = 2;
            if (user.creatura.rarita === '🟡 RARO') renditaMinuto = 6;
            if (user.creatura.rarita === '🔵 SUPER RARO') renditaMinuto = 15;
            if (user.creatura.rarita === '🟠 EPIC') renditaMinuto = 30;
            if (user.creatura.rarita === '🔴 LEGGENDARIO') renditaMinuto = 65;
            if (user.creatura.rarita === '🔮 MITICO') renditaMinuto = 150;

            let guadagnoTotale = minutiTrascorsi * renditaMinuto;
            user.euro += guadagnoTotale;
            user.creatura.ultimoGuadagno = ora;

            if (guadagnoTotale > 0) {
                m.reply(`🏪 *RENDITA PASSIVA:* La tua creatura ha generato *+${guadagnoTotale}€* mentre eri via.`);
            }
        }
    }

    const tipiCreature = ['Chimera', 'Cyborg-Lupo', 'Idra Neon', 'Mecha-Gatto', 'Fenix Nucleare', 'Tardigrado Alfa'];
    const raritaSieri = [
        { nome: 'Siero Comune', costo: 500, prob: [0.65, 0.25, 0.08, 0.02, 0.00, 0.00] },
        { nome: 'Siero Quantistico', costo: 2500, prob: [0.15, 0.45, 0.25, 0.12, 0.03, 0.00] },
        { nome: 'Siero Radioattivo', costo: 6000, prob: [0.00, 0.15, 0.40, 0.30, 0.12, 0.03] }
    ];

    if (command === 'mutazione') {
        if (!user.creatura) {
            let txt = `🧪 *LABORATORIO DI MUTAZIONE GENETICA* 🧪\n`;
            txt += `====================================\n\n`;
            txt += `Non possiedi ancora nessuna creatura geneticamente modificata.\n\n`;
            txt += `🧬 *SIERI DISPONIBILI NELL'INCUBATRICE:*\n`;
            raritaSieri.forEach((s, idx) => {
                txt += `▪️ *ID ${idx + 1}:* ${s.nome} -> *${s.costo}€*\n`;
            });
            txt += `\n🎯 Acquista un siero usando i bottoni qui sotto:`;

            const buttons = [
                { buttonId: `${usedPrefix}creamutazione 1`, buttonText: { displayText: '🧪 COMUNE (500€)' }, type: 1 },
                { buttonId: `${usedPrefix}creamutazione 2`, buttonText: { displayText: '⚡ QUANTISTICO (2.5k€)' }, type: 1 },
                { buttonId: `${usedPrefix}creamutazione 3`, buttonText: { displayText: '☣️ RADIOATTIVO (6k€)' }, type: 1 }
            ];

            return conn.sendMessage(chatId, { text: txt, buttons: buttons, headerType: 1 }, { quoted: m });
        }

        let buffer = await generaCanvasLaboratorio(user.creatura);
        let renditaOraria = 0;
        let bonusG = '';
        
        if (user.creatura.rarita === '🟢 COMUNE') { renditaOraria = 120; bonusG = '3%'; }
        if (user.creatura.rarita === '🟡 RARO') { renditaOraria = 360; bonusG = '5%'; }
        if (user.creatura.rarita === '🔵 SUPER RARO') { renditaOraria = 900; bonusG = '15%'; }
        if (user.creatura.rarita === '🟠 EPIC') { renditaOraria = 1800; bonusG = '20%'; }
        if (user.creatura.rarita === '🔴 LEGGENDARIO') { renditaOraria = 3900; bonusG = '30%'; }
        if (user.creatura.rarita === '🔮 MITICO') { renditaOraria = 9000; bonusG = '50%'; }

        let cap = `🧪 *STATO ATTUALE CAPSULA DI MUTAZIONE* 🧪\n\n`;
        cap += `🧬 *Creatura:* ${user.creatura.nome}\n`;
        cap += `📊 *Rarità:* ${user.creatura.rarita}\n`;
        cap += `⚔️ *Potenza Attacco:* ${user.creatura.attacco}/100\n`;
        cap += `🛡️ *Potenza Difesa:* ${user.creatura.difesa}/100\n\n`;
        cap += `💰 *Rendita Passiva:* *+${renditaOraria}€ / ora*\n`;
        cap += `📈 *Bonus Guadagni Globale:* *+${bonusG}* ad ogni incasso\n`;
        cap += `💵 *Valore di Mercato:* ${user.creatura.valore}€\n\n`;
        cap += `Scegli come procedere con i bottoni:`;

        let costoEvoluzione = Math.floor(user.creatura.valore * 0.4);
        const buttons = [
            { buttonId: `${usedPrefix}evoluimutazione`, buttonText: { displayText: `🧬 EVOLVI (${costoEvoluzione}€)` }, type: 1 }
        ];

        return conn.sendMessage(chatId, { image: buffer, caption: cap, buttons: buttons, headerType: 4 }, { quoted: m });
    }

    if (command === 'creamutazione') {
        if (user.creatura) return m.reply(`⚠️ Hai già una creatura attiva! Digita \`${usedPrefix}mutazione\``);
        
        let idSiero = parseInt(args[0]) - 1;
        if (isNaN(idSiero) || idSiero < 0 || idSiero > 2) return m.reply(`⚠️ Specifica un ID valido.`);

        let siero = raritaSieri[idSiero];
        if (user.euro < siero.costo) return m.reply(`❌ Non hai abbastanza euro! Ti servono *${siero.costo}€*.`);

        user.euro -= siero.costo;

        let rand = Math.random();
        let r_nome = '';
        let c1 = siero.prob[0];
        let c2 = c1 + siero.prob[1];
        let c3 = c2 + siero.prob[2];
        let c4 = c3 + siero.prob[3];
        let c5 = c4 + siero.prob[4];

        if (rand < c1) r_nome = '🟢 COMUNE';
        else if (rand < c2) r_nome = '🟡 RARO';
        else if (rand < c3) r_nome = '🔵 SUPER RARO';
        else if (rand < c4) r_nome = '🟠 EPIC';
        else if (rand < c5) r_nome = '🔴 LEGGENDARIO';
        else r_nome = '🔮 MITICO';

        let nomeC = tipiCreature[Math.floor(Math.random() * tipiCreature.length)];
        let atk = Math.floor(Math.random() * 20) + 10;
        let def = Math.floor(Math.random() * 20) + 10;
        let val = siero.costo;

        if (r_nome === '🟡 RARO') { atk += 10; def += 10; val *= 1.8; }
        if (r_nome === '🔵 SUPER RARO') { atk += 20; def += 20; val *= 2.5; }
        if (r_nome === '🟠 EPIC') { atk += 35; def += 35; val *= 4; }
        if (r_nome === '🔴 LEGGENDARIO') { atk += 55; def += 55; val *= 8; }
        if (r_nome === '🔮 MITICO') { atk += 80; def += 80; val *= 15; }

        user.creatura = {
            nome: nomeC,
            rarita: r_nome,
            attacco: atk,
            difesa: def,
            valore: Math.floor(val),
            ultimoGuadagno: Date.now()
        };

        let buffer = await generaCanvasLaboratorio(user.creatura);
        let ris = `🧬 *MUTAZIONE COMPLETATA!* 🧬\n\n`;
        ris += `Hai dato vita a: *${nomeC}*!\n`;
        ris += `Grado genetico: *${r_nome}*\n\n`;
        ris += `Genererà soldi in modo passivo sul tuo profilo!`;

        const buttons = [{ buttonId: `${usedPrefix}mutazione`, buttonText: { displayText: '🔬 VEDI NELLA CAPSULA' }, type: 1 }];
        return conn.sendMessage(chatId, { image: buffer, caption: ris, buttons: buttons, headerType: 4 }, { quoted: m });
    }

    if (command === 'evoluimutazione') {
        if (!user.creatura) return m.reply(`❌ Non hai nessuna creatura da far evolvere.`);
        
        let costoEvoluzione = Math.floor(user.creatura.valore * 0.4);
        if (user.euro < costoEvoluzione) return m.reply(`❌ Ti servono *${costoEvoluzione}€* per tentare l'evoluzione chimica.`);

        user.euro -= costoEvoluzione;

        if (Math.random() < 0.38) {
            let risNeg = `💥 *ESPLOSIONE CHIMICA!* 💥\n\n`;
            risNeg += `Il siero ha causato un rigetto molecolare distruttivo.\n`;
            risNeg += `La tua creatura si è sciolta nell'acido! Hai perso tutto.`;
            user.creatura = null;
            return m.reply(risNeg);
        }

        user.creatura.attacco = Math.min(100, user.creatura.attacco + Math.floor(Math.random() * 12) + 4);
        user.creatura.difesa = Math.min(100, user.creatura.difesa + Math.floor(Math.random() * 12) + 4);
        user.creatura.valore = Math.floor(user.creatura.valore * 1.45);

        if (Math.random() < 0.22) {
            if (user.creatura.rarita === '🟢 COMUNE') user.creatura.rarita = '🟡 RARO';
            else if (user.creatura.rarita === '🟡 RARO') user.creatura.rarita = '🔵 SUPER RARO';
            else if (user.creatura.rarita === '🔵 SUPER RARO') user.creatura.rarita = '🟠 EPIC';
            else if (user.creatura.rarita === '🟠 EPIC') user.creatura.rarita = '🔴 LEGGENDARIO';
            else if (user.creatura.rarita === '🔴 LEGGENDARIO') user.creatura.rarita = '🔮 MITICO';
        }

        let buffer = await generaCanvasLaboratorio(user.creatura);
        let risPos = `🧬 *EVOLUZIONE RIUSCITA!* 🧬\n\n`;
        risPos += `I geni si sono fusi aumentando la potenza e la rendita passiva!\n`;
        risPos += `Nuovo Valore di Mercato: *${user.creatura.valore}€*`;

        const buttons = [{ buttonId: `${usedPrefix}mutazione`, buttonText: { displayText: '🔬 TORNA ALLA CAPSULA' }, type: 1 }];
        return conn.sendMessage(chatId, { image: buffer, caption: risPos, buttons: buttons, headerType: 4 }, { quoted: m });
    }
};

async function generaCanvasLaboratorio(creatura) {
    const canvas = createCanvas(600, 350);
    const ctx = canvas.getContext('2d');

    let grad = ctx.createLinearGradient(0, 0, 600, 350);
    grad.addColorStop(0, '#05111a');
    grad.addColorStop(1, '#020508');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 350);

    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1;
    for (let i = 0; i < 600; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 350); ctx.strokeStyle = 'rgba(0, 240, 255, 0.02)'; ctx.stroke();
    }
    for (let j = 0; j < 350; j += 40) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(600, j); ctx.strokeStyle = 'rgba(0, 240, 255, 0.02)'; ctx.stroke();
    }

    let colNeon = '#00ffaa';
    if (creatura.rarita === '🟡 RARO') colNeon = '#ffff00';
    if (creatura.rarita === '🔵 SUPER RARO') colNeon = '#00ccff';
    if (creatura.rarita === '🟠 EPIC') colNeon = '#ffaa00';
    if (creatura.rarita === '🔴 LEGGENDARIO') colNeon = '#ff0055';
    if (creatura.rarita === '🔮 MITICO') colNeon = '#cc33ff';

    ctx.strokeStyle = colNeon;
    ctx.lineWidth = 4;
    ctx.shadowColor = colNeon;
    ctx.shadowBlur = 15;
    ctx.strokeRect(30, 40, 200, 260);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(35, 45, 190, 250);

    ctx.shadowBlur = 0;
    ctx.fillStyle = colNeon;
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('CAPSULA BIO', 70, 30);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(creatura.nome.toUpperCase(), 260, 75);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '14px sans-serif';
    ctx.fillText('GRADO GENETICO:', 260, 110);
    ctx.fillStyle = colNeon;
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(creatura.rarita, 395, 110);

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.fillText(`ATTACCO: ${creatura.attacco}/100`, 260, 160);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(260, 170, 300, 12);
    ctx.fillStyle = '#ff3333';
    ctx.fillRect(260, 170, (creatura.attacco / 100) * 300, 12);

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.fillText(`DIFESA: ${creatura.difesa}/100`, 260, 215);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(260, 225, 300, 12);
    ctx.fillStyle = '#33ccff';
    ctx.fillRect(260, 225, (creatura.difesa / 100) * 300, 12);

    ctx.fillStyle = 'rgba(0, 255, 170, 0.1)';
    ctx.fillRect(260, 265, 300, 40);
    ctx.strokeStyle = '#00ffaa';
    ctx.lineWidth = 1;
    ctx.strokeRect(260, 265, 300, 40);

    ctx.fillStyle = '#00ffaa';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`VALORE: ${creatura.valore}€`, 275, 290);

    ctx.strokeStyle = colNeon;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, 100); ctx.lineTo(120, 70); ctx.lineTo(180, 140); ctx.lineTo(90, 220); ctx.lineTo(150, 270);
    ctx.stroke();

    return canvas.toBuffer('image/png');
}

handler.help = ['mutazione', 'creamutazione', 'evoluimutazione'];
handler.tags = ['giochi'];
handler.command = ['mutazione', 'creamutazione', 'evoluimutazione'];
handler.group = true;

export default handler;
