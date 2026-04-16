// Comando creato da Sam aka Vare - github.com/realvare
const playAgainQuickReply = (prefix) => ({
    interactiveMessage: {
        header: {
            hasMediaAttachment: false
        },
        body: {
            text: "Vuoi giocare ancora?"
        },
        nativeFlowMessage: {
            buttons: [
                {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "🔤 Gioca Ancora!",
                        id: `${prefix}loghi`
                    })
                }
            ]
        }
    }
});

let handler = async (m, { conn, args, participants, isAdmin, isBotAdmin, usedPrefix, command }) => {
    let frasi = [
        `🏢 *INDOVINA IL LOGO!* 🏢`,
        `🌍 *Che azienda rappresenta questo logo?*`,
        `🎯 *Sfida brand: riconosci questo logo?*`,
        `🧭 *Indovina l'azienda dal suo logo!*`,
        `📊 *Quiz marchi: quale azienda è questa?*`,
        `🌟 *Metti alla prova la tua conoscenza dei brand!*`,
        `🔍 *Osserva attentamente e indovina l'azienda!*`,
        `🚗 *Riconosci questo marchio automobilistico?*`,
        `🏁 *Sfida auto: quale casa automobilistica è questa?*`,
    ];

    if (m.text?.toLowerCase() === '.skiploghi') {
        if (!m.isGroup) return m.reply('⚠️ Questo comando funziona solo nei gruppi!');
        if (!global.loghiGame?.[m.chat]) return m.reply('⚠️ Non c\'è nessuna partita attiva in questo gruppo!');

        if (!isAdmin && !m.fromMe) {
            return m.reply('❌ *Questo comando può essere usato solo dagli admin!*');
        }

        clearTimeout(global.loghiGame[m.chat].timeout);
        await conn.sendMessage(m.chat, {
            text: `🛑 *Gioco dei loghi interrotto da un admin*\n✨ La risposta era: *${global.loghiGame[m.chat].rispostaOriginale}*`,
            ...playAgainQuickReply(usedPrefix)
        }, { quoted: m });
        delete global.loghiGame[m.chat];
        return;
    }

    if (global.loghiGame?.[m.chat]) {
        return m.reply('⚠️ C\'è già una partita attiva in questo gruppo!');
    }

    const cooldownKey = `loghi_${m.chat}`;
    const lastGame = global.cooldowns?.[cooldownKey] || 0;
    const now = Date.now();
    const cooldownTime = 5000;

    if (now - lastGame < cooldownTime) {
        const remainingTime = Math.ceil((cooldownTime - (now - lastGame)) / 1000);
        return m.reply(`⏳ *Aspetta ancora ${remainingTime} secondi prima di avviare un nuovo gioco!*`);
    }

    global.cooldowns = global.cooldowns || {};
    global.cooldowns[cooldownKey] = now;

    // Loghi con fonti affidabili + Dataset auto
    let loghi = [
        // Loghi generali esistenti
        { url: 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/apple.svg', nome: 'Apple' },
        { url: 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/google.svg', nome: 'Google' },
        { url: 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/microsoft.svg', nome: 'Microsoft' },
        { url: 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/amazon.svg', nome: 'Amazon' },
        { url: 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/facebook.svg', nome: 'Facebook' },
        { url: 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/tesla.svg', nome: 'Tesla' },
        { url: 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/nike.svg', nome: 'Nike' },
        { url: 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/adidas.svg', nome: 'Adidas' },
        { url: 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/cocacola.svg', nome: 'Coca Cola' },
        { url: 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/pepsi.svg', nome: 'Pepsi' },
        { url: 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/samsung.svg', nome: 'Samsung' },
        { url: 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/sony.svg', nome: 'Sony' },
        { url: 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/intel.svg', nome: 'Intel' },
        { url: 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/amd.svg', nome: 'AMD' },
        { url: 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/netflix.svg', nome: 'Netflix' },
        { url: 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/youtube.svg', nome: 'YouTube' },
        { url: 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/instagram.svg', nome: 'Instagram' },
        { url: 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/x.svg', nome: 'Twitter' },
        { url: 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/whatsapp.svg', nome: 'WhatsApp' },
        { url: 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/spotify.svg', nome: 'Spotify' },
        { url: 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/starbucks.svg', nome: 'Starbucks' },
        { url: 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/playstation.svg', nome: 'PlayStation' },
        { url: 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/xbox.svg', nome: 'Xbox' },
        { url: 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/nintendo.svg', nome: 'Nintendo' },
        { url: 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/discord.svg', nome: 'Discord' },
        { url: 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/twitch.svg', nome: 'Twitch' },
        { url: 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/tiktok.svg', nome: 'TikTok' },
        { url: 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/paypal.svg', nome: 'PayPal' },
        { url: 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/visa.svg', nome: 'Visa' },
        { url: 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/mastercard.svg', nome: 'Mastercard' },
        { url: 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/adobe.svg', nome: 'Adobe' },

        // Dataset auto da filippofilip95/car-logos-dataset
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/abarth.png', nome: 'Abarth' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/acura.png', nome: 'Acura' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/alfa-romeo.png', nome: 'Alfa Romeo' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/aston-martin.png', nome: 'Aston Martin' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/audi.png', nome: 'Audi' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/bentley.png', nome: 'Bentley' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/bmw.png', nome: 'BMW' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/bugatti.png', nome: 'Bugatti' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/buick.png', nome: 'Buick' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/cadillac.png', nome: 'Cadillac' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/chevrolet.png', nome: 'Chevrolet' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/chrysler.png', nome: 'Chrysler' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/citroen.png', nome: 'Citroen' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/dodge.png', nome: 'Dodge' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/ferrari.png', nome: 'Ferrari' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/fiat.png', nome: 'Fiat' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/ford.png', nome: 'Ford' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/genesis.png', nome: 'Genesis' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/gmc.png', nome: 'GMC' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/honda.png', nome: 'Honda' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/hyundai.png', nome: 'Hyundai' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/infiniti.png', nome: 'Infiniti' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/jaguar.png', nome: 'Jaguar' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/jeep.png', nome: 'Jeep' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/kia.png', nome: 'Kia' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/lamborghini.png', nome: 'Lamborghini' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/land-rover.png', nome: 'Land Rover' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/lexus.png', nome: 'Lexus' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/lincoln.png', nome: 'Lincoln' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/maserati.png', nome: 'Maserati' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/mazda.png', nome: 'Mazda' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/mclaren.png', nome: 'McLaren' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/mercedes-benz.png', nome: 'Mercedes' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/mini.png', nome: 'Mini' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/mitsubishi.png', nome: 'Mitsubishi' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/nissan.png', nome: 'Nissan' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/opel.png', nome: 'Opel' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/peugeot.png', nome: 'Peugeot' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/porsche.png', nome: 'Porsche' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/ram.png', nome: 'RAM' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/renault.png', nome: 'Renault' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/rolls-royce.png', nome: 'Rolls Royce' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/seat.png', nome: 'Seat' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/skoda.png', nome: 'Skoda' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/subaru.png', nome: 'Subaru' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/suzuki.png', nome: 'Suzuki' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/tesla.png', nome: 'Tesla' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/toyota.png', nome: 'Toyota' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/volkswagen.png', nome: 'Volkswagen' },
        { url: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/volvo.png', nome: 'Volvo' },

        // Brand Icons alternativo (mantieni solo alcuni per non duplicare)
        { url: 'https://img.icons8.com/color/48/apple-logo.png', nome: 'Apple' },
        { url: 'https://img.icons8.com/color/48/google-logo.png', nome: 'Google' },
        { url: 'https://img.icons8.com/color/48/netflix.png', nome: 'Netflix' },
        { url: 'https://img.icons8.com/fluency/48/instagram-new.png', nome: 'Instagram' },
        { url: 'https://img.icons8.com/color/48/spotify.png', nome: 'Spotify' },
        { url: 'https://img.icons8.com/color/48/starbucks.png', nome: 'Starbucks' }
    ];

    // Seleziona un logo casuale
    let scelta = loghi[Math.floor(Math.random() * loghi.length)];

    let frase = frasi[Math.floor(Math.random() * frasi.length)];

    try {
        let msg = await conn.sendMessage(m.chat, {
            image: { url: scelta.url },
            caption: `${frase}\n\n 🏢 *Rispondi con il nome dell'azienda!*\n⏱️ *Tempo disponibile:* 30 secondi\n\n> \`vare ✧ bot\``,
            quoted: m
        });

        global.loghiGame = global.loghiGame || {};
        global.loghiGame[m.chat] = {
            id: msg.key.id,
            risposta: scelta.nome.toLowerCase(),
            rispostaOriginale: scelta.nome,
            tentativi: {},
            suggerito: false,
            startTime: Date.now(),
            timeout: setTimeout(async () => {
                if (global.loghiGame?.[m.chat]) {
                    await conn.sendMessage(m.chat, {
                        text: `⏳ *Tempo scaduto!*\n\n🏢 *La risposta era:* *${scelta.nome}*\n\n> \`vare ✧ bot\``,
                        ...playAgainQuickReply(usedPrefix)
                    }, { quoted: msg });
                    delete global.loghiGame[m.chat];
                }
            }, 30000)
        };
    } catch (error) {
        console.error('Errore nel gioco loghi:', error);
        m.reply('❌ *Si è verificato un errore durante l\'avvio del gioco*\n\n🔄 *Riprova tra qualche secondo*\n\n💡 *Possibile problema con il caricamento dell\'immagine*');
    }
};

function normalizeString(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .trim();
}

function calculateSimilarity(str1, str2) {
    const words1 = str1.split(' ').filter(word => word.length > 1);
    const words2 = str2.split(' ').filter(word => word.length > 1);

    if (words1.length === 0 || words2.length === 0) return 0;

    const matches = words1.filter(word =>
        words2.some(w2 => w2.includes(word) || word.includes(w2))
    );

    return matches.length / Math.max(words1.length, words2.length);
}

function isAnswerCorrect(userAnswer, correctAnswer) {
    if (userAnswer.length < 2) return false;

    const similarityScore = calculateSimilarity(userAnswer, correctAnswer);

    return (
        userAnswer === correctAnswer ||
        (correctAnswer.includes(userAnswer) && userAnswer.length > correctAnswer.length * 0.5) ||
        (userAnswer.includes(correctAnswer) && userAnswer.length < correctAnswer.length * 1.5) ||
        similarityScore >= 0.8 // Soglia di similarità
    );
}

handler.before = async (m, { conn, usedPrefix, command }) => {
    const chat = m.chat;
    const game = global.loghiGame?.[chat];

    // Gestione quick reply
    if (m.message && m.message.interactiveResponseMessage) {
        const quickReplyId = m.message.interactiveResponseMessage.nativeFlowResponseMessage?.paramsJson;
        if (quickReplyId) {
            try {
                const params = JSON.parse(quickReplyId);
                if (params.id && params.id.endsWith('loghi')) {
                    if (!global.loghiGame?.[chat]) {
                        const fakeMessage = {
                            ...m,
                            text: usedPrefix + 'loghi',
                            body: usedPrefix + 'loghi'
                        };
                        try {
                            await handler(fakeMessage, { conn, usedPrefix, command: 'loghi' });
                        } catch (error) {
                            console.error('Errore nel riavvio del gioco dalle quick reply:', error);
                            conn.reply(chat, '❌ *Errore nel riavvio del gioco. Prova a digitare manualmente il comando.*', m);
                        }
                    }
                }
            } catch (parseError) {
                console.error('Errore nel parsing dei parametri quick reply:', parseError);
            }
        }
        return;
    }

    if (!game || !m.quoted || m.quoted.id !== game.id || m.key.fromMe) return;

    const userAnswer = normalizeString(m.text || '');
    const correctAnswer = normalizeString(game.risposta);

    if (!userAnswer || userAnswer.length < 2) return;

    const similarityScore = calculateSimilarity(userAnswer, correctAnswer);

    if (isAnswerCorrect(userAnswer, correctAnswer)) {
        clearTimeout(game.timeout);

        const timeTaken = Math.round((Date.now() - game.startTime) / 1000);
        let reward = Math.floor(Math.random() * 31) + 20;
        let exp = 150;

        const timeBonus = timeTaken <= 10 ? 20 : timeTaken <= 20 ? 10 : 0;
        reward += timeBonus;

        if (!global.db.data.users[conn.decodeJid(m.sender)]) global.db.data.users[conn.decodeJid(m.sender)] = {};
        global.db.data.users[conn.decodeJid(m.sender)].euro = (global.db.data.users[conn.decodeJid(m.sender)].euro || 0) + reward;
        global.db.data.users[conn.decodeJid(m.sender)].exp = (global.db.data.users[conn.decodeJid(m.sender)].exp || 0) + exp;

        let congratsMessage = `
╭━『 🎉 *RISPOSTA CORRETTA!* 』━╮
┃
┃ 🏢 *Azienda:* ${game.rispostaOriginale}
┃ ⏱️ *Tempo impiegato:* ${timeTaken}s
┃
┃ 🎁 *Ricompense:*
┃ • ${reward} 💰 euro ${timeBonus > 0 ? `(+${timeBonus} bonus velocità)` : ''}
┃ • ${exp} 🆙 EXP
┃
╰━━━━━━━━━━━━━━━━╯`;

        await conn.sendMessage(chat, {
            text: congratsMessage,
            ...playAgainQuickReply(usedPrefix)
        }, { quoted: m });
        delete global.loghiGame[chat];
    } else if (similarityScore >= 0.6 && !game.suggerito) {
        game.suggerito = true;
        await conn.reply(chat, '👀 *Ci sei quasi!*', m);
    } else if (game.tentativi[m.sender] >= 3) {
        await conn.sendMessage(chat, {
            text: '❌ *Hai esaurito i tuoi 3 tentativi!*\n\n⏳ *Aspetta che altri giocatori provino o che finisca il tempo*',
            ...playAgainQuickReply(usedPrefix)
        }, { quoted: m });
        delete global.loghiGame[chat];
    } else {
        game.tentativi[m.sender] = (game.tentativi[m.sender] || 0) + 1;
        const tentativiRimasti = 3 - game.tentativi[m.sender];

        if (tentativiRimasti === 1) {
            const primaLettera = game.rispostaOriginale[0].toUpperCase();
            const numeroLettere = game.rispostaOriginale.length;
            await conn.reply(chat, `❌ *Risposta errata!*

💡 *Suggerimento:*
  • Inizia con la lettera *"${primaLettera}"*
  • È composta da *${numeroLettere} lettere*`, m);
        } else if (tentativiRimasti === 2) {
            await conn.reply(chat, `❌ *Risposta errata!*

📝 *Tentativi rimasti:* ${tentativiRimasti}
🤔 *Pensa bene alla tua prossima risposta!*`, m);
        } else {
             await conn.reply(chat, `❌ *Risposta errata!*

📝 *Ultimo tentativo rimasto..*`, m);
        }
    }
};

handler.help = ['loghi'];
handler.tags = ['giochi'];
handler.command = /^(loghi|skiploghi)$/i;
handler.group = true;
handler.register = true;

export default handler;