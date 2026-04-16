let rouletteSessioni = {};

let handler = async (m, { conn, command }) => {
    let chat = m.chat;
    let who = m.sender;

    // --- APRI IL TAVOLO (.roulette) ---
    if (command === 'roulette') {
        if (rouletteSessioni[chat]) return m.reply('⚠️ C\'è già una partita in corso. Non vedi il sangue a terra? Scrivi *.entra*');

        rouletteSessioni[chat] = {
            giocatori: [who],
            nomi: {},
            stato: 'ATTESA'
        };
        rouletteSessioni[chat].nomi[who] = m.pushName || 'Anonimo';

        let intro = `🌑 *IL CLUB DEI DISPERATI* 🌑\n`;
        intro += `──────────────────\n`;
        intro += `_Le luci soffuse illuminano un tavolo circolare. Il freddo acciaio di una Smith & Wesson rimbalza sul legno mentre l'odore di polvere da sparo riempie la stanza._\n\n`;
        intro += `📜 *REGOLAMENTO:* Ci si siede, si carica un solo colpo e si preme il grilletto a turno. L'ultimo che resta intero vince la gloria.\n\n`;
        intro += `👤 *Giocatori attuali:* 1/6\n`;
        intro += `👉 Scrivi *.entra* per sederti al tavolo.\n`;
        intro += `👉 L'organizzatore può scrivere *.spara* per sigillare le porte e iniziare.`;

        return conn.sendMessage(chat, { text: intro, mentions: [who] }, { quoted: m });
    }

    // --- ENTRA NEL TAVOLO (.entra) ---
    if (command === 'entra') {
        let sessione = rouletteSessioni[chat];
        if (!sessione) return m.reply('La sedia è vuota. Crea un tavolo con *.roulette*');
        if (sessione.stato !== 'ATTESA') return m.reply('Troppo tardi. Il tamburo sta già girando...');
        if (sessione.giocatori.includes(who)) return m.reply('Sei già seduto. Controlla che la sicura sia tolta.');
        if (sessione.giocatori.length >= 6) return m.reply('Il tavolo è pieno. Aspetta il prossimo turno (se qualcuno sopravvive).');

        sessione.giocatori.push(who);
        sessione.nomi[who] = m.pushName || 'Anonimo';

        let msg = `✅ @${who.split('@')[0]} ha preso posto al tavolo.\n👥 Sfidanti pronti: ${sessione.giocatori.length}/6`;
        return conn.sendMessage(chat, { text: msg, mentions: [who] }, { quoted: m });
    }

    // --- SEQUENZA DI SPARO (.spara) ---
    if (command === 'spara') {
        let sessione = rouletteSessioni[chat];
        if (!sessione) return;
        if (sessione.giocatori[0] !== who) return m.reply('Solo chi ha portato la pistola può dare il via al massacro!');
        if (sessione.giocatori.length < 2) return m.reply('Hai bisogno di almeno un altro pazzo per giocare! 💀');

        sessione.stato = 'SCONTRO';
        
        await conn.sendMessage(chat, { text: `🚨 *PORTE SIGILLATE.* \n\n_Il tamburo viene fatto girare vorticosamente... che la fortuna assista i sopravvissuti._` });

        async function prossimoRound() {
            if (sessione.giocatori.length <= 1) {
                let vincitore = sessione.giocatori[0];
                let vNome = sessione.nomi[vincitore];
                let finale = `🏆 *L'ULTIMO UOMO IN PIEDI* 🏆\n\n`;
                finale += `🥇 Complimenti ${vNome} (@${vincitore.split('@')[0]}). Sei l'unico che stasera potrà raccontare quello che è successo in questa stanza.`;
                
                await conn.sendMessage(chat, { text: finale, mentions: [vincitore] });
                delete rouletteSessioni[chat];
                return;
            }

            let indexVittima = Math.floor(Math.random() * sessione.giocatori.length);
            let vittima = sessione.giocatori[indexVittima];
            let vNome = sessione.nomi[vittima];

            let roundMsg = `📽️ *GIRA IL TAMBURO...*\n`;
            roundMsg += `L'arma si ferma davanti alla fronte di *${vNome}*...\n`;
            roundMsg += `*CLIC... BOOM!* 💥\n\n`;
            roundMsg += `💀 @${vittima.split('@')[0]} crolla a terra!`;

            await conn.sendMessage(chat, { text: roundMsg, mentions: [vittima] });

            sessione.giocatori.splice(indexVittima, 1);

            // Pausa drammatica tra i round
            setTimeout(() => prossimoRound(), 4000);
        }

        prossimoRound();
    }
};

handler.help = ['roulette', 'entra', 'spara'];
handler.tags = ['giochi'];
handler.command = /^(roulette|entra|spara)$/i;
handler.group = true;

export default handler;
