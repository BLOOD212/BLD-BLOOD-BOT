import { createCanvas } from 'canvas';

const EURO_REWARD = 100;
const GAME_DURATION = 60000;

const PAROLE_WORDLE = ['ABITO', 'ACQUA', 'AIUTO', 'ALBUM', 'AMICO', 'ANIMA', 'AMORE', 'ARENA', 'ASPRO', 'AVERE', 'BANCO', 'BARCA', 'BARBA', 'BASSO', 'BELLO', 'BIRRA', 'BOSCO', 'BRAVO', 'BUONO', 'CALDO', 'CAFFE', 'CAMPO', 'CARNE', 'CARTA', 'CAUSA', 'CERCA', 'CERTO', 'CHINA', 'CIFRA', 'DANTE', 'DANZA', 'DENTE', 'DIECI', 'DISCO', 'DOLCE', 'DONNA', 'DRAGO', 'DUOMO', 'DITTA', 'EBANO', 'EPOCA', 'EREDE', 'EXTRA', 'ESAME', 'ENTRO', 'ELICA', 'FERRO', 'FESTA', 'FETTA', 'FIUME', 'FIORE', 'FOLLA', 'FORMA', 'FORTE', 'GATTO', 'GAMBA', 'GENTE', 'GIOCO', 'GOMMA', 'GRADO', 'GRECO', 'GUSTO', 'HOTEL', 'ISOLA', 'LATTE', 'LARGO', 'LEGGE', 'LEONE', 'LIBRO', 'LINEA', 'LISTA', 'LUNGO', 'MONDO', 'MADRE', 'MARCO', 'MASSA', 'MEZZO', 'METRO', 'MILLE', 'MONTE', 'MORTE', 'NOTTE', 'NELLO', 'NOZZE', 'NULLO', 'NUOVO', 'OLTRE', 'OPERA', 'OCCHI', 'OVEST', 'PADRE', 'PANDA', 'PARTE', 'PASTA', 'PAURA', 'PESCE', 'PIANO', 'PIZZA', 'QUOTA', 'QUASI', 'RESTO', 'RICCO', 'ROSSO', 'RUSSO', 'ROTTO', 'REGNO', 'RAZZA', 'SANTO', 'SALTO', 'SCALE', 'SENSO', 'SOLDI', 'SOTTO', 'SPESA', 'SPORT', 'TEMPO', 'TERRA', 'TORTA', 'TUTTO', 'TURNO', 'TESTA', 'UNICO', 'UMORE', 'UNITO', 'USATO', 'USCIO', 'UTILE', 'VERDE', 'VENTO', 'VINO', 'VISTA', 'VOCE', 'VOLO', 'VUOTO', 'VALLE', 'ZEBRA', 'ZITTO', 'ZUCCA', 'ZAINO', 'ZOPPO', 'ZAPPA'];
// penso e spero siano tutte da 5 🤒
class WordleGame {
    constructor(targetWord, playerId) {
        this.targetWord = targetWord.toUpperCase();
        this.attempts = [];
        this.maxAttempts = 6;
        this.gameOver = false;
        this.won = false;
        this.startTime = Date.now();
        this.id = null;
        this.playerId = playerId;
        this.timeoutId = null;
    }

    guess(word) {
        if (this.gameOver) return { error: "La partita è già terminata! Usa `.wordle` per iniziarne una nuova." };
        
        const normalizedWord = word.toUpperCase().trim();
        if (normalizedWord.length !== 5) return { error: "La parola deve essere di 5 lettere!" };
        if (!/^[A-Z]+$/.test(normalizedWord)) return { error: "La parola deve contenere solo lettere dell'alfabeto (A-Z)!" };

        const result = this.calculateResult(normalizedWord);
        this.attempts.push({ word: normalizedWord, result });

        if (normalizedWord === this.targetWord) {
            this.gameOver = true;
            this.won = true;
        } else if (this.attempts.length >= this.maxAttempts) {
            this.gameOver = true;
        }

        return { success: true };
    }

