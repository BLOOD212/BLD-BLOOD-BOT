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
            jackpot: Math.floor(Math.random() * (1500 - 300 + 1)) + 300,
            lanciTotali: 0,
            ultimoGiocatore: 'Nessuno'
        };
    }

    let userEuro = global.db.data.users[m.sender].euro || 0;

    if (!text) {
        let info = `🔮 *IL POZZO CIECO DEI DESIDERI* 🔮\n`;
        info += `====================================\n\n`;
        info += `💰 *JACKPOT ATTUALE:*  ❓ *Sconosciuto!*\n`;
        info += `⚠️ _Il valore del pozzo è segreto e cambia ogni volta!_\n\n`;
        info += `📊 *STATISTICHE DEL POZZO:*\n`;
        info += `✨ Euro extra gettati dal gruppo: *${datiPozzo[chatId].lanciTotali}€*\n`;
        info += `👤 Ultimo cercatore di fortuna: ${datiPozzo[chatId].ultimoGiocatore}\n\n`;
        info += `ℹ️ *COME PARTECIPARE:*\n`;
        info += `Lancia una quantità di euro nel pozzo. Se attivi la magia, vincerai l'intero Jackpot misterioso accumulato fino a questo momento!\n\n`;
        info += `📈 *BONUS DI PUNTATA:*\n`;
        info += `Più monete lanci insieme, più sale la tua percentuale di sbloccare il bottino segreto!\n\n`;
        info += `👉 *Usa:* \`${usedPrefix}${command} [cifra]\` (es: \`${usedPrefix}${command} 25\`)`;
        return m.reply(info);
    }

    if (isNaN(text)) return m.reply(`⚠️ *ERRORE*: Devi specificare una cifra numerica valida da lanciare.`);

    let lancio = parseInt(text);

    if (lancio <= 0) return m.reply(`❌ Inserisci una cifra superiore a 0.`);
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

        let vittoria = `✨🌌 *IL POZZO SEGRETO SI È SBLOCCATO!* 🌌✨\n`;
        vittoria += `====================================\n\n`;
        vittoria += `🎉 *CLAMOROSO!* @${m.sender.split('@')[0]} ha indovinato il momento perfetto!\n`;
        vittoria += `🌊 Il pozzo cieco sputa fuori tutte le monete nascoste al suo interno!\n\n`;
        vittoria += `🏆 *HAI SVUOTATO IL JACKPOT MISTERIOSO!*\n`;
        vittoria += `💰 Hai vinto l'incredibile cifra di: *+${bottinoVinto}€*`;

        datiPozzo[chatId] = {
            jackpot: Math.floor(Math.random() * (1500 - 300 + 1)) + 300,
            lanciTotali: 0,
            ultimoGiocatore: 'Nessuno'
        };

        return conn.sendMessage(m.chat, { text: vittoria, mentions: [m.sender] }, { quoted: m });
    } else {
        let quotaFortuna = Math.floor(probabilitaFinale * 100);
        
        let risf = `🔮 *MONETA LANCIATA NEL PROFONDO* 🔮\n`;
        risf += `------------------------------------\n\n`;
        risf += `👤 @${m.sender.split('@')[0]} ha gettato *${lancio}€* nel buio del pozzo.\n`;
        risf += `🕳️ *Splash!* Senti il rumore, ma il Jackpot segreto resta nascosto...\n\n`;
        risf += `🎯 Probabilità di successo per questo lancio: *${quotaFortuna}%*\n`;
        risf += `💰 Gli euro extra nel pozzo aumentano di +${lancio}€!\n\n`;
        risf += `🍀 Continua a tentare la fortuna con \`${usedPrefix}${command} [cifra]\`!`;

        return conn.sendMessage(m.chat, { text: risf, mentions: [m.sender] }, { quoted: m });
    }
};

handler.help = ['pozzo', 'lancia'];
handler.tags = ['giochi'];
handler.command = /^(pozzo|lancia)$/i;
handler.group = true;

export default handler;
