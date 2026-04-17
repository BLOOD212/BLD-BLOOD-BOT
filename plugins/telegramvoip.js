let axios, cheerio;
let ready = false;

try {
  axios = (await import('axios')).default;
  cheerio = await import('cheerio');
  ready = true;
} catch (e) {}

const headers = {
  'User-Agent': 'Mozilla/5.0'
};

const sites = [
  'https://receive-sms-online.info',
  'https://receive-smss.com',
  'https://www.receivesms.co',
  'https://freephonenum.com',
  'https://receive-sms.cc',
  'https://sms-online.co',
  'https://receiveasms.com'
];

const countries = [
  { name: 'USA 🇺🇸', prefix: '+1' },
  { name: 'UK 🇬🇧', prefix: '+44' },
  { name: 'Francia 🇫🇷', prefix: '+33' },
  { name: 'Germania 🇩🇪', prefix: '+49' },
  { name: 'Spagna 🇪🇸', prefix: '+34' },
  { name: 'Italia 🇮🇹', prefix: '+39' },
  { name: 'Svezia 🇸🇪', prefix: '+46' },
  { name: 'Canada 🇨🇦', prefix: '+1' },
  { name: 'Paesi Bassi 🇳🇱', prefix: '+31' },
  { name: 'Polonia 🇵🇱', prefix: '+48' },
  { name: 'Russia 🇷🇺', prefix: '+7' },
  { name: 'Ucraina 🇺🇦', prefix: '+380' },
  { name: 'India 🇮🇳', prefix: '+91' },
  { name: 'Indonesia 🇮🇩', prefix: '+62' },
  { name: 'Filippine 🇵🇭', prefix: '+63' }
];

async function getNumbers() {
  let results = [];

  for (let site of sites) {
    try {
      const { data } = await axios.get(site, { headers, timeout: 10000 });
      const $ = cheerio.load(data);

      $('a, td, div').each((i, el) => {
        let t = $(el).text().trim();

        let match = t.match(/\+\d{6,15}/g);
        if (match) results.push(...match);
      });

    } catch (e) {
      console.log('Errore sito:', site);
    }
  }

  results = [...new Set(results)].filter(n => n.length >= 8);

  return results;
}

async function getSMS(num) {
  let clean = num.replace('+', '');

  for (let site of sites) {
    try {
      const { data } = await axios.get(`${site}/${clean}`, { headers, timeout: 10000 });
      const $ = cheerio.load(data);

      let msgs = [];

      $('table tr, .list, .sms, div').each((i, el) => {
        let text = $(el).text().trim();

        if (text.length > 10 && text.length < 300) {
          msgs.push(text);
        }
      });

      if (msgs.length > 0) return msgs.slice(0, 10);

    } catch {}
  }

  return [];
}

let sessions = {};

let handler = async (m, { conn, args, usedPrefix }) => {
  if (!ready) return m.reply("❌ Librerie mancanti.");

  let user = m.sender;

  if (!args[0]) {
    let txt = `🌍 *SCEGLI PAESE*\n\n`;

    countries.forEach((c, i) => {
      txt += `${i + 1}. ${c.name}\n`;
    });

    txt += `\nUsa: ${usedPrefix}voip <numero>`;
    return m.reply(txt);
  }

  if (!isNaN(args[0])) {
    let country = countries[parseInt(args[0]) - 1];
    if (!country) return m.reply("❌ Paese non valido");

    m.reply("⏳ Cerco numeri...");

    let all = await getNumbers();

    let nums = all.filter(n => n.startsWith(country.prefix));

    if (nums.length === 0) return m.reply("❌ Nessun numero trovato");

    sessions[user] = {
      country,
      nums,
      current: 0
    };

    let num = nums[0];

    return conn.sendMessage(m.chat, {
      text: `📱 *NUMERO ATTIVO*\n\n🌍 ${country.name}\n📲 ${num}`,
      buttons: [
        { buttonId: `${usedPrefix}voip next`, buttonText: { displayText: '🔄 Cambia Numero' }, type: 1 },
        { buttonId: `${usedPrefix}voip sms`, buttonText: { displayText: '📩 Controlla SMS' }, type: 1 },
        { buttonId: `${usedPrefix}voip`, buttonText: { displayText: '🌍 Cambia Paese' }, type: 1 }
      ],
      headerType: 1
    });
  }

  if (args[0] === 'next') {
    let session = sessions[user];
    if (!session) return m.reply("❌ Seleziona prima un paese");

    session.current++;
    if (session.current >= session.nums.length) session.current = 0;

    let num = session.nums[session.current];

    return conn.sendMessage(m.chat, {
      text: `📱 *NUOVO NUMERO*\n\n🌍 ${session.country.name}\n📲 ${num}`,
      buttons: [
        { buttonId: `${usedPrefix}voip next`, buttonText: { displayText: '🔄 Cambia Numero' }, type: 1 },
        { buttonId: `${usedPrefix}voip sms`, buttonText: { displayText: '📩 Controlla SMS' }, type: 1 },
        { buttonId: `${usedPrefix}voip`, buttonText: { displayText: '🌍 Cambia Paese' }, type: 1 }
      ],
      headerType: 1
    });
  }

  if (args[0] === 'sms') {
    let session = sessions[user];
    if (!session) return m.reply("❌ Nessuna sessione");

    let num = session.nums[session.current];

    m.reply("⏳ Controllo SMS...");

    let msgs = await getSMS(num);

    if (msgs.length === 0) return m.reply("❌ Nessun SMS");

    let txt = `📩 *SMS ${num}*\n\n`;

    msgs.forEach(x => {
      txt += `💬 ${x}\n────────────\n`;
    });

    return m.reply(txt.trim());
  }
};

handler.help = ['voip'];
handler.tags = ['tools'];
handler.command = /^(voip)$/i;
handler.owner = true

export default handler;