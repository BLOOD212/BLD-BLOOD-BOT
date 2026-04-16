import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

let handler = async (m, { conn, usedPrefix, command, args, text }) => {
  const userName = m.sender || 'Utente';
  const fullText = text.trim().toLowerCase();

  if (command === 'html' || fullText.startsWith(`${usedPrefix}html `)) {
    const url = args[0] || fullText.slice(usedPrefix.length + 5).trim();
    if (!url) {
      return m.reply(`ㅤ⋆｡˚『 ╭ \`ERRORE\` ╯ 』˚｡⋆\n╭\n│ 『 ❌ 』 \`Errore:\` *URL non fornito*\n Usa: ${usedPrefix}html https://google.com\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`);
    }

    const loadingMsg = await conn.sendMessage(m.chat, {
      text: `ㅤ⋆｡˚『 ╭ \`CARICAMENTO HTML\` ╯ 』˚｡⋆\n╭\n│ 『 🔄 』 \`Caricamento:\` *${url}*\n Attendere...\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`
    }, { quoted: m });

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'varebot/2.5'
        },
        timeout: 20000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      let htmlContent = await response.text();
      const maxLength = 4000;
      let truncated = false;

      if (htmlContent.length > maxLength) {
        htmlContent = htmlContent.substring(0, maxLength) + '...';
        truncated = true;
      }

      const domain = new URL(url).hostname;
      const contentType = response.headers.get('content-type') || 'text/html';
      const contentLength = response.headers.get('content-length');
      let infoText = `ㅤ⋆｡˚『 ╭ \`CODICE HTML\` ╯ 』˚｡⋆\n╭\n`;
      infoText += `│ 『 🌐 』 \`Dominio:\` *${domain}*\n`;
      infoText += `│ 『 📊 』 \`Content-Type:\` *${contentType}*\n`;
      if (contentLength) infoText += `│ 『 📏 』 \`Dimensioni:\` *${Math.round(contentLength / 1024)}KB*\n`;
      if (truncated) infoText += `│ 『 ⚠️ 』 \`Nota:\` *Contenuto troncato (primi ${maxLength} caratteri)*\n`;
      infoText += `│ 『 🔗 』 \`URL:\` *${url}*\n`;
      infoText += ` \`\`\`html\n${htmlContent}\n\`\`\`\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;

      await conn.sendMessage(m.chat, { text: infoText }, { quoted: loadingMsg });

    } catch (error) {
      await conn.sendMessage(m.chat, {
        text: `ㅤ⋆｡˚『 ╭ \`ERRORE\` ╯ 』˚｡⋆\n╭\n│ 『 ${global.errore} 』 *${error.message}*\n Possibili cause: sito bloccato, contenuto protetto, timeout o URL non valido\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`
      }, { quoted: loadingMsg });
    }
    return;
  }

  if (command === 'refresh' || fullText.startsWith(`${usedPrefix}refresh `)) {
    const url = args[0] || fullText.slice(usedPrefix.length + 8).trim();
    if (!url) {
      return m.reply(`ㅤ⋆｡˚『 ╭ \`ERRORE\` ╯ 』˚｡⋆\n╭\n│ 『 ❌ 』 \`Errore:\` *URL non fornito*\n Usa: ${usedPrefix}refresh https://google.com\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`);
    }

    const loadingMsg = await conn.sendMessage(m.chat, {
      text: `ㅤ⋆｡˚『 ╭ \`AGGIORNAMENTO SS\` ╯ 』˚｡⋆\n╭\n│ 『 🔄 』 \`Caricamento:\` *${url}*\n Attendere...\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`
    }, { quoted: m });

    try {
      let screenshotBuffer;
      let apiUsed = '';
      let success = false;

      try {
        apiUsed = 'S-Shot';
        const sshotAPI = `https://mini.s-shot.ru/1024x768/JPEG/1024/Z100/?${encodeURIComponent(url)}`;
        const response = await fetch(sshotAPI, {
          headers: {
            'User-Agent': 'varebot/2.5'
          },
          timeout: 20000
        });
        if (response.ok && response.headers.get('content-type')?.includes('image')) {
          screenshotBuffer = await response.arrayBuffer();
          if (screenshotBuffer.length > 1000) {
            success = true;
            cache.set(url, { buffer: screenshotBuffer, api: apiUsed, timestamp: Date.now() });
          }
        }
      } catch (error) {}

      if (!success) {
        await conn.sendMessage(m.chat, {
          text: `ㅤ⋆｡˚『 ╭ \`ERRORE\` ╯ 』˚｡⋆\n╭\n│ 『 ${global.errore} 』 *Impossibile aggiornare screenshot*\n Riprova tra qualche minuto\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`
        }, { quoted: loadingMsg });
        return;
      }

      const domain = new URL(url).hostname;
      const siteInfo = `│ 『 🌐 』 \`Dominio:\` *${domain}*\n│ 『 📏 』 \`Dimensioni:\` *${Math.round(screenshotBuffer.length / 1024)}KB*`;
      const buttons = [
        {
          name: 'quick_reply',
          buttonParamsJson: JSON.stringify({
            display_text: '🔄 Aggiorna',
            id: `${usedPrefix}refresh ${url}`
          })
        },
        {
          name: 'quick_reply',
          buttonParamsJson: JSON.stringify({
            display_text: '📄 HTML',
            id: `${usedPrefix}html ${url}`
          })
        },
        {
          name: 'quick_reply',
          buttonParamsJson: JSON.stringify({
            display_text: '📊 SEO',
            id: `${usedPrefix}seo ${url}`
          })
        },
        {
          name: 'quick_reply',
          buttonParamsJson: JSON.stringify({
            display_text: '📥 PDF',
            id: `${usedPrefix}pdf ${url}`
          })
        }
      ];

      await conn.sendMessage(m.chat, {
        image: screenshotBuffer,
        caption: `ㅤ⋆｡˚『 ╭ \`SS AGGIORNATO\` ╯ 』˚｡⋆\n╭\n${siteInfo}\n│ 『 🔗 』 \`URL:\` *${url}*\n\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`,
        footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙',
        interactiveButtons: buttons
      }, { quoted: loadingMsg });

    } catch (error) {
      await conn.sendMessage(m.chat, {
        text: `ㅤ⋆｡˚『 ╭ \`ERRORE\` ╯ 』˚｡⋆\n╭\n│ 『 ${global.errore} 』 *${error.message}*\n Riprova tra qualche minuto\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`
      }, { quoted: loadingMsg });
    }
    return;
  }

  if (command === 'seo' || fullText.startsWith(`${usedPrefix}seo `)) {
    const url = args[0] || fullText.slice(usedPrefix.length + 4).trim();
    if (!url) {
      return m.reply(`ㅤ⋆｡˚『 ╭ \`ERRORE\` ╯ 』˚｡⋆\n╭\n│ 『 ❌ 』 \`Errore:\` *URL non fornito*\n Usa: ${usedPrefix}seo https://google.com\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`);
    }

    const loadingMsg = await conn.sendMessage(m.chat, {
      text: `ㅤ⋆｡˚『 ╭ \`ANALISI SEO\` ╯ 』˚｡⋆\n╭\n│ 『 🔍 』 \`Analisi:\` *${url}*\n Attendere...\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`
    }, { quoted: m });

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'varebot/2.5'
        },
        timeout: 20000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const dom = new JSDOM(html);
      const document = dom.window.document;

      const title = document.querySelector('title')?.textContent || 'Non trovato';
      const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || 'Non trovata';
      const keywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content') || 'Non trovati';

      const domain = new URL(url).hostname;
      let seoText = `ㅤ⋆｡˚『 ╭ \`ANALISI SEO\` ╯ 』˚｡⋆\n╭\n`;
      seoText += `│ 『 🌐 』 \`Dominio:\` *${domain}*\n`;
      seoText += `│ 『 📝 』 \`Titolo:\` *${title}*\n`;
      seoText += `│ 『 📜 』 \`Descrizione:\` *${description}*\n`;
      seoText += `│ 『 🔑 』 \`Keywords:\` *${keywords}*\n`;
      seoText += `│ 『 🔗 』 \`URL:\` *${url}*\n\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;

      await conn.sendMessage(m.chat, { text: seoText }, { quoted: loadingMsg });

    } catch (error) {
      await conn.sendMessage(m.chat, {
        text: `ㅤ⋆｡˚『 ╭ \`ERRORE\` ╯ 』˚｡⋆\n╭\n│ 『 ${global.errore} 』 *${error.message}*\n Possibili cause: sito bloccato, contenuto protetto o URL non valido\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`
      }, { quoted: loadingMsg });
    }
    return;
  }

  if (command === 'pdf' || fullText.startsWith(`${usedPrefix}pdf `)) {
    const url = args[0] || fullText.slice(usedPrefix.length + 4).trim();
    if (!url) {
      return m.reply(`ㅤ⋆｡˚『 ╭ \`ERRORE\` ╯ 』˚｡⋆\n╭\n│ 『 ❌ 』 \`Errore:\` *URL non fornito*\n Usa: ${usedPrefix}pdf https://google.com\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`);
    }

    const loadingMsg = await conn.sendMessage(m.chat, {
      text: `ㅤ⋆｡˚『 ╭ \`GENERAZIONE PDF\` ╯ 』˚｡⋆\n╭\n│ 『 📥 』 \`Generazione:\` *${url}*\n Attendere...\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`
    }, { quoted: m });

    try {
      const pdfApi = `https://api.pdfshift.io/v3/convert/pdf`;
      const response = await fetch(pdfApi, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source: url,
          sandbox: true
        }),
        timeout: 20000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const pdfBuffer = await response.arrayBuffer();
      if (pdfBuffer.length < 1000) {
        throw new Error('PDF generato non valido');
      }

      const domain = new URL(url).hostname;
      const fileInfo = `│ 『 🌐 』 \`Dominio:\` *${domain}*\n│ 『 📏 』 \`Dimensioni:\` *${Math.round(pdfBuffer.length / 1024)}KB*`;

      await conn.sendMessage(m.chat, {
        document: pdfBuffer,
        fileName: `${domain}.pdf`,
        mimetype: 'application/pdf',
        caption: `ㅤ⋆｡˚『 ╭ \`PDF GENERATO\` ╯ 』˚｡⋆\n╭\n${fileInfo}\n│ 『 🔗 』 \`URL:\` *${url}*\n\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`
      }, { quoted: loadingMsg });

    } catch (error) {
      await conn.sendMessage(m.chat, {
        text: `ㅤ⋆｡˚『 ╭ \`ERRORE\` ╯ 』˚｡⋆\n╭\n│ 『 ${global.errore} 』 *${error.message}*\n Possibili cause: sito non supporta PDF, timeout o URL non valido\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`
      }, { quoted: loadingMsg });
    }
    return;
  }

  if (!args[0]) {
    return m.reply(`ㅤ⋆｡˚『 ╭ \`ERRORE\` ╯ 』˚｡⋆\n╭\n│ 『 ❌ 』 \`Errore:\` *URL non fornito*\n Usa: ${usedPrefix}${command} https://google.com\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`);
  }

  let url = args[0];
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  try {
    new URL(url);
  } catch (error) {
    return m.reply(`ㅤ⋆｡˚『 ╭ \`ERRORE\` ╯ 』˚｡⋆\n╭\n│ 『 ${global.errore} 』 *URL non valido*\n Assicurati di inserire un indirizzo web corretto\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`);
  }

  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    const domain = new URL(url).hostname;
    const siteInfo = `│ 『 🌐 』 \`Dominio:\` *${domain}*\n│ 『 🔧 』 \`Servizio:\` *${cached.api}*\n│ 『 📏 』 \`Dimensioni:\` *${Math.round(cached.buffer.length / 1024)}KB*\n│ 『 🕒 』 \`Nota:\` *Da cache*`;
    const buttons = [
      {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: '🔄 Aggiorna',
          id: `${usedPrefix}refresh ${url}`
        })
      },
      {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: '📄 HTML',
          id: `${usedPrefix}html ${url}`
        })
      },
      {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: '📊 SEO',
          id: `${usedPrefix}seo ${url}`
        })
      },
      {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: '📥 PDF',
          id: `${usedPrefix}pdf ${url}`
        })
      }
    ];

    await conn.sendMessage(m.chat, {
      image: cached.buffer,
      caption: `ㅤ⋆｡˚『 ╭ \`SS DA CACHE\` ╯ 』˚｡⋆\n╭\n${siteInfo}\n│ 『 🔗 』 \`URL:\` *${url}*\n\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`,
      footer: 'vare ✧ bot',
      interactiveButtons: buttons
    }, { quoted: m });
    return;
  }

  const loadingMsg = await conn.sendMessage(m.chat, {
    text: `ㅤ⋆｡˚『 ╭ \`CARICAMENTO SS\` ╯ 』˚｡⋆\n╭\n│ 『 🔄 』 \`Caricamento:\` *${url}*\n Attendere...\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`
  }, { quoted: m });

  try {
    let screenshotBuffer;
    let apiUsed = '';
    let success = false;

    if (!success) {
      try {
        apiUsed = 'Thum.io';
        const thumAPI = `https://image.thum.io/get/width/1200/crop/768/${encodeURIComponent(url)}`;
        const response = await fetch(thumAPI, {
          headers: {
            'User-Agent': 'varebot/2.5'
          },
          timeout: 20000
        });
        if (response.ok && response.headers.get('content-type')?.includes('image')) {
          screenshotBuffer = await response.arrayBuffer();
          if (screenshotBuffer.length > 1000) {
            success = true;
          }
        }
      } catch (error) {}
    }

    if (!success) {
      try {
        apiUsed = 'S-Shot';
        const sshotAPI = `https://mini.s-shot.ru/1024x768/JPEG/1024/Z100/?${encodeURIComponent(url)}`;
        const response = await fetch(sshotAPI, {
          headers: {
            'User-Agent': 'varebot/2.5'
          },
          timeout: 20000
        });
        if (response.ok && response.headers.get('content-type')?.includes('image')) {
          screenshotBuffer = await response.arrayBuffer();
          if (screenshotBuffer.length > 1000) {
            success = true;
          }
        }
      } catch (error) {}
    }

    if (!success) {
      try {
        apiUsed = 'Webshot';
        const webshotAPI = `https://webshot.deam.io/${encodeURIComponent(url)}/?width=1200&height=800`;
        const response = await fetch(webshotAPI, {
          headers: {
            'User-Agent': 'varebot/2.5'
          },
          timeout: 20000
        });
        if (response.ok && response.headers.get('content-type')?.includes('image')) {
          screenshotBuffer = await response.arrayBuffer();
          if (screenshotBuffer.length > 1000) {
            success = true;
          }
        }
      } catch (error) {}
    }

    if (!success) {
      try {
        apiUsed = 'AbstractAPI';
        const abstractAPI = `https://screenshot.abstractapi.com/v1/?url=${encodeURIComponent(url)}&width=1200&delay=1`;
        const response = await fetch(abstractAPI, {
          headers: {
            'User-Agent': 'varebot/2.5'
          },
          timeout: 20000
        });
        if (response.ok && response.headers.get('content-type')?.includes('image')) {
          screenshotBuffer = await response.arrayBuffer();
          if (screenshotBuffer.length > 1000) {
            success = true;
          }
        }
      } catch (error) {}
    }

    if (!success) {
      try {
        apiUsed = 'HeartRails';
        const heartrailsAPI = `https://capture.heartrails.com/1200x800?${encodeURIComponent(url)}`;
        const response = await fetch(heartrailsAPI, {
          headers: {
            'User-Agent': 'varebot/2.5'
          },
          timeout: 20000
        });
        if (response.ok && response.headers.get('content-type')?.includes('image')) {
          screenshotBuffer = await response.arrayBuffer();
          if (screenshotBuffer.length > 1000) {
            success = true;
          }
        }
      } catch (error) {}
    }

    if (!success) {
      try {
        apiUsed = 'Vercel Puppeteer';
        const vercelAPI = `https://htmlcsstoimage.com/demo_run?url=${encodeURIComponent(url)}&selector=body&ms_delay=0&width=1200&height=800`;
        const response = await fetch(vercelAPI, {
          headers: {
            'User-Agent': 'varebot/2.5'
          },
          timeout: 20000
        });
        if (response.ok) {
          const data = await response.json();
          if (data.url) {
            const imageResponse = await fetch(data.url);
            screenshotBuffer = await imageResponse.arrayBuffer();
            if (screenshotBuffer.length > 1000) {
              success = true;
            }
          }
        }
      } catch (error) {}
    }

    if (!success || !screenshotBuffer || screenshotBuffer.length === 0) {
      await conn.sendMessage(m.chat, {
        text: `ㅤ⋆｡˚『 ╭ \`ERRORE\` ╯ 』˚｡⋆\n╭\n│ 『 ${global.errore} 』 *Impossibile ottenere screenshot*\n Possibili cause: sito bloccato, non raggiungibile, servizi non disponibili o URL non valido\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`
      }, { quoted: loadingMsg });
      return;
    }

    cache.set(url, { buffer: screenshotBuffer, api: apiUsed, timestamp: Date.now() });

    const domain = new URL(url).hostname;
    let siteInfo = `│ 『 🌐 』 \`Dominio:\` *${domain}*\n│ 『 📏 』 \`Dimensioni:\` *${Math.round(screenshotBuffer.length / 1024)}KB*`;
    const buttons = [
      {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: '🔄 Aggiorna',
          id: `${usedPrefix}refresh ${url}`
        })
      },
      {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: '📄 HTML',
          id: `${usedPrefix}html ${url}`
        })
      },
      {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: '📊 SEO',
          id: `${usedPrefix}seo ${url}`
        })
      },
      {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
        display_text: '📥 PDF',
        id: `${usedPrefix}pdf ${url}`
        })
      }
    ];

    await conn.sendMessage(m.chat, {
      image: screenshotBuffer,
      caption: `ㅤ⋆｡˚『 ╭ \`SS COMPLETATO\` ╯ 』˚｡⋆\n╭\n${siteInfo}\n│ 『 🔗 』 \`URL:\` *${url}*\n\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`,
      footer: 'vare ✧ bot',
      interactiveButtons: buttons
    }, { quoted: loadingMsg });

  } catch (error) {
    await conn.sendMessage(m.chat, {
      text: `ㅤ⋆｡˚『 ╭ \`ERRORE\` ╯ 』˚｡⋆\n╭\n│ 『 ${global.errore} 』 *${error.message}*\n Possibili cause: sito bloccato, non raggiungibile, servizi non disponibili o URL non valido\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`
    }, { quoted: loadingMsg });
  }
};

handler.help = ['fetch <url>', 'html <url>', 'seo <url>', 'pdf <url>'];
handler.tags = ['tools'];
handler.command = /^(fetch|screenshot|ss|web|html|refresh|seo|pdf)$/i;
handler.register = true;
export default handler;