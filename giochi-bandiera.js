// Comando creato da Sam aka Vare - github.com/realvare
const playAgainButtons = () => [{
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text: 'Mbare dinuovo!', id: `.bandiera` })
}];

let handler = async (m, { conn, args, participants, isAdmin, isBotAdmin, usedPrefix, command }) => {
    let frasi = [
        `🇺🇳 *INDOVINA LA BANDIERA!* 🇺🇳`,
        `🌍 *Che nazione rappresenta questa bandiera?*`,
        `🏳️ *Sfida geografica: riconosci questa questa bandiera?*`,
        `🧭 *Indovina la nazione dalla sua bandiera!*`,
        `🎯 *Quiz bandiere: quale paese è questo?*`,
        `🌟 *Metti alla prova la tua conoscenza geografica!*`,
        `🔍 *Osserva attentamente e indovina la nazione!*`,
    ];

    if (m.text?.toLowerCase() === '.skipbandiera') {
        if (!m.isGroup) return m.reply('⚠️ Questo comando funziona solo nei gruppi!');
        if (!global.bandieraGame?.[m.chat]) return m.reply('⚠️ Non c\'è nessuna partita attiva in questo gruppo!');

        if (!isAdmin && !m.fromMe) {
            return m.reply('❌ *Questo comando può essere usato solo dagli admin!*');
        }

        clearTimeout(global.bandieraGame[m.chat].timeout);
        
        let skipText = `ㅤ⋆｡˚『 ╭ \`GIOCO INTERROTTO\` ╯ 』˚｡⋆\n╭\n`;
        skipText += `│ 『 🏳️ 』 \`La risposta era:\`\n│ 『 ‼️ 』 *\`${global.bandieraGame[m.chat].rispostaOriginale}\`*\n`;
        skipText += `│ 『 👑 』 _*Interrotto da un admin*_\n`;
        skipText += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;

        await conn.sendMessage(m.chat, {
            text: skipText,
            footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙',
            interactiveButtons: playAgainButtons()
        }, { quoted: m });
        delete global.bandieraGame[m.chat];
        return;
    }
    
    if (global.bandieraGame?.[m.chat]) {
        return m.reply('⚠️ C\'è già una partita attiva in questo gruppo!');
    }

    const cooldownKey = `bandiera_${m.chat}`;
    const lastGame = global.cooldowns?.[cooldownKey] || 0;
    const now = Date.now();
    const cooldownTime = 5000;

    if (now - lastGame < cooldownTime) {
        const remainingTime = Math.ceil((cooldownTime - (now - lastGame)) / 1000);
        return m.reply(`⏳ *Aspetta ancora ${remainingTime} secondi prima di avviare un nuovo gioco!*`);
    }

    global.cooldowns = global.cooldowns || {};
    global.cooldowns[cooldownKey] = now;

    let bandiere = [
        { url: 'https://flagcdn.com/w320/it.png', nome: 'Italia' },
        { url: 'https://flagcdn.com/w320/fr.png', nome: 'Francia' },
        { url: 'https://flagcdn.com/w320/de.png', nome: 'Germania' },
        { url: 'https://flagcdn.com/w320/gb.png', nome: 'Regno Unito' },
        { url: 'https://flagcdn.com/w320/es.png', nome: 'Spagna' },
        { url: 'https://flagcdn.com/w320/se.png', nome: 'Svezia' },
        { url: 'https://flagcdn.com/w320/no.png', nome: 'Norvegia' },
        { url: 'https://flagcdn.com/w320/fi.png', nome: 'Finlandia' },
        { url: 'https://flagcdn.com/w320/dk.png', nome: 'Danimarca' },
        { url: 'https://flagcdn.com/w320/pl.png', nome: 'Polonia' },
        { url: 'https://flagcdn.com/w320/pt.png', nome: 'Portogallo' },
        { url: 'https://flagcdn.com/w320/gr.png', nome: 'Grecia' },
        { url: 'https://flagcdn.com/w320/ch.png', nome: 'Svizzera' },
        { url: 'https://flagcdn.com/w320/at.png', nome: 'Austria' },
        { url: 'https://flagcdn.com/w320/be.png', nome: 'Belgio' },
        { url: 'https://flagcdn.com/w320/nl.png', nome: 'Paesi Bassi' },
        { url: 'https://flagcdn.com/w320/ua.png', nome: 'Ucraina' },
        { url: 'https://flagcdn.com/w320/ro.png', nome: 'Romania' },
        { url: 'https://flagcdn.com/w320/hu.png', nome: 'Ungheria' },
        { url: 'https://flagcdn.com/w320/cz.png', nome: 'Repubblica Ceca' },
        { url: 'https://flagcdn.com/w320/ie.png', nome: 'Irlanda' },
        { url: 'https://flagcdn.com/w320/bg.png', nome: 'Bulgaria' },
        { url: 'https://flagcdn.com/w320/md.png', nome: 'Moldavia' },
        { url: 'https://flagcdn.com/w320/us.png', nome: 'Stati Uniti' },
        { url: 'https://flagcdn.com/w320/ca.png', nome: 'Canada' },
        { url: 'https://flagcdn.com/w320/mx.png', nome: 'Messico' },
        { url: 'https://flagcdn.com/w320/br.png', nome: 'Brasile' },
        { url: 'https://flagcdn.com/w320/ar.png', nome: 'Argentina' },
        { url: 'https://flagcdn.com/w320/cl.png', nome: 'Cile' },
        { url: 'https://flagcdn.com/w320/co.png', nome: 'Colombia' },
        { url: 'https://flagcdn.com/w320/pe.png', nome: 'Perù' },
        { url: 'https://flagcdn.com/w320/ve.png', nome: 'Venezuela' },
        { url: 'https://flagcdn.com/w320/cu.png', nome: 'Cuba' },
        { url: 'https://flagcdn.com/w320/au.png', nome: 'Australia' },
        { url: 'https://flagcdn.com/w320/nz.png', nome: 'Nuova Zelanda' },
        { url: 'https://flagcdn.com/w320/cn.png', nome: 'Cina' },
        { url: 'https://flagcdn.com/w320/jp.png', nome: 'Giappone' },
        { url: 'https://flagcdn.com/w320/in.png', nome: 'India' },
        { url: 'https://flagcdn.com/w320/kr.png', nome: 'Corea del Sud' },
        { url: 'https://flagcdn.com/w320/th.png', nome: 'Thailandia' },
        { url: 'https://flagcdn.com/w320/vn.png', nome: 'Vietnam' },
        { url: 'https://flagcdn.com/w320/id.png', nome: 'Indonesia' },
        { url: 'https://flagcdn.com/w320/ph.png', nome: 'Filippine' },
        { url: 'https://flagcdn.com/w320/my.png', nome: 'Malesia' },
        { url: 'https://flagcdn.com/w320/sg.png', nome: 'Singapore' },
        { url: 'https://flagcdn.com/w320/pk.png', nome: 'Pakistan' },
        { url: 'https://flagcdn.com/w320/af.png', nome: 'Afghanistan' },
        { url: 'https://flagcdn.com/w320/ir.png', nome: 'Iran' },
        { url: 'https://flagcdn.com/w320/iq.png', nome: 'Iraq' },
        { url: 'https://flagcdn.com/w320/tr.png', nome: 'Turchia' },
        { url: 'https://flagcdn.com/w320/il.png', nome: 'Israele' },
        { url: 'https://flagcdn.com/w320/sa.png', nome: 'Arabia Saudita' },
        { url: 'https://flagcdn.com/w320/ae.png', nome: 'Emirati Arabi Uniti' },
        { url: 'https://flagcdn.com/w320/qa.png', nome: 'Qatar' },
        { url: 'https://flagcdn.com/w320/eg.png', nome: 'Egitto' },
        { url: 'https://flagcdn.com/w320/ng.png', nome: 'Nigeria' },
        { url: 'https://flagcdn.com/w320/ma.png', nome: 'Marocco' },
        { url: 'https://flagcdn.com/w320/tn.png', nome: 'Tunisia' },
        { url: 'https://flagcdn.com/w320/ke.png', nome: 'Kenya' },
        { url: 'https://flagcdn.com/w320/et.png', nome: 'Etiopia' },
        { url: 'https://flagcdn.com/w320/gh.png', nome: 'Ghana' },
        { url: 'https://flagcdn.com/w320/cm.png', nome: 'Camerun' },
        { url: 'https://flagcdn.com/w320/ci.png', nome: "Costa d'Avorio" },
        { url: 'https://flagcdn.com/w320/sn.png', nome: 'Senegal' },
        { url: 'https://flagcdn.com/w320/za.png', nome: 'Sudafrica' },
        { url: 'https://flagcdn.com/w320/dz.png', nome: 'Algeria' },
        { url: 'https://flagcdn.com/w320/sd.png', nome: 'Sudan' },
        { url: 'https://flagcdn.com/w320/cd.png', nome: 'Repubblica Democratica del Congo' },
        { url: 'https://flagcdn.com/w320/ao.png', nome: 'Angola' },
        { url: 'https://flagcdn.com/w320/mg.png', nome: 'Madagascar' },
        { url: 'https://flagcdn.com/w320/tz.png', nome: 'Tanzania' },
        { url: 'https://flagcdn.com/w320/ug.png', nome: 'Uganda' },
    ];
    
    let scelta = bandiere[Math.floor(Math.random() * bandiere.length)];
    let frase = frasi[Math.floor(Math.random() * frasi.length)];

    try {
        let startCaption = `ㅤ⋆｡˚『 ╭ \`${frase}\` ╯ 』˚｡⋆\n╭\n`;
        startCaption += `│ 『 🏳️ 』 \`Rispondi con il nome\` *della nazione*\n`;
        startCaption += `│ 『 ⏱️ 』 \`Tempo disponibile:\` *30 secondi*\n`;
        startCaption += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;

        let msg = await conn.sendMessage(m.chat, {
            image: { url: scelta.url },
            caption: startCaption,
            footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙'
        }, { quoted: m });
        
        global.bandieraGame = global.bandieraGame || {};
        global.bandieraGame[m.chat] = {
            id: msg.key.id,
            risposta: scelta.nome.toLowerCase(),
            rispostaOriginale: scelta.nome,
            tentativi: {},
            suggerito: false,
            startTime: Date.now(),
            timeout: setTimeout(async () => {
                if (global.bandieraGame?.[m.chat]) {
                    let timeoutText = `ㅤ⋆｡˚『 ╭ \`TEMPO SCADUTO!\` ╯ 』˚｡⋆\n╭\n`;
                    timeoutText += `│ 『 🏳️ 』 \`La risposta era:\`\n│ 『 ‼️ 』 *\`${scelta.nome}\`*\n`;
                    timeoutText += `│ 『 💡 』 _*Sii più veloce la prossima volta!*_\n`;
                    timeoutText += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;
                    
                    await conn.sendMessage(m.chat, {
                        text: timeoutText,
                        footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙',
                        interactiveButtons: playAgainButtons()
                    }, { quoted: msg });
                    delete global.bandieraGame[m.chat];
                }
            }, 30000)
        };
    } catch (error) {
        console.error('Errore nel gioco bandiere:', error);
        m.reply('❌ *Si è verificato un errore durante l\'avvio del gioco*\n\n🔄 *Riprova tra qualche secondo*');
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
        similarityScore >= 0.8
    );
}

