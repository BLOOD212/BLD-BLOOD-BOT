import { unlinkSync, readFileSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';

function parseTime(t) {
    if (!t) return 0;
    t = t.replace(/s$/i, '');
    if (/^\d*\.?\d+$/.test(t)) {
        return parseFloat(t);
    }
    if (t.includes(':')) {
        const parts = t.split(':').map(parseFloat).reverse();
        let seconds = 0;
        for (let i = 0; i < parts.length; i++) {
            seconds += parts[i] * Math.pow(60, i);
        }
        return seconds;
    }
    
    return parseFloat(t) || 0;
}

let handler = async (m, { conn, args, __dirname, usedPrefix }) => {
    try {
        if (!args.length || args.length < 2) {
            return m.reply(`『 ❌ 』 \`Uso del comando:\`
${usedPrefix}tagliamedia [inizio] [fine]

➤ \`Esempi:\`
• ${usedPrefix}tagliamedia 10 30 _(dal secondo 10 al 30)_
• ${usedPrefix}tagliamedia 0.05 0.08 _(da 0.05s a 0.08s)_
• ${usedPrefix}tagliamedia 1.5 3.25 _(da 1.5s a 3.25s)_
• ${usedPrefix}tagliamedia 10s 30s _(dal secondo 10 al 30)_
• ${usedPrefix}tagliamedia 00:10 00:30 _(dal secondo 10 al 30)_
• ${usedPrefix}tagliamedia 1:30.5 2:00.25 _(da 1min30.5s a 2min0.25s)_

➤ *Rispondendo ad un audio o video*`);
        }
        let startRaw, endRaw;
        let fullText = args.join(' ');
        if (fullText.includes('-')) {
            [startRaw, endRaw] = fullText.split('-').map(s => s.trim());
        } else {
            startRaw = args[0];
            endRaw = args[1];
        }

        let start = parseTime(startRaw);
        let end = parseTime(endRaw);

        if (isNaN(start) || isNaN(end) || start < 0 || end < 0) {
            return m.reply('『 ❌ 』 Tempi non validi. Usa numeri positivi.');
        }

        if (end <= start) {
            return m.reply('『 ❌ 』 Il tempo di fine deve essere maggiore di quello di inizio.');
        }

        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';

        if (!/(audio|video)/.test(mime)) {
            return m.reply('『 ❗ 』 Rispondi a un audio o video con questo comando');
        }

        await m.react('⏳');

        let ext = mime.includes('video') ? '.mp4' : '.mp3';
        let fs = await import('fs/promises');

        let inputPath = join(__dirname, '../temp/', `input_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
        let outputPath = join(__dirname, '../temp/', `output_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${ext}`);

        try {
            let media = await q.download();
            await fs.writeFile(inputPath, media);

            let duration = end - start;
            let ffmpegCmd;

            if (ext === '.mp4') {
                ffmpegCmd = `ffmpeg -i "${inputPath}" -ss ${start} -t ${duration} -c:v libx264 -c:a aac -preset veryfast -movflags +faststart "${outputPath}"`;
            } else {
                ffmpegCmd = `ffmpeg -i "${inputPath}" -ss ${start} -t ${duration} -c copy "${outputPath}"`;
            }

            exec(ffmpegCmd, async (err, stdout, stderr) => {
                try {
                    await fs.unlink(inputPath);
                } catch (e) {
                    console.log('Errore rimozione file input:', e);
                }

                if (err) {
                    console.log('FFmpeg error:', err);
                    console.log('FFmpeg stderr:', stderr);
                    await m.react('❌');
                    return m.reply(`❌ Errore durante il taglio del media. Controlla che i tempi siano corretti.`);
                }

                try {
                    let stats = await fs.stat(outputPath);
                    if (stats.size === 0) {
                        throw new Error('File output vuoto');
                    }
                    let buff = await fs.readFile(outputPath);
                    let fileName = `taglio_${start.toFixed(2)}s-${end.toFixed(2)}s${ext}`;
                    await conn.sendFile(m.chat, buff, fileName, `✅ Media tagliato da ${start}s a ${end}s`, m);
                    await m.react('✅');
                } catch (readErr) {
                    console.log('Errore lettura output:', readErr);
                    await m.react('❌');
                    return m.reply('❌ Errore nella lettura del file processato. Controlla i tempi inseriti.');
                } finally {
                    try {
                        await fs.unlink(outputPath);
                    } catch (e) {
                        console.log('Errore rimozione file output:', e);
                    }
                }
            });

        } catch (downloadErr) {
            console.log('Errore download media:', downloadErr);
            await m.react('❌');
            return m.reply(global.errore);
        }

    } catch (e) {
        console.log('Errore in tagliamedia:', e);
        await m.react('❌');
        m.reply(`${global.errore}`);
    }
}

handler.help = ['tagliamedia inizio fine'];
handler.tags = ['strumenti'];
handler.command = /^(tagliamedia|tagliaaudio|tagliavideo)$/i;

export default handler;
