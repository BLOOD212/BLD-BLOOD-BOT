let games = {};

const playAgainButtons = () => [{
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text: 'Ancora un anagramma!', id: '.anagramma' })
}];

let handler = async (m, { conn, command }) => {
    const chatId = m.chat;
    if (!m.isGroup) return m.reply(`『 🔤 』 \`Questo comando può essere usato solo nei gruppi.\``);

    if (command === 'anagramma' || command === 'scramble') {
        if (games[chatId]) return m.reply(`⚠️ C'è già un anagramma attivo!`);

        const dizionario = {
            facile: ["PIZZA", "CANE", "GATTO", "SOLE", "MARE", "CASA", "PANE", "RISO", "VINO", "ERBA"],
            medio: ["TELEFONO", "WHATSAPP", "GRUPPO", "AMICI", "DIVANO", "SERIE", "CALCIO", "MUSICA"],
            difficile: ["MESSAGGIO", "TASTIERA", "STICKER", "CALCETTO", "VACANZE", "COMPUTER"],
            impossibile: ["INFORMATICA", "PROGRAMMAZIONE", "TELECOMUNICAZIONI", "CRYPTOCURRENCY"]
        };

        const diffs = ['facile', 'medio', 'difficile', 'impossibile'];
        const scelta = diffs[Math.floor(Math.random() * diffs.length)];
        const parola = dizionario[scelta][Math.floor(Math.random() * dizionario[scelta].length)];
        
        let lettere = parola.split('').sort(() => Math.random() - 0.5);
        const scram = lettere.join('');

        let msg = await conn.sendMessage(chatId, { text: `🔤 *SFIDA ANAGRAMMA (${scelta.toUpperCase()})*\n👉 *${scram}*\n📌 Indizio: \`${Array(parola.length).fill("_").join(' ')}\`\n💰 Premio: *${{facile:10, medio:25, difficile:50, impossibile:100}[scelta]}€*` });

        games[chatId] = {
            id: msg.key.id, // ID del messaggio per il controllo
            original: parola,
            scrambled: scram,
            level: scelta,
            errorsLeft: { facile: 2, medio: 3, difficile: 5, impossibile: 6 }[scelta],
            reward: { facile: 10, medio: 25, difficile: 50, impossibile: 100 }[scelta],
            hint: Array(parola.length).fill("_"),
            revealedIndexes: [],
            timer: setTimeout(() => {
                if (games[chatId]) {
                    conn.sendMessage(chatId, { text: `⏳ *TEMPO SCADUTO!*\nLa parola era: *${games[chatId].original}*`, footer: '𝐁𝐋𝐎𝐎𝐃-𝐁𝐎𝐓', buttons: playAgainButtons() }, { quoted: msg });
                    delete games[chatId];
                }
            }, 90000)
        };
    }
};

handler.before = async (m, { conn }) => {
    const game = games[m.chat];
    // Metodo di controllo identico alle bandiere
    if (!game || m.isBaileys || !m.quoted || m.quoted.id !== game.id) return;

    const rispostaUtente = m.text.trim().toUpperCase();

    if (rispostaUtente === game.original) {
        clearTimeout(game.timer);
        global.db.data.users[m.sender].euro = (global.db.data.users[m.sender].euro || 0) + game.reward;
        let msg = await conn.sendMessage(m.chat, { text: `🎉 *COMPLIMENTI!*\n👤 @${m.sender.split('@')[0]} ha indovinato!\n🎯 Parola: *${game.original}*\n💰 Ricompensa: *+${game.reward}€*`, mentions: [m.sender], footer: '𝐁𝐋𝐎𝐎𝐃-𝐁𝐎𝐓', buttons: playAgainButtons() }, { quoted: m });
        delete games[m.chat];
    } else {
        game.errorsLeft--;
        if (game.errorsLeft <= 0) {
            clearTimeout(game.timer);
            await conn.sendMessage(m.chat, { text: `💀 *GAME OVER!*\nLa parola corretta era: *${game.original}*`, footer: '𝐁𝐋𝐎𝐎𝐃-𝐁𝐎𝐓', buttons: playAgainButtons() }, { quoted: m });
            delete games[m.chat];
        } else {
            let indici = Array.from({length: game.original.length}, (_, i) => i).filter(i => !game.revealedIndexes.includes(i));
            const indice = indici[Math.floor(Math.random() * indici.length)];
            game.hint[indice] = game.original[indice];
            game.revealedIndexes.push(indice);
            m.reply(`❌ *Sbagliato!*\n📌 Indizio: \`${game.hint.join(' ')}\`\n❤️ Tentativi: *${game.errorsLeft}*`);
        }
    }
};

handler.command = /^(anagramma|scramble)$/i;
handler.group = true;
handler.tag = ["giochi"];
export default handler;
