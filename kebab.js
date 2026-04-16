import { createCanvas } from 'canvas';

const kebabIngredients = [
  '*Pane pita 🫓*', '*Pane lavash 🫓*', '*Carne di pollo 🍗*', '*Carne di manzo 🥩*', '*Carne di agnello 🐑*',
  '*Insalata 🥗*', '*Pomodori 🍅*', '*Cipolla 🧅*', '*Cetriolini sottaceto 🥒*', '*Peperoni 🌶️*',
  '*Salsa allo yogurt 🥛*', '*Salsa piccante 🔥*', '*Salsa all’aglio 🧄*', '*Patatine fritte 🍟*',
  '*Formaggio feta 🧀*', '*Rucola 🥗*', '*Mais 🌽*', '*Peperoncino fresco 🌶️*'
];

const kebabBotReplies = [
  "🌯 Kebab perfetto!",
  "😋 Che bontà!",
  "🔥 Attenzione, questo è piccante!",
  "🎉 Kebab da campioni!",
  "🤤 Mmm, che delizia!"
];

const playAgainButtons = () => [
  {
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({
      display_text: 'Ordina un altro kebab 🌯',
      id: `.kebab`
    })
  }
];

async function generateKebabImage(ingredients) {
  const width = 800;
  const height = 800;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Sfondo
  ctx.fillStyle = "#f5e6c8";
  ctx.fillRect(0, 0, width, height);

  // Titolo
  ctx.fillStyle = "#000";
  ctx.font = "bold 50px Sans";
  ctx.textAlign = "center";
  ctx.fillText("IL TUO KEBAB", width / 2, 80);

  // Base kebab
  ctx.fillStyle = "#d9a066";
  ctx.fillRect(250, 200, 300, 400);

  ctx.fillStyle = "#fff";
  ctx.fillRect(270, 220, 260, 360);

  // Ingredienti scritti dentro
  ctx.fillStyle = "#000";
  ctx.font = "28px Sans";
  ctx.textAlign = "left";

  let y = 260;
  ingredients.forEach(ing => {
    ctx.fillText("• " + ing.replace(/\*/g, ''), 290, y);
    y += 40;
  });

  return canvas.toBuffer();
}

let handler = async (m, { conn }) => {
  if (global.kebabGame?.[m.chat])
    return m.reply("⚠️ C'è già un kebab in preparazione in questo gruppo!");

  const cooldownKey = `kebab_${m.chat}`;
  const now = Date.now();
  const cooldownTime = 5000;

  global.cooldowns = global.cooldowns || {};
  const lastGame = global.cooldowns[cooldownKey] || 0;

  if (now - lastGame < cooldownTime) {
    const remaining = Math.ceil((cooldownTime - (now - lastGame)) / 1000);
    return m.reply(`⏳ Aspetta ${remaining} secondi prima di riaprire la cucina!`);
  }

  global.cooldowns[cooldownKey] = now;

  const intro = `
╭━━━〔 🌯 𝑲𝑬𝑩𝑨𝑩 𝑺𝑻𝑼𝑫𝑰𝑶 🌯 〕━━━╮
┃  Crea il tuo kebab perfetto
╰━━━━━━━━━━━━━━━━━━╯
`;

  let text = intro + "\n";
  kebabIngredients.forEach((c, i) => {
    text += `〔 ${i + 1} 〕 ${c}\n`;
  });

  text += `
━━━━━━━━━━━━━━
✎ Scrivi: 1,2,3
✦ Scrivi "fine" per completare
━━━━━━━━━━━━━━`;

  const msg = await conn.sendMessage(m.chat, { text }, { quoted: m });

  global.kebabGame = global.kebabGame || {};
  global.kebabGame[m.chat] = {
    id: msg.key.id,
    ingredients: [],
    user: m.sender,
    timeout: setTimeout(async () => {
      const game = global.kebabGame[m.chat];
      if (!game) return;

      const kebab = game.ingredients.join(', ');
      const userTag = `@${game.user.split('@')[0]}`;
      const randomReply = kebabBotReplies[Math.floor(Math.random() * kebabBotReplies.length)];
      const imageBuffer = await generateKebabImage(game.ingredients);

      await conn.sendMessage(m.chat, {
        image: imageBuffer,
        caption: `
╭━━━〔 🌯 𝑲𝑬𝑩𝑨𝑩 𝑪𝑹𝑬𝑨𝑻𝑶 🌯 〕━━━╮
┃ 👤 Creato da: ${userTag}
┃
┃ 🥙 Ingredienti:
┃ ${kebab}
┃
╰━━━━━━━━━━━━━━━━━━╯

${randomReply}
`,
        mentions: [game.user],
        interactiveButtons: playAgainButtons()
      });

      delete global.kebabGame[m.chat];
    }, 120000)
  };
};

handler.before = async (m, { conn }) => {
  const game = global.kebabGame?.[m.chat];
  if (!game || !m.quoted || m.quoted.id !== game.id || m.sender !== game.user) return;

  const choices = m.text.trim().split(',').map(s => s.trim());

  for (const choice of choices) {
    if (choice.toLowerCase() === 'fine') {
      clearTimeout(game.timeout);

      const kebab = game.ingredients.join(', ');
      const userTag = `@${game.user.split('@')[0]}`;
      const randomReply = kebabBotReplies[Math.floor(Math.random() * kebabBotReplies.length)];
      const imageBuffer = await generateKebabImage(game.ingredients);

      await conn.sendMessage(m.chat, {
        image: imageBuffer,
        caption: `
╭━━━〔 🌯 𝑲𝑬𝑩𝑨𝑩 𝑪𝑹𝑬𝑨𝑻𝑶 🌯 〕━━━╮
┃ 👤 Creato da: ${userTag}
┃
┃ 🥙 Ingredienti:
┃ ${kebab}
┃
╰━━━━━━━━━━━━━━━━━━╯

${randomReply}
`,
        mentions: [game.user],
        interactiveButtons: playAgainButtons()
      });

      delete global.kebabGame[m.chat];
      return;
    }

    const index = parseInt(choice) - 1;
    if (!isNaN(index) && kebabIngredients[index] && !game.ingredients.includes(kebabIngredients[index])) {
      game.ingredients.push(kebabIngredients[index]);
    }
  }

  await conn.sendMessage(m.chat, {
    text: `🥙 Hai scelto:\n${game.ingredients.join(', ')}\n\nScrivi altri numeri o "fine".`
  });
};

handler.help = ['kebab'];
handler.tags = ['giochi'];
handler.command = /^kebab$/i;
handler.group = true;
handler.register = true;

export default handler;