    calculateResult(word) {
        const targetLetters = this.targetWord.split('');
        const guessLetters = word.split('');
        const result = new Array(5).fill(null);
        const targetLetterCount = {};
        for (const letter of targetLetters) {
            targetLetterCount[letter] = (targetLetterCount[letter] || 0) + 1;
        }
        for (let i = 0; i < 5; i++) {
            if (guessLetters[i] === targetLetters[i]) {
                result[i] = 'correct';
                targetLetterCount[guessLetters[i]]--;
            }
        }
        for (let i = 0; i < 5; i++) {
            if (result[i] === null) {
                if (targetLetterCount[guessLetters[i]] > 0) {
                    result[i] = 'present';
                    targetLetterCount[guessLetters[i]]--;
                } else {
                    result[i] = 'absent';
                }
            }
        }
        return result;
    }

    async generateBoardImage() {
        const cellSize = 65;
        const cellSpacing = 10;
        const borderRadius = 8;
        const padding = 20;
        const boardWidth = 5 * cellSize + 4 * cellSpacing;
        const boardHeight = this.maxAttempts * cellSize + (this.maxAttempts - 1) * cellSpacing;
        const canvasWidth = boardWidth + padding * 2;
        const canvasHeight = boardHeight + padding * 2;
        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');
        const colors = { bg1: '#1a1a1c', bg2: '#272729', border: '#3A3A3C', text: '#FFFFFF', correct: '#538D4E', present: '#B59F3B', absent: '#3A3A3C', shadow: 'rgba(0, 0, 0, 0.3)' };
        const gradient = ctx.createRadialGradient(canvasWidth / 2, canvasHeight / 2, 0, canvasWidth / 2, canvasHeight / 2, canvasWidth / 1.5);
        gradient.addColorStop(0, colors.bg2);
        gradient.addColorStop(1, colors.bg1);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.font = 'bold 40px "Clear Sans", "Helvetica Neue", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = colors.shadow;
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        for (let i = 0; i < this.maxAttempts; i++) {
            for (let j = 0; j < 5; j++) {
                const x = padding + j * (cellSize + cellSpacing);
                const y = padding + i * (cellSize + cellSpacing);
                ctx.strokeStyle = colors.border;
                ctx.lineWidth = 2;
                if (this.attempts[i]) {
                    const letter = this.attempts[i].word[j];
                    const status = this.attempts[i].result[j];
                    ctx.fillStyle = colors[status];
                    ctx.beginPath();
                    ctx.roundRect(x, y, cellSize, cellSize, borderRadius);
                    ctx.fill();
                    ctx.save();
                    ctx.shadowColor = 'transparent';
                    ctx.fillStyle = colors.text;
                    ctx.fillText(letter, x + cellSize / 2, y + cellSize / 2 + 3);
                    ctx.restore();
                } else {
                    ctx.fillStyle = colors.bg1;
                    ctx.beginPath();
                    ctx.roundRect(x, y, cellSize, cellSize, borderRadius);
                    ctx.fill();
                    ctx.stroke();
                }
            }
        }
        return canvas.toBuffer('image/png');
    }
}

global.wordleGame = global.wordleGame || {};

async function handleGameTimeout(conn, chat, gameId, usedPrefix, targetWord, playerId) {
    const currentGame = global.wordleGame?.[chat];
    
    if (!currentGame || currentGame.id !== gameId) return;
    
    try {
        currentGame.gameOver = true;
        
        let timeoutText = `ㅤ⋆｡˚『 ╭ \`TEMPO SCADUTO!\` ╯ 』˚｡⋆\n╭\n`;
        timeoutText += `│ 『 🎯 』 \`Parola:\` *${targetWord}*\n`;
        timeoutText += `│ 『 💡 』 _*Sii piu veloce*_\n`;
        timeoutText += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;
        
        const buttons = [{
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: '🎯 Gioca Ancora!', id: `.wordle` })
        }];

        await conn.sendMessage(chat, {
            text: timeoutText,
            footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙',
            interactiveButtons: buttons
        });
        
        delete global.wordleGame[chat];
    } catch (error) {
        console.error('[WORDLE] Errore durante la gestione del timeout:', error);
        delete global.wordleGame[chat];
    }
}

