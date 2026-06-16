import pkg from 'canvas';
const { createCanvas } = pkg;

let activeGames = {};

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const chatId = m.chat;
    const userId = m.sender;

    global.db = global.db || { data: { users: {} } };
    global.db.data.users[userId] = global.db.data.users[userId] || { euro: 0 };
    let user = global.db.data.users[userId];

    if (activeGames[userId] && (command === 'destra' || command === 'sinistra' || command === 'ritirati')) {
        let game = activeGames[userId];
        
        if (command === 'ritirati') {
            let vincita = Math.floor(game.puntata * game.moltiplicatori[game.passo - 1]);
            user.euro += vincita;
            let msg = `💰 *RITIRATA STRATEGICA!* 💰\n\n`;
            msg += `Hai deciso di non rischiare oltre. Ti porti a casa **${vincita}€**!\n`;
            msg += `Saldo attuale: *${user.euro}€*`;
            delete activeGames[userId];
            return m.reply(msg);
        }

        let scelta = command;
        let sceltaCorretta = game.percorso[game.passo];

        if (scelta === sceltaCorretta) {
            game.passo++;
            
            if (game.passo === 5) {
                let vincitaTotale = Math.floor(game.puntata * game.moltiplicatori[4]);
                user.euro += vincitaTotale;
                let buffer = await generaMappaPonte(game.percorso, game.passo, true);
                
                let ris = `🏆 *SOPRAVVISSUTO AL PONTE DI VETRO!* 🏆\n\n`;
                ris += `Sei riuscito ad attraversare incolume tutte le lastre!\n`;
                ris += `💵 *Puntata iniziale:* ${game.puntata}€\n`;
                ris += `🚀 *Moltiplicatore Massimo:* 5.0x\n`;
                ris += `💰 *VINCITA TOTALE:* **+${vincitaTotale}€**`;
                
                delete activeGames[userId];
                return conn.sendMessage(chatId, { image: buffer, caption: ris }, { quoted: m });
            }

            let premioAttuale = Math.floor(game.puntata * game.moltiplicatori[game.passo - 1]);
            let prossimoPremio = Math.floor(game.puntata * game.moltiplicatori[game.passo]);
            let buffer = await generaMappaPonte(game.percorso, game.passo, false);

            let txt = `🟩 *LASTRA SICURA! PASSO ${game.passo}/5* 🟩\n\n`;
            txt += `Il vetro ha retto il tuo peso! Sei un passo più vicino alla salvezza.\n\n`;
            txt += `💰 *Premio attuale accumulato:* ${premioAttuale}€\n`;
            txt += `📈 *Prossimo passo ti porterà a:* ${prossimoPremio}€ (Moltiplicatore: ${game.moltiplicatori[game.passo]}x)\n\n`;
            txt += `Scegli la prossima mossa con i bottoni qui sotto 👇`;

            return inviaBottoniGioco(conn, chatId, txt, buffer, m);
        } else {
            let buffer = await generaMappaPonte(game.percorso, game.passo, false, true);
            let ris = `💥 *IL VETRO SI È INFRANTO!* 💥\n\n`;
            ris += `Hai scelto la lastra di vetro normale. Sei precipitato nel vuoto!\n`;
            ris += `💀 Hai perso i tuoi **${game.puntata}€** scommessi.`;
            
            delete activeGames[userId];
            return conn.sendMessage(chatId, { image: buffer, caption: ris }, { quoted: m });
        }
    }

    if (command === 'ponte') {
        if (activeGames[userId]) {
            return m.reply(`⚠️ Hai già una sessione attiva! Finisci prima quella corrente.`);
        }

        let puntata = parseInt(args[0]);
        if (!puntata || isNaN(puntata) || puntata <= 0) {
            return m.reply(`⚠️ Specifica una cifra valida da scommettere!\nEsempio: \`.ponte 500\``);
        }

        if (user.euro < puntata) {
            return m.reply(`❌ Non hai abbastanza euro! Il tuo saldo attuale è di *${user.euro}€*.`);
        }

        user.euro -= puntata;

        let percorso = [];
        for (let i = 0; i < 5; i++) {
            percorso.push(Math.random() < 0.5 ? 'sinistra' : 'destra');
        }

        activeGames[userId] = {
            puntata: puntata,
            percorso: percorso,
            passo: 0,
            moltiplicatori: [1.3, 1.8, 2.5, 3.5, 5.0]
        };

        let buffer = await generaMappaPonte(percorso, 0, false);
        let txt = `🧪 *SQUID GAME: IL PONTE DI VETRO* 🧪\n\n`;
        txt += `Hai scommesso **${puntata}€**. Davanti a te ci sono 5 coppie di lastre di vetro. Una è di vetro temperato, l'altra si distruggerà.\n\n`;
        txt += `📈 *Tabella Moltiplicatori:*\n`;
        txt += `🚶 Passo 1: 1.3x\n🚶 Passo 2: 1.8x\n🚶 Passo 3: 2.5x\n🚶 Passo 4: 3.5x\n🏆 Passo 5: 5.0x\n\n`;
        txt += `Scegli dove saltare per il tuo primo passo usando i bottoni:`;

        return inviaBottoniGioco(conn, chatId, txt, buffer, m);
    }
};

