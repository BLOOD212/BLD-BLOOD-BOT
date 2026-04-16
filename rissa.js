// Plugin Rissa Arena - Adattato con sistema economico Euro/Exp
let rissaInCorso = {};

const footer = '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙';

let handler = async (m, { conn, command, args, usedPrefix }) => {
    let chat = m.chat;
    let who = m.sender;

    // Inizializzazione Database Utente
    global.db.data.users[who] = global.db.data.users[who] || {};
    let user = global.db.data.users[who];
    if (user.euro === undefined) user.euro = 50;
    if (user.exp === undefined) user.exp = 0;

    // --- LOGICA SCOMMESSA (.punta) ---
    if (command === 'punta') {
        if (!rissaInCorso[chat] || rissaInCorso[chat].stato !== 'OPEN') {
            return m.reply('⚠️ L\'arena è chiusa o non c\'è nessuna sfida attiva!');
        }

        let cifra = parseInt(args[0]);
        if (isNaN(cifra) || cifra <= 0) return m.reply('💸 Punta una cifra valida!');
        if (user.euro < cifra) return m.reply(`📉 Non hai abbastanza euro! Saldo: *${user.euro}€*`);

        let suChi = m.mentionedJid[0];
        if (!suChi || (suChi !== rissaInCorso[chat].p1 && suChi !== rissaInCorso[chat].p2)) {
            return m.reply('🥊 Devi taggare uno dei due lottatori per scommettere!');
        }

        user.euro -= cifra;
        rissaInCorso[chat].scommesse.push({ user: who, amount: cifra, target: suChi });
        
        return conn.sendMessage(chat, { 
            text: `✅ Scommessa di *${cifra}€* su @${suChi.split('@')[0]} piazzata!\n💰 Residuo: *${user.euro}€*`,
            mentions: [suChi]
        }, { quoted: m });
    }

    // --- LOGICA AVVIO RISSA (.rissa) ---
    let target = null;
    if (m.mentionedJid && m.mentionedJid[0]) target = m.mentionedJid[0];
    else if (m.quoted && m.quoted.sender) target = m.quoted.sender;

    if (!target) return m.reply('👊 Tagga qualcuno per aprirgli il cranio!');
    if (target === who) return m.reply('🤔 Vuoi picchiarti da solo?');
    if (rissaInCorso[chat]) return m.reply('⚠️ C\'è già un pestaggio in corso in questa chat!');

    const armi = ["una Motosega arrugginita ⚙️", "un Ombrello rotto 🌂", "un Tirapugni d'oro ✨", "una Sogliola surgelata 🐟", "un Estintore 🧯", "una Mazza chiodata 🏏", "un Nokia 3310 📱", "una Cintura di cuoio 🥋"];
    let arma1 = armi[Math.floor(Math.random() * armi.length)];
    let arma2 = armi[Math.floor(Math.random() * armi.length)];

    rissaInCorso[chat] = {
        p1: who,
        p2: target,
        armaP1: arma1,
        armaP2: arma2,
        scommesse: [],
        stato: 'OPEN',
        startTime: Date.now()
    };

    let intro = `ㅤ⋆｡˚『 ╭ \`🏟️ ARENA DELLA MORTE 🏟️\` ╯ 』˚｡⋆\n╭\n`;
    intro += `│ 『 🥊 』 *SFIDA:* @${who.split('@')[0]} 🆚 @${target.split('@')[0]}\n`;
    intro += `│ 『 ⚔️ 』 *ARMI:* \n│  • ${arma1}\n│  • ${arma2}\n`;
    intro += `│ ──────────────────\n`;
    intro += `│ 『 💰 』 \`SCOMMESSE APERTE!\` (30s)\n`;
    intro += `│ 『 📝 』 \`Usa:\` *.punta [cifra] @tag*\n`;
    intro += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;

    // Bottoni per scommettere rapidamente (facoltativo, ma utile)
    const buttons = [
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🥊 PUNTA SU SFIDANTE', id: `${usedPrefix}punta 50 @${who.split('@')[0]}` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🥊 PUNTA SU VITTIMA', id: `${usedPrefix}punta 50 @${target.split('@')[0]}` }) }
    ];

    setTimeout(() => fineScommesse(chat, conn), 30000);

    return conn.sendMessage(chat, { text: intro, mentions: [who, target], footer, interactiveButtons: buttons }, { quoted: m });
};

async function fineScommesse(chatId, conn) {
    let rissa = rissaInCorso[chatId];
    if (!rissa) return;
    rissa.stato = 'CLOSED';

    let vincitore = Math.random() > 0.5 ? rissa.p1 : rissa.p2;
    let perdente = vincitore === rissa.p1 ? rissa.p2 : rissa.p1;
    let armaVincitore = vincitore === rissa.p1 ? rissa.armaP1 : rissa.armaP2;

    // Premio per il lottatore vincitore
    let premioLottatore = 50;
    let expLottatore = 100;
    global.db.data.users[vincitore].euro += premioLottatore;
    global.db.data.users[vincitore].exp += expLottatore;

    let cronaca = `ㅤ⋆｡˚『 ╭ \`🚨 RISULTATO RISSA 🚨\` ╯ 』˚｡⋆\n╭\n`;
    cronaca += `│ 『 🏆 』 *VINCITORE:* @${vincitore.split('@')[0]}\n`;
    cronaca += `│ 『 ⚔️ 』 *ARMA USATA:* ${armaVincitore}\n`;
    cronaca += `│ 『 💀 』 *PERDENTE:* @${perdente.split('@')[0]}\n`;
    cronaca += `│ ──────────────────\n`;
    cronaca += `│ 『 🎁 』 \`Premio Campione:\` *${premioLottatore}€* e *${expLottatore}xp*\n`;
    cronaca += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*\n\n`;
    cronaca += `📊 *RESOCONTO SCOMMESSE:* \n`;

    let mentions = [vincitore, perdente];

    if (rissa.scommesse.length === 0) {
        cronaca += `_Nessuno ha scommesso su questo spargimento di sangue..._`;
    } else {
        rissa.scommesse.forEach(s => {
            mentions.push(s.user);
            let uTag = `@${s.user.split('@')[0]}`;
            if (s.target === vincitore) {
                let vinto = s.amount * 2;
                global.db.data.users[s.user].euro += vinto;
                global.db.data.users[s.user].exp += 30;
                cronaca += `│ ✅ ${uTag}: *+${vinto}€* (Saldo: ${global.db.data.users[s.user].euro}€)\n`;
            } else {
                cronaca += `│ ❌ ${uTag}: *PERSO* (Saldo: ${global.db.data.users[s.user].euro}€)\n`;
            }
        });
    }

    const playAgain = [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🥊 NUOVA RISSA', id: `.rissa` }) }];

    await conn.sendMessage(chatId, { text: cronaca, mentions, footer, interactiveButtons: playAgain });
    delete rissaInCorso[chatId];
}

handler.help = ['rissa', 'punta'];
handler.tags = ['giochi'];
handler.command = /^(rissa|punta)$/i;
handler.group = true;
handler.register = true;

export default handler;
