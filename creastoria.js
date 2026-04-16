let stories = {};

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const chatId = m.chat;

    // --- LOGICA COMANDI ---
    if (command === 'storia') {
        if (stories[chatId]) return m.reply(`📖 C'è già una storia in corso!\nFrase attuale: *${stories[chatId].sentence}*\n\nScrivi una parola o usa \`${usedPrefix}finistoria\`.`);
        
        stories[chatId] = {
            sentence: "",
            lastPlayer: "",
            wordCount: 0
        };
        return m.reply("✍️ *STORIA DI GRUPPO INIZIATA!*\n\nRegole:\n1. Scrivi **solo una parola**.\n2. Non puoi scrivere due volte di fila.\n\nInizia tu! Scrivi la prima parola.");
    }

    if (command === 'finistoria') {
        if (!stories[chatId] || stories[chatId].sentence === "") return m.reply("❌ Nessuna storia attiva.");
        
        let finalStory = stories[chatId].sentence;
        delete stories[chatId];

        return await conn.sendMessage(chatId, {
            text: `📝 *CAPOLAVORO CONCLUSO:*\n\n" ${finalStory}. "\n\nInizia una nuova avventura con \`${usedPrefix}storia\``
        }, { quoted: m });
    }

    // --- LOGICA AGGIUNTA PAROLA (Senza comando) ---
    if (stories[chatId] && !command && text) {
        let word = text.trim();
        
        // Ignora se è una frase lunga o un comando del bot
        if (word.split(/\s+/).length > 1 || word.startsWith('.') || word.startsWith('/')) return;
        
        // Impedisce il doppio turno
        if (m.sender === stories[chatId].lastPlayer) return; 

        stories[chatId].sentence += (stories[chatId].sentence === "" ? "" : " ") + word;
        stories[chatId].lastPlayer = m.sender;
        stories[chatId].wordCount++;

        // --- COLPO DI SCENA (Ogni 10 parole) ---
        if (stories[chatId].wordCount % 10 === 0) {
            const eventi = [
                "improvvisamente esplose tutto e",
                "ma un alieno disse che",
                "mentre un tizio nudo gridava",
                "e stranamente tutto diventò rosa perché",
                "però il destino voleva che"
            ];
            let colpoDiScena = eventi[Math.floor(Math.random() * eventi.length)];
            stories[chatId].sentence += " " + colpoDiScena;
            
            await conn.sendMessage(chatId, { text: `😲 *COLPO DI SCENA!*\n\n... ${stories[chatId].sentence} ...` });
        }
    }
};

handler.help = ['storia', 'finistoria'];
handler.tags = ['giochi'];
handler.command = /^(storia|finistoria)$/i;
handler.group = true;

export default handler;
