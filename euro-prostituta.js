const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const COOLDOWN = 5 * 60 * 1000;
const MALATTIA_CHANCE = 0.20;
const MIN_GUADAGNO = 50;
const MAX_GUADAGNO = 300;

const lavori = [
    { msg: "Ha conquistato un magnate russo per una notte indimenticabile", xp: [150, 350], emoji: "💎" },
    { msg: "Ha sedotto un ricco imprenditore in uno show privato esclusivo", xp: [120, 320], emoji: "💃" },
    { msg: "Ha incantato la clientela VIP del club più esclusivo della città", xp: [180, 380], emoji: "🎭" },
    { msg: "Ha accompagnato un principe arabo in un weekend di lusso", xp: [200, 400], emoji: "👠" },
    { msg: "È diventata la star principale di una produzione cinematografica per adulti", xp: [160, 360], emoji: "🎬" },
    { msg: "Ha posato per il calendario più venduto dell'anno", xp: [100, 280], emoji: "📸" },
    { msg: "Ha sfilato per i più prestigiosi brand di lingerie internazionali", xp: [130, 300], emoji: "👙" },
    { msg: "Ha partecipato a una festa esclusiva su uno yacht di lusso", xp: [170, 370], emoji: "🛥️" },
    { msg: "Ha fatto da accompagnatrice a un gala di beneficenza d'élite", xp: [140, 340], emoji: "🥂" },
    { msg: "Ha conquistato un famoso attore di Hollywood", xp: [190, 400], emoji: "⭐" },
    { msg: "Ha partecipato a un servizio fotografico per una rivista di lusso", xp: [110, 290], emoji: "📷" },
    { msg: "È stata protagonista di uno spettacolo privato per un sultano", xp: [180, 390], emoji: "🕌" },
    { msg: "Ha intrattenuto un gruppo di magnati dell'industria petrolifera", xp: [160, 380], emoji: "🛢️" },
    { msg: "Ha fatto da modella per una casa di moda parigina", xp: [120, 310], emoji: "👗" },
    { msg: "È stata ospite speciale di una crociera di lusso nel Mediterraneo", xp: [150, 350], emoji: "🚢" },
    { msg: "Ha partecipato a un party privato in una villa di Montecarlo", xp: [170, 380], emoji: "🏰" },
    { msg: "È stata ingaggiata per un evento esclusivo a Dubai", xp: [180, 390], emoji: "🏜️" },
    { msg: "Ha fatto da compagnia a un diplomatico in missione segreta", xp: [140, 330], emoji: "🕴️" },
    { msg: "È stata la star di uno show privato per un collezionista d'arte", xp: [130, 320], emoji: "🎨" },
    { msg: "Ha partecipato a una serata esclusiva in un casino di Las Vegas", xp: [160, 370], emoji: "🎰" }
];

const malattie = [
    { nome: "Herpes", perditaXp: 600, perditaeuro: 250, emoji: "🦠", durata: "3 giorni", desc: "Un cliente poco attento alle precauzioni" },
    { nome: "Sifilide", perditaXp: 1000, perditaeuro: 400, emoji: "🧬", durata: "5 giorni", desc: "Un incontro rischioso con conseguenze serie" },
    { nome: "Gonorrea", perditaXp: 500, perditaeuro: 200, emoji: "💉", durata: "4 giorni", desc: "Una serata che è finita male" },
    { nome: "Epatite", perditaXp: 1200, perditaeuro: 600, emoji: "🩸", durata: "una settimana", desc: "Un cliente che ha nascosto la sua condizione" },
    { nome: "Candida", perditaXp: 350, perditaeuro: 120, emoji: "🍞", durata: "2 giorni", desc: "Scarsa igiene in un ambiente poco pulito" },
    { nome: "Clamidia", perditaXp: 700, perditaeuro: 300, emoji: "🔬", durata: "4 giorni", desc: "Un cliente che sembrava pulito ma non lo era" },
    { nome: "HIV", perditaXp: 2000, perditaeuro: 800, emoji: "🚨", durata: "2 settimane", desc: "Il peggiore degli incidenti possibili" },
    { nome: "Papillomavirus", perditaXp: 800, perditaeuro: 350, emoji: "🧪", durata: "6 giorni", desc: "Un virus subdolo e pericoloso" },
    { nome: "Tricomoniasi", perditaXp: 400, perditaeuro: 180, emoji: "🔴", durata: "3 giorni", desc: "Infezione da un ambiente poco igienico" },
    { nome: "Scabbia", perditaXp: 300, perditaeuro: 150, emoji: "🐛", durata: "5 giorni", desc: "Parassiti da biancheria sporca" },
    { nome: "Epatite B", perditaXp: 1500, perditaeuro: 700, emoji: "🧨", durata: "10 giorni", desc: "Contagio attraverso fluidi corporei" },
    { nome: "Mollusco contagioso", perditaXp: 250, perditaeuro: 100, emoji: "🔹", durata: "1 settimana", desc: "Infezione della pelle da contatto" },
    { nome: "Pidocchi pubici", perditaXp: 200, perditaeuro: 80, emoji: "🪲", durata: "3 giorni", desc: "Ospiti indesiderati da un cliente trasandato" },
    { nome: "Vaginosi batterica", perditaXp: 300, perditaeuro: 120, emoji: "💊", durata: "4 giorni", desc: "Squilibrio batterico da stress lavorativo" },
    { nome: "Uretrite", perditaXp: 450, perditaeuro: 200, emoji: "🔥", durata: "5 giorni", desc: "Infiammazione da rapporti troppo frequenti" }
];

