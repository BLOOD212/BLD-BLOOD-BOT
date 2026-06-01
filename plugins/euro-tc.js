let users = {};
let cooldowns = {}
const COOLDOWN_TIME = 60000 // 1 minuto di cooldown dopo vittoria

const resultEmojis = {
    testa: '👑',
    croce: '🗡️'
};

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let scelta, quantita;
    if (command === 'testa' || command === 'croce') {
        scelta = command;
        quantita = parseInt(text.trim()) || null;
        
        if (!quantita) {
            return m.reply(
`ㅤㅤ⋆｡˚『 ╭ \`TESTA O CROCE\` ╯ 』˚｡⋆
╭
│ 『 💡 』 \`Uso:\` *.testa 50*
│ 『 💡 』 \`Alt:\` *.croce 50*
│ 『 💡 』 \`Alt:\` *.tc testa 50*
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`
            );
        }
    } else {
        if (!text) text = '';
        [scelta, quantita] = text.trim().split(/\s+/);
        
        if (!scelta || !quantita) {
            return m.reply(
`ㅤㅤ⋆｡˚『 ╭ \`TESTA O CROCE\` ╯ 』˚｡⋆
╭
│ 『 💡 』 \`Uso:\` *.tc testa 50*
│ 『 💡 』 \`Alt:\` *.testa 50*
│ 『 💡 』 \`Alt:\` *.croce 50*
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`
            );
        }
        
        scelta = scelta.toLowerCase();
        quantita = parseInt(quantita);
    }

    if (scelta !== 'testa' && scelta !== 'croce') {
        return m.reply(
`ㅤㅤ⋆｡˚『 ╭ \`ERRORE\` ╯ 』˚｡⋆
╭
│ 『 ⚠️ 』 \`Scegli:\` *testa* o *croce*
│ 『 💡 』 \`Esempio:\` *.tc testa 50*
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`
        );
    }

    if (isNaN(quantita) || quantita <= 0) {
        return m.reply(
`⚠️ ═══ ERRORE ═══ ⚠️
💰 Inserisci un importo valido!
💡 Esempio: ${usedPrefix + command} testa 50`
        );
    }

    if (!global.db.data.users) global.db.data.users = {};
    if (!global.db.data.users[m.sender]) {
        global.db.data.users[m.sender] = {
            euro: 0,
            money: 0,
            joincount: 0,
            exp: 0,
            lastcofre: 0,
        };
    }

    let user = global.db.data.users[m.sender];
    let importoTotale = quantita;

    if (user.euro < importoTotale) {
        return m.reply(
`💸 ═══ FONDI BASSI ═══ 💸
💰 Hai: ${user.euro} €
🎯 Serve: ${importoTotale} €`
        );
    }

    // Dopo aver determinato il risultato
    let risultato = Math.random() < 0.5 ? 'testa' : 'croce';
    let vinto = risultato === scelta;

    // Verifica cooldown se ha vinto l'ultima volta
    if (vinto && cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < COOLDOWN_TIME) {
        let remainingTime = Math.ceil((cooldowns[m.sender] + COOLDOWN_TIME - Date.now()) / 1000);
        return m.reply(
`ㅤㅤ⋆｡˚『 ╭ \`COOLDOWN\` ╯ 』˚｡⋆
╭
│ 『 ⏳ 』 \`Attendi:\` *${remainingTime}s*
│ 『 💡 』 \`Motivo:\` *Vittoria precedente*
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`
        );
    }
    const resGif = await conn.sendMessage(m.chat, {
        video: { url: vinto
            ? 'https://media.giphy.com/media/aSnZ1ZQahbvNlKQb2P/giphy.mp4'
            : 'https://media.giphy.com/media/mTssfOuFvkO2uVwN28/giphy.mp4' },
        gifPlayback: true,
        caption: `- 『 🎲 』 \`Scelta:\` *${scelta.toUpperCase()}*
- 『 💰 』 \`Puntata:\` *${quantita}€*`
    }, { quoted: m })

    await new Promise(resolve => setTimeout(resolve, 3500));

    // Aggiorna bilancio e cooldown se vince
    if (vinto) {
        user.euro += quantita;
        cooldowns[m.sender] = Date.now();
    } else {
        user.euro -= quantita;
    }

    // Invia messaggio finale con bottone di ritiro se ha perso, quotando la GIF inviata
    let buttons = []
    if (!vinto) {
        buttons.push({
            buttonId: `${usedPrefix}tc ${scelta} ${quantita}`,
            buttonText: { displayText: '🔄 Ritenta' },
            type: 1
        })
    }

    const finalText = `ㅤㅤ⋆｡˚『 ╭ \`${vinto ? 'VITTORIA' : 'SCONFITTA'}\` ╯ 』˚｡⋆
╭
│ 『 ${resultEmojis[risultato]} 』 \`Risultato:\` *${risultato.toUpperCase()}*
│ 『 🎲 』 \`Scelta:\` *${scelta.toUpperCase()}*
│ 『 💰 』 \`Puntata:\` *${quantita}€*
│ 『 ${vinto ? '📈' : '📉'} 』 \`${vinto ? '+' : '-'}${quantita}€\`
│ 『 💎 』 \`Bilancio:\` *${user.euro}€*
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

    try {
        await conn.sendMessage(m.chat, {
            text: finalText,
            buttons: buttons.length ? buttons : undefined,
            footer: '𝐁𝐋𝐎𝐎𝐃-𝐁𝐎𝐓'
        }, { quoted: resGif })
    } catch (err) {
        console.error('Errore invio messaggio finale tc:', err)
        // fallback testuale sempre quotando la GIF
        await conn.sendMessage(m.chat, { text: finalText }, { quoted: resGif })
    }
}

handler.help = ['testacroce', 'testa', 'croce'];
handler.tags = ['euro', 'giochi'];
handler.command = ['testacroce', 'tc', 'testa', 'croce'];

export default handler;