async function startGame(conn, m, usedPrefix) {
    const chat = m.chat;

    if (global.wordleGame?.[chat]) {
        return conn.reply(m.chat, '『 ⚠️ 』 \`C\'è già una partita attiva!\`', m);
    }

    const cooldownKey = `wordle_${chat}`;
    global.cooldowns = global.cooldowns || {};
    const lastGame = global.cooldowns[cooldownKey] || 0;
    const now = Date.now();
    const cooldownTime = 5000;

    if (now - lastGame < cooldownTime) {
        const remainingTime = Math.ceil((cooldownTime - (now - lastGame)) / 1000);
        return conn.reply(m.chat, `『 ⏳ 』 *Aspetta ancora ${remainingTime} secondi prima di avviare un nuovo gioco!*`, m);
    }
    
    try {
        const randomWord = PAROLE_WORDLE[Math.floor(Math.random() * PAROLE_WORDLE.length)];
        const newGame = new WordleGame(randomWord, m.sender);
        
        const boardImage = await newGame.generateBoardImage();

        let startCaption = `ㅤ⋆｡˚『 ╭ \`WORDLE\` ╯ 』˚｡⋆\n╭\n`;
        startCaption += `│ 『 🎯 』 \`Indovina\` *la parola di \`5 lettere.\`*\n`;
        startCaption += `│ 『 ⏱️ 』 \`1 minuto\` di tempo \`per round\`\n`;
        startCaption += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;

        let msg = await conn.sendMessage(chat, { 
            image: boardImage, 
            caption: startCaption,
            footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙'
        }, { quoted: m });

        global.wordleGame[chat] = newGame;
        global.wordleGame[chat].id = msg.key.id;
        global.cooldowns[cooldownKey] = now;

        const timeoutId = setTimeout(() => {
            handleGameTimeout(conn, chat, msg.key.id, usedPrefix, randomWord, m.sender);
        }, GAME_DURATION);

        global.wordleGame[chat].timeoutId = timeoutId;

    } catch (error) {
        console.error('Errore nell\'avvio del gioco Wordle:', error);
        await conn.reply(m.chat, `${global.errore}`, m);
    }
}


let handler = async (m, { conn, command, usedPrefix }) => {
    if (command === 'skipwordle') {
        const game = global.wordleGame?.[m.chat];
        if (!game) return conn.reply(m.chat, '⚠️ Non c\'è nessuna partita attiva in questo gruppo!', m);

        const groupMeta = await conn.groupMetadata(m.chat).catch(() => null);
        const participant = groupMeta?.participants.find(p => p.id === m.sender);
        const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';

        if (!isAdmin && m.sender !== game.playerId && !m.fromMe) {
            return conn.reply(m.chat, '❌ *Questo comando può essere usato solo dagli admin o da chi ha iniziato la partita!*', m);
        }

        clearTimeout(game.timeoutId);
        const boardImage = await game.generateBoardImage();
        
        let skipCaption = `ㅤ⋆｡˚『 ╭ \`PARTITA INTERROTTA\` ╯ 』˚｡⋆\n╭\n`;
        skipCaption += `│ 『 🎯 』 \`La parola era:\`\n 『 ‼️ 』 *\`${game.targetWord}\`*\n`;
        skipCaption += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;

        const buttons = [{
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: '🎯 Gioca Ancora!', id: `.wordle` })
        }];

        await conn.sendMessage(m.chat, {
            image: boardImage,
            caption: skipCaption,
            footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙',
            interactiveButtons: buttons
        }, { quoted: m });
        delete global.wordleGame[m.chat];
        return;
    }

    if (command === 'wordle') {
        await startGame(conn, m, usedPrefix);
    }
};

