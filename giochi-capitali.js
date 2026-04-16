
const playAgainButtons = (prefix) => [
    {
        buttonId: `${prefix}capitali`,
        buttonText: { displayText: '🎮 Gioca Ancora!' },
        type: 1
    }
];
let handler = async (m, { conn, args, participants, isAdmin, isBotAdmin, usedPrefix, command }) => {
    // Array di frasi da usare nel gioco
    let frasi = [
        `🏛️ *INDOVINA LA CAPITALE!* 🏛️`,
        `🌍 *Qual è la capitale di questo paese?*`,
        `🏙️ *Sfida geografica: riconosci questa capitale?*`,
        `🧭 *Indovina la capitale dalla nazione!*`,
        `🎯 *Quiz capitali: quale città è la capitale?*`,
        `🌟 *Metti alla prova la tua conoscenza geografica!*`,
        `🔍 *Pensa attentamente e indovina la capitale!*`,
    ];
    if (m.text?.toLowerCase() === '.skipcapitali') {
        if (!m.isGroup) return m.reply('『 ⚠️ 』- Questo comando funziona solo nei gruppi!');
        if (!global.capitaliGame?.[m.chat]) return m.reply('『 ⚠️ 』- Non c\'è nessuna partita attiva in questo gruppo!');
        if (!isAdmin && !m.fromMe) {
            return m.reply('『 ❌ 』 - \`Questo comando può essere usato solo dagli admin!\`');
        }

        clearTimeout(global.capitaliGame[m.chat].timeout);
        await conn.sendMessage(m.chat, {
            text: `『 🛑 』 - \`Gioco delle capitali interrotto da un admin\`\n✨ _La risposta era:_ *${global.capitaliGame[m.chat].rispostaOriginale}*`,
            buttons: playAgainButtons(usedPrefix),
            headerType: 1
        }, { quoted: m });
        delete global.capitaliGame[m.chat];
        return;
    }
    if (global.capitaliGame?.[m.chat]) {
        return m.reply('『 ⚠️ 』 - \`C\'è già una partita attiva in questo gruppo!\`');
    }
    const cooldownKey = `capitali_${m.chat}`;
    const lastGame = global.cooldowns?.[cooldownKey] || 0;
    const now = Date.now();
    const cooldownTime = 10000;

    if (now - lastGame < cooldownTime) {
        const remainingTime = Math.ceil((cooldownTime - (now - lastGame)) / 1000);
        return m.reply(`⏳ *Aspetta ancora ${remainingTime} secondi prima di avviare un nuovo gioco!*`);
    }
    global.cooldowns = global.cooldowns || {};
    global.cooldowns[cooldownKey] = now;
    let capitali = [
        { paese: 'Italia', capitale: 'Roma', url: 'https://flagcdn.com/w320/it.png' },
        { paese: 'Francia', capitale: 'Parigi', url: 'https://flagcdn.com/w320/fr.png' },
        { paese: 'Germania', capitale: 'Berlino', url: 'https://flagcdn.com/w320/de.png' },
        { paese: 'Regno Unito', capitale: 'Londra', url: 'https://flagcdn.com/w320/gb.png' },
        { paese: 'Spagna', capitale: 'Madrid', url: 'https://flagcdn.com/w320/es.png' },
        { paese: 'Svezia', capitale: 'Stoccolma', url: 'https://flagcdn.com/w320/se.png' },
        { paese: 'Norvegia', capitale: 'Oslo', url: 'https://flagcdn.com/w320/no.png' },
        { paese: 'Finlandia', capitale: 'Helsinki', url: 'https://flagcdn.com/w320/fi.png' },
        { paese: 'Danimarca', capitale: 'Copenaghen', url: 'https://flagcdn.com/w320/dk.png' },
        { paese: 'Polonia', capitale: 'Varsavia', url: 'https://flagcdn.com/w320/pl.png' },
        { paese: 'Portogallo', capitale: 'Lisbona', url: 'https://flagcdn.com/w320/pt.png' },
        { paese: 'Grecia', capitale: 'Atene', url: 'https://flagcdn.com/w320/gr.png' },
        { paese: 'Svizzera', capitale: 'Berna', url: 'https://flagcdn.com/w320/ch.png' },
        { paese: 'Austria', capitale: 'Vienna', url: 'https://flagcdn.com/w320/at.png' },
        { paese: 'Belgio', capitale: 'Bruxelles', url: 'https://flagcdn.com/w320/be.png' },
        { paese: 'Paesi Bassi', capitale: 'Amsterdam', url: 'https://flagcdn.com/w320/nl.png' },
        { paese: 'Ucraina', capitale: 'Kiev', url: 'https://flagcdn.com/w320/ua.png' },
        { paese: 'Romania', capitale: 'Bucarest', url: 'https://flagcdn.com/w320/ro.png' },
        { paese: 'Ungheria', capitale: 'Budapest', url: 'https://flagcdn.com/w320/hu.png' },
        { paese: 'Repubblica Ceca', capitale: 'Praga', url: 'https://flagcdn.com/w320/cz.png' },
        { paese: 'Irlanda', capitale: 'Dublino', url: 'https://flagcdn.com/w320/ie.png' },
        { paese: 'Bulgaria', capitale: 'Sofia', url: 'https://flagcdn.com/w320/bg.png' },
        { paese: 'Moldavia', capitale: 'Chisinau', url: 'https://flagcdn.com/w320/md.png' },
        { paese: 'Stati Uniti', capitale: 'Washington', url: 'https://flagcdn.com/w320/us.png' },
        { paese: 'Canada', capitale: 'Ottawa', url: 'https://flagcdn.com/w320/ca.png' },
        { paese: 'Messico', capitale: 'Città del Messico', url: 'https://flagcdn.com/w320/mx.png' },
        { paese: 'Brasile', capitale: 'Brasilia', url: 'https://flagcdn.com/w320/br.png' },
        { paese: 'Argentina', capitale: 'Buenos Aires', url: 'https://flagcdn.com/w320/ar.png' },
        { paese: 'Cile', capitale: 'Santiago', url: 'https://flagcdn.com/w320/cl.png' },
        { paese: 'Colombia', capitale: 'Bogotà', url: 'https://flagcdn.com/w320/co.png' },
        { paese: 'Perù', capitale: 'Lima', url: 'https://flagcdn.com/w320/pe.png' },
        { paese: 'Venezuela', capitale: 'Caracas', url: 'https://flagcdn.com/w320/ve.png' },
        { paese: 'Cuba', capitale: 'L\'Avana', url: 'https://flagcdn.com/w320/cu.png' },
        { paese: 'Australia', capitale: 'Canberra', url: 'https://flagcdn.com/w320/au.png' },
        { paese: 'Nuova Zelanda', capitale: 'Wellington', url: 'https://flagcdn.com/w320/nz.png' },
        { paese: 'Cina', capitale: 'Pechino', url: 'https://flagcdn.com/w320/cn.png' },
        { paese: 'Giappone', capitale: 'Tokyo', url: 'https://flagcdn.com/w320/jp.png' },
        { paese: 'India', capitale: 'Nuova Delhi', url: 'https://flagcdn.com/w320/in.png' },
        { paese: 'Corea del Sud', capitale: 'Seul', url: 'https://flagcdn.com/w320/kr.png' },
        { paese: 'Thailandia', capitale: 'Bangkok', url: 'https://flagcdn.com/w320/th.png' },
        { paese: 'Vietnam', capitale: 'Hanoi', url: 'https://flagcdn.com/w320/vn.png' },
        { paese: 'Indonesia', capitale: 'Jakarta', url: 'https://flagcdn.com/w320/id.png' },
        { paese: 'Filippine', capitale: 'Manila', url: 'https://flagcdn.com/w320/ph.png' },
        { paese: 'Malesia', capitale: 'Kuala Lumpur', url: 'https://flagcdn.com/w320/my.png' },
        { paese: 'Singapore', capitale: 'Singapore', url: 'https://flagcdn.com/w320/sg.png' },
        { paese: 'Pakistan', capitale: 'Islamabad', url: 'https://flagcdn.com/w320/pk.png' },
        { paese: 'Afghanistan', capitale: 'Kabul', url: 'https://flagcdn.com/w320/af.png' },
        { paese: 'Iran', capitale: 'Teheran', url: 'https://flagcdn.com/w320/ir.png' },
        { paese: 'Iraq', capitale: 'Baghdad', url: 'https://flagcdn.com/w320/iq.png' },
        { paese: 'Turchia', capitale: 'Ankara', url: 'https://flagcdn.com/w320/tr.png' },
        { paese: 'Israele', capitale: 'Gerusalemme', url: 'https://flagcdn.com/w320/il.png' },
        { paese: 'Arabia Saudita', capitale: 'Riyad', url: 'https://flagcdn.com/w320/sa.png' },
        { paese: 'Emirati Arabi Uniti', capitale: 'Abu Dhabi', url: 'https://flagcdn.com/w320/ae.png' },
        { paese: 'Qatar', capitale: 'Doha', url: 'https://flagcdn.com/w320/qa.png' },
        { paese: 'Egitto', capitale: 'Il Cairo', url: 'https://flagcdn.com/w320/eg.png' },
        { paese: 'Nigeria', capitale: 'Abuja', url: 'https://flagcdn.com/w320/ng.png' },
        { paese: 'Marocco', capitale: 'Rabat', url: 'https://flagcdn.com/w320/ma.png' },
        { paese: 'Tunisia', capitale: 'Tunisi', url: 'https://flagcdn.com/w320/tn.png' },
        { paese: 'Kenya', capitale: 'Nairobi', url: 'https://flagcdn.com/w320/ke.png' },
        { paese: 'Etiopia', capitale: 'Addis Abeba', url: 'https://flagcdn.com/w320/et.png' },
        { paese: 'Ghana', capitale: 'Accra', url: 'https://flagcdn.com/w320/gh.png' },
        { paese: 'Camerun', capitale: 'Yaoundé', url: 'https://flagcdn.com/w320/cm.png' },
        { paese: 'Costa d\'Avorio', capitale: 'Yamoussoukro', url: 'https://flagcdn.com/w320/ci.png' },
        { paese: 'Senegal', capitale: 'Dakar', url: 'https://flagcdn.com/w320/sn.png' },
        { paese: 'Sudafrica', capitale: 'Città del Capo', url: 'https://flagcdn.com/w320/za.png' },
        { paese: 'Algeria', capitale: 'Algeri', url: 'https://flagcdn.com/w320/dz.png' },
        { paese: 'Sudan', capitale: 'Khartoum', url: 'https://flagcdn.com/w320/sd.png' },
        { paese: 'Angola', capitale: 'Luanda', url: 'https://flagcdn.com/w320/ao.png' },
        { paese: 'Madagascar', capitale: 'Antananarivo', url: 'https://flagcdn.com/w320/mg.png' },
        { paese: 'Tanzania', capitale: 'Dodoma', url: 'https://flagcdn.com/w320/tz.png' },
        { paese: 'Uganda', capitale: 'Kampala', url: 'https://flagcdn.com/w320/ug.png' },
        { paese: 'Russia', capitale: 'Mosca', url: 'https://flagcdn.com/w320/ru.png' },
        { paese: 'Croazia', capitale: 'Zagabria', url: 'https://flagcdn.com/w320/hr.png' },
        { paese: 'Serbia', capitale: 'Belgrado', url: 'https://flagcdn.com/w320/rs.png' },
        { paese: 'Slovenia', capitale: 'Lubiana', url: 'https://flagcdn.com/w320/si.png' },
        { paese: 'Slovacchia', capitale: 'Bratislava', url: 'https://flagcdn.com/w320/sk.png' },
        { paese: 'Estonia', capitale: 'Tallinn', url: 'https://flagcdn.com/w320/ee.png' },
        { paese: 'Lettonia', capitale: 'Riga', url: 'https://flagcdn.com/w320/lv.png' },
        { paese: 'Lituania', capitale: 'Vilnius', url: 'https://flagcdn.com/w320/lt.png' },
        { paese: 'Islanda', capitale: 'Reykjavik', url: 'https://flagcdn.com/w320/is.png' },
        { paese: 'Lussemburgo', capitale: 'Lussemburgo', url: 'https://flagcdn.com/w320/lu.png' },
        { paese: 'Malta', capitale: 'La Valletta', url: 'https://flagcdn.com/w320/mt.png' },
        { paese: 'Cipro', capitale: 'Nicosia', url: 'https://flagcdn.com/w320/cy.png' },
        { paese: 'Monaco', capitale: 'Monaco', url: 'https://flagcdn.com/w320/mc.png' },
        { paese: 'San Marino', capitale: 'San Marino', url: 'https://flagcdn.com/w320/sm.png' },
        { paese: 'Vaticano', capitale: 'Città del Vaticano', url: 'https://flagcdn.com/w320/va.png' },
        { paese: 'Liechtenstein', capitale: 'Vaduz', url: 'https://flagcdn.com/w320/li.png' },
        { paese: 'Andorra', capitale: 'Andorra la Vella', url: 'https://flagcdn.com/w320/ad.png' },
    ];
    let scelta = capitali[Math.floor(Math.random() * capitali.length)];
    let frase = frasi[Math.floor(Math.random() * frasi.length)];

    try {
        let msg = await conn.sendMessage(m.chat, {
            image: { url: scelta.url },
            caption: `${frase}\n\n🌍 *Paese:* ${scelta.paese}\n\n🏛️ *Rispondi con il nome della capitale!*\n⏱️ *Tempo disponibile:* 30 secondi\n\n> \`𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙\``,
            quoted: m
        });
        global.capitaliGame = global.capitaliGame || {};
        global.capitaliGame[m.chat] = {
            id: msg.key.id,
            risposta: scelta.capitale.toLowerCase(),
            rispostaOriginale: scelta.capitale,
            paese: scelta.paese,
            tentativi: {},
            suggerito: false,
            startTime: Date.now(),
            timeout: setTimeout(async () => {
                if (global.capitaliGame?.[m.chat]) {
                    await conn.sendMessage(m.chat, {
                        text: `⏳ *Tempo scaduto!*\n\n🏛️ *La capitale di ${scelta.paese} è:* *${scelta.capitale}*\n\n> \`𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙\``,
                        buttons: playAgainButtons(usedPrefix),
                        headerType: 1
                    }, { quoted: msg });
                    delete global.capitaliGame[m.chat]; 
                }
            }, 30000)
        };
    } catch (error) {
        console.error('Errore nel gioco capitali:', error);
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
    const game = global.capitaliGame?.[chat];
    if (!game || !m.quoted || m.quoted.id !== game.id || m.key.fromMe) return;
    const userAnswer = normalizeString(m.text || '');
    const correctAnswer = normalizeString(game.risposta);
    if (!userAnswer || userAnswer.length < 2) return;
    const similarityScore = calculateSimilarity(userAnswer, correctAnswer);
    if (isAnswerCorrect(userAnswer, correctAnswer)) {
        clearTimeout(game.timeout);

        const timeTaken = Math.round((Date.now() - game.startTime) / 1000);
        let reward = Math.floor(Math.random() * 31) + 20;
        let exp = 500;
        const timeBonus = timeTaken <= 10 ? 20 : timeTaken <= 20 ? 10 : 0;
        reward += timeBonus;
        if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {};
        global.db.data.users[m.sender].euro = (global.db.data.users[m.sender].euro || 0) + reward;
        global.db.data.users[m.sender].exp = (global.db.data.users[m.sender].exp || 0) + exp;

        let congratsMessage = `
╭━『 🎉 *BRAVO COGLIONE È GIUSTA!* 』━╮
┃
┃ 🌍 *Paese:* ${game.paese}
┃ 🏛️ *Capitale:* ${game.rispostaOriginale}
┃ ⏱️ *Tempo impiegato:* ${timeTaken}s
┃
┃ 🎁 *Ricompense:*
┃ • ${reward} 💰 euro ${timeBonus > 0 ? `(+${timeBonus} bonus velocità)` : ''}
┃ • ${exp} 🆙 EXP
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
        await conn.sendMessage(chat, {
            text: congratsMessage,
            buttons: playAgainButtons(usedPrefix),
            headerType: 1
        }, { quoted: m });
        delete global.capitaliGame[chat];
    } else if (similarityScore >= 0.6 && !game.suggerito) {
        game.suggerito = true;
        await conn.reply(chat, '👀 *Ci sei quasi!*', m);
    } else if (game.tentativi[m.sender] >= 3) {
        await conn.sendMessage(chat, {
            text: '❌ *Hai esaurito i tuoi 3 tentativi!*\n\n⏳ *Aspetta che altri giocatori provino o che finisca il tempo*',
            buttons: playAgainButtons(usedPrefix),
            headerType: 1
        }, { quoted: m });
        delete global.capitaliGame[chat];
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

📝 *Ultimo tentativo rimasto..*`, m)
        }
    }
};

handler.help = ['capitali'];
handler.tags = ['giochi'];
handler.command = /^(capitali|skipcapitali)$/i;
handler.group = true;
handler.register = true;

export default handler;