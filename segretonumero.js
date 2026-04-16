const playAgainButtons = () => [{
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text: 'Nuova sfida! 🎲', id: `.segreto` })
}];

let handler = async (m, { conn, isAdmin, usedPrefix, command }) => {
    global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {};
    
    if (command === 'skipsegreto') {
        if (!global.db.data.chats[m.chat].segreto) return m.reply('⚠️ Nessuna partita attiva!');
        if (!isAdmin && !m.fromMe) return m.reply('❌ Solo admin!');
        delete global.db.data.chats[m.chat].segreto;
        return m.reply('✅ Partita annullata.');
    }

    if (global.db.data.chats[m.chat].segreto) {
        return m.reply('⚠️ C\'è già un numero attivo! Indovinalo prima di iniziarne un altro.');
    }

    const numeroSegreto = Math.floor(Math.random() * 100) + 1;
    const premioIniziale = 200;

    global.db.data.chats[m.chat].segreto = {
        numero: numeroSegreto,
        premio: premioIniziale,
        tentativi: 0,
        isResolved: false, // Flag per evitare doppie risposte
        startTime: Date.now()
    };

    let caption = `ㅤ⋆｡˚『 ╭ \`IL NUMERO SEGRETO\` ╯ 』˚｡⋆\n╭\n`;
    caption += `│ 『 🔢 』 \`Ho pensato un numero tra:\` *1 e 100*\n`;
    caption += `│ 『 💰 』 \`Premio iniziale:\` *${premioIniziale}€*\n`;
    caption += `│ 『 ⚠️ 』 _Ogni errore riduce il premio!_\n`;
    caption += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;

    await conn.reply(m.chat, caption, m);
};

handler.before = async (m, { conn }) => {
    const chat = global.db.data.chats[m.chat];
    if (!chat?.segreto || m.key.fromMe || chat.segreto.isResolved) return;

    // Controllo se il messaggio è un numero puro
    const guess = parseInt(m.text.trim());
    if (isNaN(guess) || guess < 1 || guess > 100) return;

    const game = chat.segreto;
    game.tentativi++;
    
    if (guess === game.numero) {
        game.isResolved = true; // Blocca istantaneamente altre risposte
        
        const premioFinale = Math.max(20, game.premio - (game.tentativi * 5));

        if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {};
        global.db.data.users[m.sender].euro = (global.db.data.users[m.sender].euro || 0) + premioFinale;
        global.db.data.users[m.sender].exp = (global.db.data.users[m.sender].exp || 0) + 100;

        let winText = `ㅤ⋆｡˚『 ╭ \`NUMERO INDOVINATO!\` ╯ 』˚｡⋆\n╭\n`;
        winText += `│ 『 🎉 』 \`Il numero era:\` *${game.numero}*\n`;
        winText += `│ 『 👤 』 \`Vincitore:\` @${m.sender.split('@')[0]}\n`;
        winText += `│ 『 📉 』 \`Tentativi:\` *${game.tentativi}*\n`;
        winText += `│ 『 💰 』 \`Vincita:\` *${premioFinale}€*\n`;
        winText += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;

        await conn.sendMessage(m.chat, { 
            text: winText, 
            mentions: [m.sender],
            footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙',
            interactiveButtons: playAgainButtons()
        }, { quoted: m });
        
        delete chat.segreto; // Elimina la sessione
    } else {
        const suggerimento = guess < game.numero ? "PIÙ ALTO! ⬆️" : "PIÙ BASSO! ⬇️";
        await conn.reply(m.chat, `❌ *${guess}* è sbagliato.\n💡 Suggerimento: *${suggerimento}*`, m);
    }
};

handler.help = ['segreto'];
handler.tags = ['giochi'];
handler.command = /^(segreto|skipsegreto)$/i;
handler.group = true;
handler.register = true;

export default handler;