handler.before = async (m, { conn, usedPrefix }) => {
    const chat = m.chat;
    let game = global.wordleGame?.[chat];
    
    if (!game || !m.quoted || m.quoted.id !== game.id || m.key.fromMe) return;

    if (m.sender !== game.playerId) {
        return;
    }

    const userGuess = (m.text || '').trim().toUpperCase();
    if (!userGuess || !/^[A-Z]{5}$/.test(userGuess)) {
        return conn.reply(m.chat, '❌ *Rispondi con una parola valida di 5 lettere!*', m);
    }

    const result = game.guess(userGuess);
    if (result.error) {
        return conn.reply(m.chat, result.error, m);
    }
    
    const boardImage = await game.generateBoardImage();
    
    clearTimeout(game.timeoutId);

    const buttons = [{
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({ display_text: '🎯 Gioca Ancora!', id: `.wordle` })
    }];

    if (game.won) {
        const timeTaken = Math.round((Date.now() - game.startTime) / 1000);
        let reward = EURO_REWARD;
        let exp = 200;
        const timeBonus = timeTaken <= 30 ? 50 : 0;
        reward += timeBonus;

        if (global.db.data.users[m.sender]) {
            global.db.data.users[m.sender].euro = (global.db.data.users[m.sender].euro || 0) + reward;
            global.db.data.users[m.sender].exp = (global.db.data.users[m.sender].exp || 0) + exp;
        }

        let winCaption = `ㅤ⋆｡˚『 ╭ \`HAI VINTO!\` ╯ 』˚｡⋆\n╭\n`;
        winCaption += `│ 『 🎯 』 \`Parola:\` *${game.targetWord}*\n`;
        winCaption += `│ 『 ⏱️ 』 \`Tempo:\` *${timeTaken}s*\n`;
        winCaption += `│ 『 📊 』 \`Tentativi:\` *${game.attempts.length}/${game.maxAttempts}*\n`;
        winCaption += `│ 『 🎁 』 \`Ricompensa:\` *${reward}€ e ${exp}xp*\n`;
        winCaption += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;
        
        await conn.sendMessage(chat, {
            image: boardImage,
            caption: winCaption,
            footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙',
            interactiveButtons: buttons
        }, { quoted: m });
        delete global.wordleGame[chat];

    } else if (game.gameOver) {
        let loseCaption = `ㅤ⋆｡˚『 ╭ \`GAME OVER!\` ╯ 』˚｡⋆\n╭\n`;
        loseCaption += `│ 『 🎯 』 \`La parola era:\`\n『 ‼️ 』 *\`${game.targetWord}\`*\n`;
        loseCaption += `│ 『 💡 』 \`Non arrenderti!\`\n`;
        loseCaption += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;
        
        await conn.sendMessage(chat, {
            image: boardImage,
            caption: loseCaption,
            footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙',
            interactiveButtons: buttons
        }, { quoted: m });
        delete global.wordleGame[chat];

    } else {
        let continueCaption = `ㅤ⋆｡˚『 ╭ \`WORDLE\` ╯ 』˚｡⋆\n╭\n`;
        continueCaption += `│ 『 📝 』 \`Tentativo:\` *${userGuess}*\n`;
        continueCaption += `│ 『 📊 』 \`Rimasti:\` *${game.maxAttempts - game.attempts.length}*\n`;
        continueCaption += `│ 『 ⏱️ 』 \`Hai 1 minuto!\`\n`;
        continueCaption += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;
        
        let newMsg = await conn.sendMessage(chat, {
            image: boardImage,
            caption: continueCaption,
            footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙'
        }, { quoted: m });
        
        game.id = newMsg.key.id;

        const newTimeoutId = setTimeout(() => {
            handleGameTimeout(conn, chat, newMsg.key.id, usedPrefix, game.targetWord, game.playerId);
        }, GAME_DURATION);
        
        game.timeoutId = newTimeoutId;
    }
};

setInterval(() => {
    const now = Date.now();
    for (const [chat, game] of Object.entries(global.wordleGame || {})) {
        if (now - game.startTime > 600000) {
            console.log(`[WORDLE CLEANUP] Rimuovendo gioco inattivo nella chat ${chat}`);
            clearTimeout(game.timeoutId);
            delete global.wordleGame[chat];
        }
    }
}, 60000);

handler.help = ['wordle'];
handler.tags = ['giochi'];
handler.command = /^(wordle|skipwordle)$/i;
handler.group = true;
handler.register = true;

export default handler;