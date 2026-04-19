import axios from 'axios';

const pins = async (judul) => {
  const link = `https://id.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${encodeURIComponent(judul)}%26rs%3Dtyped&data=%7B%22options%22%3A%7B%22applied_unified_filters%22%3Anull%2C%22appliedProductFilters%22%3A%22---%22%2C%22article%22%3Anull%2C%22auto_correction_disabled%22%3Afalse%2C%22corpus%22%3Anull%2C%22customized_rerank_type%22%3Anull%2C%22domains%22%3Anull%2C%22dynamicPageSizeExpGroup%22%3A%22control%22%2C%22filters%22%3Anull%2C%22journey_depth%22%3Anull%2C%22page_size%22%3Anull%2C%22price_max%22%3Anull%2C%22price_min%22%3Anull%2C%22query_pin_sigs%22%3Anull%2C%22query%22%3A%22${encodeURIComponent(judul)}%22%2C%22redux_normalize_feed%22%3Atrue%2C%22request_params%22%3Anull%2C%22rs%22%3A%22typed%22%2C%22scope%22%3A%22pins%22%2C%22selected_one_bar_modules%22%3Anull%2C%22seoDrawerEnabled%22%3Afalse%2C%22source_id%22%3Anull%2C%22source_module_id%22%3Anull%2C%22source_url%22%3A%22%2Fsearch%2Fpins%2F%3Fq%3D${encodeURIComponent(judul)}%26rs%3Dtyped%22%2C%22top_pin_id%22%3Anull%2C%22top_pin_ids%22%3Anull%7D%2C%22context%22%3A%7B%7D%7D`;

  const headers = {
    'accept': 'application/json, text/javascript, */*; q=0.01',
    'referer': 'https://id.pinterest.com/',
    'user-agent': 'varebot/2.5'
  };

  try {
    const res = await axios.get(link, { headers });
    if (res.data?.resource_response?.data?.results) {
      return res.data.resource_response.data.results.map(item => {
        if (!item.images) return null;
        return {
          image: item.images.orig?.url || item.images['564x']?.url,
          title: item.grid_title || item.title || judul,
          author: item.pinner?.username || item.creator?.username || 'Utente',
          url: `https://pinterest.com/pin/${item.id}/`
        };
      }).filter(img => img !== null);
    }
    return [];
  } catch (error) {
    return [];
  }
};

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) {
    return conn.reply(m.chat, `
ㅤㅤ⋆｡˚『 ╭ \`PINTEREST\` ╯ 』˚｡⋆
╭
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
      return conn.reply(m.chat, `\`Non ho trovato nulla per "${text}"\``, m);
    }

    // Seleziona un risultato casuale tra i primi 20 per variare la scelta al click del bottone
    const res = results[Math.floor(Math.random() * Math.min(results.length, 20))];
    
    const caption = `
『 🔍 』 *Risultato per:* ${text}

━━━━━━━━━━━━━━━━━━━━
『 📖 』 *Titolo:* \`${res.title}\`
『 👤 』 *Autore:* ${res.author}
━━━━━━━━━━━━━━━━━━━━

˗ˏˋ𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙ˎˊ˗`.trim();

    // Invio con bottone "Altra Foto"
    await conn.sendMessage(m.chat, {
      image: { url: res.image },
      caption: caption,
      footer: 'Clicca sotto per un\'altra immagine',
      buttons: [
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: "🔄 Altra Foto",
            id: `${usedPrefix}${command} ${text}`
          })
        },
        {
          name: "cta_url",
          buttonParamsJson: JSON.stringify({
            display_text: "📌 Apri Originale",
            url: res.url
          })
        }
      ]
    }, { quoted: m });

    await m.react('✅');

  } catch (error) {
    console.error(error);
    await conn.reply(m.chat, `⚠️ Errore durante la ricerca.`, m);
  }
};

handler.help = ['pinterest <testo>'];
handler.tags = ['ricerca'];
handler.command = ['pinterest'];

export default handler;
