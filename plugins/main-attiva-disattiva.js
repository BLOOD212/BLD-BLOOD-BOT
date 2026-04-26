import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
// Importiamo il file usando il nome che hai scelto
import { createAIService } from './risposte-ai.js'; 

// Inizializzazione del servizio Bloodbot (Inserisci la tua API Key qui sotto)
const bloodbot = createAIService('LA_TUA_OPENAI_API_KEY');

const PERM = {
  ADMIN: 'admin',
  OWNER: 'owner',
  sam: 'sam',
};

const featureRegistry = [
  { key: 'bestemmiometro', store: 'chat', perm: PERM.ADMIN, name: '🤬 Bestemmiometro', desc: 'Rileva e conta le bestemmie' },
  { key: 'antidelete', store: 'chat', perm: PERM.ADMIN, name: '🗑️ Antidelete', desc: 'Recupera messaggi eliminati' },
  { key: 'welcome', store: 'chat', perm: PERM.ADMIN, name: '👋 Welcome', desc: 'Messaggio di benvenuto' },
  { key: 'goodbye', store: 'chat', perm: PERM.ADMIN, name: '🚪 Addio', desc: 'Messaggio di addio' },
  { key: 'antispam', store: 'chat', perm: PERM.ADMIN, name: '🛑 Antispam', desc: 'Protezione flood e spam' },
  { key: 'antisondaggi', store: 'chat', perm: PERM.ADMIN, name: '📊 Anti-sondaggi', desc: 'Blocca creazione sondaggi' },
  { key: 'antiparolacce', store: 'chat', perm: PERM.ADMIN, name: '🧼 Filtro parolacce', desc: 'Rimuove insulti e tossicità' },
  { key: 'antiBot', store: 'chat', perm: PERM.ADMIN, name: '🤖 Antibot', desc: 'Rimuove bot esterni non autorizzati' },
  { key: 'antiBot2', store: 'chat', perm: PERM.ADMIN, name: '🤖 Anti-subbots', desc: 'Blocca sub-bot nel gruppo' },
  { key: 'antitrava', store: 'chat', perm: PERM.ADMIN, name: '🧨 Antitrava', desc: 'Blocca messaggi crash/lunghi' },
  { key: 'antimedia', store: 'chat', perm: PERM.ADMIN, name: '🖼️ Antimedia', desc: 'Elimina foto/video permanenti' },
  { key: 'antioneview', store: 'chat', perm: PERM.ADMIN, name: '👁️ Antiviewonce', desc: 'Blocca media a visualizzazione singola' },
  { key: 'antitagall', store: 'chat', perm: PERM.ADMIN, name: '🏷️ Anti-tagall', desc: 'Blocca menzioni di massa' },
  { key: 'autotrascrizione', store: 'chat', perm: PERM.ADMIN, name: '📝 Auto-trascrizione', desc: 'Trascrive i vocali in testo' },
  { key: 'autotraduzione', store: 'chat', perm: PERM.ADMIN, name: '🌍 Auto-traduzione', desc: 'Traduce i messaggi in italiano' },
  { key: 'rileva', store: 'chat', perm: PERM.ADMIN, name: '📡 Rileva', desc: 'Notifica modifiche al gruppo' },
  { key: 'antiporno', store: 'chat', perm: PERM.ADMIN, name: '🔞 Antiporno', desc: 'Filtro contenuti NSFW' },
  { key: 'antigore', store: 'chat', perm: PERM.ADMIN, name: '🚫 Antigore', desc: 'Blocca contenuti splatter' },
  { key: 'modoadmin', store: 'chat', perm: PERM.ADMIN, name: '🛡️ Soloadmin', desc: 'Comandi solo per amministratori' },
  { key: 'ai', store: 'chat', perm: PERM.ADMIN, name: '🧠 Bloodbot IA', desc: 'Intelligenza Artificiale attiva' },
  { key: 'vocali', store: 'chat', perm: PERM.ADMIN, name: '🎤 Siri', desc: 'Risponde con audio ai messaggi' },
  { key: 'antivoip', store: 'chat', perm: PERM.ADMIN, name: '📞 Antivoip', desc: 'Blocca numeri non italiani' },
  { key: 'antiLink', store: 'chat', perm: PERM.ADMIN, name: '🔗 Antilink', desc: 'Blocca link WhatsApp' },
  { key: 'antiLinkUni', store: 'chat', perm: PERM.ADMIN, name: '🌍 Antilink Uni', desc: 'Blocca ogni tipo di link/URL' },
  { key: 'antiLink2', store: 'chat', perm: PERM.ADMIN, name: '🌐 Antilinksocial', desc: 'Blocca link social (IG, TT, YT)' },
  { key: 'reaction', store: 'chat', perm: PERM.ADMIN, name: '😎 Reazioni', desc: 'Reazioni automatiche ai messaggi' },
  { key: 'autolevelup', store: 'chat', perm: PERM.ADMIN, name: '⬆️ Autolivello', desc: 'Messaggio di level up' },
  { key: 'antinuke', store: 'chat', perm: PERM.OWNER, name: '🛡️ Antinuke', desc: 'Protezione totale anti-raid' },
  { key: 'antiprivato', store: 'bot', perm: PERM.OWNER, name: '🔒 Blocco privato', desc: 'Blocca chi scrive in DM al bot' },
  { key: 'soloe', store: 'bot', perm: PERM.sam, name: '👑 Solocreatore', desc: 'Bot utilizzabile solo da Blood' },
  { key: 'multiprefix', store: 'bot', perm: PERM.OWNER, name: '🔣 Multiprefix', desc: 'Abilita più prefissi (.!/)' },
  { key: 'jadibotmd', store: 'bot', perm: PERM.OWNER, name: '🧬 Subbots', desc: 'Abilita sessioni secondarie' },
  { key: 'antispambot', store: 'bot', perm: PERM.OWNER, name: '🤖 Anti-spam comandi', desc: 'Limita spam comandi globale' },
  { key: 'autoread', store: 'bot', perm: PERM.OWNER, name: '👀 Lettura', desc: 'Auto-visualizzazione messaggi' },
  { key: 'anticall', store: 'bot', perm: PERM.sam, name: '❌ Antichiamate', desc: 'Rifiuta chiamate in entrata' },
  { key: 'registrazioni', store: 'bot', perm: PERM.OWNER, name: '📛 Registrazione', desc: 'Obbligo registrazione utenti' },
];

