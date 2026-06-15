let datiPozzo = {};

let handler = async (m, { conn, usedPrefix, command, text }) => {
    const chatId = m.chat;

    if (!m.isGroup) return m.reply(`『 🔤 』 \`Questo comando può essere usato solo nei gruppi.\``);

    global.db = global.db || { data: { users: {} } };
    global.db.data = global.db.data || { users: {} };
    global.db.data.users = global.db.data.users || {};
    global.db.data.users[m.sender] = global.db.data.users[m.sender] || {};

    if (!datiPozzo[chatId]) {
        datiPozzo[chatId] = {
            jackpot: 150,
            lanciTotali: 0,
            ultimoGiocatore: 'Nessuno'
        };
    }

    let userEuro = global.db.data.users[m.sender].euro || 0;

    if (!text) {
        let info = `🔮 *IL POZZO MISTERIOSO DEI DESIDERI* 🔮\n`;
        info += `====================================\n\n`;
        info += `💰 *JACKPOT ATTUALE:*  🏆 *${datiPozzo[chatId].jackpot}€*\n\n`;
        info += `📊 *STATISTICHE DEL POZZO:*\n`;
        info += `✨ Monete accumulate all'interno: *${datiPozzo[chatId].lanciTotali}€*\n`;
        info += `👤 Ultimo cercatore di fortuna: ${datiPozzo[chatId].ultimoGiocatore}\n\n`;
        info += `ℹ️ *COME PARTECIPARE:*\n`;
        info += `Lancia una quantità di euro a tua scelta nel pozzo profondo. Se la magia del pozzo si attiva, l'intero Jackpot comunitario diventerà tuo!\n\n`;
        info += `📈 *BONUS DI PUNTATA:*\n`;
        info += `Più monete lanci contemporaneamente, più sale la tua percentuale di sbloccare il Jackpot!\n\n`;
        info += `👉 *Usa:* \`${usedPrefix}${command} [cifra]\` (es: \`${usedPrefix}${command} 25\`)`;
        return m.reply(info);
    }

    if (isNaN(text)) return m.reply(`⚠️ *ERRORE*: Devi specificare una cifra numerica valida da lanciare.`);

    let lancio = parseInt(text);

    if (lancio <= 0) return m.reply(`❌ Non puoi gettare il nulla nel pozzo! Inserisci una cifra superiore a 0.`);
    if (userEuro < lancio) return m.reply(`❌ Il tuo portafoglio è troppo leggero. Saldo attuale: *${userEuro}€*`);

    global.db.data.users[m.sender].euro -= lancio;
    datiPozzo[chatId].jackpot += lancio;
    datiPozzo[chatId].lanciTotali += lancio;
    datiPozzo[chatId].ultimoGiocatore = `@${m.sender.split('@')[0]}`;

    let probabilitaBase = 0.02;
    let bonusLancio = Math.min(0.08, (lancio / 500));
    let probabilitaFinale = probabilitaBase + bonusLancio;

    let vinceJackpot = Math.random() < probabilitaFinale;

    if (vinceJackpot) {
        let bottinoVinto = datiPozzo[chatId].jackpot;
        global.db.data.users[m.sender].euro += bottinoVinto;

        let vittoria = `✨🌌 *IL POZZO TRABOCCA DI MAGIA!* 🌌✨\n`;
        vittoria += `====================================\n\n`;
        vittoria += `🎉 *CLAMOROSO!* Le divinità del pozzo hanno accolto l'offerta di @${m.sender.split('@')[0]}!\n`;
        vittoria += `🌊 Un'esplosione di monete d'oro investe la chat del gruppo!\n\n`;
        vittoria += `🏆 *HAI SVUOTATO IL POZZO!*\n`;
        vittoria += `💰 Vincita totale accreditata: *+${bottinoVinto}€*`;

        datiPozzo[chatId] = {
            jackpot: 150,
            lanciTotali: 0,
            ultimoGiocatore: 'Nessuno'
        };

        return conn.sendMessage(m.chat, { text: vittoria, mentions: [m.sender] }, { quoted: m });
    } else {
        let quotaFortuna = Math.floor(probabilitaFinale * 100);
        
        let risf = `🔮 *MONETA LANCIATA NEL PROFONDO* 🔮\n`;
        risf += `------------------------------------\n\n`;
        risf += `👤 @${m.sender.split('@')[0]} ha gettato *${lancio}€* nell'oscurità.\n`;
        risf += `🕳️ *Splash!* Senti il rumore dell'acqua, ma il Jackpot rimane sul fondo...\n\n`;
        risf += `🎯 Probabilità di successo per questo lancio: *${quotaFortuna}%*\n`;
        risf += `💰 Il nuovo *JACKPOT* da saccheggiare è: *${datiPozzo[chatId].jackpot}€*\n\n`;
        risf += `🍀 La fortuna non è bastata. Riprova lanciando altre monete con \`${usedPrefix}${command}\`!`;

        return conn.sendMessage(m.chat, { text: risf, mentions: [m.sender] }, { quoted: m });
    }
};

handler.help = ['pozzo', 'lancia'];
handler.tags = ['game'];
handler.command = /^(pozzo|lancia)$/i;
handler.group = true;

export default handler;
