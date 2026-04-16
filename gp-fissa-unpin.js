import { Buffer } from 'buffer';

const DURATE = {
  '24h': 86400,
  '7d': 604800,
  '30d': 2592000,
};

const handler = async (m, { conn, args, command }) => {
  const isUnpin = ['unpin', 'defissa'].includes(command.toLowerCase());
  const isUnpinAll = ['unpinall', 'defissatutti'].includes(command.toLowerCase());
  const isFinalPin = command === 'pinfinal';
  const isPin = !isUnpin && !isFinalPin && !isUnpinAll;

  // --- Funzionalità unpinall (NON SUPPORTATA DIRETTAMENTE DALL'API DI WHATSAPP) ---
  // Il tipo '3' per il messaggio di pin non è definito nel protocollo WhatsApp.
  // Non è possibile defissare tutti i messaggi con un singolo comando.
  // Se questa funzionalità è cruciale, richiederà un'implementazione più complessa
  // (es. recuperare tutti i messaggi fissati e inviare singole richieste di unpin),
  // ma non è direttamente supportata dalla libreria in questo modo.
  /*
  if (isUnpinAll) {
    try {
      await conn.sendMessage(m.chat, { pin: { type: 3 } });
      return m.reply('『 ✅ 』 \`Tutti i messaggi sono stati defissati.\`');
    } catch (e) {
      console.error('Errore durante lo sblocco di tutti i messaggi:', e);
      return m.reply(`${global.errore}`);
    }
  }
  */
  // --------------------------------------------------------------------------------

  if (isUnpin) {
    if (!m.quoted) return m.reply('『 ⛓️‍💥 』 \`Rispondi al messaggio da defissare.\`');

    let key = null;

    if (m.quoted.key) {
      key = m.quoted.key;
    } else if (m.quoted.id) {
      key = {
        id: m.quoted.id,
        fromMe: m.quoted.fromMe || false,
        remoteJid: m.chat
      };
    }

    if (!key) {
      return m.reply(`${global.errore}`);
    }

    try {
      // type: 2 corrisponde a UNPIN_FOR_ALL nel protocollo
      await conn.sendMessage(m.chat, { pin: { type: 2, key } });
      return m.reply('『 ✅ 』 \`Messaggio defissato.\`');
    } catch (e) {
      console.error('Errore durante lo sblocco:', e);
      return m.reply(`${global.errore}`);
    }
  }

  if (isFinalPin) {
    const [secondsRaw, base64Key] = args;
    const seconds = parseInt(secondsRaw);
    let key;

    try {
      if (isNaN(seconds)) throw new Error('Durata non valida.');
      if (!base64Key) throw new Error('Chiave del messaggio mancante (Base64).');
      const keyString = Buffer.from(base64Key, 'base64').toString('utf8');
      key = JSON.parse(keyString);
    } catch (e) {
      console.error('Errore nella decodifica della chiave o durata non valida:', e);
      return m.reply(`${global.errore}`);
    }

    try {
      // type: 1 corrisponde a PIN_FOR_ALL nel protocollo
      await conn.sendMessage(m.chat, { pin: { type: 1, time: seconds, key } });
      const label = Object.entries(DURATE).find(([, s]) => s === seconds)?.[0] || `${seconds}s`;
      return m.reply(`『 📌 』 \`Messaggio fissato per ${label}.\``);
    } catch (e) {
      console.error('Errore durante il pin finale:', e);
      return m.reply(`${global.errore}`);
    }
  }

  if (isPin) {
    const text = args.join(' ');
    if (m.quoted && !text) {
      let quotedKey = null;

      if (m.quoted.key) {
        quotedKey = m.quoted.key;
      } else if (m.quoted.id && m.quoted.sender) {
        quotedKey = {
          id: m.quoted.id,
          fromMe: m.quoted.fromMe || false,
          remoteJid: m.chat,
          participant: m.quoted.sender
        };
      } else if (m.quoted.id) {
        quotedKey = {
          id: m.quoted.id,
          fromMe: m.quoted.fromMe || false,
          remoteJid: m.chat
        };
      }

      if (!quotedKey) {
        return m.reply(`${global.errore}`);
      }

      return await inviaBottoniDurata(conn, m.chat, quotedKey);
    }
    else if (text) {
      try {
        const sent = await conn.sendMessage(m.chat, { text }, { quoted: m });
        if (!sent || !sent.key) throw new Error('Impossibile ottenere la chiave del messaggio inviato.');
        return await inviaBottoniDurata(conn, m.chat, sent.key);
      } catch (e) {
        console.error('Errore durante l\'invio del messaggio:', e);
        return m.reply(`${global.errore}`);
      }
    } else {
      return m.reply('『 ⛓️‍💥 』 \`Rispondi a un messaggio o scrivi un testo per fissarlo.\`');
    }
  }
};

async function inviaBottoniDurata(conn, chat, key) {
  if (!key) {
    console.error('Errore: Chiave del messaggio non valida in inviaBottoniDurata.');
    return;
  }

  const keyString = JSON.stringify(key);
  const base64Key = Buffer.from(keyString).toString('base64');

  const buttons = Object.entries(DURATE).map(([label, seconds]) => ({
    buttonId: `.pinfinal ${seconds} ${base64Key}`,
    buttonText: { displayText: `⏱️ ${label}` },
    type: 1,
  }));

  try {
    await conn.sendMessage(chat, {
      text: '『 ⏱️ 』 *\`Per quanto tempo fissare il messaggio?\`*',
      buttons,
      footer: '',
      headerType: 1,
    });
  } catch (e) {
    console.error('Errore durante l\'invio dei bottoni:', e);
  }
}

handler.command = ['pin', 'pinna', 'fissa', 'fissamsg', 'unpin', 'defissa', 'unpinall', 'defissatutti', 'pinfinal'];
handler.tags = ['gruppo'];
handler.help = ['pin', 'unpin/unpinall'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;