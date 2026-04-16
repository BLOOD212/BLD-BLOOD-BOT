import axios from 'axios';
import * as cheerio from 'cheerio';

const appleMusic = {
  search: async (query) => {
    const url = `https://music.apple.com/us/search?term=${encodeURIComponent(query)}`;
    try {
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7'
        }
      });
      const $ = cheerio.load(data);
      const results = [];
      $('.desktop-search-page .section[data-testid="section-container"] .grid-item').each((index, element) => {
        const title = $(element).find('.top-search-lockup__primary__title').text().trim();
        const subtitle = $(element).find('.top-search-lockup__secondary').text().trim();
        const link = $(element).find('.click-action').attr('href');

        if (title && link) {
          results.push({
            title,
            subtitle,
            link: link.startsWith('http') ? link : `https://music.apple.com${link}`
          });
        }
      });
      return results;
    } catch (error) {
      console.error("❌ Errore nella ricerca:", error.response ? error.response.data : error.message);
      throw new Error('Errore nella ricerca su Apple Music');
    }
  }
}

async function handler(m, { conn, text, usedPrefix, command }) {
  if (!text) throw m.reply(`*📀 Inserisci il nome della canzone da cercare*\n> *\`Esempio:\`* ${usedPrefix + command} Melons - Stellina`);

  try {
    await m.react('🍎');
    
    const results = await appleMusic.search(text);
    if (!results || results.length === 0) {
      return m.reply('*❌ Nessun risultato trovato su Apple Music.*');
    }
    const title = results[0].title;
    const artist = results[0].subtitle.split('·')[1]?.trim() || results[0].subtitle;
    const songInfo = `\`\`\`◜AppleMusic - Info◞\`\`\`\n\n≡ *🌴 \`Titolo:\`* ${title}\n≡ *🌿 \`Artista:\`* ${artist}\n≡ *🍃 \`Url:\`* ${results[0].link}\n\n> 💡 *Per scaricare usa:*\n> \`\`\`${usedPrefix}playaudio/video ${title} - ${artist}\`\`\``;
    
    await m.reply(songInfo);
  } catch (error) {
    console.error("❌ Errore generale:", error);
    await m.react('❌');
    await m.reply('*❌ Errore durante la ricerca*\n\n> 💡 Prova:\n> • Verifica il titolo\n> • Tra qualche minuto');
  }
}

handler.help = ['applemusic'];
handler.tags = ['ricerca'];
handler.command = /^(aplay|applemusic)$/i;

export default handler;