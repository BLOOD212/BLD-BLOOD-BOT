import fetch from 'node-fetch'
import { promisify } from 'util'
import { URL } from 'url'
const delay = promisify(setTimeout)

function resolveUrl(src, baseUrl) {
    try {
        return new URL(src, baseUrl).href;
    } catch {
        return src;
    }
}

async function getArticleImage(url) {
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'varebot/2.5.0'
            }
        });
        if (!res.ok) return null;
        const finalUrl = res.url;
        const html = await res.text();
        let ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
        if (!ogMatch) {
            ogMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']*)["']/i) ||
                      html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:image["']/i);
        }
        if (ogMatch) {
            let src = ogMatch[1];
            src = src.replace(/&amp;/g, '&');
            return resolveUrl(src, finalUrl);
        }
        let imgMatch = html.match(/<img[^>]*src=["']([^"']*\.(?:jpg|jpeg|png|gif|webp)(?:\?[^"']*)?)["'][^>]*>/i);
        if (!imgMatch) {
            imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
        }
        if (imgMatch) {
            let src = imgMatch[1];
            if (src.startsWith('data:') || src.includes('google') || src.length < 10) {
                return null;
            }
            src = src.replace(/&amp;/g, '&');
            return resolveUrl(src, finalUrl);
        }
        
        return null;
    } catch {
        return null;
    }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        throw `*⚠️ Manca il testo da analizzare!*\n\n` +
              `ㅤ⋆｡˚『 ╭ \`𝙁𝘼𝘾𝙏 𝘾𝙃𝙀𝘾𝙆\` ╯ 』˚｡⋆\n╭\n` +
              `│ ➤ \`Utilizzo\` : *${usedPrefix + command} <testo>*\n` +
              `│ ➤ \`Esempio\` : *${usedPrefix + command} La terra è piatta*\n` +
              `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*\n\n` +
              `*💡 Suggerimenti:*\n` +
              `┌⭓ Scrivi frasi complete e chiare\n` +
              `├⭓ Includi dettagli rilevanti\n` +
              `└⭓ Evita concetti troppo vaghi`
    }

    try {
        await conn.sendPresenceUpdate('composing', m.chat)
        await delay(800)

        const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(text)}&hl=it&gl=IT&ceid=IT:it`;
        const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

        const res = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'varebot/2.5.0'
            }
        })

        if (!res.ok) throw new Error(`${global.errore}`)

        const json = await res.json()
        const articoli = json.items || []

        if (articoli.length === 0) {
            await conn.sendMessage(m.chat, { 
                react: { text: '❌', key: m.key } 
            })
            return m.reply(
                `ㅤ⋆｡˚『 ╭ \`𝙉𝙀𝙎𝙎𝙐𝙉𝘼 𝙁𝙊𝙉𝙏𝙀\` ╯ 』˚｡⋆\n╭\n` +
                `│ ➤ \`Testo\` : *${text}*\n` +
                `│ ➤ \`Risultati\` : *0 trovati*\n` +
                `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*\n\n` +
                `*💡 Suggerimenti:*\n` +
                `┌⭓ Prova a riformulare il testo\n` +
                `├⭓ Usa parole chiave diverse\n` +
                `└⭓ Verifica su fonti affidabili:\n\n` +
                `*🌐 Fonti consigliate:*\n` +
                `  ↳ www.factcheck.org\n` +
                `  ↳ www.snopes.com\n` +
                `  ↳ www.bufale.net\n` +
                `  ↳ pagellapolitica.it`
            )
        }

        const cardsPromises = articoli.slice(0, 10).map(async (art, i) => {

            const data = new Date(art.pubDate).toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            })

            let fullDesc = art.description 
                ? art.description.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
                : 'Nessuna descrizione disponibile'
            let sourceName = 'Google News';
            const titleMatch = art.title.match(/ - (.+)$/);
            if (titleMatch) {
                sourceName = titleMatch[1];
            }

            let cleanTitle = art.title;
            if (titleMatch) {
                cleanTitle = art.title.replace(/ - .+$/, '');
            }

            if (fullDesc.startsWith(cleanTitle)) {
                fullDesc = fullDesc.substring(cleanTitle.length).trim();
            }

            if (fullDesc === sourceName || fullDesc === '' || fullDesc.length < 10) {
                fullDesc = 'Nessuna descrizione disponibile';
            }

            const descrizione = fullDesc.slice(0, 400) + (fullDesc.length > 400 ? '..' : '')

            // Prioritize article image
            let imageUrl = 'https://i.ibb.co/hJW7WwxV/varebot.jpg';
            const articleImage = await getArticleImage(art.link);
            if (articleImage && !articleImage.includes('google')) {
                imageUrl = articleImage;
            } else if (art.enclosure && art.enclosure.link && !art.enclosure.link.includes('news.google.com')) {
                imageUrl = resolveUrl(art.enclosure.link, art.link);
            } else {
                const imgMatch = art.description.match(/<img[^>]*src="([^"]*\.(?:jpg|jpeg|png|gif|webp)(?:\?[^"]*)?)"/i);
                if (imgMatch) {
                    let src = imgMatch[1];
                    if (!src.includes('google') && !src.startsWith('data:')) {
                        imageUrl = resolveUrl(src, art.link);
                    }
                }
            }

            return {
                image: { url: imageUrl },
                title: ``,
                body: `『 📰 』 \`${sourceName}\`\n『 📅 』 \`${data}\`\n\n*${cleanTitle.slice(0, 300)}*\n\n*${descrizione}*`,
                footer: `Fonte ${i + 1} di ${articoli.length}`,
                buttons: [
                    {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                            display_text: '🔗 Leggi Articolo',
                            url: art.link
                        })
                    },
                    {
                        name: 'cta_copy',
                        buttonParamsJson: JSON.stringify({
                            display_text: '📋 Copia Link',
                            copy_code: art.link
                        })
                    }
                ]
            }
        })

        const cards = await Promise.all(cardsPromises)

        await conn.sendMessage(
            m.chat,
            {
                text: `『 📝 』 \`Ricerca:\` \n➤  *\`${text}\`*`,
                footer: '𝐁𝐋𝐎𝐎𝐃-𝐁𝐎𝐓',
                cards: cards
            },
            { quoted: m }
        )

    } catch (err) {
        console.error('FactCheck error:', err)

        await conn.sendMessage(m.chat, { 
            react: { text: '❌', key: m.key } 
        })

        await m.reply(
            `ㅤㅤ⋆｡˚『 ╭ \`𝙀𝙍𝙍𝙊𝙍𝙀\` ╯ 』˚｡⋆\n╭\n` +
            `│ ➤ \`Tipo\` : *Analisi fallita*\n` +
            `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*\n\n` +
            `*⚠️ Possibili cause:*\n` +
            `┌⭓ Connessione assente\n` +
            `├⭓ Server non raggiungibile\n` +
            `└⭓ Quota API superata\n\n` +
            `*💡 Soluzioni:*\n` +
            `┌⭓ Riprova tra poco\n` +
            `├⭓ Riduci il testo o semplifica\n` +
            `└⭓ Contatta lo staff con *.staff*\n\n` +
            `> *𝐁𝐋𝐎𝐎𝐃-𝐁𝐎𝐓*`
        )
    }
}

handler.help = ['factcheck <testo>']
handler.tags = ['strumenti']
handler.command = /^(factcheck|fc|factchecker)$/i
handler.register = false

export default handler