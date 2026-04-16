const minRubate = 15;
const maxRubate = 150;
const cooldown = 2 * 60 * 60 * 1000; // 2 ore
const successoProb = 0.65;

const frasiSuccesso = [
  "Come un napoletano in centro: preciso, rapido, invisibile.",
  "Schietto come un napoletano col motorino.",
  "È più veloce un rumeno, un marocchino o un napoletano? La risposta sei tu.",
  "Freddo come un milanese col Rolex: hai preso gli euro senza farti scoprire.",
  "È piovuto in città, ma non acqua, sono euro, e tutti per te.",
  "Con la calma di chi sa cosa fa: rubata da degno marocchino.",
  "I soldi non fanno la felicità, ma questi rubati sì."
];

const frasiFallimento = [
  "Occhi sospetti ti hanno sgamato.",
  "Ti sei distratto guardando tiktok.",
  "Troppa ansia da prestazione: ti sei tirato indietro.",
  "Sei stato colto dal panico e hai mollato tutto.",
  "La tua faccia da cazzo è stata black listata.",
  "Hai beccato la trappola per topi. Addio euro (e dignità).",
  "Eri troppo confident, i soldi stessi ti hanno derubato (?)"
];

const handler = async (m, { conn, usedPrefix, command }) => {
  const user = global.db.data.users[m.sender];
  const now = Date.now();
  const time = (user.lastrob2 || 0) + cooldown;

  if (now < time) {
    const remaining = msToTime(time - now);
    return conn.reply(m.chat, `『 🚓 』- *La polizia ti sta ancora cercando, ritenta il colpo tra ${remaining}.*`, m);
  }

  let who;
  if (m.isGroup) {
    who = m.mentionedJid?.[0] || m.quoted?.sender;
  } else {
    who = m.chat;
  }

  if (!who || !(who in global.db.data.users)) {
    return conn.reply(m.chat, `『 🫷 』 - \`Devi menzionare o rispondere al messaggio della vittima con il comando\``, m);
  }

  if (who === m.sender) {
    return conn.reply(m.chat, `🙃 *Non puoi rubare a te stesso... down.*`, m);
  }

  const vittima = global.db.data.users[who];
  const rubate = Math.floor(Math.random() * (maxRubate - minRubate + 1)) + minRubate;

  if (vittima.euro < rubate) {
    return conn.reply(m.chat, `『 📉 』- @${who.split('@')[0]} *è gia un poraccio di suo, lascialo stare nella sua miseria*`, m, { mentions: [who] });
  }

  const isSuccess = Math.random() < successoProb;
  user.lastrob2 = now;

  if (!isSuccess) {
    const failMsg = pickRandom(frasiFallimento);
    return await conn.sendMessage(m.chat, {
      text: `\`${failMsg}\`\n\n『 👮‍♂️ 』- \`Hai tentato di derubare\` *@${who.split('@')[0]}*, e sei *stato sgamato!*\n『 ⏳ 』- \`puoi ritentare tra:\` *${msToTime(cooldown)}*`,
      mentions: [who, m.sender]
    }, {
      quoted: m,
      ephemeralExpiration: 60,
      contextInfo: { mentionedJid: [who, m.sender] }
    });
  }
  user.euro = (user.euro || 0) + rubate;
  vittima.euro = (vittima.euro || 0) - rubate;

  const successoMsg = pickRandom(frasiSuccesso).replace(/@utente/g, `@${m.sender.split('@')[0]}`);

  await conn.sendMessage(m.chat, {
    text: `\`${successoMsg}\`\n\n💫 _@${m.sender.split('@')[0]}_ *ha sgraffiniato ${rubate} euro* a _@${who.split('@')[0]}!_`,
    mentions: [who, m.sender],
    buttons: [
      {
        buttonId: `${usedPrefix}vendicati ${m.sender}`,
        buttonText: { displayText: '😤 Vendicati!' },
        type: 1
      }
    ]
  }, {
    quoted: m,
    ephemeralExpiration: 60,
    contextInfo: {
      mentionedJid: [who, m.sender],
      forwardingScore: 999,
      isForwarded: false
    }
  });
};

handler.help = ['rubare @utente'];
handler.tags = ['euro'];
handler.command = ['rubare', 'ruba'];
handler.register = true
handler.group = true
export default handler;

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  let parts = [];
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (seconds) parts.push(`${seconds}s`);
  return parts.join(' ') || '0s';
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}