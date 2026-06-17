let games = {};

let handler = async (m, { conn, command }) => {
    const chatId = m.chat;

    if (!m.isGroup) return m.reply(`『 🔤 』 \`Questo comando può essere usato solo nei gruppi.\``);

    if (command === 'anagramma' || command === 'scramble') {
        if (games[chatId]) {
            return m.reply(`⚠️ C'è già un anagramma attivo in questo gruppo!\nParola: *${games[chatId].scrambled}*`);
        }

        const difficoltaDisponibili = ['facile', 'medio', 'difficile', 'impossibile'];
        const sceltaDifficolta = difficoltaDisponibili[Math.floor(Math.random() * difficoltaDisponibili.length)];

        const dizionario = {
            facile: [
                "PIZZA", "CANE", "GATTO", "SOLE", "MARE", "CASA", "PANE", "RISO", "VINO", "ERBA", 
                "LIBRO", "AUTO", "MOTO", "FUMO", "LUCE", "ARTE", "COLA", "PEPE", "SALE", "UVA"
            ],
            medio: [
                "TELEFONO", "WHATSAPP", "GRUPPO", "AMICI", "DIVANO", "SERIE", "CALCIO", "MUSICA", 
                "ESTATE", "LAVORO", "SCUOLA", "VIAGGIO", "CUCINA", "TAVOLO", "STRADA"
            ],
            difficile: [
                "MESSAGGIO", "TASTIERA", "STICKER", "CALCETTO", "VACANZE", "COMPUTER", "SCHERMO", 
                "BOTTIGLIA", "OROLOGIO", "QUADERNO", "CHITARRA", "STAZIONE", "OMBRELLONE"
            ],
            impossibile: [
                "INFORMATICA", "PROGRAMMAZIONE", "TELECOMUNICAZIONI", "CRYPTOCURRENCY", "AMMINISTRATORE", 
                "SOPRALLUOGO", "CONTRADDITORIO", "PARTICOLARITA", "SPROPORZIONATO"
            ]
        };

        const maxErrori = { facile: 2, medio: 3, difficile: 5, impossibile: 6 };
        const premi = { facile: 10, medio: 25, difficile: 50, impossibile: 100 };

        const paroleLivello = dizionario[sceltaDifficolta];
        const parolaOriginale = paroleLivello[Math.floor(Math.random() * paroleLivello.length)];

        let lettere = parolaOriginale.split('');
        for (let i = lettere.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [lettere[i], lettere[j]] = [lettere[j], lettere[i]];
        }
        const parolaMescolata = lettere.join('');

        games[chatId] = {
            original: parolaOriginale,
            scrambled: parolaMescolata,
            level: sceltaDifficolta,
            errorsLeft: maxErrori[sceltaDifficolta],
            reward: premi[sceltaDifficolta],
            hint: Array(parolaOriginale.length).fill("_"),
            revealedIndexes: [],
            timer: setTimeout(() => {
                if (games[chatId]) {
                    conn.sendMessage(chatId, { text: `⏳ *TEMPO SCADUTO!*\n\nNessuno ha indovinato. La parola era: *${games[chatId].original}*` });
                    delete games[chatId];
                }
            }, 90000)
        };

        let messaggio = `🔤 *SFIDA ANAGRAMMA ESTRATTA*\n\n`;
        messaggio += `📊 Difficoltà: *${sceltaDifficolta.toUpperCase()}*\n`;
        messaggio += `👉 *${parolaMescolata}*\n\n`;
        messaggio += `📌 Indizio: \`${games[chatId].hint.join(' ')}\`\n`;
        messaggio += `💰 Premio: *${premi[sceltaDifficolta]}€*\n`;
        messaggio += `⏱️ Scrivi la parola nel gruppo per vincere!`;

        return m.reply(messaggio);
    }
};

handler.before = async (m, { conn }) => {
    const chatId = m.chat;
    const game = games[chatId];
    if (!game || m.isBaileys || !m.text) return;

    const rispostaUtente = m.text.trim().toUpperCase();

    if (rispostaUtente === game.original) {
        clearTimeout(game.timer);
        global.db.data.users[m.sender].euro = (global.db.data.users[m.sender].euro || 0) + game.reward;
        
        let vittoria = `🎉 *COMPLIMENTI!*\n\n👤 @${m.sender.split('@')[0]} ha indovinato!\n🎯 Parola: *${game.original}*\n💰 Ricompensa: *+${game.reward}€*`;
        delete games[chatId];
        return conn.sendMessage(chatId, { text: vittoria, mentions: [m.sender] }, { quoted: m });
    }

    if (rispostaUtente.length === game.original.length) {
        game.errorsLeft--;
        if (game.errorsLeft <= 0) {
            clearTimeout(game.timer);
            delete games[chatId];
            return m.reply(`💀 *GAME OVER!*\n\nLa parola corretta era: *${game.original}*`);
        }

        let indiciDisponibili = [];
        for (let i = 0; i < game.original.length; i++) {
            if (!game.revealedIndexes.includes(i)) indiciDisponibili.push(i);
        }

        if (indiciDisponibili.length > 0) {
            const indiceScelto = indiciDisponibili[Math.floor(Math.random() * indiciDisponibili.length)];
            game.hint[indiceScelto] = game.original[indiceScelto];
            game.revealedIndexes.push(indiceScelto);
        }

        return m.reply(`❌ *Sbagliato!*\n📌 Indizio aggiornato: \`${game.hint.join(' ')}\`\n❤️ Tentativi rimasti: *${game.errorsLeft}*`);
    }
};

handler.command = /^(anagramma|scramble)$/i;
handler.group = true;
handler.tag = [giochi];
export default handler;
