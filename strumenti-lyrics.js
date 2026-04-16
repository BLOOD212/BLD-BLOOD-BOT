import fetch from 'node-fetch'
import * as cheerio from 'cheerio'

const fixSpacing = (text) => {
    return text
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/([.!?,:;])([A-Za-z])/g, '$1 $2')
        .replace(/([a-zA-Z])(\d)/g, '$1 $2')
        .replace(/(\d)([a-zA-Z])/g, '$1 $2')
        .replace(/\b(for|to|in|on|at|by|with|from|the|and|or|but|so|yet|nor)([A-Z][a-z])/g, '$1 $2')
        .replace(/\s+/g, ' ')
        .trim();
};

const cleanLyrics = (text) => {
    return text
        .replace(/^.*?Lyrics\s*/is, '')
        .replace(/^(?:[^\n]*\n)*?.*?\. {3}\s*Read More\s*/gim, '')
        .replace(/“[^”]+”\s+[^.]+\.{3}\s*Read More\s*/gis, '')
        .replace(/“[^”]+”\s+[^.]+\.{3}\s*Leer Más\s*/gis, '')
        .replace(/“[^”]+”\s+[^.]+\.{3}\s*Saiba Mais\s*/gis, '')
        .replace(/^[^\n]*\. {3}\s*Read More\s*/gim, '')
        .replace(/^[^\n]*\. {3}\s*Leer Más\s*/gim, '')
        .replace(/^[^\n]*\. {3}\s*Saiba Mais\s*/gim, '')
        .replace(/<img[^>]*>/gi, '')
        .replace(/Translations.*?(?=\n- |[A-Za-z])/is, '')
        .replace(/[[^\\\]]+]/gi, '\n\n- ')
        .replace(/(lyrics trovati|ricerca:|testo di|you might also like|see.*live|get tickets as low as \$\d+|embed|advertisement)/gi, '')
        .replace(/\.\.\.\s*\[Testo troppo lungo, visualizza completo su Genius\]/gi, '')
        .replace(/(\n\s*){2,}/g, '\n')
        .replace(/\s{2,}/g, ' ')
        .replace(/^\s+|\s+$/g, '')
        .replace(/\n\s*\n- /g, '\n')
        .replace(/^\s*\n/g, '\n')
        .trim();
};

function formatDateIT(dateString) {
    if (!dateString) return 'N/D';
    const mesi = [
        'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
        'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'
    ];
    const [monthEn, day, year] = dateString.replace(',', '').split(' ');
    const idx = [
        'January','February','March','April','May','June','July','August','September','October','November','December'
    ].indexOf(monthEn);
    if (idx === -1) return dateString;
    return `${day} ${mesi[idx]} ${year}`;
}

const formatMessage = (song, lyrics) => {
    const releaseDate = formatDateIT(song.release_date_for_display);
    const views = song.stats?.pageviews ? `${song.stats.pageviews.toLocaleString()}` : 'N/D';
    const album = song.album?.name || 'Singolo';
    const producer = song.producer_artists?.length > 0 ? song.producer_artists[0].name : 'N/D';

    let header = `🎶 ${song.title.toUpperCase()}\r\n👤 Artista: ${song.primary_artist.name}\r\n💿 Album: ${album}\r\n📅 Anno: ${releaseDate}\r\n🎛 Produttore: ${producer}\r\n👁 Visualizzazioni: ${views}\r\n\r\n⭑⭒━✦⁺₊✧ 𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙✧₊⁺✦━⭒⭑\r\n\r\n`;

    return header + lyrics + ``;
};

async function getImage(song) {
    if (song.song_art_image_url) return song.song_art_image_url;
    if (song.header_image_url) return song.header_image_url;
    if (song.album && song.album.cover_art_url) return song.album.cover_art_url;
    return null;
}

