import { unlinkSync, readFileSync } from 'fs'
import { join } from 'path'
import { exec } from 'child_process'
const effectsMap = new Map([
    ['basso', '-af equalizer=f=94:width_type=o:width=2:g=30'],
    ['esplosivo', '-af acrusher=.1:1:64:0:log'],
    ['profondo', '-af atempo=4/4,asetrate=44500*2/3'],
    ['forte', '-af volume=12'],
    ['veloce', '-filter:a "atempo=1.63,asetrate=44100"'],
    ['grasso', '-filter:a "atempo=1.6,asetrate=22100"'],
    ['nightcore', '-filter:a atempo=1.06,asetrate=44100*1.25'],
    ['inverso', '-filter_complex "areverse"'],
    ['robot', '-filter_complex "afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75"'],
    ['lento', '-filter:a "atempo=0.7,asetrate=44100"'],
    ['smooth', '-filter:v "minterpolate=\'mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=120\'"'],
    ['scoiattolo', '-filter:a "atempo=0.5,asetrate=65100"'],
    ['eco', '-filter:a "aecho=0.8:0.9:1000:0.3"'],
    ['coro', '-filter:a "chorus=0.7:0.9:55:0.4:0.25:2"'],
    ['flanger', '-filter:a "flanger=delay=20:depth=0.2"'],
    ['distorto', '-filter:a "aecho=0.8:0.9:1000:0.3,firequalizer=gain_entry=\'entry(0,15)entry(250,0)entry(4000,15)\'"'],
    ['pitch', '-filter:a "asetrate=44100*1.25,atempo=1.25"'],
    ['acuto', '-filter:a "highpass=f=500"'],
    ['grave', '-filter:a "lowpass=f=500"'],
    ['sottacqua', '-af "asetrate=44100*0.5,atempo=2,lowpass=f=300"'],
    ['8d', '-af "apulsator=hz=0.09"'],
    ['tremolo', '-filter:a "tremolo=f=6.5:d=0.8"'],
    ['vibrato', '-filter:a "vibrato=f=6.5:d=0.5"'],
    ['vinile', '-af aresample=48000,asetrate=48000*0.8'],
    ['cristallino', '-af crystalizer=i=5'],
    ['metallico', '-af "aecho=0.8:0.88:8:0.8"'],
    ['demone', '-af "asetrate=44100*0.6,acrusher=.1:1:64:0:log"'],
    ['radio', '-af "bandpass=f=1500:width_type=h,highpass=f=200,lowpass=f=3000"'],
    ['telefono', '-af "highpass=f=800,lowpass=f=3000"'],
    ['bambino', '-af "asetrate=44100*1.4,atempo=0.7"'],
    ['gigante', '-af "asetrate=44100*0.6,atempo=1.7"'],
    ['alien', '-af "asetrate=44100*2,atempo=0.5,aecho=0.8:0.8:50:0.5"']
]);
function combineEffects(effects) {
    return effects.map(effect => {
        const filter = effectsMap.get(effect);
        if (!filter) throw new Error(`Effetto "${effect}" non valido`);
        return filter.replace(/^-a[ff]?\s+/, '');
    }).join(',');
}

let handler = async (m, { conn, args, __dirname, usedPrefix, command }) => {
    try {
        if (command === 'effetti') {
            let teks = `   ⋆｡˚『 ╭ \`EFFETTI AUDIO\` ╯ 』˚｡⋆\n╭\n│
│ 『 🎵 』 \`Uso Base:\`
│ *${usedPrefix}effettox*
│ 『 🎶 』 \`Effetti Multipli:\`
│ *${usedPrefix}mix effetto1+effetto2+...*
│ 
│ 『 🎼 』 \`Esempi:\`
│ *${usedPrefix}8d*
│ *${usedPrefix}mix basso+eco*
│
│ 『 🪈 』 *Lista Effetti:*
${[...effectsMap.keys()].map(effect => `│ ➤ ${effect}`).join('\n')}
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`
            return m.reply(teks)
        }

        let q = m.quoted ? m.quoted : m
        let mime = (m.quoted ? m.quoted : m.msg).mimetype || ''

        if (!/audio/.test(mime)) {
            return m.reply('『 ❗ 』- \`Rispondi ad un audio/nota vocale\`')
        }

        await m.react('⏳')
        let ran = `${Math.floor(Math.random() * 10000)}.mp3`
        let filename = join(__dirname, '../temp/' + ran)
        let media = await q.download(true)
        let set;
        if (command === 'mix') {
            if (!args[0]) return m.reply(`『 ❌ 』- \`Specifica gli effetti da combinare usando +\`\n\`Esempio:\` *${usedPrefix}mix basso+eco*`)
            const effects = args[0].toLowerCase().split('+')
            try {
                set = `-af "${combineEffects(effects)}"`
            } catch (e) {
                return m.reply(e.message)
            }
        } else {
            set = effectsMap.get(command.toLowerCase())
            if (!set) return m.reply(`『 ❌ 』- \`Effetto non valido. Usa ${usedPrefix}effetti per vedere la lista\``)
        }

        exec(`ffmpeg -i ${media} ${set} ${filename}`, async (err, stderr, stdout) => {
            try {
                unlinkSync(media)
                if (err) throw err
                let buff = readFileSync(filename)
                await conn.sendFile(m.chat, buff, ran, null, m, true, {
                    type: 'audioMessage',
                    ptt: true
                })
                unlinkSync(filename)
                await m.react('✅')
            } catch (e) {
                console.error(e)
                await m.react('❌')
                m.reply('❌ ' + e.message)
            }
        })
    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('❌ ' + e.message)
    }
}

handler.help = ['effetti']
handler.tags = ['strumenti']
handler.command = new RegExp(`^(effetti|mix|${[...effectsMap.keys()].join('|')})$`, 'i')

export default handler
