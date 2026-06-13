import { createCanvas } from 'canvas';

let unoSession = {};

const coloriHex = { 
    'Rosso': '#FF3B30', 
    'Blu': '#007AFF', 
    'Giallo': '#FFCC00', 
    'Verde': '#4CD964', 
    'Jolly': '#1C1C1E' 
};

const gameButtons = (cmd) => [
    { buttonId: `pesca`, buttonText: { displayText: '📥 Pesca Carta' }, type: 1 },
    { buttonId: `enduno`, buttonText: { displayText: '🛑 Abbandona' }, type: 1 }
];

async function generaGrafica(s) {
    const canvas = createCanvas(1000, 630);
    const ctx = canvas.getContext('2d');
    
    // Sfondo Tavolo da Gioco Premium (Fondo verde scuro sfumato da Casino)
    const gradiente = ctx.createRadialGradient(500, 315, 100, 500, 315, 600);
    gradiente.addColorStop(0, '#0e4429'); 
    gradiente.addColorStop(1, '#051c11');
    ctx.fillStyle = gradiente; 
    ctx.fillRect(0, 0, 1000, 630);

    // Disegno linee geometriche di abbellimento sul tavolo
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, 940, 570);
    ctx.beginPath();
    ctx.arc(500, 315, 180, 0, Math.PI * 2);
    ctx.stroke();

    const drawCard = (x, y, label, color, isHidden = false, scale = 1, isTarget = false) => {
        const w = 85 * scale, h = 130 * scale;
        
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.4)'; 
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 4;

        if (isTarget) {
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 15;
        }

        // Bordo esterno bianco della carta
        ctx.fillStyle = '#ffffff'; 
        ctx.beginPath(); 
        ctx.roundRect(x, y, w, h, 10); 
        ctx.fill();
        ctx.restore();

        if (isHidden) {
            // Retro della carta (Stile UNO classico)
            ctx.fillStyle = '#d63031'; 
            ctx.beginPath(); 
            ctx.roundRect(x + 5, y + 5, w - 10, h - 10, 7); 
            ctx.fill();
            
            // Ovale centrale del retro
            ctx.fillStyle = '#ea2027';
            ctx.beginPath();
            ctx.ellipse(x + (w/2), y + (h/2), w/3, h/4, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.font = `italic bold ${14 * scale}px "Arial Black"`;
            ctx.fillText('UNO', x + (w/2), y + (h/2) + 5);
        } else {
            // Fronte della carta colorata
            ctx.fillStyle = color; 
            ctx.beginPath(); 
            ctx.roundRect(x + 5, y + 5, w - 10, h - 10, 7); 
            ctx.fill();

            // Ovale Bianco centrale stilizzato
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.beginPath();
            ctx.ellipse(x + (w/2), y + (h/2), w/2.4, h/3.5, Math.PI / 6, 0, Math.PI * 2);
            ctx.fill();

            // Testo/Valore della carta
            ctx.fillStyle = '#ffffff'; 
            ctx.textAlign = 'center'; 
            ctx.font = `bold ${32 * scale}px "Impact", "Arial Black"`;
            
            // Ombra del testo per maggiore leggibilità
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 4;
            
            let valore = label.split(' ')[1] || label;
            ctx.fillText(valore, x + (w/2), y + (h/2) + (11 * scale));
        }
    }

    // Disegno Mazzo Coperto a sinistra
    drawCard(70, 250, 'Mazzo', '#3a3a3c', true, 0.9);
    
    // Disegno Carte del Bot in alto (Coperte e leggermente sovrapposte)
    let botX = 500 - ((Math.min(s.botHand.length, 12) * 22) / 2);
    s.botHand.slice(0, 14).forEach((_, i) => {
        drawCard(botX + (i * 25), 45, '', '', true, 0.75);
    });

    // Disegno Carta Corrente sul Tavolo (In evidenza al centro)
    let tColore = coloriHex[s.currentColor] || coloriHex['Jolly'];
    drawCard(455, 235, s.tableCard, tColore, false, 1.25, true);

    // Disegno Carte del Giocatore in basso (Allineate e numerate)
    let startX = 500 - ((s.playerHand.length * 85) / 2);
    s.playerHand.forEach((c, i) => {
        let col = coloriHex[c.split(' ')[0]] || coloriHex['Jolly'];
        let cardX = startX + (i * 85);
        let cardY = 440;
        
        drawCard(cardX, cardY, c, col, false, 0.95);
        
        // Sotto-bacheca con l'indice numerico da digitare
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.arc(cardX + 40, cardY + 150, 14, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff'; 
        ctx.font = 'bold 15px "Arial"'; 
        ctx.textAlign = 'center';
        ctx.fillText(i + 1, cardX + 40, cardY + 155);
    });

    return canvas.toBuffer();
}