const checkIsOwner = (m) => {
    const owners = global.owner || [];
    const userJid = m.sender;
    return owners.some(owner => {
        if (typeof owner === 'string') {
            return owner === userJid;
        } else if (Array.isArray(owner)) {
            return owner[0] === userJid;
        }
        return false;
    });
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let handler = async (m, { text, usedPrefix, command, conn }) => {
    if (!global.APIKeys?.genius) {
        const isOwner = checkIsOwner(m);
        if (isOwner) {
            return m.reply(
                `🔑 *API KEY MANCANTE*` );
        } else {
            return m.reply(
                `❌ *SERVIZIO NON DISPONIBILE*\r\n\r\n⚠️ Il servizio lyrics è temporaneamente non disponibile.\r\n🔧 Contatta il creatore del bot.`
            );
        }
    }

    if (!text) {
        return m.reply(`
-  - *LYRICS*\r\n\r\n📝 *Come usare:*\r\n${usedPrefix + command} <titolo> [artista]\r\n\r\n💡 *Esempi:*\r\n• ${usedPrefix + command} Play for Keeps La Capone\r\n• ${usedPrefix + command} Charge Me Future\r
\r\n🎯 *Suggerimenti:*\r\n• Più dettagli = risultati migliori\r\n• Usa il nome completo dell'artista\r\n• Controlla l'ortografia`);
    }

    if (text.length < 2) {
        return m.reply(`❌ *RICERCA TROPPO BREVE*\n\n🔍 Inserisci almeno 2 caratteri per la ricerca.`);
    }

    if (text.length > 100) {
        return m.reply(`❌ *RICERCA TROPPO LUNGA*\n\n🔍 Massimo 100 caratteri per la ricerca.`);
    }

    try {
        const searchRes = await fetch(`https://api.genius.com/search?q=${encodeURIComponent(text)}&per_page=5`, {
            headers: {
                'Authorization': `Bearer ${global.APIKeys.genius}`,
                'User-Agent': 'varebot/2.5',
                'Accept': 'application/json'
            },
            timeout: 10000
        });

        if (!searchRes.ok) {
            throw new Error(`HTTP ${searchRes.status}: ${searchRes.statusText}`);
        }

        const data = await searchRes.json();

        if (!data.response?.hits?.length) {
            return conn.sendMessage(m.chat, {
                text: `🔍 Nessun lyrics trovato per: "*${text}*"\r\n\r\n💡 *Suggerimenti:*\r\n• Controlla l'ortografia\r\n• Aggiungi il nome dell'artista\r\n• Usa parole chiave diverse\r\n• Prova con il titolo originale (inglese)\r\n\r\n\n-  *Esempio:* 
	${usedPrefix + command} play for keeps la capone`,
            });
        }

        const song = data.response.hits[0].result;

        const lyricsRes = await fetch(song.url, {
            headers: {
                'User-Agent': 'VareBot/2.5',
            },
            timeout: 10000
        });

        if (!lyricsRes.ok) {
            throw new Error(`HTTP ${lyricsRes.status}: ${lyricsRes.statusText}`);
        }

        const html = await lyricsRes.text();
        const $ = cheerio.load(html);

        let lyrics = $('div[data-lyrics-container="true"]').text() ||
            $('div.lyrics').text() ||
            $('section[class^="Lyrics__Container"]').text() || '';

        lyrics = cleanLyrics(lyrics);
        lyrics = fixSpacing(lyrics);

        if (!lyrics) {
            lyrics = `⚠️ Lyrics non disponibili o protetti da copyright.`;
        }

        const finalMessage = formatMessage(song, lyrics);
        const buttons = [
            { buttonId: `.playaudio ${song.title} ${song.primary_artist.name}`, buttonText: { displayText: '▶️ Audio' }, type: 1 },
            { buttonId: `.playvideo ${song.title} ${song.primary_artist.name}`, buttonText: { displayText: '🎬 Video' }, type: 1 }
        ];

        let messageOptions = {
            text: finalMessage,
            footer: '𝓿𝓪𝓻𝓮𝓫𝓸𝓽',
            buttons: buttons,
            headerType: 1
        };

        try {
            const imageUrl = await getImage(song);
            if (imageUrl) {
                const imageResponse = await fetch(imageUrl, {
                    timeout: 10000,
                    headers: { 'User-Agent': 'VareBot/2.5' }
                });
                if (imageResponse.ok) {
                    const imageBuffer = await imageResponse.arrayBuffer();
                    messageOptions = {
                        image: imageBuffer,
                        caption: finalMessage,
                        footer: '𝓿𝓪𝓻𝓮𝓫𝓸𝓽',
                        buttons: buttons,
                        headerType: 4
                    };
                }
            }
        } catch (imageError) {
            console.error('Errore caricamento immagine:', imageError);
        }

        await conn.sendMessage(m.chat, messageOptions);

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, {
            text: `❌ Si è verificato un errore durante la ricerca:\r\n\r\n${e.message}\r\n\r\n🔧 Riprova più tardi o contatta il creatore.`,
        });
    }
};

handler.help = ['lyrics <titolo> [artista]'];
handler.tags = ['strumenti'];
handler.command = ['lyrics', 'testo', 'lyric'];
handler.register = true;

export default handler;