const aliasMap = new Map();
featureRegistry.forEach(f => {
  aliasMap.set(f.key.toLowerCase(), f);
});

let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isSam }) => {
  const isEnable = ['enable', 'attiva', 'on', '1'].includes(command?.toLowerCase());
  const userName = m.pushName || 'User';

  global.db.data.chats = global.db.data.chats || {};
  global.db.data.settings = global.db.data.settings || {};
  const chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {});
  const botJid = conn.decodeJid(conn.user.jid);
  const bot = global.db.data.settings[botJid] || (global.db.data.settings[botJid] = {});

  // 1. GESTIONE COMANDI ATTIVA/DISATTIVA
  if (command && ['enable', 'disable', 'attiva', 'disattiva', 'on', 'off'].includes(command)) {
    if (args[0]) {
      let type = args[0].toLowerCase();
      const feat = aliasMap.get(type);
      if (!feat) return m.reply(`『 ❌ 』 Modulo *${type}* non trovato.`);

      if (feat.perm === PERM.sam && !isSam) return m.reply('『 ❌ 』 Accesso negato: Solo Blood.');
      if (feat.perm === PERM.OWNER && !isOwner && !isSam) return m.reply('『 ❌ 』 Accesso negato: Solo Owner.');
      if (feat.perm === PERM.ADMIN && m.isGroup && !(isAdmin || isOwner || isSam)) return m.reply('『 ❌ 』 Richiesti permessi Admin.');

      const target = feat.store === 'bot' ? bot : chat;
      target[feat.key] = isEnable;
      
      if (feat.key === 'ai' && !isEnable) bloodbot.resetHistory(m.chat);

      return m.reply(`*〘 📡 BLD-SYSTEM 〙*\n\nModulo: *${feat.name}*\nStato: *${isEnable ? 'ATTIVATO 🟢' : 'DISATTIVATO 🔴'}*`);
    }
  }

  // 2. RISPOSTA AUTOMATICA BLOODBOT (se modulo AI è ON)
  // Risponde se: modulo AI è attivo E (è una chat privata OPPURE il bot viene menzionato)
  const isMentioned = m.mentionedJid?.includes(botJid) || m.text?.includes(botJid.split('@')[0]);
  if (!command && chat.ai && m.text && !m.fromMe && (!m.isGroup || isMentioned)) {
    try {
      const textClean = m.text.replace(new RegExp(`@${botJid.split('@')[0]}`, 'gi'), '').trim();
      const reply = await bloodbot.generateReply({
        messageText: textClean || "Ciao Bloodbot",
        authorName: userName,
        chatName: m.isGroup ? m.chat : 'Privato',
        chatId: m.chat
      });
      if (reply) return conn.reply(m.chat, reply, m);
    } catch (e) {
      console.error('Errore Bloodbot:', e);
    }
  }

  // Se è un comando ma non è attiva/disattiva, non mostrare il menu (evita spam)
  if (command && !['enable', 'disable', 'attiva', 'disattiva', 'on', 'off'].includes(command)) return;

  // 3. COSTRUZIONE MENU VISIVO (se scrivi solo .attiva o .disattiva senza argomenti)
  const getStatus = (f) => (f.store === 'bot' ? bot[f.key] : chat[f.key]) ? '🟢' : '🔴';

  let menu = `┎━━━━━━━━━━━━━━━━━━━━┑
┃   ✧  𝐁𝐋𝐃 - 𝐌𝐀𝐒𝐓𝐄𝐑 𝐂𝐎𝐍𝐓𝐑𝐎𝐋  ✧   ┃
┖━━━━━━━━━━━━━━━━━━━━┙
┌────────────────────┐
  👤 𝚄𝚜𝚎𝚛: ${userName}
  📡 𝚂𝚝𝚊𝚝𝚞𝚜: 𝙾𝚗𝚕𝚒𝚗𝚎
└────────────────────┘

*〘 ɪɴsᴛʀᴜᴢɪᴏɴɪ ᴏᴘᴇʀᴀᴛɪᴠᴇ 〙*
> Attiva o disattiva i moduli:
*│ ➤* .attiva <nome>
*│ ➤* .disattiva <nome>

*┍━━━━━〔 🛡️ sɪᴄᴜʀᴇᴢﾞᴀ 〕━━━━━┑*\n`;

  const sicurezzaKeys = ['bestemmiometro', 'antidelete', 'antigore', 'modoadmin', 'antivoip', 'antiLink', 'antiLinkUni', 'antiLink2', 'antitrava', 'antinuke', 'antioneview', 'antispam', 'antisondaggi', 'antiparolacce', 'antiBot', 'antiBot2', 'antimedia', 'antitagall', 'antiporno'];
  featureRegistry.filter(f => sicurezzaKeys.includes(f.key)).forEach(f => {
    menu += `┇ ${getStatus(f)} ${f.name}\n┇ _${f.desc}_\n┇ ➤ *${f.key}*\n┇\n`;
  });

  menu += `*┕━━━━━━━──ׄ──ׅ──ׄ──━━━━━━━┙*

*┍━━━━━〔 🤖 ᴀᴜᴛᴏᴍᴀﾞɪᴏɴᴇ 〕━━━━━┑*\n`;

  const automazioneKeys = ['ai', 'vocali', 'reaction', 'autolevelup', 'welcome', 'goodbye', 'autotrascrizione', 'autotraduzione', 'rileva'];
  featureRegistry.filter(f => automazioneKeys.includes(f.key)).forEach(f => {
    menu += `┇ ${getStatus(f)} ${f.name}\n┇ _${f.desc}_\n┇ ➤ *${f.key}*\n┇\n`;
  });

  menu += `*┕━━━━━━━──ׅ──ׄ──ׅ──━━━━━━━┙*

*┍━━━━━〔 ⚙️ sɪsᴛᴇᴍᴀ ʙᴏᴛ 〕━━━━━┑*\n`;

  const sistemaKeys = ['antiprivato', 'soloe', 'multiprefix', 'jadibotmd', 'antispambot', 'autoread', 'anticall', 'registrazioni'];
  featureRegistry.filter(f => sistemaKeys.includes(f.key)).forEach(f => {
    menu += `┇ ${getStatus(f)} ${f.name}\n┇ _${f.desc}_\n┇ ➤ *${f.key}*\n┇\n`;
  });

  menu += `*┕━━━━━━━──ׄ──ׅ──ׄ──━━━━━━━┙*\n\n_ʙʟᴅ-ʙᴏᴛ sᴇᴄᴜʀɪᴛʏ ɪɴᴛᴇʀꜰᴀᴄᴇ_`;

  let thumb;
  const imagePath = path.join(process.cwd(), 'menu-sicurezza.jpeg');
  if (fs.existsSync(imagePath)) {
    thumb = fs.readFileSync(imagePath);
  } else {
    thumb = Buffer.alloc(0);
  }

  await conn.sendMessage(m.chat, {
    text: menu,
    contextInfo: {
      externalAdReply: {
        title: "𝐁𝐋𝐃 - 𝐌𝐀𝐒𝐓𝐄𝐑 𝐂𝐎𝐍𝐓𝐑𝐎𝐋",
        body: "Terminal Console v3.1",
        mediaType: 1,
        renderLargerThumbnail: true,
        thumbnail: thumb,
        sourceUrl: 'https://github.com'
      }
    }
  }, { quoted: m });
};

handler.help = ['attiva', 'disattiva'];
handler.tags = ['main'];
handler.command = ['enable', 'disable', 'attiva', 'disattiva', 'on', 'off'];

export default handler;
