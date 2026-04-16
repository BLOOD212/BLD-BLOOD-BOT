import axios from 'axios';

const pins = async (judul) => {
  const link = `https://id.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${encodeURIComponent(judul)}%26rs%3Dtyped&data=%7B%22options%22%3A%7B%22applied_unified_filters%22%3Anull%2C%22appliedProductFilters%22%3A%22---%22%2C%22article%22%3Anull%2C%22auto_correction_disabled%22%3Afalse%2C%22corpus%22%3Anull%2C%22customized_rerank_type%22%3Anull%2C%22domains%22%3Anull%2C%22dynamicPageSizeExpGroup%22%3A%22control%22%2C%22filters%22%3Anull%2C%22journey_depth%22%3Anull%2C%22page_size%22%3Anull%2C%22price_max%22%3Anull%2C%22price_min%22%3Anull%2C%22query_pin_sigs%22%3Anull%2C%22query%22%3A%22${encodeURIComponent(judul)}%22%2C%22redux_normalize_feed%22%3Atrue%2C%22request_params%22%3Anull%2C%22rs%22%3A%22typed%22%2C%22scope%22%3A%22pins%22%2C%22selected_one_bar_modules%22%3Anull%2C%22seoDrawerEnabled%22%3Afalse%2C%22source_id%22%3Anull%2C%22source_module_id%22%3Anull%2C%22source_url%22%3A%22%2Fsearch%2Fpins%2F%3Fq%3D${encodeURIComponent(judul)}%26rs%3Dtyped%22%2C%22top_pin_id%22%3Anull%2C%22top_pin_ids%22%3Anull%7D%2C%22context%22%3A%7B%7D%7D`;

  const headers = {
    'accept': 'application/json, text/javascript, */*; q=0.01',
    'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'priority': 'u=1, i',
    'referer': 'https://id.pinterest.com/',
    'screen-dpr': '1', //by samakavare github.com/realvare
    'sec-ch-ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
    'sec-ch-ua-full-version-list': '"Not(A:Brand";v="99.0.0.0", "Google Chrome";v="133.0.6943.142", "Chromium";v="133.0.6943.142"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-model': '""',
    'sec-ch-ua-platform': '"Windows"',
    'sec-ch-ua-platform-version': '"10.0.0"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'varebot/2.5',
    'x-app-version': 'c056fb7',
    'x-pinterest-appstate': 'active',
    'x-pinterest-pws-handler': 'www/index.js',
    'x-pinterest-source-url': '/',
    'x-requested-with': 'XMLHttpRequest'
  };

  try {
    const res = await axios.get(link, { headers });
    if (res.data && res.data.resource_response && res.data.resource_response.data && res.data.resource_response.data.results) {
      return res.data.resource_response.data.results.map(item => {
        if (item.images) {
          const author = item.pinner?.username || 
                        item.pinner?.first_name || 
                        item.creator?.username ||
                        item.creator?.first_name ||
                        item.board?.owner?.username ||
                        item.board?.owner?.first_name ||
                        'Utente sconosciuto';
          const saves = item.aggregated_pin_data?.aggregated_stats?.saves || 
                       item.stats?.saves || 
                       item.reaction_counts?.saves ||
                       item.pin_metrics?.saves ||
                       item.save_count ||
                       null;
          const domain = item.rich_summary?.site_name || 
                        item.domain || 
                        item.link?.split('//')[1]?.split('/')[0] ||
                        'Pinterest';

          return {
            image_large_url: item.images.orig?.url || null,
            image_medium_url: item.images['564x']?.url || null,
            image_small_url: item.images['236x']?.url || null,
            title: item.rich_summary?.display_name || item.grid_title || item.title || '',
            description: item.rich_summary?.description || item.description || 'Nessuna descrizione disponibile',
            url: `https://pinterest.com/pin/${item.id}/`,
            domain: domain,
            author: author,
            saves: saves,
            raw_item: process.env.NODE_ENV === 'development' ? item : undefined
          };
        }
        return null;
      }).filter(img => img !== null);
    }
    return [];
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) {
    return conn.reply(m.chat, `
ㅤㅤ⋆｡˚『 ╭ \`PINTEREST\` ╯ 』˚｡⋆\n╭\n│
│  \`inserisci il termine da cercare.\`
│
│ 『 📚 』 \`Esempio d'uso:\`
│ *${usedPrefix}${command} gatti bellissimi*
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`, m);
  }

  await m.react('🔍');

  try {
    const results = await pins(text);
    if (!results || results.length === 0) {
      return conn.reply(m.chat, `\`Non ho trovato nessuna immagine per "${text}", Prova con una ricerca diversa\``, m);
    }

    const selectedResults = results.slice(0, 15);
    
    const cards = selectedResults.map((result, index) => {
      const imageUrl = result.image_large_url || result.image_medium_url || result.image_small_url;
      const title = result.title ? result.title.replace(/#[^\s#]+/g, '').replace(/\s+/g, ' ').trim() : `${text}`;
      const author = result.author || 'Utente sconosciuto';
      const saves = result.saves !== null ? 
                   (typeof result.saves === 'number' ? result.saves.toLocaleString() : result.saves) : 
                   'Non disponibile';
      let bodyParts = [];
      bodyParts.push(`『 👤 』 *${author}*`);
      if (saves !== 'Non disponibile') {
        bodyParts.push(`『 📌 』 *${saves} salvataggi*`);
      }
      
      return {
        image: { url: imageUrl },
        title: `\`${title.substring(0, 80) + (title.length > 80 ? '...' : '')}\``,
        body: bodyParts.join('\n'),
        footer: '˗ˏˋ𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙ˎˊ˗',
        buttons: [
          {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: "📌 Apri su Pinterest",
              url: result.url
            })
          },
           {
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
              display_text: "📎 Copia Link",
              copy_code: result.url
            })
          }
        ]
      };
    });

    await conn.sendMessage(
      m.chat,
      {
        text: `『 🔍 』 \`Risultati per:\`\n- *${text}*`,
        title: '',
        footer: `𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙`,
        cards: cards
      },
      { quoted: m }
    );

  } catch (error) {
    console.error('ERRORE nella ricerca Pinterest:', error.message || error);
    await conn.reply(m.chat, `${global.errore}`, m);
  }
};

handler.help = ['pinterest <testo>'];
handler.tags = ['ricerca'];
handler.command = ['pinterest'];
handler.register = true;

export default handler;