let cooldowns = {};

let handler = async (m, { conn, args, isPrems, text, participants }) => {
    let user = global.db.data.users[m.sender];
    
    // Verifica se è stato usato il comando "pappone"
    const isModePappone = /^(pappone)$/i.test(m.text.split(' ')[0].replace(/[.!#]/g, ''));
    
    if (isModePappone) {
        let who;
        if (m.isGroup) who = m.mentionedJid[0];
        else who = m.chat;
        
        // Se non ha taggato nessuno, controlla se ha quotato un messaggio
        if (!who && m.quoted && m.quoted.sender) {
            who = m.quoted.sender;
        }
        
        if (!who) return m.reply('🎯 Devi taggare qualcuno o quotare un messaggio per gestire il tuo business!');

        let target = global.db.data.users[who];
        if (!target) return m.reply('❌ Questa persona non è nel mio database');
        if (who === m.sender) return m.reply('🤡 Non puoi sfruttare te stesso, genio!');
        
        if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < COOLDOWN) {
            const remaining = msToTime(cooldowns[m.sender] + COOLDOWN - Date.now());
            return m.reply(`ㅤㅤ⋆｡˚『 ╭ \`COOLDOWN\` ╯ 』˚｡⋆\n╭\n│ 『 ⏰ 』 \`Tempo rimasto:\` *${remaining}*\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`);
        }

        let result = await esitoPappone(m, user, target, who, isPrems);
        cooldowns[m.sender] = Date.now();

        // Crea il fkontak
        const fkontak = {
            "key": {
                "participants": "0@s.whatsapp.net",
                "remoteJid": "status@broadcast",
                "fromMe": false,
                "id": "Halo"
            },
            "message": {
                "contactMessage": {
                    "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
                }
            },
            "participant": "0@s.whatsapp.net"
        };

        await conn.sendMessage(m.chat, {
            text: result.message,
            mentions: result.mentions
        }, { quoted: fkontak });
        return;
    }

    // Modalità normale - prostituzione
    if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < COOLDOWN) {
        const remaining = msToTime(cooldowns[m.sender] + COOLDOWN - Date.now());
        return m.reply(`ㅤㅤ⋆｡˚『 ╭ \`COOLDOWN\` ╯ 』˚｡⋆\n╭\n│ 『 ⏰ 』 \`Tempo rimasto:\` *${remaining}*\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`);
    }

    let result = await esitoLavoro(user, isPrems);
    cooldowns[m.sender] = Date.now();

    // Crea il fkontak
    const fkontak = {
        "key": {
            "participants": "0@s.whatsapp.net",
            "remoteJid": "status@broadcast",
            "fromMe": false,
            "id": "Halo"
        },
        "message": {
            "contactMessage": {
                "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        "participant": "0@s.whatsapp.net"
    };
    
    await conn.sendMessage(m.chat, {
        text: result.message
    }, { quoted: fkontak });
};

async function esitoLavoro(user, isPrems) {
    if (Math.random() < (isPrems ? MALATTIA_CHANCE/2 : MALATTIA_CHANCE)) {
        let malattia = pickRandom(malattie);
        user.exp = Math.max(0, user.exp - malattia.perditaXp);
        user.euro = Math.max(0, user.euro - malattia.perditaeuro);

        return {
            message: `ㅤㅤ⋆｡˚『 ╭ \`INCIDENTE\` ╯ 』˚｡⋆\n╭\n│ 『 ${malattia.emoji} 』 \`Malattia:\` *${malattia.nome}*\n│ 『 📉 』 \`XP persi:\` *-${formatNumber(malattia.perditaXp)}*\n│ 『 💸 』 \`Euro persi:\` *-${formatNumber(malattia.perditaeuro)}*\n│ 『 ⏰ 』 \`Recupero:\` *${malattia.durata}*\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`
        };
    } else {
        let lavoro = pickRandom(lavori);
        let guadagno = randomRange(lavoro.xp[0], lavoro.xp[1]);
        let euroGuadagno = randomRange(MIN_GUADAGNO, MAX_GUADAGNO);
        
        if (isPrems) {
            guadagno = Math.floor(guadagno * 1.5);
            euroGuadagno = Math.floor(euroGuadagno * 1.5);
        }

        user.exp += guadagno;
        user.euro += euroGuadagno;

        return {
            message: `ㅤㅤ⋆｡˚『 ╭ \`SUCCESSO\` ╯ 』˚｡⋆\n╭\n│ 『 ${lavoro.emoji} 』 \`Lavoro:\` *${lavoro.msg}*\n│ 『 📈 』 \`XP guadagnati:\` *+${formatNumber(guadagno)}*\n│ 『 💰 』 \`Euro guadagnati:\` *+${formatNumber(euroGuadagno)}*${isPrems ? '\n│ 『 🌟 』 \`Bonus:\` *Premium x1.5*' : ''}\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`
        };
    }
}

async function esitoPappone(m, user, target, who, isPrems) {
    let lavoro = pickRandom(lavori);
    let guadagnoTotale = randomRange(lavoro.xp[0], lavoro.xp[1]);
    let euroTotale = randomRange(MIN_GUADAGNO, MAX_GUADAGNO);

    let papponeXp = Math.floor(guadagnoTotale * 0.70);
    let prostituteXp = guadagnoTotale - papponeXp;
    let papponeEuro = Math.floor(euroTotale * 0.70);
    let prostituteEuro = euroTotale - papponeEuro;

    if (isPrems) {
        papponeXp = Math.floor(papponeXp * 1.5);
        prostituteXp = Math.floor(prostituteXp * 1.3);
        papponeEuro = Math.floor(papponeEuro * 1.5);
        prostituteEuro = Math.floor(prostituteEuro * 1.3);
    }

    user.exp += papponeXp;
    user.euro += papponeEuro;
    target.exp += prostituteXp;
    target.euro += prostituteEuro;

    return {
        message: `ㅤㅤ⋆｡˚『 ╭ \`AFFARE CONCLUSO\` ╯ 』˚｡⋆\n╭\n│ 『 ${lavoro.emoji} 』 \`Lavoro:\` *${lavoro.msg}*\n│ \n│ 『 🕴️ 』 \`Manager:\` *@${m.sender.split('@')[0]}*\n│ 『 📈 』 \`XP:\` *+${formatNumber(papponeXp)}*\n│ 『 💰 』 \`Euro:\` *+${formatNumber(papponeEuro)}*\n│ \n│ 『 👑 』 \`Artista:\` *@${who.split('@')[0]}*\n│ 『 📈 』 \`XP:\` *+${formatNumber(prostituteXp)}*\n│ 『 💰 』 \`Euro:\` *+${formatNumber(prostituteEuro)}*${isPrems ? '\n│ 『 🌟 』 \`Bonus:\` *Premium attivo*' : ''}\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`,
        mentions: [m.sender, who]
    };
}

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatNumber(num) {
    return num.toLocaleString('it-IT');
}

function msToTime(ms) {
    let seconds = Math.floor(ms / 1000);
    let minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    return `${minutes}m ${seconds}s`;
}

handler.help = ['puttana', 'pappone @tag'];
handler.tags = ['euro', 'giochi'];
handler.command = /^(prostituzione|puttana|pappone)$/i;
handler.register = true;
handler.group = true;

export default handler;