function creaMazzo() {
    let colori = ['Rosso', 'Blu', 'Giallo', 'Verde'], mazzo = [];
    colori.forEach(c => {
        mazzo.push(`${c} 0`);
        for (let v = 1; v <= 9; v++) { mazzo.push(`${c} ${v}`); mazzo.push(`${c} ${v}`); }
        for (let i = 0; i < 2; i++) mazzo.push(`${c} +2`);
    });
    for (let i = 0; i < 4; i++) { mazzo.push('Jolly 🔥'); mazzo.push('Jolly +4'); }
    return mazzo.sort(() => Math.random() - 0.5);
}

function puoGiocare(carta, tavolo, coloreScelto) {
    if (carta.includes('Jolly')) return true;
    let [c_c, v_c] = carta.split(' '), [c_t, v_t] = tavolo.split(' ');
    return c_c === coloreScelto || v_c === v_t;
}

let handler = async (m, { conn }) => {
    let chat = m.chat;
    let mazzo = creaMazzo();
    unoSession[chat] = {
        player: m.sender, mazzo,
        playerHand: mazzo.splice(0, 7),
        botHand: mazzo.splice(0, 7),
        tableCard: mazzo.find(c => !c.includes('Jolly') && !c.includes('+')),
        currentColor: ''
    };
    unoSession[chat].currentColor = unoSession[chat].tableCard.split(' ')[0];

    let img = await generaGrafica(unoSession[chat]);
    
    // Su iOS l'immagine deve viaggiare separata dai pulsanti per non rompersi
    await conn.sendMessage(chat, { image: img, caption: `🃏 *UNO MATCH INIZIATO!*\n🎨 Colore al tavolo: *${unoSession[chat].currentColor}*` }, { quoted: m });

    await conn.sendMessage(chat, {
        text: `🎮 *IL TUO TURNO*\n\nDigita il *numero* sotto la carta che vuoi lanciare oppure usa la pulsantiera nativa qui sotto per pescare.`,
        footer: '🔴 UNO Digital Table v1.2',
        buttons: gameButtons(),
        headerType: 1
    }, { quoted: m });
};