async function inviaBottoniGioco(conn, chatId, text, imageBuffer, quoted) {
    const buttons = [
        { buttonId: '.sinistra', buttonText: { displayText: '⬅️ SINISTRA' }, type: 1 },
        { buttonId: '.destra', buttonText: { displayText: '➡️ DESTRA' }, type: 1 },
        { buttonId: '.ritirati', buttonText: { displayText: '💰 RITIRATI (Prendi i soldi)' }, type: 1 }
    ];

    return conn.sendMessage(chatId, {
        image: imageBuffer,
        caption: text,
        footer: '⚠️ Se i bottoni non funzionano, scrivi manualmente .destra o .sinistra',
        buttons: buttons,
        headerType: 4
    }, { quoted });
}

async function generaMappaPonte(percorso, passoAttuale, vittoria = false, morto = false) {
    const canvas = createCanvas(600, 800);
    const ctx = canvas.getContext('2d');

    let grad = ctx.createLinearGradient(0, 0, 0, 800);
    grad.addColorStop(0, '#0f0c20');
    grad.addColorStop(1, '#06040a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 800);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(200, 0); ctx.lineTo(200, 800);
    ctx.moveTo(400, 0); ctx.lineTo(400, 800);
    ctx.stroke();

    for (let i = 0; i < 5; i++) {
        let y = 620 - (i * 130);

        ctx.fillStyle = passoAttuale === i ? '#ff007f' : 'rgba(255, 255, 255, 0.3)';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(`LIVELLO ${i + 1}`, 20, y + 45);

        ['sinistra', 'destra'].forEach((lato) => {
            let x = lato === 'sinistra' ? 120 : 340;
            
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;

            if (i < passoAttuale) {
                ctx.fillStyle = 'rgba(0, 255, 127, 0.25)';
                ctx.strokeStyle = '#00ff7f';
                ctx.lineWidth = 3;
            } else if (i === passoAttuale) {
                if (morto) {
                    ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
                    ctx.strokeStyle = '#ff0000';
                    ctx.lineWidth = 4;
                } else {
                    ctx.fillStyle = 'rgba(0, 204, 255, 0.1)';
                    ctx.strokeStyle = '#00ccff';
                    ctx.lineWidth = 4;
                    ctx.shadowColor = '#00ccff';
                    ctx.shadowBlur = 10;
                }
            } else {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = 2;
            }

            disegnaRettangoloArrotondato(ctx, x, y, 140, 70, 8);
            ctx.fill();
            ctx.stroke();

            if (!(i === passoAttuale && morto)) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x + 20, y + 10);
                ctx.lineTo(x + 120, y + 60);
                ctx.stroke();
            } else if (i === passoAttuale && morto && percorso[i] !== lato) {
                ctx.fillStyle = '#ff0000';
                ctx.font = 'bold 30px sans-serif';
                ctx.fillText('💥', x + 55, y + 45);
            }
        });
    }

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, 600, 100);
    
    ctx.fillStyle = '#ff0055';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('⚡ PONTE DI VETRO ⚡', 160, 45);

    ctx.fillStyle = '#ffffff';
    ctx.font = '16px sans-serif';
    if (vittoria) {
        ctx.fillStyle = '#00ff7f';
        ctx.fillText('STATO: COMPLETATO 🎉', 210, 80);
    } else if (morto) {
        ctx.fillStyle = '#ff3333';
        ctx.fillText('STATO: PRECIPITATO 💀', 215, 80);
    } else {
        ctx.fillText(`PASSO ATTUALE: ${passoAttuale + 1} DI 5`, 220, 80);
    }

    return canvas.toBuffer('image/png');
}

function disegnaRettangoloArrotondato(ctx, x, y, larghezza, altezza, raggio) {
    ctx.beginPath();
    ctx.moveTo(x + raggio, y);
    ctx.lineTo(x + larghezza - raggio, y);
    ctx.quadraticCurveTo(x + larghezza, y, x + larghezza, y + raggio);
    ctx.lineTo(x + larghezza, y + altezza - raggio);
    ctx.quadraticCurveTo(x + larghezza, y + altezza, x + larghezza - raggio, y + altezza);
    ctx.lineTo(x + raggio, y + altezza);
    ctx.quadraticCurveTo(x, y + altezza, x, y + altezza - raggio);
    ctx.lineTo(x, y + raggio);
    ctx.quadraticCurveTo(x, y, x + raggio, y);
    ctx.closePath();
}

handler.help = ['ponte'];
handler.tags = ['giochi'];
handler.command = ['ponte', 'destra', 'sinistra', 'ritirati'];
handler.group = true;

export default handler;
