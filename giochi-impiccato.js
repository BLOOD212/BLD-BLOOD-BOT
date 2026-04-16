import { createCanvas } from 'canvas'; // Importa la libreria canvas

const parole = [
  "gatto", "cane", "uccello", "elefante", "tigre", "balena", "farfalla", "tartaruga", "coniglio", "rana", "polpo", "scoiattolo", "giraffa", "coccodrillo", "pinguino", "corvo", "delfino", "serpente", "criceto", "zanzara", "ape",
  "televisione", "computer", "economia", "elettronica", "facebook", "whatsapp", "instagram", "tiktok", "telefono", "stampante", "microfono", "tastiera", "monitor", "processore", "batteria", "auricolari", "fotocamera", "proiettore", "router", "tablet",
  "milanese", "presidente", "bot", "insegnante", "studente", "avvocato", "architetto", "bibliotecario", "pediatra", "scienziato", "ricercatore", "musicista", "pittore", "scrittore", "giornalista", "regista", "attore", "attrice", "cuoco", "pasticcere",
  "anticonstituzionalmente", "precipitevolissimevolmente", "elettroencefalografista", "psiconeuroendocrinoimmunologia", "interscambiabilità", "transustanziazione", "incomprensibilità", "sovrappopolazione", "incommensurabilità", "inadeguatezza", "responsabilizzazione", "disinteressatamente", "inappuntabilità", "sovraccaricamento", "imprenditorialità", "riqualificazione", "sottosviluppato", "sovrintendenza", "incompatibilità", "contraddistinguere",
  "film", "matematica", "chimica", "fisica", "filosofia", "psicologia", "letteratura", "università", "biblioteca", "laboratorio", "esperimento", "viaggiatore", "astronauta", "astronomia", "costellazione", "galassia", "universo", "gravità", "orbita", "satellite"
];

const intentiMax = 6;
const gam = new Map();
const hintTimeout = 30; // secondi prima che si possa chiedere un indizio
const hintCost = 10; // euro per indizio

function scegliParolaCasuale() {
  return parole[Math.floor(Math.random() * parole.length)];
}

function mostraParola(p, lettere) {
  let out = "";
  for (const l of p) {
    if (lettere.includes(l)) {
      out += l + " ";
    } else if ("aeiou".includes(l)) {
      out += "+ "; // Più per le vocali non indovinate
    } else {
      out += "- "; // Meno per le consonanti non indovinate
    }
  }
  return out.trim();
}

/**
 * Disegna lo stato del gioco dell'impiccato su un canvas e restituisce l'immagine come buffer.
 * @param {number} intenti Il numero di tentativi rimasti.
 * @returns {Buffer} Un buffer contenente l'immagine PNG.
 */