handler.before = async (m, { conn }) => {
    let chat = m.chat, s = unoSession[chat];
    if (!s || s.player !== m.sender) return;

    let msgText = (m.text || m.body || '').trim().toLowerCase();

    if (m.message?.buttonsResponseMessage?.selectedButtonId) {
        msgText = m.message.buttonsResponseMessage.selectedButtonId.toLowerCase();
    }

    if (msgText === '.uno' || msgText === 'uno') return;
    if (msgText === 'enduno' || msgText === '🛑 abbandona') { 
        delete unoSession[chat]; 
        return m.reply('🛑 *Partita terminata.* Il tavolo da gioco è stato chiuso.'); 
    }

    let report = "";
    if (msgText === 'pesca' || msgText === '📥 pesca') {
        if (s.mazzo.length === 0) s.mazzo = creaMazzo();
        let p = s.mazzo.shift(); 
        s.playerHand.push(p);
        report = `📥 Hai pescato la carta: *${p}*`;
        if (!puoGiocare(p, s.tableCard, s.currentColor)) {
            report += `\n❌ Non puoi giocarla. Il turno passa al Bot.`;
            report += botTurno(s);
        }
    } else {
        let idx = parseInt(msgText) - 1;
        if (isNaN(idx) || idx < 0 || idx >= s.playerHand.length) return;
        let carta = s.playerHand[idx];
        if (!puoGiocare(carta, s.tableCard, s.currentColor)) return m.reply('❌ *Mossa non valida!* La carta non corrisponde per colore o valore.');

        s.playerHand.splice(idx, 1); 
        s.tableCard = carta;
        s.currentColor = carta.includes('Jolly') ? s.currentColor : carta.split(' ')[0];
        report = `✅ Hai giocato: *${carta}*`;

        if (carta.includes('+2')) { 
            for(let i=0; i<2; i++) s.botHand.push(s.mazzo.shift());
            report += `\n⚠️ Il Bot subisce +2 carte e salta il turno!`;
        } else if (carta.includes('+4')) { 
            for(let i=0; i<4; i++) s.botHand.push(s.mazzo.shift());
            report += `\n🔥 Il Bot subisce +4 carte e salta il turno!`;
        } else {
            report += botTurno(s);
        }
    }

    if (s.playerHand.length === 0) { 
        delete unoSession[chat]; 
        return m.reply('🏆 *CONGRATULAZIONI! HAI VINTO LA PARTITA!* 🏆'); 
    }
    if (s.botHand.length === 0) { 
        delete unoSession[chat]; 
        return m.reply('💀 *GAME OVER! Il Bot ha esaurito le carte e ha vinto!* 💀'); 
    }

    let img = await generaGrafica(s);
    
    // Invio sdoppiato compatibile al 100% con iOS
    await conn.sendMessage(chat, { image: img, caption: `🎨 Colore corrente: *${s.currentColor}*\n🤖 Carte rimaste al Bot: *${s.botHand.length}*` }, { quoted: m });

    await conn.sendMessage(chat, { 
        text: `${report}\n\n👉 Invia il *numero* della carta da giocare o usa i tasti sotto:`, 
        footer: '🔴 UNO Digital Table v1.2',
        buttons: gameButtons(),
        headerType: 1
    }, { quoted: m });
};

function botTurno(s) {
    let mosse = s.botHand.filter(c => puoGiocare(c, s.tableCard, s.currentColor));
    if (mosse.length > 0) {
        let scelta = mosse.find(c => !c.includes('Jolly')) || mosse[0];
        s.botHand.splice(s.botHand.indexOf(scelta), 1); 
        s.tableCard = scelta;
        s.currentColor = scelta.includes('Jolly') ? ['Rosso','Blu','Verde','Giallo'][Math.floor(Math.random()*4)] : scelta.split(' ')[0];
        let res = `\n\n🤖 *Mossa del Bot:* Ha giocato *${scelta}*`;

        if (scelta.includes('+2')) { 
            for(let i=0; i<2; i++) s.playerHand.push(s.mazzo.shift());
            res += `\n⚠️ Ti prendi +2 carte e salti il turno!`; 
            res += botTurno(s); 
        } else if (scelta.includes('+4')) { 
            for(let i=0; i<4; i++) s.playerHand.push(s.mazzo.shift());
            res += `\n🔥 Ti prendi +4 carte e salti il turno!`; 
            res += botTurno(s); 
        }
        return res;
    } else {
        if (s.mazzo.length === 0) s.mazzo = creaMazzo();
        s.botHand.push(s.mazzo.shift()); 
        return `\n\n🤖 *Mossa del Bot:* Non aveva carte utili, quindi ha pescato dal mazzo.`;
    }
}

handler.command = /^(uno)$/i;
export default handler;
