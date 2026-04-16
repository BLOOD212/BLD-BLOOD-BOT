import { performance } from "perf_hooks";

// Funzione per selezionare un elemento casuale da un array
function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

let handler = async (m, { conn, text }) => {
    let destinatario;

    // Se è una risposta a un messaggio
    if (m.quoted && m.quoted.sender) {
        destinatario = m.quoted.sender;
    }
    // Se ci sono utenti menzionati
    else if (m.mentionedJid && m.mentionedJid.length > 0) {
        destinatario = m.mentionedJid[0];
    }
    // Se non c'è nulla
    else {
        return m.reply("Tagga qualcuno o rispondi a un messaggio per iniziare il ditalino.");
    }

    let nomeDestinatario = `@${destinatario.split('@')[0]}`;

    // Messaggi personalizzati
    let sequenza = [
        `🤟🏻 *Inizio un bel ditalino per* *${nomeDestinatario}*...`,
        "🤟🏻 *Ci siamo quasi*...",
        "👋🏻 *Riparatevi dalla cascata, si salvi chi può*!!"
    ];

    // Invia i messaggi uno alla volta
    for (let msg of sequenza) {
        await m.reply(msg, null, { mentions: [destinatario] });
    }

    // Calcolo del tempo
    let startTime = performance.now();
    let endTime = performance.now();
    let elapsedTime = (endTime - startTime).toFixed(2);

    let resultMessage = `✨ *${nomeDestinatario}* *è venuta💦💦 allagando l'intero gruppo e sta spruzzando come una troietta bagnata dopo* *${elapsedTime}ms*!`;

    conn.reply(m.chat, resultMessage, m, { mentions: [destinatario] });
};

handler.help = ['ditalino'];
handler.tags = ['giochi'];
handler.command = /^(ditalino)$/i;

handler.group = true;
handler.admin = false;
handler.botAdmin = false;

handler.fail = null;

export default handler;