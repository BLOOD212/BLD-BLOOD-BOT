let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `🫣 Inserisci due nomi!\nEsempio: *${usedPrefix + command} Mario Luigia*`;

    let args = text.trim().split(/ +/);
    if (args.length < 2) throw `🫣 Servono DUE nomi!`;

    let n1 = args[0].toLowerCase();
    let n2 = args[1].toLowerCase();

    // Funzione per mischiare le lettere in modo che sembri un nome
    const mixNames = (name1, name2) => {
        let combined = name1 + name2;
        let letters = combined.split('');
        
        // Mischia le lettere (Fisher-Yates Shuffle)
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }

        // Prende una lunghezza media tra i due nomi per non farlo troppo lungo
        let targetLength = Math.floor((name1.length + name2.length) / 1.5);
        let result = letters.slice(0, targetLength).join('');
        
        // Rende leggibile: Prima maiuscola
        return result.charAt(0).toUpperCase() + result.slice(1);
    };

    const nomeMixato = mixNames(n1, n2);

    let response = `✨ *GENERATORE NOMI MIX* ✨\n\n`;
    response += `👤 *Base 1:* ${args[0]}\n`;
    response += `👤 *Base 2:* ${args[1]}\n\n`;
    response += `🧪 *Nome Generato:* **${nomeMixato}**\n\n`;
    response += `> Ho rimescolato le lettere per te!`;

    await conn.reply(m.chat, response, m);
};

handler.help = ['nomimix',];
handler.tags = ['giochi'];
handler.command = /^(nomimix)$/i;
handler.group = true;
handler.botAdmin = false;
handler.fail = null;
export default handler;