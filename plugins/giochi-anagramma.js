let games = {};

let handler = async (m, { conn, command }) => {
    const chatId = m.chat;

    if (!m.isGroup) return m.reply(`『 🔤 』 \`Questo comando può essere usato solo nei gruppi.\``);

    if (command === 'anagramma' || command === 'scramble') {
        if (games[chatId]) {
            return m.reply(`⚠️ C'è già un anagramma attivo! Parola: *${games[chatId].scrambled}*`);
        }

        const dizionario = {
            facile: ["PIZZA", "CANE", "GATTO", "SOLE", "MARE", "CASA", "PANE", "RISO", "VINO", "ERBA", "LIBRO", "AUTO", "MOTO", "FUMO", "LUCE", "ARTE", "COLA", "PEPE", "SALE", "UVA", "PESCE", "MELA", "PORTA", "TESTA"],
            medio: ["TELEFONO", "WHATSAPP", "GRUPPO", "AMICI", "DIVANO", "SERIE", "CALCIO", "MUSICA", "ESTATE", "LAVORO", "SCUOLA", "VIAGGIO", "CUCINA", "TAVOLO", "STRADA", "COMPUTER", "TASTIERA", "AGENDA", "SCARPE", "CHITARRA"],
            difficile: ["MESSAGGIO", "BOTTIGLIA", "OROLOGIO", "QUADERNO", "STAZIONE", "OMBRELLONE", "COLTELLO", "SPECCHIO", "FINESTRA", "COPERTINA", "GIARDINO", "FRIGORIFERO", "PANTALONI", "DETERGENTE"],
            impossibile: ["INFORMATICA", "PROGRAMMAZIONE", "TELECOMUNICAZIONI", "CRYPTOCURRENCY", "AMMINISTRATORE", "SOPRALLUOGO", "CONTRADDITORIO", "PARTICOLARITA", "SPROPORZIONATO", "CARATTERISTICA", "INCONDIZIONATO"]
        };

        const livelli = Object.keys(dizionario);
        const sceltaDifficolta = livelli[Math.floor(Math.random() * livelli.length)];
        const maxErrori = { facile: 2, medio: 3, difficile: 5, impossibile: 6 };
        const premi = { facile: 10, medio: 25, difficile: 50, impossibile: 100 };

        const parolaOriginale = dizionario[sceltaDifficolta][Math.floor(Math.random() * dizionario[sceltaDifficolta].length)];
        let lettere = parolaOriginale.split('');
        for (let i = lettere.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [lettere[i], lettere[j]] = [lettere[j], lettere[i]];
        }
        
        games[chatId] = {
            original: parolaOriginale,
            scrambled: lettere.join(''),
            level: sceltaDifficolta,
            errorsLeft: maxErrori[sceltaDifficolta],
            reward: premi[sceltaDifficolta],
            hint: Array(parolaOriginale.length).fill("_"),
            revealedIndexes: [],
            timer: setTimeout(() => {
                if (games[chatId]) {
                    conn.sendMessage(chatId, { text: `⏳ *TEMPO SCADUTO!*\nLa parola era: *${games[chatId].original}*` });
                    delete games[chatId];
                }
            }, 90000)
        };

        return m.reply(`🔤 *SFIDA ANAGRAMMA (${sceltaDifficolta.toUpperCase()})*\n\n👉 *${games[chatId].scrambled}*\n📌 Indizio: \`${games[chatId].hint.join(' ')}\`\n💰 Premio: *${games[chatId].reward}€*`);
    }
};

handler.before = async (m, { conn }) => {
    const chatId = m.chat;
    const game = games[chatId];
    if (!game || m.isBaileys || !m.text) return;

    // Controlla se l'utente risponde al messaggio del bot o scrive direttamente
    const rispostaUtente = m.text.trim().toUpperCase();
    
    if (rispostaUtente === game.original) {
        clearTimeout(game.timer);
        global.db.data.users[m.sender].euro = (global.db.data.users[m.sender].euro || 0) + game.reward;
        delete games[chatId];
        return conn.sendMessage(chatId, { text: `🎉 *CORRETTO!*\n👤 @${m.sender.split('@')[0]} ha vinto *${game.reward}€*!`, mentions: [m.sender] }, { quoted: m });
    }

    // Se la lunghezza è uguale ma ha sbagliato parola
    if (rispostaUtente.length === game.original.length) {
        game.errorsLeft--;
        if (game.errorsLeft <= 0) {
            clearTimeout(game.timer);
            delete games[chatId];
            return m.reply(`💀 *GAME OVER!* La parola era: *${game.original}*`);
        }

        // Rivela una lettera casuale
        let indici = Array.from({length: game.original.length}, (_, i) => i).filter(i => !game.revealedIndexes.includes(i));
        if (indici.length > 0) {
            const i = indici[Math.floor(Math.random() * indici.length)];
            game.hint[i] = game.original[i];
            game.revealedIndexes.push(i);
        }
        return m.reply(`❌ *Sbagliato!* Tentativi rimasti: *${game.errorsLeft}*\n📌 Indizio: \`${game.hint.join(' ')}\``);
    }
};

handler.command = /^(anagramma|scramble)$/i;
handler.group = true;
export default handler;
