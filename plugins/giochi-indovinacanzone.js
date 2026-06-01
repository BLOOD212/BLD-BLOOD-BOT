//comando creatore da sam github.com/realvare
import axios from 'axios'
import fs from 'fs'
import path from 'path'
function normalize(str) {
    if (!str) return '';
    str = str.split(/\s*[\(\[{](?:feat|ft|featuring).*$/i)[0]
        .split(/\s*(?:feat|ft|featuring)\.?\s+.*$/i)[0]
    
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .trim();
}
async function getRandomItalianTrackFromItunes() {
    const keywords = [
       "Lazza", "Melons", "Sayf", "Sfera Ebbasta", "Ghali","Baby Gang", "Shiva", "Drake", "Tony Boy", "Kid Yugi", "21 savage", "Marracash", "Capo Plaza", "Guè Pequeno", "Melons", "King Von", "Chief Keef", "Lil Durk",  "Tha Supreme", "Gemitaiz", "Fabri Fibra", "Marracash", "Simba La Rue", "Il tre", "Rondo Da Sosa", "Drefgold", "Noyz Narcos", "Salmo", "Clementino", "Noyz Narcos", "Rocco Hunt", "Luchè", "Enzo Dong", "Calcutta", "Gazzelle", "Ariete"
    ]
    let found = null
    let tentativi = 0
    while (!found && tentativi < 5) {
        const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)]
        const response = await axios.get('https://itunes.apple.com/search', {
            params: {
                term: randomKeyword,
                country: 'IT',
                media: 'music',
                limit: 35
            }
        })
        const valid = response.data.results.filter(b => b.previewUrl && b.trackName && b.artistName && b.artworkUrl100)
        if (valid.length) found = valid[Math.floor(Math.random() * valid.length)]
        tentativi++
    }
    if (!found) throw new Error(`${global.errore}`)
    return {
        title: found.trackName,
        artist: found.artistName,
        preview: found.previewUrl,
        artwork: found.artworkUrl100.replace('100x100bb', '600x600bb') // Migliore qualità
    }
}

async function downloadImage(url, filepath) {
    const response = await axios.get(url, {
        responseType: 'arraybuffer'
    })
    fs.writeFileSync(filepath, Buffer.from(response.data))
    return filepath
}

const activeGames = new Map()

let handler = async (m, { conn }) => {
    const chat = m.chat
    
    if (activeGames.has(chat)) {
        return m.reply('『 ⚠️ 』- \`C\'è già una partita in corso in questo gruppo!\` ')
    }

    try {
        const track = await getRandomItalianTrackFromItunes()
        const audioResponse = await axios.get(track.preview, {
            responseType: 'arraybuffer'
        })
        
        const tmpDir = path.join(process.cwd(), 'temp')
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true })
        }
        
        const audioPath = path.join(tmpDir, `song_${Date.now()}.mp3`)
        
        fs.writeFileSync(audioPath, Buffer.from(audioResponse.data))
        
        const formatGameMessage = (timeLeft) => `
  ⋆｡˚『 ╭ \`INDOVINA CANZONE\` ╯ 』˚｡⋆\n╭
┃ 『 ⏱️ 』 \`Tempo:\` *${timeLeft} secondi* 
┃ 『 👤 』 \`Artista:\` *${track.artist}* 
┃
┃ ➤  \`Scrivi il titolo!\`
╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`
        let gameMessage = await conn.sendMessage(m.chat, {
            text: formatGameMessage(30),
            contextInfo: {
                externalAdReply: {
                    title: 'indovina la canzone',
                    body: `Artista: ${track.artist}`,
                    thumbnailUrl: track.artwork,
                    sourceUrl: '𝐁𝐋𝐎𝐎𝐃-𝐁𝐎𝐓',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m })
        
        await conn.sendMessage(m.chat, { 
            audio: fs.readFileSync(audioPath),
            mimetype: 'audio/mp4',
            ptt: true
        }, { quoted: m })
        fs.unlinkSync(audioPath)
        let game = {
            track,
            timeLeft: 30,
            message: gameMessage,
            interval: null
        }
        game.interval = setInterval(async () => {
            try {
                game.timeLeft -= 5
            
                if (game.timeLeft <= 0) {
                    clearInterval(game.interval)
                    activeGames.delete(chat)
                    await conn.sendMessage(m.chat, {
                        text: `
ㅤ⋆｡˚『 ╭ \`TEMPO SCADUTO\` ╯ 』˚｡⋆\n╭\n│
│ ➤ \`Nessuno ha indovinato!\`
┃ 『  』🎵 \`Titolo:\` *${track.title}*
┃ 『  』👤 \`Artista:\` *${track.artist}*
┃
╰⭒─ׄ─ׅ─ׄ─⭒`,
                        buttons: [
                            {
                                buttonId: '.ic',
                                buttonText: {
                                    displayText: '『 🎵 』 Rigioca'
                                },
                                type: 1
                            }
                        ],
                        headerType: 1
                    }).catch(() => {})
                    return
                }
                // Non fare niente durante il countdown, il messaggio rimane fisso
            } catch (e) {
                console.error('Errore nel countdown:', e)
            }
        }, 5000) //timer ogni 5 secondi per colpa di ratelimit czz
        activeGames.set(chat, game)

    } catch (e) {
        console.error('Errore in indovina canzone:', e)
        m.reply(`${global.errore}`)
        activeGames.delete(chat)
    }
}
handler.before = async (m, { conn }) => {
    const chat = m.chat
    
    if (!activeGames.has(chat)) return
    
    const game = activeGames.get(chat)
    const userAnswer = normalize(m.text || '')
    const correctAnswer = normalize(game.track.title)
    if (!userAnswer || userAnswer.length < 2) return;
    function similarity(str1, str2) {
        const words1 = str1.split(' ').filter(Boolean)
        const words2 = str2.split(' ').filter(Boolean)
        
        const matches = words1.filter(word => 
            words2.some(w2 => w2.includes(word) || word.includes(w2))
        )
        return matches.length / Math.max(words1.length, words2.length)
    }

    const similarityScore = similarity(userAnswer, correctAnswer)
    const isCorrect = 
        (userAnswer.length > 1) &&
        (
            userAnswer === correctAnswer ||
            (correctAnswer.includes(userAnswer) && userAnswer.length > correctAnswer.length * 0.5) ||
            (userAnswer.includes(correctAnswer) && userAnswer.length < correctAnswer.length * 1.5) ||
            similarityScore >= 0.7
        );

    if (isCorrect) {
        clearInterval(game.interval)
        activeGames.delete(chat)
        let reward = Math.floor(Math.random() * 100) + 50
        let exp = 500
        if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
        global.db.data.users[m.sender].euro = (global.db.data.users[m.sender].euro || 0) + reward
        global.db.data.users[m.sender].exp = (global.db.data.users[m.sender].exp || 0) + exp
        await conn.sendMessage(m.chat, {
            react: {
                text: '✅',
                key: m.key
            }
        }).catch(() => {})
        await conn.sendMessage(m.chat, {
            text: `
ㅤㅤ⋆｡˚『 ╭ \`CORRETTA\` ╯ 』˚｡⋆\n╭\n│
│ ➤ \`Risposta Corretta!\`
┃ 『  』🎵 \`Titolo:\` *${game.track.title}*
┃ 『  』👤 \`Artista:\` *${game.track.artist}*
┃
┃ 『 🎁 』 \`Vincite:\`
│ ➤  \`${reward}\` *euro*
│ ➤  \`${exp}\` *exp*
┃
╰⭒─ׄ─ׅ─ׄ─⭒`,
            buttons: [
                {
                    buttonId: '.ic',
                    buttonText: {
                        displayText: '『 🎵 』 Rigioca'
                    },
                    type: 1
                }
            ],
            headerType: 1
        }, { quoted: m }).catch(() => {})
        
        console.log('Debug risposta:', {
            userAnswer,
            correctAnswer,
            similarity: similarity(userAnswer, correctAnswer)
        })
    } else if (similarityScore >= 0.3) {
        await conn.sendMessage(m.chat, {
            react: {
                text: '❌', //solo per nomi simili
                key: m.key
            }
        }).catch(() => {})
        await conn.reply(m.chat, '👀 *Ci sei quasi!* Riprova...', m)
    }
}

handler.help = ['indovinacanzone']
handler.tags = ['giochi']
handler.command = ['indovinacanzone', 'ic']
handler.register = false
handler.group = true
export default handler
