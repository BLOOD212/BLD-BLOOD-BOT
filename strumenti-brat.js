import fetch from 'node-fetch'

let handler = async (m, { conn, text, command }) => {
    let newText = text || m.quoted?.text;
    if (!newText) return m.reply('📝 *Uso:*\n- .brat <testo>\n- .bratvid <testo>\n💡 *Esempio:* .brat Hello World\n\nPuoi anche rispondere a un messaggio per usare il suo testo.');
    
    try {
        const isVideo = command.includes('vid');
        const url = isVideo
            ? `https://skyzxu-brat.hf.space/brat-animated?text=${encodeURIComponent(newText)}`
            : `https://skyzxu-brat.hf.space/brat?text=${encodeURIComponent(newText)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Errore API: ${response.status}`);
        const contentType = response.headers.get('content-type');
        const buffer = await response.arrayBuffer();
        const mediaBuffer = Buffer.from(buffer);
        if (isVideo) {
            const isVideoType = contentType?.includes('video') || contentType?.includes('mp4');
            const isGif = contentType?.includes('gif');
            if (isVideoType) {
            await conn.sendMessage(m.chat, {
                    video: mediaBuffer,
                    caption: `"${newText}"`,
                    mimetype: 'video/mp4',
                    fileName: `brat_${Date.now()}.mp4`,
                    buttons: [{
                        buttonId: '.sticker',
                        buttonText: { displayText: '🖼️ Rendi Sticker' },
                        type: 1
                    }],
                    contextInfo: global.fake?.contextInfo
                }, { quoted: m });
            } else if (isGif) {
                await conn.sendMessage(m.chat, {
                    video: mediaBuffer,
                    caption: `"${newText}"`,
                    mimetype: 'image/gif',
                    fileName: `brat_${Date.now()}.gif`,
                    gifPlayback: true,
                    buttons: [{
                        buttonId: '.sticker',
                        buttonText: { displayText: '🖼️ Rendi Sticker' },
                        type: 1
                    }],
                    contextInfo: global.fake?.contextInfo
                }, { quoted: m });
            } else {
                await conn.sendMessage(m.chat, {
                    document: mediaBuffer,
                    caption: `"${newText}"`,
                    mimetype: contentType || 'application/octet-stream',
                    fileName: `brat_${Date.now()}.${contentType?.split('/')[1] || 'bin'}`,
                    contextInfo: global.fake?.contextInfo
                }, { quoted: m });
            }
        } else {
            const isImage = contentType?.includes('image');
            if (isImage) {
                await conn.sendMessage(m.chat, {
                    image: mediaBuffer,
                    caption: `"${newText}"`,
                    buttons: [{
                        buttonId: '.sticker',
                        buttonText: { displayText: '🖼️ Rendi Sticker' },
                        type: 1
                    }],
                    contextInfo: global.fake?.contextInfo
                }, { quoted: m });
            } else {
                await conn.sendMessage(m.chat, {
                    document: mediaBuffer,
                    caption: `"${newText}"`,
                    mimetype: contentType || 'application/octet-stream',
                    fileName: `brat_${Date.now()}.${contentType?.split('/')[1] || 'bin'}`,
                    contextInfo: global.fake?.contextInfo
                }, { quoted: m });
            }
        }
    } catch (error) {
        await m.react('❌');
        m.reply(`${global.errore}\n\n${error.message}`);
    }
}

handler.help = ['brat <testo>', 'bratvid <testo>']
handler.tags = ['strumenti']
handler.command = /^brat(vid(eo)?)?$/i
handler.register = true

export default handler
