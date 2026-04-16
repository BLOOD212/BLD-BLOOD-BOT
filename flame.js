// Plugin by deadly

let handler = async (m, { conn, usedPrefix, command }) => {
  // 1. Controllo se è un gruppo
  if (!m.isGroup) return m.reply('⚠️ Le fiamme ardono solo nei gruppi!');

  // 2. Identificazione vittima (Tag o Risposta)
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null);
  
  if (!who) {
    return m.reply(`🔥 *FLAME ACTIVATED* 🔥\n\nTaggala persona o rispondi a un suo messaggio per iniziare!\n\nEsempio: ${usedPrefix + command} @utente`);
  }

  // 3. Impedisce di flammare il bot
  const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
  if (who === botNumber) return m.reply('😏 Non puoi flammare me. Finiresti arrosto prima di subito!');

  // 4. Setup nomi e messaggi
  const victimName = '@' + who.split('@')[0];
  const attackerName = '@' + m.sender.split('@')[0];

  const startMsg = `
╔══════════════════════╗
   🔥 *FLAME WAR INIZIATA* 🔥
╚══════════════════════╝

👊 *Sfidante:* ${attackerName}
🎯 *Vittima:* ${victimName}

⏱️ *Durata:* 3 minuti
💬 *Il bot attacca per primo!*`;

  await conn.sendMessage(m.chat, {
    text: startMsg,
    mentions: [m.sender, who]
  }, { quoted: m });

  // --- LOGICA DELLA BATTAGLIA ---
  let flameCount = 0;
  let battleActive = true;

  const generateFlame = (target) => {
    const flames = [
      `🔊 ${target}, scrivi così piano che i tuoi messaggi arrivano via fax?`,
      `🎭 ${target}, sembri un bug di sistema... inutile e fastidioso!`,
      `📱 ${target}, la tua sfiga prende sempre il 5G, complimenti!`,
      `⚡ ${target}, se la stupidità fosse energia, saresti una centrale elettrica!`,
      `🤡 ${target}, il circo ha chiamato, dicono che manchi solo tu!`,
      `⚰️ ${target}, il tuo senso dell'umorismo è morto e sepolto!`,
      `📡 ${target}, il segnale è arrivato, ma il tuo cervello è ancora in roaming?`,
      `💅 ${target}, anche i sassi hanno conversazioni più interessanti delle tue!`,
      `📉 ${target}, la tua dignità sta scendendo più velocemente delle azioni di una banca in crisi!`,
      `🧟 ${target}, ti hanno mai detto che hai il carisma di un router spento?`
    ];
    return flames[Math.floor(Math.random() * flames.length)];
  };

  // Funzione che gestisce le risposte della vittima
  const battleHandler = async (chatUpdate) => {
    if (!battleActive) return;
    const m2 = chatUpdate.messages[0];
    if (!m2.message || m2.key.fromMe) return;

    const sender = m2.key.participant || m2.key.remoteJid;
    
    // Se la vittima scrive nel gruppo, il bot risponde
    if (sender === who && m2.key.remoteJid === m.chat) {
      flameCount++;
      const reply = generateFlame(victimName);
      
      await new Promise(res => setTimeout(res, 1000)); // Piccolo delay
      await conn.sendMessage(m.chat, { text: reply, mentions: [who] }, { quoted: m2 });
    }
  };

  // Attiva il listener per intercettare i messaggi
  conn.ev.on('messages.upsert', battleHandler);

  // Primo attacco automatico dopo 2 secondi
  setTimeout(() => {
    if (battleActive) conn.sendMessage(m.chat, { text: generateFlame(victimName), mentions: [who] });
  }, 2000);

  // Timer di chiusura (3 minuti)
  setTimeout(async () => {
    if (battleActive) {
      battleActive = false;
      conn.ev.off('messages.upsert', battleHandler); // Rimuove il listener per non sprecare RAM
      
      const endMsg = `
╔══════════════════════╗
   ⏱️ *TEMPO SCADUTO!* ⏱️
╚══════════════════════╝
🥊 Il bot vince per KO tecnico!
📊 Insulti totali scagliati: ${flameCount + 1}

*Vuoi scappare?* Corri per 2,5km (ovvero **3.750 passi**)!`;
      
      await conn.sendMessage(m.chat, { text: endMsg, mentions: [who] });
    }
  }, 180000);
};

handler.help = ['flame'];
handler.tags = ['giochi'];
handler.command = /^(flame)$/i;
handler.group = true;

export default handler;
