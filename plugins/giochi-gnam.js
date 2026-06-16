let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Controllo se è stato taggato qualcuno
    let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null;
    if (!target) return m.reply("Devi taggare qualcuno! Esempio: .gnam @utente");

    // Liste di frasi e battute
    let azioni = [
        "ha divorato in un sol boccone",
        "si è mangiato tutto il povero",
        "ha trasformato in uno spuntino di mezzanotte",
        "ha dato un morso gigante a",
        "si è fatto una scorpacciata di"
    ];

    let battute = [
        "Spero che almeno fosse saporito!",
        "Non è rimasto nemmeno un osso...",
        "Che fame da lupi, eh?",
        "Povero, non ha avuto scampo.",
        "Il menù di oggi era decisamente... vivace!"
    ];

    let azioneScelta = azioni[Math.floor(Math.random() * azioni.length)];
    let battutaScelta = battute[Math.floor(Math.random() * battute.length)];

    let res = `@${m.sender.split('@')[0]} ${azioneScelta} @${target.split('@')[0]}! ${battutaScelta}`;

    conn.sendMessage(m.chat, { 
        text: res, 
        mentions: [m.sender, target] 
    }, { quoted: m });
};

handler.command = ['gnam'];
export default handler;
