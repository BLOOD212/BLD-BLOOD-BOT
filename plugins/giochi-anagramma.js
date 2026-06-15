let games = {};

let handler = async (m, { conn, usedPrefix, command, text }) => {
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
                "BOTTIGLIA", "OROLOGIO", "QUADERNO", "CHITARRA", "STAZIONE", "OMBRELONE"
            ],
            impossibile: [
                "INFORMATICA", "PROGRAMMAZIONE", "TELECOMUNICAZIONI", "CRYPTOCURRENCY", "AMMINISTRATORE", 
                "SOPRALLUOGO", "CONTRADDITORIO", "PARTICOLARITÀ", "SPROPORZIONATO"
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

        let indizioIniziale = Array(parolaOriginale.length).fill("_");

        games[chatId] = {
            original: parolaOriginale,
            scrambled: parolaMescolata,
            level: sceltaDifficolta,
            errorsLeft: maxErrori[sceltaDifficolta],
            reward: premi[sceltaDifficolta],
            hint: indizioIniziale,
            revealedIndexes: [],
            timer: setTimeout(() => {
                if (games[chatId]) {
                    conn.sendMessage(chatId, { text: `⏳ *TEMPO SCADUTO!*\n\nNessuno ha indovinato in tempo. La parola corretta era: *${games[chatId].original}*` });
                    delete games[chatId];
                }
            }, 90000)
        };

        let messaggio = `🔤 *SFIDA ANAGRAMMA ESTRATTA*\n\n`;
        messaggio += `📊 Difficoltà: *${sceltaDifficolta.toUpperCase()}*\n`;
        messaggio += `🧠 Riordina le lettere per formare la parola:\n`;
        messaggio += `👉 *${parolaMescolata}*\n\n`;
        messaggio += `📌 Indizio: \`${indizioIniziale.join(' ')}\`\n`;
        messaggio += `💰 Premio in palio: *${premi[sceltaDifficolta]}€*\n`;
        messaggio += `❤️ Errori rimasti al gruppo: *${maxErrori[sceltaDifficolta]}*\n\n`;
        messaggio += `⏱️ Avete 90 secondi per rispondere usando il comando: \`${usedPrefix}p [parola]\``;

        return m.reply(messaggio);
    }

    else if (command === 'p') {
        const game = games[chatId];
        if (!game) return m.reply(`❌ Nessun anagramma attivo in questo gruppo. Avvialo con \`${usedPrefix}anagramma\``);

        if (!text) return m.reply(`⚠️ Inserisci la parola per tentare la risposta!\nEsempio: \`${usedPrefix}p PIZZA\``);

        const rispostaUtente = text.trim().toUpperCase();

        if (rispostaUtente === game.original) {
            clearTimeout(game.timer);
            
            global.db = global.db || { data: { users: {} } };
            global.db.data = global.db.data || { users: {} };
            global.db.data.users = global.db.data.users || {} ;
            global.db.data.users[m.sender] = global.db.data.users[m.sender] || {};
            
            global.db.data.users[m.sender].euro = (global.db.data.users[m.sender].euro || 0) + game.reward;
            
            let vittoria = `🎉 *COMPLIMENTI!*\n\n`;
            vittoria += `👤 @${m.sender.split('@')[0]} ha indovinato la parola prima di tutti!\n`;
            vittoria += `🎯 Parola: *${game.original}*\n`;
            vittoria += `💰 Ricompensa: *+${game.reward}€* aggiunti al tuo portafoglio!`;
            
            delete games[chatId];
            return conn.sendMessage(chatId, { text: vittoria, mentions: [m.sender] }, { quoted: m });
        }

        if (rispostaUtente.length === game.original.length) {
            game.errorsLeft--;

            if (game.errorsLeft <= 0) {
                clearTimeout(game.timer);
                let soluzione = game.original;
                delete games[chatId];
                return m.reply(`💀 *GAME OVER!*\n\nIl gruppo ha esaurito i tentativi disponibili. La parola corretta era: *${soluzione}*`);
            }

            let indiciDisponibili = [];
            for (let i = 0; i < game.original.length; i++) {
                if (!game.revealedIndexes.includes(i)) {
                    indiciDisponibili.push(i);
                }
            }

            if (indiciDisponibili.length > 0) {
                const indiceScelto = indiciDisponibili[Math.floor(Math.random() * indiciDisponibili.length)];
                game.hint[indiceScelto] = game.original[indiceScelto];
                game.revealedIndexes.push(indiceScelto);
            }

            let erroreMsg = `❌ *Sbagliato!* Una lettera è andata al suo posto.\n\n`;
            erroreMsg += `👉 Anagramma: *${game.scrambled}*\n`;
            erroreMsg += `📌 Indizio aggiornato: \`${game.hint.join(' ')}\`\n`;
            erroreMsg += `❤️ Tentativi rimasti al gruppo: *${game.errorsLeft}*`;

            return m.reply(erroreMsg);
        } else {
            return m.reply(`⚠️ La parola inserita non ha lo stesso numero di lettere dell'anagramma (*${game.original.length} lettere*). Riprova!`);
        }
    }
};

handler.command = /^(anagramma|scramble|p)$/i;
handler.group = true;
export default handler;
