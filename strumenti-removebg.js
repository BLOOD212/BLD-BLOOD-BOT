import { Blob } from 'node:buffer';
import { FormData } from 'formdata-node';
import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || q.mediaType || '';
    if (!mime) throw `『 🖼️ 』- \`Rispondi a un'immagine con ${usedPrefix + command}\``;
    if (!/image\/(jpe?g|png)/.test(mime)) {
        throw `『 ⚠️ 』- \`Formato ${mime} non supportato. Usa solo JPG/PNG\``;
    }

    const API_KEY = global.APIKeys.removebg;
    if (!API_KEY) {
        throw '『 ❌ 』- \`APIKey non configurata. Contatta l\'owner del bot.\`';
    }
   
    m.react('⏳');
   
    try {
        let img = await q.download();
        if (img.length > 12 * 1024 * 1024) {
            throw '『 ❌ 』- \`Immagine troppo grande. Massimo 12MB consentiti.\`';
        }

        let form = new FormData();
        form.append('image_file', new Blob([img]), {
            filename: 'image.png',
            contentType: mime
        });

        form.append('size', 'auto');

        let res = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': API_KEY
            },
            body: form
        });
        
        if (!res.ok) {
            let errorText = await res.text();
            let errorMsg = '❌ Errore sconosciuto';
            
            switch (res.status) {
                case 400:
                    errorMsg = '❌ Immagine non valida o formato non supportato';
                    break;
                case 401:
                    errorMsg = '❌ API Key non valida';
                    break;
                case 402:
                    errorMsg = '❌ Crediti API esauriti';
                    break;
                case 403:
                    errorMsg = '❌ Accesso negato all\'API';
                    break;
                case 429:
                    errorMsg = '❌ Troppi tentativi. Riprova tra qualche minuto';
                    break;
                default:
                    errorMsg = `❌ Errore del server: ${res.status}`;
            }
            throw errorMsg;
        }
        
        let processedImg = await res.arrayBuffer();
        if (processedImg.length === 0) {
            throw `${global.errore}`;
        }

        await conn.sendFile(
            m.chat, 
            processedImg, 
            'removebg.png', 
            '『 ✨ 』- \`Sfondo rimosso con successo.\`\n\n> `vare ✧ bot`', 
            m
        );
        
        m.react('✅');
       
    } catch (error) {
        console.error('Remove.bg Error:', error);
        let errorMsg = typeof error === 'string' ? error : '❌ Errore durante la rimozione dello sfondo. Riprova.';
        await m.reply(`${global.errore}`);
        m.react('❌');
    }
};

handler.help = ['removebg', 'rimuovibg'];
handler.tags = ['strumenti'];
handler.command = ['removebg', 'rimuovibg', 'nobg', 'rmbg'];
handler.register = true;

export default handler;
