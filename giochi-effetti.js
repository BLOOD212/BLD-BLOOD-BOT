import fetch from 'node-fetch';
import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import { join } from 'path';

const apis = {
    sra: 'https://some-random-api.com/canvas/',
    popcat: 'https://api.popcat.xyz/',
};
const effetti = {
    triggered: { api: 'sra', path: 'overlay/triggered', isGif: true },
    jail: { api: 'sra', path: 'overlay/jail' },
    comunista: { api: 'sra', path: 'overlay/comrade' },
    passed: { api: 'sra', path: 'overlay/passed' },
    wasted: { api: 'sra', path: 'overlay/wasted' },
    gay: { api: 'sra', path: 'overlay/gay' },
    pixelate: { api: 'sra', path: 'filter/pixelate' },
    simpcard: { api: 'sra', path: 'misc/simpcard' },
    horny: { api: 'sra', path: 'misc/horny' },
    lolice: { api: 'sra', path: 'misc/lolice' },
    blur: { api: 'sra', path: 'filter/blur' },
    blurple: { api: 'sra', path: 'filter/blurple' },
    bisex: { api: 'sra', path: 'misc/bisexual' },
    heart: { api: 'sra', path: 'misc/heart' },
    love: { api: 'sra', path: 'misc/heart' },
    lesbian: { api: 'sra', path: 'misc/lesbian' },
    lgbt: { api: 'sra', path: 'misc/lgbt' },
    nonbinary: { api: 'sra', path: 'misc/nonbinary' },
    tonikawa: { api: 'sra', path: 'misc/tonikawa' },
    dog: { api: 'sra', path: 'misc/its-so-stupid', needsText: true, textHint: 'un testo qualsiasi', textParam: 'dog' },
    lied: { api: 'sra', path: 'misc/lied', textParam: 'username', useAuthorName: true },
    namecard: { api: 'sra', path: 'misc/namecard', needsText: true, textHint: 'Compleanno (es: 01/01/2000)', textParam: 'birthday', useAuthorName: true, defaultText: '01/01/2000' },
    ytc: { api: 'sra', path: 'misc/youtube-comment', needsText: true, textHint: 'un commento', textParam: 'comment', useAuthorName: true },
    petpet: { api: 'popcat', path: 'pet', isGif: true, avatarParam: 'image' },
    wanted: { api: 'popcat', path: 'wanted', avatarParam: 'image' }
};

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const effect = command.toLowerCase();
    const config = effetti[effect];

    if (!config) {
        return m.reply('🤕 Effetto non trovato o non supportato.');
    }

    let who = m.quoted ? m.quoted.sender : m.mentionedJid?.[0] ? m.mentionedJid[0] : m.sender;
    if (!who) {
        return m.reply(`⭔ \`Tagga qualcuno o rispondi a un messaggio\`\n\n*\`Esempio:\`* *${usedPrefix + command} @user*`);
    }

    if (config.needsText && !text.trim()) {
        return m.reply(`🤕 Serve ${config.textHint} per l'effetto ${effect}.\nEsempio: ${usedPrefix + command} [testo] @user`);
    }

    let tempg;
    let tempw;

    try {
        const pp = await conn.profilePictureUrl(who, 'image').catch(() => null);
        if (!pp) {
            const notification = who === m.sender ? 
                'non hai una foto profilo 🤕' : 
                `@${who.split('@')[0]} non ha una foto profilo 🤕`;
            return m.reply(notification, null, { mentions: [who] });
        }

        const name = await conn.getName(who) || 'User';
        const url = new URL(config.path, apis[config.api]);
        
        const avatarParam = config.avatarParam || 'avatar';
        url.searchParams.set(avatarParam, pp);

        if (config.textParam) {
            let textValue = '';
            if (config.useAuthorName && !config.needsText) {
                textValue = name;
            } else if (config.needsText) {
                textValue = text.replace(/@\d+/g, '').trim() || config.defaultText || '';
            }
             if (textValue) {
                url.searchParams.set(config.textParam, textValue);
            }
            if (config.useAuthorName) {
                 url.searchParams.set('username', name);
            }
        }
        
        const res = await fetch(url.toString());
        if (!res.ok) {
            const error = await res.text();
            throw `Errore API [${res.status}]: ${error}`;
        }

        const buffer = await res.arrayBuffer();
        if (!buffer || buffer.length < 100) {
            throw 'Risposta API non valida o file corrotto.';
        }
        const buf = Buffer.from(buffer);

        if (config.isGif) {
            const timestamp = Date.now();
            tempg = join('temp', `${timestamp}.gif`);
            tempw = join('temp', `${timestamp}.webp`);

            await fs.writeFile(tempg, buf);

            await new Promise((resolve, reject) => {
                ffmpeg(tempg)
                    .outputOptions([
                        '-vcodec', 'libwebp',
                        '-vf', `scale=512:512:force_original_aspect_ratio=decrease`,
                    ])
                    .toFormat('webp')
                    .save(tempw)
                    .on('end', resolve)
                    .on('error', (err) => reject(new Error(`FFmpeg error: ${err.message}`)));
            });

            const webpBuffer = await fs.readFile(tempw);
            await conn.sendMessage(m.chat, { sticker: webpBuffer }, { quoted: m });
        } else {
            await conn.sendMessage(m.chat, { image: buf, caption: '', mentions: [who] }, { quoted: m });
        }

    } catch (e) {
        console.error('Errore effettiimmagine:', e);
        m.reply(e.toString().includes('API') || e.toString().includes('FFmpeg') ? e.message : global.errore);
    } finally {
        if (tempg) {
            try { await fs.unlink(tempg); } catch (e) { console.error('Failed to delete temp GIF file:', e); }
        }
        if (tempw) {
            try { await fs.unlink(tempw); } catch (e) { console.error('Failed to delete temp WEBP file:', e); }
        }
    }
};

handler.help = ['wasted', 'wanted','triggered', 'jail', 'comunista', 'gay', 'passed', 'pixelate', 'simpcard', 'horny', 'lolice', 'blur', 'blurple', 'bisex', 'love', 'heart', 'dog', 'lesbian', 'lgbt', 'lied', 'namecard', 'nonbinary', 'tonikawa', 'ytc', 'petpet'];
handler.tags = ['giochi'];
handler.command = /^(wanted|wasted|triggered|jail|comunista|gay|passed|pixelate|simpcard|horny|lolice|blur|blurple|bisex|love|heart|dog|lesbian|lgbt|lied|namecard|nonbinary|tonikawa|ytc|petpet)$/i;

export default handler;