function disegnaAhorcado(intenti) {
    const lost = intentiMax - intenti;
    const canvas = createCanvas(400, 400);
    const ctx = canvas.getContext('2d');

    // Sfondo bianco
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ombra del patibolo e dell'omino
    ctx.fillStyle = 'rgba(0, 0, 0, 0.07)';
    if(lost >= 1) { // L'ombra dell'omino appare solo quando appare l'omino
        ctx.beginPath();
        ctx.ellipse(250, 355, 40, 10, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.beginPath();
    ctx.rect(95, 345, 255, 10);
    ctx.fill();

    // Patibolo (aspetto legno)
    ctx.strokeStyle = '#8B4513'; // Marrone legno
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(50, 350);
    ctx.lineTo(350, 350); // Base
    ctx.moveTo(100, 350);
    ctx.lineTo(100, 50);  // Palo verticale
    ctx.lineTo(250, 50);  // Palo orizzontale
    ctx.stroke();
    
    // Supporto obliquo per il patibolo
    ctx.beginPath();
    ctx.moveTo(100, 120);
    ctx.lineTo(170, 50);
    ctx.stroke();

    // Corda
    ctx.strokeStyle = '#A0522D'; // Colore corda
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(250, 50);
    ctx.lineTo(250, 100); // Corda
    ctx.stroke();

    // Omino (più stilizzato)
    ctx.strokeStyle = '#2c3e50'; // Colore scuro per l'omino
    ctx.lineWidth = 6;

    if (lost >= 1) { // Testa con cappio e viso
        // Cappio
        ctx.beginPath();
        ctx.arc(250, 115, 15, 0, Math.PI * 2, true);
        ctx.stroke();
        // Testa
        ctx.fillStyle = '#ecf0f1';
        ctx.beginPath();
        ctx.arc(250, 145, 30, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.stroke();
        
        // --- LOGICA ESPRESSIONE FACCIALE ---
        ctx.lineWidth = 2; // Linea più sottile per i tratti del viso

        if (lost < 3) { // 1-2 errori: Faccia spensierata
            ctx.fillStyle = '#2c3e50';
            // Occhi
            ctx.beginPath();
            ctx.arc(242, 142, 3, 0, Math.PI * 2); // Sinistro
            ctx.arc(258, 142, 3, 0, Math.PI * 2); // Destro
            ctx.fill();
            // Bocca sorridente
            ctx.beginPath();
            ctx.arc(250, 152, 10, 0, Math.PI, false);
            ctx.stroke();
        } else if (lost < 6) { // 3-5 errori: Faccia preoccupata
            ctx.fillStyle = '#2c3e50';
            // Occhi
            ctx.beginPath();
            ctx.arc(242, 142, 3.5, 0, Math.PI * 2); // Sinistro
            ctx.arc(258, 142, 3.5, 0, Math.PI * 2); // Destro
            ctx.fill();
            // Bocca dritta/preoccupata
            ctx.beginPath();
            ctx.moveTo(242, 155);
            ctx.lineTo(258, 155);
            ctx.stroke();
        } else { // 6 errori: Game Over
            // Occhi a X
            ctx.beginPath();
            ctx.moveTo(238, 138); ctx.lineTo(246, 146);
            ctx.moveTo(246, 138); ctx.lineTo(238, 146);
            ctx.moveTo(254, 138); ctx.lineTo(262, 146);
            ctx.moveTo(262, 138); ctx.lineTo(254, 146);
            ctx.stroke();
            // Lingua fuori
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(245, 160);
            ctx.bezierCurveTo(245, 168, 255, 168, 255, 160);
            ctx.stroke();
            ctx.strokeStyle = '#2c3e50';
        }
    }
    ctx.lineWidth = 6; // Ripristina spessore linea
    if (lost >= 2) { // Corpo
        ctx.beginPath();
        ctx.moveTo(250, 175);
        ctx.lineTo(250, 260);
        ctx.stroke();
    }
    if (lost >= 3) { // Braccio sinistro
        ctx.beginPath();
        ctx.moveTo(250, 190);
        ctx.lineTo(200, 240);
        ctx.stroke();
    }
    if (lost >= 4) { // Braccio destro
        ctx.beginPath();
        ctx.moveTo(250, 190);
        ctx.lineTo(300, 240);
        ctx.stroke();
    }
    if (lost >= 5) { // Gamba sinistra
        ctx.beginPath();
        ctx.moveTo(250, 260);
        ctx.lineTo(200, 310);
        ctx.stroke();
    }
    if (lost >= 6) { // Gamba destra
        ctx.beginPath();
        ctx.moveTo(250, 260);
        ctx.lineTo(300, 310);
        ctx.stroke();
    }

    return canvas.toBuffer('image/png');
}


function lettereRestanti(p, lettere) {
  let vocali = 0, consonanti = 0;
  const lettereUniche = new Set(p.split(''));
  for (const l of lettereUniche) {
    if (!lettere.includes(l)) {
      if ("aeiou".includes(l)) vocali++;
      else consonanti++;
    }
  }
  return { vocali, consonanti };
}

let handler = async (m, { conn }) => {
  if (gam.has(m.sender)) {
    return conn.reply(m.chat, "⚠️ Hai già una partita in corso. Termina quella prima di iniziarne una nuova!", m);
  }
  let parola = scegliParolaCasuale();
  let lettere = [];
  let intenti = intentiMax;
  let msg = mostraParola(parola, lettere);
  let startTime = Date.now();

  const { vocali, consonanti } = lettereRestanti(parola, lettere);
  const caption = `ㅤㅤ⋆｡˚『 ╭ \`IMPICCATO\` ╯ 』˚｡⋆
╭
│ 『 📝 』 \`Parola:\` *${msg}*
│ 『 ❤️ 』 \`Tentativi:\` *${intenti}*
│ 『 ➕ 』 \`Vocali:\` *${vocali}*
│ 『 ➖ 』 \`Consonanti:\` *${consonanti}*
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

Rispondi a questo messaggio per giocare!
(Dopo ${hintTimeout} secondi puoi scrivere *indizio* per ottenere un aiuto, costa ${hintCost} 🌟)`;
  
  const imageBuffer = disegnaAhorcado(intenti);
  let sent = await conn.sendFile(m.chat, imageBuffer, 'impiccato.png', caption, m);
  
  gam.set(m.sender, { parola, lettere, intenti, startTime, hintUsed: false, msgId: sent.key.id });
};

handler.before = async (m, { conn }) => {
  let gioco = gam.get(m.sender);
  if (!gioco) return;

  // Verifica che si stia rispondendo al messaggio del gioco
  if (!m.quoted || m.quoted.id !== gioco.msgId) return;

  let { parola, lettere, intenti, startTime, hintUsed, msgId } = gioco;
  let user = global.db.data.users[m.sender];
  let input = m.text.trim().toLowerCase();

  // Gestione comando "indizio"
  if (input === 'indizio') {
    let elapsed = (Date.now() - startTime) / 1000;
    if (hintUsed) {
      return conn.reply(m.chat, "❗ Hai già usato l'indizio per questa parola!", m);
    }
    if (elapsed < hintTimeout) {
      return conn.reply(m.chat, `⏳ Attendi ancora ${Math.ceil(hintTimeout - elapsed)} secondi per richiedere un indizio!`, m);
    }
    if (!user || user.euro < hintCost) {
      return conn.reply(m.chat, `❌ Non hai abbastanza euro! Servono almeno ${hintCost} 🌟 per un indizio.`, m);
    }
    let letterePossibili = parola.split('').filter(l => !lettere.includes(l));
    if (letterePossibili.length === 0) {
      return conn.reply(m.chat, "🤔 Non ci sono più lettere da suggerire!", m);
    }
    let suggerita = letterePossibili[Math.floor(Math.random() * letterePossibili.length)];
    lettere.push(suggerita);
    user.euro -= hintCost;
    gioco.hintUsed = true;
    
    let msg = mostraParola(parola, lettere);
    const completata = parola.split('').every(l => lettere.includes(l));
    
    if (completata) {
        let exp = Math.floor(Math.random() * 300) + 100;
        if (parola.length >= 8) exp = Math.floor(Math.random() * 3500) + 500;
        global.db.data.users[m.sender].exp += exp;
        gam.delete(m.sender);
        const winCaption = `💡 Indizio: la lettera *${suggerita.toUpperCase()}* è stata rivelata!\n\nㅤㅤ⋆｡˚『 ╭ \`HAI VINTO!\` ╯ 』˚｡⋆\n╭\n│ 『 🎉 』 \`Parola:\` *${parola}*\n│ 『  XP 』 \`Guadagnati:\` *${exp}*\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;
        return conn.reply(m.chat, winCaption, m);
    } else {
        const { vocali, consonanti } = lettereRestanti(parola, lettere);
        const caption = `💡 Indizio: la lettera *${suggerita.toUpperCase()}* è stata rivelata!\n\nㅤㅤ⋆｡˚『 ╭ \`IMPICCATO\` ╯ 』˚｡⋆\n╭\n│ 『 📝 』 \`Parola:\` *${msg}*\n│ 『 ❤️ 』 \`Tentativi:\` *${intenti}*\n│ 『 ➕ 』 \`Vocali:\` *${vocali}*\n│ 『 ➖ 』 \`Consonanti:\` *${consonanti}*\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;
        const imageBuffer = disegnaAhorcado(intenti);
        let sent = await conn.sendFile(m.chat, imageBuffer, 'impiccato.png', caption, m);
        gam.set(m.sender, { ...gioco, msgId: sent.key.id });
    }
    return;
  }
  
  // Gestione input utente (lettera o parola)
  if (/^[a-z]+$/.test(input)) {
    let msg;
    if (input.length === 1) { // L'utente ha inserito una lettera
      if (lettere.includes(input)) {
         return conn.reply(m.chat, "❗ Lettera già inserita, provane un'altra.", m);
      }
      lettere.push(input);
      if (!parola.includes(input)) {
        intenti--;
      }
    } else { // L'utente ha provato a indovinare la parola
      if (input === parola) {
         lettere = parola.split('');
      } else {
        intenti--;
        await conn.reply(m.chat, `❌ Parola sbagliata! Hai perso un tentativo.`, m);
      }
    }
    
    msg = mostraParola(parola, lettere);
    const completata = parola.split('').every(l => lettere.includes(l));

    if (intenti <= 0) {
      gam.delete(m.sender);
      const caption = `ㅤㅤ⋆｡˚『 ╭ \`HAI PERSO!\` ╯ 』˚｡⋆\n╭\n│ 『 💀 』 \`La parola era:\` *${parola}*\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;
      const imageBuffer = disegnaAhorcado(0);
      return conn.sendFile(m.chat, imageBuffer, 'impiccato.png', caption, m);
    } else if (completata) {
      let exp = Math.floor(Math.random() * 300) + 100;
      if (parola.length >= 8) exp = Math.floor(Math.random() * 3500) + 500;
      global.db.data.users[m.sender].exp += exp;
      gam.delete(m.sender);
      const caption = `ㅤㅤ⋆｡˚『 ╭ \`HAI VINTO!\` ╯ 』˚｡⋆\n╭\n│ 『 🎉 』 \`Parola:\` *${parola}*\n│ 『 ✨ 』 \`Guadagnati:\` *${exp} XP*\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;
      const imageBuffer = disegnaAhorcado(intenti);
      return conn.sendFile(m.chat, imageBuffer, 'impiccato.png', caption, m);
    } else {
      const { vocali, consonanti } = lettereRestanti(parola, lettere);
      const caption = `ㅤㅤ⋆｡˚『 ╭ \`IMPICCATO\` ╯ 』˚｡⋆
╭
│ 『 📝 』 \`Parola:\` *${msg}*
│ 『 ❤️ 』 \`Tentativi:\` *${intenti}*
│ 『 ➕ 』 \`Vocali:\` *${vocali}*
│ 『 ➖ 』 \`Consonanti:\` *${consonanti}*
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

Scrivi una lettera o prova a indovinare l'intera parola!`;
      const imageBuffer = disegnaAhorcado(intenti);
      let sent = await conn.sendFile(m.chat, imageBuffer, 'impiccato.png', caption, m);
      gam.set(m.sender, { ...gioco, lettere, intenti, msgId: sent.key.id });
    }
  }
};

handler.help = ['impiccato'];
handler.tags = ['giochi'];
handler.command = ['impiccato'];
handler.register = true;

export default handler;