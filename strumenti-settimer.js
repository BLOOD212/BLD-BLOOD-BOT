const timers = {};
const maxTimers = 3;
function generateSimpleId(user) {
  if (!timers[user]) timers[user] = {};
  const ids = Object.keys(timers[user]).map(Number);
  for (let i = 1; i <= 99; i++) {
    if (!ids.includes(i)) return i.toString().padStart(2, '0');
  }
  return Math.floor(Math.random() * 99 + 1).toString().padStart(2, '0');
}

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const user = m.sender;
  const tagUtente = '@' + user.split('@')[0];
  if (command === 'timer') {
    if (!timers[user] || Object.keys(timers[user]).length === 0) {
      return conn.reply(m.chat, '『 ⏰ 』- \`Non hai timer attivi.\`', m);
    }
    let timerList = 'ㅤㅤ⋆｡˚『 ╭ \`TIMER\` ╯ 』˚｡⋆\n╭\n│';
    Object.entries(timers[user]).forEach(([id, timer]) => {
      timerList += `│ #${id} • ${timer.motivo}\n`;
    });
    timerList += '*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*';
    return conn.reply(m.chat, timerList, m);
  }
  if (command === 'deltimer') {
    if (!timers[user] || Object.keys(timers[user]).length === 0) {
      return conn.reply(m.chat, '『 ⏹️ 』- \`Non hai nessun timer attivo.\`', m);
    }

    if (!args[0]) {
      const count = Object.keys(timers[user]).length;
      const response = `
ㅤ⋆｡˚『 ╭ \`ELIMINA TIMER\` ╯ 』˚｡⋆\n╭\n│
│ 『 ❓ 』 \`Vuoi eliminare ${count} timer?\`
│ 『 ⚡ 』 \`Usa:\`
│ • *.deltimer all* - *elimina tutti*
│ • *.deltimer [id]* - *elimina specifico*
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;
      return conn.reply(m.chat, response, m);
    }

    if (args[0].toLowerCase() === 'all') {
      const count = Object.keys(timers[user]).length;
      Object.values(timers[user]).forEach(timer => clearTimeout(timer.timeout));
      delete timers[user];
      const response = `
ㅤㅤ⋆｡˚『 ╭ \`TRASCRIZIONE\` ╯ 』˚｡⋆\n╭\n│
│ 『 ✅ 』 \`Eliminati ${count} timer\`
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;
      return conn.reply(m.chat, response, m);
    }

    const id = args[0].padStart(2, '0');
    if (!timers[user]?.[id]) {
      return conn.reply(m.chat, `『 ❌ 』- \`Timer #${id} non trovato\``, m);
    }

    const motivo = timers[user][id].motivo;
    clearTimeout(timers[user][id].timeout);
    delete timers[user][id];
    
    const response = `
ㅤ⋆｡˚『 ╭ \`TIMER ELIMINATO\` ╯ 』˚｡⋆\n╭\n│
│ 『 🆔 』 \`ID:\` *#${id}*
│ 『 📝 』 \`Motivo\`: *${motivo}*
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;
    return conn.reply(m.chat, response, m);
  }
  if (command === 'settimer') {
    if (!args[0]) {
      return conn.reply(m.chat, `『 ⚠️ 』- \`Formato:\` *${usedPrefix}settimer <orario/durata> <motivo>*`, m);
    }
    if (/^\d{1,2}:\d{2}$/.test(args[0])) {
      const [hh, mm] = args[0].split(':').map(Number);
      if (hh > 23 || mm > 59) {
        return conn.reply(m.chat, '『 ⚠️ 』- \`Orario non valido! Usa formato 24h (00:00 - 23:59)\`', m);
      }
      const now = new Date();
      const target = new Date(now);
      target.setHours(hh, mm, 0, 0);
      if (target <= now) target.setDate(now.getDate() + 1);
      const ms = target - now;
      const motivo = args.slice(1).join(' ') || 'Nessun motivo specificato';
      const timerId = generateSimpleId(user);

      const response = `
ㅤ⋆｡˚『 ╭ \`TIMER\` ╯ 』˚｡⋆\n╭\n│
│ 『 ⏰ 』 \`Orario:\` *${args[0]}*
│ 『 📝 』 \`Motivo:\` *${motivo}*
│ 『 🆔 』 \`ID:\` *${timerId}*
│ 『 ⏳ 』 \`Tempo:\` *${formatTime(ms)}*
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;

      await conn.reply(m.chat, response, m);

      timers[user][timerId] = {
        timeout: setTimeout(async () => {
          const messaggio = `
ㅤ⋆｡˚『 ╭ \`TIMER SCADUTO\` ╯ 』˚｡⋆\n╭\n│
│ 『 👋 』 *${tagUtente}*
│ 『 📝 』 \`Motivo:\` *${motivo}*
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;
          await conn.sendMessage(m.chat, { text: messaggio, mentions: [user] });
          await conn.sendMessage(user, { text: messaggio });
          delete timers[user][timerId];
        }, ms),
        endTime: `${args[0]}`,
        motivo
      };

      return;
    }
    const numero = parseInt(args[0]);
    const tipo = args[1]?.toLowerCase();

    if (isNaN(numero) || numero < 1 || !['minuto', 'minuti', 'secondo', 'secondi'].includes(tipo)) {
      return conn.reply(m.chat, '『 ⚠️ 』- \`Uso:\` *.settimer <numero> minuti/secondi <motivo>*', m);
    }

    const motivo = args.slice(2).join(' ') || 'Nessun motivo specificato';
    const timerId = generateSimpleId(user);

    let ms = 0;
    if (tipo.startsWith('minut')) ms = numero * 60 * 1000;
    else if (tipo.startsWith('second')) ms = numero * 1000;

    const response = `
ㅤㅤ⋆｡˚『 ╭ \`TIMER\` ╯ 』˚｡⋆\n╭\n│
│ 『 ⏰ 』 \`Durata:\` *${numero}* *${tipo}*
│ 『 📝 』 \`Motivo:\` *${motivo}*
│ 『 🆔 』  \`ID:\` *${timerId}*
│ 『 ⏳ 』 \`Tempo:\` *${formatTime(ms)}*
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;

    await conn.reply(m.chat, response, m);

    timers[user][timerId] = {
      timeout: setTimeout(async () => {
        const messaggio = `
ㅤ⋆｡˚『 ╭ \`TIMER SCADUTO\` ╯ 』˚｡⋆\n╭\n│
│ 『 👋 』 *${tagUtente}*
│ 『 📝 』 \`Motivo:\` *${motivo}*
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;
        await conn.sendMessage(m.chat, { text: messaggio, mentions: [user] });
        await conn.sendMessage(user, { text: messaggio });
        delete timers[user][timerId];
      }, ms),
      endTime: `${formatTime(ms)}`,
      motivo
    };
  }
};
function formatTime(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);

  return parts.join(' ');
}

handler.help = ['settimer <tempo> [motivo]','timer','deltimer [id]'];
handler.tags = ['strumenti'];
handler.command = /^(settimer|deltimer|timer)$/i;

export default handler;