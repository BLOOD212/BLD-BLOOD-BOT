// 🎯 PLUGIN VOIP ELITE V3.5 - PROXY BRIDGE VERSION
// Powered by Giuse & Blood

let isScraperReady = false;
let axios, cheerio;

try {
    axios = (await import('axios')).default;
    cheerio = await import('cheerio');
    isScraperReady = true;
} catch (e) {
    console.log("ERRORE VOIP: Librerie mancanti.");
}

const baseUrl = 'https://sms24.me';

// Sostituiamo la chiamata diretta con un servizio di bypass o un proxy pubblico
const bypassUrl = (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

const getHeaders = () => ({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
});

async function fetchMessaggi(numeroTelefono) {
    try {
        const target = `${baseUrl}/en/numbers/${numeroTelefono.replace('+', '')}`;
        // Usiamo AllOrigins per nascondere l'IP della VPS
        const { data } = await axios.get(bypassUrl(target), { timeout: 20000 });
        const html = JSON.parse(data.contents || data).contents || data.contents;
        const $ = cheerio.load(html);
        let messaggi = [];
        $('.shadow-sm, .list-group-item, .callout').each((i, el) => {
            let mittente = $(el).find('a').first().text().trim() || 'SCONOSCIUTO';
            let testo = $(el).text().replace(/\s+/g, ' ').replace(mittente, '').trim();
            if (testo.length > 5) messaggi.push({ mittente, testo });
        });
        return messaggi;
    } catch (e) { return null; }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!isScraperReady) return m.reply("❌ Errore librerie.");
    const cmd = command.toLowerCase();

    if (cmd === 'menuvoip') {
        return m.reply(`┏━━━ « 📱 *VOIP PROXY-MODE* » ━━━┓\n┃\n┃ 🌍 *${usedPrefix}voip*\n┃ 🔥 *${usedPrefix}lastvoips*\n┃ 📡 *${usedPrefix}regvoip <num>*\n┗━━━━━━━━━━━━━━━━━━━━━━┛`);
    }

    if (cmd === 'lastvoips' || (cmd === 'voip' && args[0])) {
        let nazione = [
            { id: '6', path: '/en/countries/it' },
            { id: '1', path: '/en/countries/us' }
            // Aggiungi le altre nazioni se necessario...
        ].find(n => n.id === args[0]);

        let targetUrl = nazione ? `${baseUrl}${nazione.path}` : `${baseUrl}/en`;
        let { key } = await conn.sendMessage(m.chat, { text: `🛡️ *BYPASSING CLOUDFLARE...*` });

        try {
            // Chiamata tramite Proxy Bridge
            const response = await axios.get(bypassUrl(targetUrl), { timeout: 25000 });
            const html = response.data.contents; 
            const $ = cheerio.load(html);
            
            let nms = [];
            $('a').each((i, el) => {
                let t = $(el).text().trim();
                if (t.includes('+')) nms.push(t.replace(/[^0-9]/g, ''));
            });

            if (nms.length === 0) throw new Error("Nessun numero trovato tramite Bridge.");

            let res = `🟢 *NUMERI (PROXY MODE)* 🟢\n\n`;
            [...new Set(nms)].slice(0, 15).forEach((n, i) => res += `*${i+1}.* \`+${n}\`\n`);
            return conn.sendMessage(m.chat, { text: res, edit: key });

        } catch (e) {
            return conn.sendMessage(m.chat, { text: `❌ *FALLIMENTO TOTALE:* Anche il proxy è stato respinto.\nIl provider SMS ha attivato una protezione "Under Attack Mode".`, edit: key });
        }
    }
};

handler.command = /^(voip|regvoip|lastvoips|menuvoip)$/i;
export default handler;
