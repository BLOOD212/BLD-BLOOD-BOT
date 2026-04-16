import fs from 'fs';
const timeout = 30000;
const premio = 10;

const handler = async (m, {conn, usedPrefix}) => {
  conn.indovinelli = conn.indovinelli ? conn.indovinelli : {};
  const id = m.chat;
  if (id in conn.indovinelli) {
    conn.reply(m.chat, '⚠️ C\'è già un indovinello attivo in questa chat!', conn.indovinelli[id][0]);
    throw false;
  }
  const indovinelli = JSON.parse(fs.readFileSync(`./media/database/indovinelli.json`));
  const json = indovinelli[Math.floor(Math.random() * indovinelli.length)];
  const risposta = json.response;
  const clue = risposta.replace(/[b-df-hj-np-tv-z]/gi, '?');
  const emoji = ['🧠', '🤔', '🕵️‍♂️', '🦉', '🦊', '🦄', '🐙', '🐸', '🐧', '🐢'];
  const randomEmoji = emoji[Math.floor(Math.random() * emoji.length)];
  const caption = `
${randomEmoji} *INDOVINELLO!*
❓ *${json.question}*

⏱️ *Tempo:* ${(timeout / 1000).toFixed(0)} secondi
🎁 *Premio:* +${premio} 🪙 euro

💡 *Suggerimento:* ${clue}
Scrivi la risposta in chat!`.trim();

  conn.indovinelli[id] = [
    await conn.reply(m.chat, caption, m), json,
    premio,
    setTimeout(async () => {
      if (conn.indovinelli[id]) await conn.reply(m.chat, `⏰ Tempo scaduto!\nLa risposta era: *${json.response}* 😜`, conn.indovinelli[id][0]);
      delete conn.indovinelli[id];
    }, timeout)
  ];
};

handler.before = async (m, {conn}) => {
  conn.indovinelli = conn.indovinelli ? conn.indovinelli : {};
  const id = m.chat;
  if (!(id in conn.indovinelli)) return;
  const [msg, json, premio, timeoutObj] = conn.indovinelli[id];
  if (m.quoted && m.quoted.id === msg.key.id) {
    if (m.text.trim().toLowerCase() === json.response.toLowerCase()) {
      let complimenti = [
        "🎉 Bravo! Hai indovinato!",
        "👏 Complimenti, risposta esatta!",
        "🥳 Sei un vero genio degli indovinelli!",
        "🦉 Intelligenza fuori dal comune!",
        "🪙 Vinci ancora!"
      ];
      let testo = complimenti[Math.floor(Math.random() * complimenti.length)];
      if (global.db && global.db.data && global.db.data.users && global.db.data.users[m.sender]) {
        global.db.data.users[m.sender].euro = (global.db.data.users[m.sender].euro || 0) + premio;
        testo += `\nHai guadagnato *${premio}* 🪙 euro!`;
      }
      await conn.reply(m.chat, testo, m);
      clearTimeout(timeoutObj);
      delete conn.indovinelli[id];
    } else {
      await conn.reply(m.chat, "❌ Risposta sbagliata! Riprova!", m);
    }
  }
};

handler.help = ['indovinello'];
handler.tags = ['giochi'];
handler.command = /^(indovinello|indovinelli|quiz)$/i;

export default handler;
