let handler = async (m, { conn }) => {
    // Liste tecniche professionali
    const basi = ["Rosa Cipria 🌸", "Nude Caldo 🪵", "Bianco Lattiginoso 🥛", "Trasparente Crystal 💎", "Beige Naturale 🐚", "Pesca Camouflage 🍑", "Rosa Antico 🎀", "Bianco Latte 🕊️", "Fucsia Shimmer 💖", "Milky Rose 🍭", "Pesca Neon 🍊", "Lilla Pastello 🔮", "Avorio Satin 🕯️", "Champagne ✨", "Ghiaccio ❄️"];
    const forme = ["Mandorla Russa 💅", "Square Definita 📐", "Coffin Elegante ⚰️", "Stiletto Audace 👠", "Ballerina Chic 🩰", "Ovale Classica 🥚", "Squoval Moderna 💅"];
    const stili = ["Struttura a Muretto", "French Classico", "French a V (Chevron)", "Babyboomer Sfumato", "Deep French", "Micro-French", "Effetto Marmo", "Effetto Cat-Eye", "French Obliquo", "Effetto Fumo"];
    const colori = ["Nero Profondo 🖤", "Bianco Gesso ⚪", "Rosso Rubino ❤️", "Blu Elettrico 💙", "Oro Specchio 👑", "Argento Glitter 🥈", "Verde Smeraldo 💚", "Bordeaux 🍷", "Lilla 💜", "Rosa Neon 💖"];
    const commenti = [
        "Queste unghie sono perfette per occasioni importanti ma anche per farsi notare! 🔥",
        "Un look da vera regina, eleganza allo stato puro. 👑",
        "Il set ideale per chi vuole unire raffinatezza e carattere. 💎",
        "Semplici, pulite e incredibilmente sexy. Impossibile non guardarle! 😍",
        "Un capolavoro di tecnica che trasforma le mani in gioielli. 💍",
        "Audaci, moderne e con quel tocco di luce che incanta chiunque. 🌟",
        "La scelta perfetta per una donna che ama i dettagli di lusso. 👠"
    ];

    // Funzione per rimescolare (Fisher-Yates Shuffle)
    const shuffle = (array) => array.sort(() => Math.random() - 0.5);

    // Rimescoliamo le liste ogni volta per non avere sempre le stesse frasi
    const basiShuffled = shuffle([...basi]);
    const formeShuffled = shuffle([...forme]);
    const stiliShuffled = shuffle([...stili]);
    const coloriShuffled = shuffle([...colori]);

    let database_500 = [];
    
    // Generiamo 500 combinazioni uniche rimescolate
    for (let b of basiShuffled) {
        for (let f of formeShuffled) {
            for (let s of stiliShuffled) {
                for (let c of coloriShuffled) {
                    if (database_500.length >= 500) break;
                    
                    let com = commenti[Math.floor(Math.random() * commenti.length)];
                    let frase = `✨ *NAIL ART LUXURY DESIGN* ✨\n\n` +
                                `🌸 *BASE:* ${b}\n` +
                                `💅 *FORMA:* ${f}\n` +
                                `🎨 *STILE:* ${s}\n` +
                                `🌈 *COLORE:* ${c}\n` +
                                `✨ *FINISH:* Extra Lucido Specchiato\n\n` +
                                `📝 _${com}_`;
                    
                    database_500.push(frase);
                }
                if (database_500.length >= 500) break;
            }
            if (database_500.length >= 500) break;
        }
        if (database_500.length >= 500) break;
    }

    // Scegliamo una frase a caso tra le 500 generate
    const scelta = database_500[Math.floor(Math.random() * database_500.length)];

    await conn.reply(m.chat, scelta, m);
};

handler.help = ['unghie'];
handler.tags = ['giochi'];
handler.command = /^(unghie)$/i;

export default handler;
