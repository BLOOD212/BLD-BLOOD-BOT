import fs from 'fs';

const FILE_PATH = './media/database/gruppotempo.json';
let savedTimers = {};
if (fs.existsSync(FILE_PATH)) {
  try {
    savedTimers = JSON.parse(fs.readFileSync(FILE_PATH));
  } catch (e) {
    console.error('[Errore JSON]', e);
    savedTimers = {};
  }
}

function salvaTimer() {
  fs.writeFileSync(FILE_PATH, JSON.stringify(savedTimers, null, 2));
}

const timerGruppo = {};
const autoTask = {};

async function cambiaStatoGruppo(conn, chatId, stato) {
  try {
    await conn.groupSettingUpdate(chatId, stato);
  } catch (e) {
    console.error('Errore nel cambiare stato gruppo:', e);
  }
}

function scheduleOrario(ora, callback) {
  const [hh, mm] = ora.split(':').map(Number);
  const now = new Date();
  let next = new Date();
  next.setHours(hh, mm, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  const delay = next - now;
  return setTimeout(() => {
    callback();
    const interval = setInterval(callback, 24 * 60 * 60 * 1000);
    return interval;
  }, delay);
}

function setupAutoOrari(conn, chatId) {
  if (!savedTimers[chatId]?.autoOrari) return;

  const { chiudi, apri } = savedTimers[chatId].autoOrari;
  if (autoTask[chatId]?.timeout) clearTimeout(autoTask[chatId].timeout);
  if (autoTask[chatId]?.interval) clearInterval(autoTask[chatId].interval);
  if (autoTask[chatId + '_apri']?.timeout) clearTimeout(autoTask[chatId + '_apri'].timeout);
  if (autoTask[chatId + '_apri']?.interval) clearInterval(autoTask[chatId + '_apri'].interval);

  const timeoutChiudi = scheduleOrario(chiudi, async () => {
    await cambiaStatoGruppo(conn, chatId, 'announcement');
    conn.reply(chatId, '🔒 *Gruppo chiuso automaticamente*\n⏰ Orario programmato raggiunto');
  });
  autoTask[chatId] = { timeout: timeoutChiudi };

  const timeoutApri = scheduleOrario(apri, async () => {
    await cambiaStatoGruppo(conn, chatId, 'not_announcement');
    conn.reply(chatId, '🔓 *Gruppo riaperto automaticamente*\n⏰ Orario programmato raggiunto');
  });
  autoTask[chatId + '_apri'] = { timeout: timeoutApri };
}

function parseDuration(str) {
  if (!str) return 0;
  const match = str.match(/^(\d+)(s|m|h|g)$/);
  if (!match) return 0;
  const num = parseInt(match[1]);
  const unit = match[2];
  switch (unit) {
    case 's': return num * 1000;
    case 'm': return num * 60 * 1000;
    case 'h': return num * 60 * 60 * 1000;
    case 'g': return num * 24 * 60 * 60 * 1000;
    default: return 0;
  }
}

function formatDuration(ms) {
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((ms % (60 * 1000)) / 1000);

  let result = [];
  if (days > 0) result.push(`${days}g`);
  if (hours > 0) result.push(`${hours}h`);
  if (minutes > 0) result.push(`${minutes}m`);
  if (seconds > 0) result.push(`${seconds}s`);
  return result.join(' ') || '0s';
}

function creaMenuPrincipale(usedPrefix) {
  return {
    text: `🏠 *GESTIONE GRUPPO - MENU PRINCIPALE*\n\n` +
          `Scegli un'opzione dal menu qui sotto per gestire il gruppo:`,
    footer: `Powered by GruppoTempo`,
    buttons: [
      { buttonId: `${usedPrefix}gt-menu-stato`, buttonText: { displayText: "🔄 Cambia Stato" }, type: 1 },
      { buttonId: `${usedPrefix}gt-menu-timer`, buttonText: { displayText: "⏲️ Timer Temporaneo" }, type: 1 },
      { buttonId: `${usedPrefix}gt-menu-auto`, buttonText: { displayText: "🤖 Automazione" }, type: 1 },
      { buttonId: `${usedPrefix}gt-status`, buttonText: { displayText: "📊 Stato Attuale" }, type: 1 },
      { buttonId: `${usedPrefix}gt-reset`, buttonText: { displayText: "🗑️ Reset Tutto" }, type: 1 }
    ],
    headerType: 1
  };
}

function creaMenuStato(usedPrefix, isChiuso) {
  return {
    text: `🔄 *CAMBIA STATO GRUPPO*\n\n` +
          `Stato attuale: ${isChiuso ? '🔒 Chiuso' : '🔓 Aperto'}\n\n` +
          `Scegli la nuova configurazione:`,
    footer: `Tornare indietro: ${usedPrefix}gruppotempo`,
    buttons: [
      { buttonId: `${usedPrefix}gt-apri`, buttonText: { displayText: "🔓 Apri Gruppo" }, type: 1 },
      { buttonId: `${usedPrefix}gt-chiudi`, buttonText: { displayText: "🔒 Chiudi Gruppo" }, type: 1 },
      { buttonId: `${usedPrefix}gruppotempo`, buttonText: { displayText: "⬅️ Menu Principale" }, type: 1 }
    ],
    headerType: 1
  };
}

function creaMenuTimer(usedPrefix) {
  return {
    text: `⏲️ *TIMER TEMPORANEO*\n\n` +
          `Cambia lo stato del gruppo per un periodo limitato.\n` +
          `Dopo il tempo stabilito, tornerà automaticamente allo stato precedente.\n\n` +
          `Scegli durata e azione:`,
    footer: `Esempio: Chiudi per 30 minuti`,
    buttons: [
      { buttonId: `${usedPrefix}gt-timer-chiudi`, buttonText: { displayText: "🔒 Chiudi con Timer" }, type: 1 },
      { buttonId: `${usedPrefix}gt-timer-apri`, buttonText: { displayText: "🔓 Apri con Timer" }, type: 1 },
      { buttonId: `${usedPrefix}gruppotempo`, buttonText: { displayText: "⬅️ Menu Principale" }, type: 1 }
    ],
    headerType: 1
  };
}

function creaMenuDurata(usedPrefix, azione) {
  const emoji = azione === 'chiudi' ? '🔒' : '🔓';
  return {
    text: `${emoji} *SELEZIONA DURATA*\n\n` +
          `Per quanto tempo vuoi ${azione} il gruppo?`,
    footer: `O scrivi: ${usedPrefix}gt-${azione}-custom [durata]`,
    buttons: [
      { buttonId: `${usedPrefix}gt-${azione}-15m`, buttonText: { displayText: "15 minuti" }, type: 1 },
      { buttonId: `${usedPrefix}gt-${azione}-30m`, buttonText: { displayText: "30 minuti" }, type: 1 },
      { buttonId: `${usedPrefix}gt-${azione}-1h`, buttonText: { displayText: "1 ora" }, type: 1 },
      { buttonId: `${usedPrefix}gt-${azione}-2h`, buttonText: { displayText: "2 ore" }, type: 1 },
      { buttonId: `${usedPrefix}gt-${azione}-12h`, buttonText: { displayText: "12 ore" }, type: 1 }
    ],
    headerType: 1
  };
}

function creaMenuAuto(usedPrefix) {
  return {
    text: `🤖 *AUTOMAZIONE GIORNALIERA*\n\n` +
          `Configura orari fissi per aprire e chiudere automaticamente il gruppo ogni giorno.\n\n` +
          `Perfetto per gruppi con orari di lavoro o studio!`,
    footer: `Gli orari si ripetono ogni giorno`,
    buttons: [
      { buttonId: `${usedPrefix}gt-auto-config`, buttonText: { displayText: "⚙️ Configura Orari" }, type: 1 },
      { buttonId: `${usedPrefix}gt-auto-disattiva`, buttonText: { displayText: "❌ Disattiva Auto" }, type: 1 },
      { buttonId: `${usedPrefix}gruppotempo`, buttonText: { displayText: "⬅️ Menu Principale" }, type: 1 }
    ],
    headerType: 1
  };
}

export async function ripristinaTimer(conn) {
  for (const chatId in savedTimers) {
    const dati = savedTimers[chatId];

    if (dati.timer && dati.timer.scade > Date.now()) {
      const tempoRimasto = dati.timer.scade - Date.now();
      timerGruppo[chatId] = setTimeout(async () => {
        const nuovoStato = dati.timer.stato === 'announcement' ? 'not_announcement' : 'announcement';
        await cambiaStatoGruppo(conn, chatId, nuovoStato);
        conn.reply(chatId, `🔓 *Gruppo riaperto automaticamente*\n⏰ Timer scaduto`);
        delete savedTimers[chatId].timer;
        salvaTimer();
      }, tempoRimasto);
    }

    if (dati.autoOrari) {
      setupAutoOrari(conn, chatId);
    }
  }
}

const handler = async (m, { conn, isAdmin, isOwner, args, usedPrefix, command }) => {
  if (!(isAdmin || isOwner)) {
    global.dfail('admin', m, conn);
    return;
  }

  const chatId = m.chat;
  let info;
  
  try {
    info = await conn.groupMetadata(chatId);
  } catch (e) {
    return m.reply('❌ Errore nel leggere le informazioni del gruppo.');
  }

  const isChiuso = info.announce;

  // Ottieni il testo completo del messaggio per gestire i button callback
  const fullText = m.text || '';
  const cmd = args[0]?.toLowerCase() || '';

  // Menu principale
  if ((command === 'gruppotempo' && !args[0]) || fullText === `${usedPrefix}gruppotempo`) {
    const menu = creaMenuPrincipale(usedPrefix);
    return conn.sendMessage(chatId, menu, { quoted: m });
  }

  // Gestione comandi con bottoni - controlla sia args che il testo completo
  const commandToCheck = cmd || fullText.replace(usedPrefix, '');

  switch (commandToCheck) {
    case 'gt-menu-stato':
      const menuStato = creaMenuStato(usedPrefix, isChiuso);
      return conn.sendMessage(chatId, menuStato, { quoted: m });

    case 'gt-menu-timer':
      const menuTimer = creaMenuTimer(usedPrefix);
      return conn.sendMessage(chatId, menuTimer, { quoted: m });

    case 'gt-menu-auto':
      const menuAuto = creaMenuAuto(usedPrefix);
      return conn.sendMessage(chatId, menuAuto, { quoted: m });

    case 'gt-timer-chiudi':
      const menuChiudiTimer = creaMenuDurata(usedPrefix, 'chiudi');
      return conn.sendMessage(chatId, menuChiudiTimer, { quoted: m });

    case 'gt-timer-apri':
      const menuApriTimer = creaMenuDurata(usedPrefix, 'apri');
      return conn.sendMessage(chatId, menuApriTimer, { quoted: m });

    case 'gt-apri':
      if (!isChiuso) return m.reply('⚠️ Il gruppo è già aperto!');
      await cambiaStatoGruppo(conn, chatId, 'not_announcement');
      return m.reply('🔓 *Gruppo aperto con successo!*');

    case 'gt-chiudi':
      if (isChiuso) return m.reply('⚠️ Il gruppo è già chiuso!');
      await cambiaStatoGruppo(conn, chatId, 'announcement');
      return m.reply('🔒 *Gruppo chiuso con successo!*');

    case 'gt-status':
      let statusText = `📊 *STATO ATTUALE DEL GRUPPO*\n\n`;
      statusText += `🔹 Stato: ${isChiuso ? '🔒 Chiuso' : '🔓 Aperto'}\n`;
      
      if (savedTimers[chatId]?.timer) {
        const tempoRimasto = savedTimers[chatId].timer.scade - Date.now();
        if (tempoRimasto > 0) {
          statusText += `⏲️ Timer attivo: ${formatDuration(tempoRimasto)} rimanenti\n`;
        }
      }
      
      if (savedTimers[chatId]?.autoOrari) {
        const { chiudi, apri } = savedTimers[chatId].autoOrari;
        statusText += `🤖 Automazione: Chiude alle ${chiudi}, Apre alle ${apri}\n`;
      }
      
      if (!savedTimers[chatId]?.timer && !savedTimers[chatId]?.autoOrari) {
        statusText += `✨ Nessuna automazione attiva`;
      }
      
      return m.reply(statusText);

    case 'gt-reset':
      clearTimeout(timerGruppo[chatId]);
      clearTimeout(autoTask[chatId]?.timeout);
      clearTimeout(autoTask[chatId + '_apri']?.timeout);
      delete savedTimers[chatId];
      salvaTimer();
      return m.reply('🗑️ *Tutte le automazioni sono state resettate!*');

    case 'gt-auto-config':
      return m.reply(
        `⚙️ *CONFIGURA AUTOMAZIONE*\n\n` +
        `Scrivi il comando nel formato:\n` +
        `${usedPrefix}gt-auto-set [ora_chiusura] [ora_apertura]\n\n` +
        `*Esempio:*\n${usedPrefix}gt-auto-set 22:00 08:00\n\n` +
        `(Chiude alle 22:00, riapre alle 08:00)`
      );

    case 'gt-auto-disattiva':
      if (!savedTimers[chatId]?.autoOrari) {
        return m.reply('⚠️ Non ci sono automazioni attive da disattivare.');
      }
      clearTimeout(autoTask[chatId]?.timeout);
      clearTimeout(autoTask[chatId + '_apri']?.timeout);
      delete savedTimers[chatId].autoOrari;
      salvaTimer();
      return m.reply('❌ *Automazione giornaliera disattivata!*');

    case 'gt-auto-set':
      if (args.length !== 3) {
        return m.reply(
          `❌ *Formato errato!*\n\n` +
          `Usa: ${usedPrefix}gt-auto-set [ora_chiusura] [ora_apertura]\n` +
          `Esempio: ${usedPrefix}gt-auto-set 22:00 08:00`
        );
      }
      
      const orarioChiudi = args[1];
      const orarioApri = args[2];
      
      if (!/^\d{1,2}:\d{2}$/.test(orarioChiudi) || !/^\d{1,2}:\d{2}$/.test(orarioApri)) {
        return m.reply('❌ *Formato orario non valido!*\nUsa il formato HH:MM (es: 22:00)');
      }

      savedTimers[chatId] = savedTimers[chatId] || {};
      savedTimers[chatId].autoOrari = { chiudi: orarioChiudi, apri: orarioApri };
      salvaTimer();
      setupAutoOrari(conn, chatId);

      return m.reply(
        `✅ *Automazione configurata!*\n\n` +
        `🔒 Chiusura automatica: *${orarioChiudi}*\n` +
        `🔓 Apertura automatica: *${orarioApri}*\n\n` +
        `Gli orari si ripeteranno ogni giorno.`
      );

    default:
      // Gestione timer con durate predefinite
      if (commandToCheck) {
        const timerMatch = commandToCheck.match(/^gt-(apri|chiudi)-(15m|30m|1h|2h|12h)$/);
        if (timerMatch) {
          const [, azione, durata] = timerMatch;
          const nuovoStato = azione === 'chiudi' ? 'announcement' : 'not_announcement';
          const durationMs = parseDuration(durata);

          if ((nuovoStato === 'announcement' && isChiuso) || (nuovoStato === 'not_announcement' && !isChiuso)) {
            return m.reply(`⚠️ Il gruppo è già ${isChiuso ? 'chiuso' : 'aperto'}!`);
          }

          await cambiaStatoGruppo(conn, chatId, nuovoStato);

          if (timerGruppo[chatId]) clearTimeout(timerGruppo[chatId]);

          timerGruppo[chatId] = setTimeout(async () => {
            const statoRiapri = nuovoStato === 'announcement' ? 'not_announcement' : 'announcement';
            await cambiaStatoGruppo(conn, chatId, statoRiapri);
            conn.reply(chatId, `🔄 *Stato gruppo ripristinato automaticamente*\n⏰ Timer scaduto`);
            delete savedTimers[chatId]?.timer;
            salvaTimer();
          }, durationMs);

          savedTimers[chatId] = savedTimers[chatId] || {};
          savedTimers[chatId].timer = {
            stato: nuovoStato,
            scade: Date.now() + durationMs
          };
          salvaTimer();

          const emoji = azione === 'chiudi' ? '🔒' : '🔓';
          return m.reply(`${emoji} *Gruppo ${azione} per ${durata}*\n⏰ Si ripristinerà automaticamente`);
        }

        // Gestione timer personalizzato
        const customMatch = commandToCheck.match(/^gt-(apri|chiudi)-custom$/);
        if (customMatch && args[1]) {
          const [, azione] = customMatch;
          const durata = args[1];
          const durationMs = parseDuration(durata);
          
          if (durationMs === 0) {
            return m.reply(
              `❌ *Durata non valida!*\n\n` +
              `Esempi validi:\n• 30s (30 secondi)\n• 15m (15 minuti)\n• 2h (2 ore)\n• 1g (1 giorno)`
            );
          }

          const nuovoStato = azione === 'chiudi' ? 'announcement' : 'not_announcement';

          if ((nuovoStato === 'announcement' && isChiuso) || (nuovoStato === 'not_announcement' && !isChiuso)) {
            return m.reply(`⚠️ Il gruppo è già ${isChiuso ? 'chiuso' : 'aperto'}!`);
          }

          await cambiaStatoGruppo(conn, chatId, nuovoStato);

          if (timerGruppo[chatId]) clearTimeout(timerGruppo[chatId]);

          timerGruppo[chatId] = setTimeout(async () => {
            const statoRiapri = nuovoStato === 'announcement' ? 'not_announcement' : 'announcement';
            await cambiaStatoGruppo(conn, chatId, statoRiapri);
            conn.reply(chatId, `🔄 *Stato gruppo ripristinato automaticamente*\n⏰ Timer scaduto`);
            delete savedTimers[chatId]?.timer;
            salvaTimer();
          }, durationMs);

          savedTimers[chatId] = savedTimers[chatId] || {};
          savedTimers[chatId].timer = {
            stato: nuovoStato,
            scade: Date.now() + durationMs
          };
          salvaTimer();

          const emoji = azione === 'chiudi' ? '🔒' : '🔓';
          return m.reply(`${emoji} *Gruppo ${azione} per ${durata}*\n⏰ Si ripristinerà automaticamente`);
        }
      }

      // Se il comando non è riconosciuto, mostra il menu principale
      const menu = creaMenuPrincipale(usedPrefix);
      return conn.sendMessage(chatId, menu, { quoted: m });
  }
};

handler.help = ['gruppotempo'];
handler.tags = ['gruppo'];
handler.command = /^(gruppotempo)$/i;
handler.botAdmin = true;
handler.admin = true;
handler.group = true;

export default handler;