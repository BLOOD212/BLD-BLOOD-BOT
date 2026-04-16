//sistemate questo plugin im lazy
import Jimp from 'jimp';

let handler = async (m, { conn, usedPrefix, command, args }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || q.mediaType || '';
    if (!mime) throw `『 🖼️ 』- \`Rispondi a un'immagine con ${usedPrefix + command}\``;
    if (!/image\/(jpe?g|png|webp)/.test(mime)) {
        throw `『 ⚠️ 』- \`Formato ${mime} non supportato. Usa JPG/PNG/WEBP\``;
    }
    //smart di default
    let cropType = args[0]?.toLowerCase() || 'smart';
    let customRatio = args[1] || null;
    const cropTypes = {
        'smart': 'Ritaglio intelligente',
        'square': 'Quadrato (1:1)',
        'portrait': 'Ritratto (3:4)',
        'landscape': 'Paesaggio (4:3)',
        'wide': 'Panoramico (16:9)',
        'story': 'Storia Instagram (9:16)',
        'post': 'Post Instagram (1:1)',
        'cover': 'Copertina Facebook (820:312)',
        'custom': 'Personalizzato'
    };
    
    if (args[0] === 'help' || args[0] === 'aiuto') {
        let helpText = `『 📐 』- \`Tipi di ritaglio disponibili:\`\n\n`;
        Object.entries(cropTypes).forEach(([key, desc]) => {
            helpText += `➤ *${key}*: ${desc}\n`;
        });
        helpText += `\n*Esempi:*\n`;
        helpText += `• ${usedPrefix + command} square\n`;
        helpText += `• ${usedPrefix + command} custom 2:3\n`;
        helpText += `• ${usedPrefix + command} smart`;
        return m.reply(helpText);
    }
    
    m.react('⏳');
    
    try {
        let imgBuffer = await q.download();
        const image = await Jimp.read(imgBuffer);
        let originalWidth = image.bitmap.width;
        let originalHeight = image.bitmap.height;
        let cropParams = calculateSharpCrop(originalWidth, originalHeight, cropType, customRatio);

        if (!cropParams) {
            throw `❌ Tipo di ritaglio "${cropType}" non valido. Usa ${usedPrefix + command} help per vedere le opzioni.`;
        }
        let jimpImage = await Jimp.read(imgBuffer);

        if (cropParams.extract) {
            jimpImage.crop(cropParams.extract.left, cropParams.extract.top, cropParams.extract.width, cropParams.extract.height);
        }

        if (cropParams.resize) {
            jimpImage.resize(cropParams.resize.width, cropParams.resize.height);
        }
        let croppedBuffer = await jimpImage.getBufferAsync(Jimp.MIME_PNG);
        const finalImage = await Jimp.read(croppedBuffer);
        let finalMetadata = { width: finalImage.bitmap.width, height: finalImage.bitmap.height };
        let infoMsg = `✂️ *Immagine ritagliata!*\n\n`;
        infoMsg += `📊 *Informazioni:*\n`;
        infoMsg += `• Originale: ${originalWidth}x${originalHeight}px\n`;
        infoMsg += `• Ritagliata: ${finalMetadata.width}x${finalMetadata.height}px\n`;
        infoMsg += `• Dimensione: ${Math.round(croppedBuffer.length / 1024)}KB\n\n`;
        infoMsg += `> \`vare ✧ bot\``;
        await conn.sendFile(
            m.chat,
            croppedBuffer,
            `cropped_${cropType}.png`,
            infoMsg,
            m
        );
        
        m.react('✅');
        
    } catch (error) {
        console.error('Crop Error:', error);
        let errorMsg = typeof error === 'string' ? error : '❌ Errore durante il ritaglio. Riprova.';
        await m.reply(errorMsg);
        m.react('❌');
    }
};
function calculateSharpCrop(width, height, type, customRatio) {
    switch (type) {
        case 'smart':
            let smartSize = Math.min(width, height) * 0.9;
            return {
                extract: {
                    left: Math.round((width - smartSize) / 2),
                    top: Math.round((height - smartSize) / 2),
                    width: Math.round(smartSize),
                    height: Math.round(smartSize)
                }
            };
            
        case 'square':
        case 'post':
            return getAspectRatioCrop(width, height, 1, 1);
            
        case 'portrait':
            return getAspectRatioCrop(width, height, 3, 4);
            
        case 'landscape':
            return getAspectRatioCrop(width, height, 4, 3);
            
        case 'wide':
            return getAspectRatioCrop(width, height, 16, 9);
            
        case 'story':
            return getAspectRatioCrop(width, height, 9, 16);
            
        case 'cover':
            return getAspectRatioCrop(width, height, 820, 312);
            
        case 'custom':
            if (!customRatio || !customRatio.includes(':')) {
                return null;
            }
            let [w, h] = customRatio.split(':').map(Number);
            if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
                return null;
            }
            return getAspectRatioCrop(width, height, w, h);
            
        default:
            return null;
    }
}
function getAspectRatioCrop(width, height, targetW, targetH) {
    let targetRatio = targetW / targetH;
    let imageRatio = width / height;
    
    if (imageRatio > targetRatio) {
        let newWidth = Math.round(height * targetRatio);
        return {
            extract: {
                left: Math.round((width - newWidth) / 2),
                top: 0,
                width: newWidth,
                height: height
            }
        };
    } else {
        let newHeight = Math.round(width / targetRatio);
        return {
            extract: {
                left: 0,
                top: Math.round((height - newHeight) / 2),
                width: width,
                height: newHeight
            }
        };
    }
}

handler.help = ['crop', 'ritaglio', 'autocrop'];
handler.tags = ['strumenti'];
handler.command = ['crop', 'ritaglio', 'autocrop', 'ritagliare'];
handler.register = true;

export default handler;
