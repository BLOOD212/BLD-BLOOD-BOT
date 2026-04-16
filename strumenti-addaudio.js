import { join } from 'path';
import { exec } from 'child_process';
import fs from 'fs/promises';

const tmpDir = join(process.cwd(), 'temp');
const mediaCache = new Map();

async function execPromise(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) return reject(stderr || err);
            resolve(stdout);
        });
    });
}

async function downloadYTAudio(url, dest) {
    const cmd = `yt-dlp -f bestaudio[ext=m4a]/bestaudio -o "${dest}" "${url}" --quiet --no-warnings`;
    await execPromise(cmd);
}

export async function handler(m, { conn, args, usedPrefix, command }) {
    if (!m.quoted) return m.reply(`『 ❗️ 』- \`Rispondi a un audio o un video.\``);

    let q = m.quoted;
    let mime = (q.msg || q).mimetype || '';

    await m.react('⏳');

    try {
        let cached = mediaCache.get(m.chat) || { audio: null, video: null };

        if (mime.includes('audio')) {
            let mediaAudio = await q.download();
            cached.audio = mediaAudio;
            mediaCache.set(m.chat, cached);

            if (cached.video) {
                await mergeAndSend(m, conn, cached.video, cached.audio);
                mediaCache.delete(m.chat);
                await m.react('✅');
                return;
            }

            await m.react('✅');
            return m.reply('『 ✅ 』- \`Audio salvato! Ora rispondi ad un video con .addaudio per unire.\`');
        }

        if (mime.includes('video')) {
            let mediaVideo = await q.download();
            cached.video = mediaVideo;

            if (args.length && args[0].match(/https?:\/\/(www\.)?(youtube\.com|youtu\.be)/i)) {
                const audioPath = join(tmpDir, `audio_${Date.now()}.m4a`);
                const videoPath = join(tmpDir, `video_${Date.now()}.mp4`);
                const outputPath = join(tmpDir, `output_${Date.now()}.mp4`);

                await fs.writeFile(videoPath, mediaVideo);
                await downloadYTAudio(args[0], audioPath);

                const ffmpegCmd = `ffmpeg -i "${videoPath}" -i "${audioPath}" -c:v copy -map 0:v:0 -map 1:a:0 -shortest "${outputPath}" -y`;
                await execPromise(ffmpegCmd);

                let buff = await fs.readFile(outputPath);
                await conn.sendFile(m.chat, buff, 'video-con-audio.mp4', null, m);

                await fs.unlink(videoPath).catch(() => {});
                await fs.unlink(audioPath).catch(() => {});
                await fs.unlink(outputPath).catch(() => {});
                await m.react('✅');
                return;
            }

            mediaCache.set(m.chat, cached);

            if (cached.audio) {
                await mergeAndSend(m, conn, cached.video, cached.audio);
                mediaCache.delete(m.chat);
                await m.react('✅');
                return;
            }

            await m.react('✅');
            return m.reply('『 ✅ 』- \`Video salvato! Ora rispondi a un audio con .addaudio per unire.\`');

        }

        await m.react('❌');
        return m.reply('『 ❌ 』 \`Devi rispondere a un audio o un video.\`');

    } catch (e) {
        console.error('[ERRORE addaudio]', e);
        await m.react('❌');
        await m.reply(`${global.errore}`);
    }
}

async function mergeAndSend(m, conn, videoBuffer, audioBuffer) {
    const videoPath = join(tmpDir, `video_${Date.now()}.mp4`);
    const audioPath = join(tmpDir, `audio_${Date.now()}.m4a`);
    const outputPath = join(tmpDir, `output_${Date.now()}.mp4`);

    await fs.writeFile(videoPath, videoBuffer);
    await fs.writeFile(audioPath, audioBuffer);

    const ffmpegCmd = `ffmpeg -i "${videoPath}" -i "${audioPath}" -c:v copy -map 0:v:0 -map 1:a:0 -shortest "${outputPath}" -y`;
    await execPromise(ffmpegCmd);

    let buff = await fs.readFile(outputPath);
    await conn.sendFile(m.chat, buff, 'video-con-audio.mp4', null, m);

    await fs.unlink(videoPath).catch(() => {});
    await fs.unlink(audioPath).catch(() => {});
    await fs.unlink(outputPath).catch(() => {});
}

handler.help = ['addaudio'];
handler.tags = ['strumenti'];
handler.command = ['addaudio', 'aggiungiaudio'];

export default handler;