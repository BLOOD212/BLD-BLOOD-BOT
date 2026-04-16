const pizzaCondimenti = [
  '*Formaggio 🧀*', '*Mozzarella 🧀*', '*Bufala 🐃*', '*Gorgonzola 🧀*', '*Feta 🧀*', '*Grana Padano 🧀*', '*Provolone 🧀*', '*Scamorza 🧀*', '*Burrata 🧀*', '*Pecorino 🧀*',
  '*Salsa 🍅*', '*Pomodoro 🍅*', '*Passata di pomodoro 🍅*', '*Pesto 🥗*', '*Olio d’oliva 🫒*', '*Aglio 🧄*', '*Cipolla 🧅*', '*Peperoni 🔥*', '*Jalapeño 🔥*', '*Peperoncino 🔥*',
  '*Salame 🍖*', '*Wurstel 🍖*', '*Prosciutto cotto 🍖*', '*Prosciutto crudo 🍖*', '*Mortadella 🍖*', '*Salsiccia 🍖*', '*Salsiccia piccante 🔥*', '*Bacon 🍖*', '*Pollo 🍗*', '*Tonno 🐟*',
  '*Acciughe 🐟*', '*Funghi 🍄*', '*Champignon 🍄*', '*Porcini 🍄*', '*Olive nere 🫒*', '*Olive verdi 🫒*', '*Carciofi 🥗*', '*Zucchine 🥒*', '*Melanzane 🍆*', '*Peperoni dolci 🌶️*',
  '*Spinaci 🥗*', '*Rucola 🥗*', '*Asparagi 🥗*', '*Broccoli 🥗*', '*Cavolfiore 🥗*', '*Mais 🌽*', '*Patate 🍟*', '*Zucca 🎃*', '*Pistacchio 🌰*', '*Noci 🌰*',
  '*Pinoli 🌰*', '*Tartufi 🌰*', '*Uova 🥚*', '*Capperi 🌿*', '*Sottaceti 🥗*', '*Erbe aromatiche 🌿*', '*Origano 🌿*', '*Basilico 🌿*', '*Prezzemolo 🌿*', '*Timo 🌿*',
  '*Rosmarino 🌿*', '*Peperoncino dolce 🌶️*', '*Peperoncini piccanti 🔥*', '*Formaggio grattugiato 🧀*', '*Stracchino 🧀*', '*Grana grattugiato 🧀*', '*Caciocavallo 🧀*', '*Gorgonzola piccante 🧀*', '*Mozzarella di bufala 🐃*', '*Burrata cremosa 🧀*',
  '*Ricotta 🧀*', '*Prosciutto di Parma 🍖*', '*Speck 🍖*', '*Soppressata 🍖*', '*Salame piccante 🔥*', '*Kebab 🍖*', '*Hamburger 🍔*', '*Patatine fritte 🍟*', '*Peperoncino fresco 🌶️*', '*Cipolla rossa 🧅*',
  '*Funghi trifolati 🍄*', '*Funghi champignon 🍄*', '*Cipolla caramellata 🧅*', '*Pomodorini 🍅*', '*Rucola fresca 🥗*', '*Spinaci freschi 🥗*', '*Olive taggiasche 🫒*', '*Olive denocciolate 🫒*', '*Capperi sott’aceto 🌿*', '*Aglio fresco 🧄*',
  '*Basilico fresco 🌿*', '*Origano secco 🌿*', '*Peperone grigliato 🌶️*', '*Zucchine grigliate 🥒*', '*Melanzane grigliate 🍆*', '*Asparagi grigliati 🥗*', '*Broccoli al vapore 🥗*', '*Pomodori secchi 🍅*', '*Mais dolce 🌽*', '*Formaggio affumicato 🧀*',
  '*Carne macinata 🍖*', '*Prosciutto affumicato 🍖*', '*Salsiccia di maiale 🍖*', '*Salsiccia di pollo 🍖*', '*Salsiccia di tacchino 🍖*', '*Salsiccia di vitello 🍖*', '*Salsiccia vegetale 🍖*'
];

const pizzaBotReplies = [
  "🍕 Pizza perfetta!", "🤢 Che schifo!", "🔥 Wow, questa pizza è piccante!", "🌟 Una vera opera d'arte!", 
  "😱 Troppo condimento!", "😋 Mmm, che bontà!", "🙃 Interessante combinazione!", "🫣 Non so se è commestibile...", 
  "🎉 Pizza da campioni!", "🤔 Pizza... strana, ma coraggiosa!"
];

const playAgainButtons = () => [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Ordina un\'altra pizza! 🍕', id: `.pizza` }) }];