handler.before = async (m, { conn, usedPrefix, command }) => {
    const chat = m.chat;
    const game = global.bandieraGame?.[chat];
    
    // Gestione bottoni interattivi
    if (m.message && m.message.interactiveResponseMessage) {
        const response = m.message.interactiveResponseMessage;
        
        if (response.nativeFlowResponseMessage?.paramsJson) {
            try {
                const params = JSON.parse(response.nativeFlowResponseMessage.paramsJson);
                if (params.id === '.bandiera') {
                    if (!global.bandieraGame?.[chat]) {
                        const fakeMessage = {
                            ...m,
                            text: usedPrefix + 'bandiera',
                            body: usedPrefix + 'bandiera'
                        };
                        try {
                            await handler(fakeMessage, { conn, usedPrefix, command: 'bandiera' });
                        } catch (error) {
                            console.error('Errore nel riavvio del gioco dai bottoni:', error);
                            conn.reply(chat, '❌ *Errore nel riavvio del gioco. Prova a digitare manualmente il comando.*', m);
                        }
                    }
                }
            } catch (error) {
                console.error('Errore nel parsing dei parametri del bottone:', error);
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

        if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {};
        global.db.data.users[m.sender].euro = (global.db.data.users[m.sender].euro || 0) + reward;
        global.db.data.users[m.sender].exp = (global.db.data.users[m.sender].exp || 0) + exp;

        let congratsMessage = `ㅤ⋆｡˚『 ╭ \`RISPOSTA CORRETTA!\` ╯ 』˚｡⋆\n╭\n`;
        congratsMessage += `│ 『 🏳️ 』 \`Nazione:\` *${game.rispostaOriginale}*\n`;
        congratsMessage += `│ 『 ⏱️ 』 \`Tempo impiegato:\` *${timeTaken}s*\n`;
        congratsMessage += `│ 『 🎁 』 \`Ricompense:\`\n`;
        congratsMessage += `│ 『 💰 』 *${reward}€* ${timeBonus > 0 ? `(+${timeBonus} bonus velocità)` : ''}\n`;
        congratsMessage += `│ 『 🆙 』 *${exp} EXP*\n`;
        congratsMessage += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;
        
        await conn.sendMessage(chat, {
            text: congratsMessage,
            footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙',
            interactiveButtons: playAgainButtons()
        }, { quoted: m });
        delete global.bandieraGame[chat];
        
    } else if (similarityScore >= 0.6 && !game.suggerito) {
        game.suggerito = true;
        await conn.reply(chat, '👀 *Ci sei quasi!*', m);
        
    } else if (game.tentativi[m.sender] >= 3) {
        let failText = `ㅤ⋆｡˚『 ╭ \`TENTATIVI ESAURITI!\` ╯ 』˚｡⋆\n╭\n`;
        failText += `│ 『 ❌ 』 \`Hai esaurito i tuoi 3 tentativi!\`\n`;
        failText += `│ 『 ⏳ 』 _*Aspetta che altri provino...*_\n`;
        failText += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;
        
        await conn.sendMessage(chat, {
            text: failText,
            footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙',
            interactiveButtons: playAgainButtons()
        }, { quoted: m });
        delete global.bandieraGame[chat];
        
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

handler.help = ['bandiera'];
handler.tags = ['giochi'];
handler.command = /^(bandiera|skipbandiera)$/i;
handler.group = true;
handler.register = true;

export default handler;
