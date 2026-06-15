let currentGame = {};

let handler = async (m, { conn, usedPrefix, command, text }) => {
    const chatId = m.chat;

    if (!m.isGroup) return m.reply(`『 🔤 』 \`Questo comando può essere usato solo nei gruppi.\``);

    const animali = [
        { nome: 'cane', difficolta: '🟢 FACILE', indizi: ['È il migliore amico dell\'uomo', 'Abbaia quando sente qualcuno', 'Ama rincorrere le palline', 'Fa le feste muovendo la coda'] },
        { nome: 'gatto', difficolta: '🟢 FACILE', indizi: ['I suoi baffi si chiamano vibrisse', 'Adora farsi le unghie sui divani', 'Fa le fusa quando riceve le coccole', 'Dice miao ed è un felino domestico'] },
        { nome: 'elefante', difficolta: '🟢 FACILE', indizi: ['È il mammifero terrestre più pesante', 'Le sue zanne sono fatte di avorio', 'Ha grandi orecchie e una lunga proboscide', 'Ha paura dei topolini nelle favole'] },
        { nome: 'leone', difficolta: '🟢 FACILE', indizi: ['Le femmine cacciano mentre lui riposa', 'Vive in branchi nella savana', 'È conosciuto da tutti come il Re della foresta', 'I maschi hanno una folta criniera'] },
        { nome: 'giraffa', difficolta: '🟡 MEDIO', indizi: ['Ha la lingua di colore bluastri', 'Le sue macchie sono uniche come impronte digitali', 'Ha piccole corna ricoperte di pelle sulla testa', 'È l\'animale più alto del mondo'] },
        { nome: 'delfino', difficolta: '🟡 MEDIO', indizi: ['Dorme con un solo emisfero cerebrale alla volta', 'Comunica con click e fischi complessi', 'Salta fuori dall\'acqua per respirare dallo sfiatatoio', 'È un mammifero marino super intelligente'] },
        { nome: 'squalo', difficolta: '🟡 MEDIO', indizi: ['Il suo scheletro è di cartilagine, non ha ossa', 'Ha più file di denti che si rigenerano sempre', 'Ha un olfatto pazzesco per il sangue a km di distanza', 'È il grande predatore dell\'oceano con la pinna dorsale'] },
        { nome: 'polpo', difficolta: '🟠 DIFFICILE', indizi: ['Ha tre cuori e il suo sangue è di colore blu', 'Ha un cervello in ogni singolo arto', 'Può rigenerare i tentacoli se vengono tagliati', 'Spruzza inchiostro nero per scappare dai predatori'] },
        { nome: 'bradipo', difficolta: '🟠 DIFFICILE', indizi: ['La sua digestione può durare fino a un mese intero', 'Scende dall\'albero solo una volta alla settimana per i bisogni', 'Sulla sua pelliccia crescono alghe che lo fanno sembrare verde', 'È l\'animale più lento del mondo'] },
        { nome: 'tardigrado', difficolta: '🔴 IMPOSSIBILE', indizi: ['Può sopravvivere nel vuoto dello spazio cosmico', 'Resiste a temperature vicine allo zero assoluto', 'Se si disidrata entra in uno stato di animazione sospesa', 'È chiamato anche orsetto d\'acqua ed è microscopico'] }
    ];

    let cmd = command.toLowerCase();

    if (cmd === 'identikit') {
        if (currentGame[chatId]) {
            return m.reply(`⚠️ C'è già una sessione attiva! Rispondi con \`${usedPrefix}indovina [nome]\``);
        }

        let animale = animali[Math.floor(Math.random() * animali.length)];
        
        currentGame[chatId] = {
            animale: animale.nome,
            difficolta: animale.difficolta,
            indizi: animale.indizi,
            indice: 1
        };

        let msg = `🔍 *IDENTIKIT: INVESTIGAZIONE APERTA* 🔍\n`;
        msg += `====================================\n\n`;
        msg += `📊 *DIFFICOLTÀ:* ${animale.difficolta}\n\n`;
        msg += `📌 *INDIZIO N.1:*\n`;
        msg += `👉 _"${animale.indizi[0]}"_\n\n`;
        msg += `------------------------------------\n`;
        msg += `🎮 *COME RISPONDERE:* Usa \`${usedPrefix}indovina [nome]\`\n`;
        msg += `💡 _Ogni 20 secondi scrivi nuovamente \`${usedPrefix}identikit\` per sbloccare l'indizio successivo senza intasare la VPS!_`;

        return m.reply(msg);
    }

    if (cmd === 'indovina') {
        if (!currentGame[chatId]) {
            return m.reply(`❌ Nessun caso aperto al momento. Digita \`${usedPrefix}identikit\` per iniziare.`);
        }
        if (!text) {
            return m.reply(`⚠️ Specifica il nome di un animale! Esempio: \`${usedPrefix}indovina elefante\``);
        }

        let tentativo = text.trim().toLowerCase();
        let dati = currentGame[chatId];

        if (tentativo === dati.animale) {
            let vincitore = m.sender;
            let ris = `🎉 *IDENTIKIT COMPLETATO!* 🎉\n`;
            ris += `====================================\n\n`;
            ris += `📊 *Difficoltà:* ${dati.difficolta}\n`;
            ris += `👤 *Risolto da:* @${vincitore.split('@')[0]}\n`;
            ris += `🎯 *Soluzione:* *${dati.animale.toUpperCase()}* 🐾\n\n`;
            ris += `👏 Ottimo lavoro investigativo!`;

            delete currentGame[chatId];
            return conn.sendMessage(chatId, { text: ris, mentions: [vincitore] }, { quoted: m });
        } else {
            return m.reply(`❌ *SBAGLIATO!* Non è un ${tentativo.toUpperCase()}. Continuate a cercare!`);
        }
    }
};

handler.help = ['identikit', 'indovina'];
handler.tags = ['giochi'];
handler.command = ['identikit', 'indovina'];
handler.group = true;

export default handler;