let handler = async (m, { conn, args }) => {
  let frasi = [
    `🍕 *Scegli i condimenti per la tua pizza!*`,
    `🔥 *Personalizza la tua pizza!*`,
    `🌟 *Crea la tua pizza ideale!*`,
    `🧂 *Scegli i tuoi condimenti preferiti!*`,
  ];

  if (global.pizzaGame?.[m.chat]) return m.reply('⚠️ *C\'è già una partita attiva in questo gruppo!*');

  const cooldownKey = `pizza_${m.chat}`;
  const now = Date.now();
  const cooldownTime = 5000;
  const lastGame = global.cooldowns?.[cooldownKey] || 0;
  if (now - lastGame < cooldownTime) {
    const remainingTime = Math.ceil((cooldownTime - (now - lastGame)) / 1000);
    return m.reply(`⏳ *Aspetta ancora ${remainingTime} secondi prima di avviare un nuovo gioco!*`);
  }

  global.cooldowns = global.cooldowns || {};
  global.cooldowns[cooldownKey] = now;

  const frase = frasi[Math.floor(Math.random() * frasi.length)];
  let messaggio = `${frase}\n\n`;
  pizzaCondimenti.forEach((c, i) => { messaggio += `${i + 1}. ${c}\n`; });
  messaggio += '\n*Rispondi con i numeri dei condimenti separati da virgola (es. 1, 2, 3)*\n*Scrivi "fine" per terminare la tua pizza*';

  try {
    const msg = await conn.sendMessage(m.chat, { text: messaggio, footer: '🍕 𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙 🍕' }, { quoted: m });
    global.pizzaGame = global.pizzaGame || {};
    global.pizzaGame[m.chat] = {
      id: msg.key.id,
      condimenti: [],
      utente: m.sender,
      timeout: setTimeout(async () => {
        if (!global.pizzaGame?.[m.chat]) return;
        const pizza = global.pizzaGame[m.chat].condimenti.join(', ');
        const utente = `@${global.pizzaGame[m.chat].utente.split('@')[0]}`;
        const randomReply = pizzaBotReplies[Math.floor(Math.random() * pizzaBotReplies.length)];
        await conn.sendMessage(m.chat, { text: `*PIZZA CREATA DA* ${utente}\n\n*Questa è la tua pizza:* ${pizza}\n\n${randomReply}`, footer: '🍕 𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙 🍕', interactiveButtons: playAgainButtons() }, { quoted: msg });
        delete global.pizzaGame[m.chat];
      }, 120000)
    };
  } catch (error) {
    console.error('Errore nel gioco pizza:', error);
    m.reply('❌ *Si è verificato un errore durante l\'avvio del gioco*\n🔄 *Riprova tra qualche secondo*');
  }
};

handler.before = async (m, { conn }) => {
  const chat = m.chat;
  const game = global.pizzaGame?.[chat];
  if (!game || !m.quoted || m.quoted.id !== game.id || m.key.fromMe || m.sender !== game.utente) return;

  const scelte = m.text.trim().split(',').map(s => s.trim()).filter(s => s);
  for (const scelta of scelte) {
    if (scelta.toLowerCase() === 'fine') {
      clearTimeout(game.timeout);
      const pizza = game.condimenti.join(', ');
      const utente = `@${game.utente.split('@')[0]}`;
      const randomReply = pizzaBotReplies[Math.floor(Math.random() * pizzaBotReplies.length)];
      await conn.sendMessage(m.chat, { text: `*PIZZA CREATA DA* ${utente}\n\n*Questa è la tua pizza:* ${pizza}\n\n${randomReply}`, footer: '🍕 𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙 🍕', interactiveButtons: playAgainButtons() }, { quoted: m });
      delete global.pizzaGame[m.chat];
      return;
    }
    const index = parseInt(scelta) - 1;
    if (!isNaN(index) && pizzaCondimenti[index] && !game.condimenti.includes(pizzaCondimenti[index])) {
      game.condimenti.push(pizzaCondimenti[index]);
    } else if (isNaN(index)) {
      await conn.sendMessage(m.chat, { text: '*Scelta non valida. Usa solo numeri o "fine".*' });
      return;
    }
  }
  await conn.sendMessage(m.chat, { text: `*Hai scelto ${game.condimenti.join(', ')}.*\n*Vuoi aggiungere altro? (rispondi con i numeri dei condimenti separati da virgola o "fine")*` });
};

handler.help = ['pizza'];
handler.tags = ['giochi'];
handler.command = /^pizza$/i;
handler.group = true;
handler.register = true;

export default handler;