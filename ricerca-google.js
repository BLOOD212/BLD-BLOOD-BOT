import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `
ㅤㅤ⋆｡˚『 ╭ \`GOOGLE\` ╯ 』˚｡⋆\n╭\n│
│  \`inserisci il testo da cercare.\`
│
│ 『 📚 』 \`Esempio d'uso:\`
│ *${usedPrefix}${command} varebot*
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`, m);
  }

  await m.react('🔍');

  try {
    const { data } = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: global.APIKeys.google,
        cx: global.APIKeys.googleCX,
        q: text,
        num: 10,
        lr: 'lang_it',
        cr: 'countryIT'
      }
    });

    if (!data.items || data.items.length === 0) {
      return conn.reply(m.chat, `\`Non ho trovato nessun risultato per "${text}", Prova con una ricerca diversa\``, m);
    }

    const cards = data.items.map((item, index) => {
      const title = item.title ? item.title.replace(/[^\w\s]/gi, '').trim() : 'Risultato Google';
      const snippet = item.snippet || 'Nessuna descrizione disponibile';
      const domain = new URL(item.link).hostname.replace('www.', '');
      const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      
      return {
        image: { url: favicon },
        title: `\`${title.substring(0, 80) + (title.length > 80 ? '...' : '')}\``,
        body: `『 🌐 』 *${domain}*\n『 📝 』 *${snippet.substring(0, 120) + (snippet.length > 120 ? '...' : '')}*\n『 📄 』 *Risultato ${index + 1}*`,
        footer: '˗ˏˋ ☾ 𝚟𝚊𝚛𝚎𝚋𝚘𝚝 ☽ ˎˊ˗',
        buttons: [
          {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: "🔗 Apri Link",
              url: item.link
            })
          }
        ]
      };
    });

    await conn.sendMessage(
      m.chat,
      {
        text: `『 🔍 』 \`Risultati per:\` `,
        title: '',
        footer: `*${text}*`,
        cards: cards
      },
      { quoted: m }
    );

    await m.react('✅');

  } catch (error) {
    console.error('ERRORE nella ricerca Google:', error.message || error);
    if (error.response?.status === 403) {
      return conn.reply(m.chat, `\`⚠️ API Google non configurata o limite raggiunto\``, m);
    } else if (error.response?.status === 400) {
      return conn.reply(m.chat, `\`⚠️ Parametri di ricerca non validi\``, m);
    }
    
    await conn.reply(m.chat, `${global.errore}`, m);
  }
};

handler.help = ['google <testo>'];
handler.tags = ['ricerca'];
handler.command = ['google', 'gsearch'];
handler.register = true;

export default handler;