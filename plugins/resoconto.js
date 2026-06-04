function formatNumber(number = 0) {
  return Number(number || 0)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

let handler = async (m, { conn, text, usedPrefix, command }) => {

  // ===== RESOCONTO UTENTI =====
  if (/^resoconto$/i.test(command)) {
    let chatId = m.chat
    let isWeekly = /settiman|settimana/i.test(text || '')
    let dati = isWeekly
      ? global.db.data.chats[chatId]?.statsSettimanali
      : global.db.data.chats[chatId]?.statsGiornaliere

    if (!dati || dati.totali === 0) {
      return m.reply(isWeekly
        ? `╮(￣_￣)╭ Nessun messaggio registrato questa settimana.`
        : `╮(￣_￣)╭ Nessun messaggio registrato oggi.`)
    }

    let membriAttivi = Object.keys(dati.utenti).length

    let classifica = Object.entries(dati.utenti || {})
      .sort(([, a], [, b]) => b.conteggio - a.conteggio)
      .slice(0, 5)

    let dataOggi

    if (isWeekly) {
      let now = new Date()
      let day = now.getDay() || 7
      let start = new Date(now)
      start.setDate(now.getDate() - day + 1)
      let end = new Date(start)
      end.setDate(start.getDate() + 6)

      dataOggi = `${start.toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric'})} ➔ ${end.toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric'})}`
    } else {
      dataOggi = new Date().toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric'})
    }

    let report = `╔════════════════════╗\n`
    report += `║   🏆 *${isWeekly ? 'WEEKLY REPORT' : 'DAILY REPORT'}* ║\n`
    report += `╚════════════════════╝\n\n`
    report += `📅 *Periodo:* ${dataOggi}\n\n`
    report += `┌───⊷ *STATISTICHE* ⊶\n`
    report += `▢ 💬 *Messaggi:* ${formatNumber(dati.totali)}\n`
    report += `▢ 👥 *Utenti:* ${formatNumber(membriAttivi)}\n`
    report += `▢ 📸 *Multimedia:* ${formatNumber(dati.media)}\n`
    report += `└───────────────\n\n`
    report += `┌───⊷ *TOP NERDS* ⊶\n`

    let mentions = []
    const medaglie = ['🥇','🥈','🥉','4️⃣','5️⃣']

    classifica.forEach(([jid, u], i) => {
      report += `│ ${medaglie[i]} @${jid.split('@')[0]}\n`
      report += `│ ➔ ${formatNumber(u.conteggio)} messaggi\n`
      if (i < classifica.length - 1) report += `│\n`
      mentions.push(jid)
    })

    report += `└───────────────\n\n`
    report += `✨ *Grazie per essere attivi!* ✨`

    return conn.sendMessage(chatId, { text: report, mentions }, { quoted: m })
  }

  // ===== TOP GRUPPI =====
  if (/^topgruppi$/i.test(command)) {
    let isWeekly = /settiman|settimana/i.test(text || '');
    let dati = isWeekly
      ? global.db.data.statsGruppiSettimanali
      : global.db.data.statsGruppi;

    if (!dati || dati.totali === 0) {
      return m.reply(
        isWeekly
          ? "╮(￣_￣)╭ Nessun messaggio registrato questa settimana."
          : "╮(￣_￣)╭ Nessun messaggio registrato oggi."
      );
    }

    let gruppiAttivi = Object.keys(dati.gruppi).length;

    let classifica = Object.entries(dati.gruppi)
      .sort(([, a], [, b]) => b.conteggio - a.conteggio)
      .slice(0, 5);

    let gruppi = {};
    try { gruppi = await conn.groupFetchAllParticipating(); } catch {}

    let dataStr = isWeekly
      ? (() => {
          let now = new Date();
          let day = now.getDay() || 7;
          let start = new Date(now);
          start.setDate(now.getDate() - day + 1);
          let end = new Date(start);
          end.setDate(start.getDate() + 6);
          return `${start.toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric'})} ➔ ${end.toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric'})}`;
        })()
      : new Date().toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric'});

    let report = `╔════════════════════╗\n`
    report += `║  🌐 *GLOBAL REPORT* (${isWeekly ? 'W' : 'D'})  ║\n`
    report += `╚════════════════════╝\n\n`
    report += `📅 *Data:* ${dataStr}\n\n`
    report += `┌───⊷ *NETWORK* ⊶\n`
    report += `▢ 💬 *Messaggi Totali:* ${formatNumber(dati.totali)}\n`
    report += `▢ 👥 *Gruppi Attivi:* ${formatNumber(gruppiAttivi)}\n`
    report += `└───────────────\n\n`
    report += `┌───⊷ *TOP GRUPPI* ⊶\n`;

    const medaglie = ['🥇','🥈','🥉','4️⃣','5️⃣'];
    for (let i = 0; i < classifica.length; i++) {
      let [gid,g] = classifica[i];
      let nome = gruppi[gid]?.subject || "Gruppo sconosciuto";
      let membriAttivi = Object.keys(g.utenti).length;

      report += `│ ${medaglie[i]} *${nome}*\n`;
      report += `│ ➔ 💬 ${formatNumber(g.conteggio)} | 👥 ${formatNumber(membriAttivi)} | 📸 ${formatNumber(g.media)}\n`;
      if (i < classifica.length - 1) report += `│\n`
    }

    report += `└───────────────\n\n`
    report += `_Usa i bottoni qui sotto per navigare_`;

    return conn.sendMessage(m.chat, {
      text: report,
      buttons: [
        { buttonId: `${usedPrefix}resoconto`, buttonText: { displayText: '🏆 Top Utenti' }, type: 1 },
        { buttonId: `${usedPrefix}topgruppi settimana`, buttonText: { displayText: '📅 Top Settimanale' }, type: 1 },
        { buttonId: `${usedPrefix}groupstats`, buttonText: { displayText: '📊 Questo gruppo' }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m });
  }
};


// ===== BEFORE UNIFICATO =====
handler.before = async function (m) {
  if (!m.chat || m.isBaileys || !m.isGroup) return

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}

  if (!global.db.data.chats[m.chat].statsGiornaliere) {
    global.db.data.chats[m.chat].statsGiornaliere = {
      totali: 0, media: 0, utenti: {}, attiviOggi: 0,
      data: new Date().toLocaleDateString('it-IT')
    }
  }

  if (!global.db.data.chats[m.chat].statsSettimanali) {
    let now = new Date()
    let year = now.getFullYear()
    let firstJan = new Date(year, 0, 1)
    let diffDays = Math.floor((now - firstJan) / 86400000)
    let week = Math.ceil((diffDays + firstJan.getDay() + 1) / 7)

    global.db.data.chats[m.chat].statsSettimanali = {
      totali: 0, media: 0, utenti: {}, attiviSettimana: 0,
      settimana: `${year}-W${String(week).padStart(2, '0')}`
    }
  }

  if (!global.db.data.statsGruppi) {
    global.db.data.statsGruppi = { totali:0, media:0, gruppi:{}, attiviOggi:0 }
  }

  if (!global.db.data.statsGruppiSettimanali) {
    global.db.data.statsGruppiSettimanali = { totali:0, media:0, gruppi:{}, attiviSettimana:0 }
  }

  let stats = global.db.data.chats[m.chat].statsGiornaliere
  let statsWeek = global.db.data.chats[m.chat].statsSettimanali
  let gStats = global.db.data.statsGruppi
  let gWeek = global.db.data.statsGruppiSettimanali

  stats.totali++
  if (!stats.utenti[m.sender]) stats.utenti[m.sender] = { conteggio:0, media:0 }
  stats.utenti[m.sender].conteggio++
  stats.attiviOggi = Object.keys(stats.utenti).length

  statsWeek.totali++
  if (!statsWeek.utenti[m.sender]) statsWeek.utenti[m.sender] = { conteggio:0, media:0 }
  statsWeek.utenti[m.sender].conteggio++
  statsWeek.attiviSettimana = Object.keys(statsWeek.utenti).length

  gStats.totali++
  if (!gStats.gruppi[m.chat]) gStats.gruppi[m.chat] = { conteggio:0, media:0, utenti:{} }
  gStats.gruppi[m.chat].conteggio++
  if (!gStats.gruppi[m.chat].utenti[m.sender]) gStats.gruppi[m.chat].utenti[m.sender] = { conteggio:0, media:0 }
  gStats.gruppi[m.chat].utenti[m.sender].conteggio++
  gStats.attiviOggi = Object.keys(gStats.gruppi).length

  gWeek.totali++
  if (!gWeek.gruppi[m.chat]) gWeek.gruppi[m.chat] = { conteggio:0, media:0, utenti:{} }
  gWeek.gruppi[m.chat].conteggio++
  if (!gWeek.gruppi[m.chat].utenti[m.sender]) gWeek.gruppi[m.chat].utenti[m.sender] = { conteggio:0, media:0 }
  gWeek.gruppi[m.chat].utenti[m.sender].conteggio++
  gWeek.attiviSettimana = Object.keys(gWeek.gruppi).length

  const isMedia = ['imageMessage','videoMessage','audioMessage','stickerMessage','documentMessage'].includes(m.mtype)
  if (isMedia) {
    stats.media++; statsWeek.media++
    gStats.media++; gWeek.media++
  }
};


// ===== RESET + REPORT =====
let isResetting = false;

setInterval(async () => {
  let now = new Date();
  let ora = now.getHours();
  let minuti = now.getMinutes();
  let giorno = now.getDay();

  if (ora === 0 && minuti === 0 && !isResetting) {
    isResetting = true;

    let chats = global.db.data.chats || {};
    let gruppiStats = global.db.data.statsGruppi || {};
    let gruppiWeekStats = global.db.data.statsGruppiSettimanali || {};

    // ===============================
    // 📊 REPORT GIORNALIERO (UTENTI)
    // ===============================
    for (let gid in chats) {
      let dati = chats[gid]?.statsGiornaliere;
      if (!dati || dati.totali === 0) continue;

      let classifica = Object.entries(dati.utenti || {})
        .sort(([, a], [, b]) => b.conteggio - a.conteggio)
        .slice(0, 3);

      if (!classifica.length) continue;

      let ieri = new Date(Date.now() - 86400000)
        .toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric'});

      let report = `╔════════════════════╗\n`
      report += `║   🎉 *FINAL DAILY REPORT* ║\n`
      report += `╚════════════════════╝\n\n`
      report += `📅 *Ieri:* ${ieri}\n\n`
      report += `┌───⊷ *STATISTICHE* ⊶\n`
      report += `▢ 💬 *Messaggi:* ${formatNumber(dati.totali)}\n`
      report += `▢ 👥 *Attivi:* ${formatNumber(dati.attiviOggi)}\n`
      report += `▢ 📸 *Media:* ${formatNumber(dati.media)}\n`
      report += `└───────────────\n\n`
      report += `┌───⊷ *PODIO* ⊶\n`

      const medaglie = ['🥇','🥈','🥉'];
      const premi = [1000, 500, 250];
      let mentions = [];

      classifica.forEach(([jid, u], i) => {
        mentions.push(jid);

        // --- AGGIUNTA EURO ---
        if (!global.db.data.users[jid]) global.db.data.users[jid] = {};
        let user = global.db.data.users[jid];
        let premio = premi[i];
        user.euro = (Number(user.euro) || 0) + premio;
        // ---------------------

        report += `│ ${medaglie[i]} @${jid.split('@')[0]}\n`;
        report += `│ ✨ ${formatNumber(u.conteggio)} msg ➔ 💰 +${premio}€\n`;
        if (i < classifica.length - 1) report += `│\n`
      });

      report += `└───────────────\n\n`
      report += `_Le statistiche sono state resettate._`;

      try {
        await global.conn.sendMessage(gid, { text: report, mentions });
      } catch (e) {
        console.error(`Errore utenti ${gid}:`, e);
      }

      chats[gid].statsGiornaliere = {
        totali: 0,
        media: 0,
        utenti: {},
        attiviOggi: 0,
        data: new Date().toLocaleDateString('it-IT')
      };
    }

    // ===============================
    // 📊 REPORT GIORNALIERO (GRUPPI)
    // ===============================
    if (gruppiStats.totali > 0) {
      let classifica = Object.entries(gruppiStats.gruppi || {})
        .sort(([, a], [, b]) => b.conteggio - a.conteggio)
        .slice(0, 3);

      let gruppi = {};
      try { gruppi = await global.conn.groupFetchAllParticipating(); } catch {}

      let ieri = new Date(Date.now() - 86400000)
        .toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric'});

      let report = `╔════════════════════╗\n`
      report += `║   🏆 *PODIO DEI GRUPPI* ║\n`
      report += `╚════════════════════╝\n\n`
      report += `📅 *Ieri:* ${ieri}\n\n`
      report += `┌───⊷ *TOTALI* ⊶\n`
      report += `▢ 💬 *Messaggi:* ${formatNumber(gruppiStats.totali)}\n`
      report += `▢ 👥 *Gruppi:* ${formatNumber(gruppiStats.attiviOggi)}\n`
      report += `└───────────────\n\n`
      report += `┌───⊷ *TOP 3* ⊶\n`;

      const medaglie = ['🥇','🥈','🥉'];

      classifica.forEach(([gid, g], i) => {
        let nome = gruppi[gid]?.subject || "Gruppo sconosciuto";
        let membri = Object.keys(g?.utenti || {}).length || 0;

        report += `│ ${medaglie[i]} *${nome}*\n`;
        report += `│ ➔ ${formatNumber(g?.conteggio || 0)} msg | ${formatNumber(membri)} attivi\n`;
        if (i < classifica.length - 1) report += `│\n`
      });

      report += `└───────────────\n\n`
      report += `_Reset globale completato._`;

      for (let gid in gruppiStats.gruppi) {
        if (!gid.endsWith('@g.us')) continue;
        try {
          await global.conn.sendMessage(gid, { text: report });
        } catch (e) {
          console.error(`Errore gruppi ${gid}:`, e);
        }
      }

      global.db.data.statsGruppi = {
        totali: 0,
        media: 0,
        gruppi: {},
        attiviOggi: 0,
        data: new Date().toLocaleDateString('it-IT')
      };
    }

    // ===============================
    // 📅 SETTIMANALE (LUNEDÌ)
    // ===============================
    if (giorno === 1) {

      // UTENTI
      for (let gid in chats) {
        let dati = chats[gid]?.statsSettimanali;
        if (!dati || dati.totali === 0) continue;

        let classifica = Object.entries(dati.utenti || {})
          .sort(([, a], [, b]) => b.conteggio - a.conteggio)
          .slice(0, 5);

        if (!classifica.length) continue;

        let ref = new Date(Date.now() - 7 * 86400000);
        let day = ref.getDay() || 7;
        let start = new Date(ref); start.setDate(ref.getDate() - day + 1);
        let end = new Date(start); end.setDate(start.getDate() + 6);

        let settimana = `${start.toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric'})} ➔ ${end.toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric'})}`;

        let report = `╔════════════════════╗\n`
        report += `║  🗓️ *REPORT SETTIMANALE* ║\n`
        report += `╚════════════════════╝\n\n`
        report += `📅 ${settimana}\n\n`
        report += `┌───⊷ *DATI SETTIMANA* ⊶\n`
        report += `▢ 💬 *Totali:* ${formatNumber(dati.totali)}\n`
        report += `▢ 👥 *Utenti:* ${formatNumber(dati.attiviSettimana)}\n`
        report += `▢ 📸 *Media:* ${formatNumber(dati.media)}\n`
        report += `└───────────────\n\n`
        report += `┌───⊷ *TOP NERDS* ⊶\n`;

        const medaglie = ['🥇','🥈','🥉','4️⃣','5️⃣'];
        let mentions = [];

        classifica.forEach(([jid, u], i) => {
          mentions.push(jid);
          report += `│ ${medaglie[i]} @${jid.split('@')[0]}\n`;
          report += `│ ➔ ${formatNumber(u.conteggio)} messaggi\n`;
          if (i < classifica.length - 1) report += `│\n`
        });

        report += `└───────────────\n\n`
        report += `_Inizia una nuova settimana!_`;

        try {
          await global.conn.sendMessage(gid, { text: report, mentions });
        } catch {}

        chats[gid].statsSettimanali = {
            totali: 0, media: 0, utenti: {}, attiviSettimana: 0,
            settimana: new Date().toLocaleDateString('it-IT')
        };
      }

      // GRUPPI
      if (gruppiWeekStats.totali > 0) {
        let classifica = Object.entries(gruppiWeekStats.gruppi || {})
          .sort(([, a], [, b]) => b.conteggio - a.conteggio)
          .slice(0, 5);

        let gruppi = {};
        try { gruppi = await global.conn.groupFetchAllParticipating(); } catch {}

        let ref = new Date(Date.now() - 7 * 86400000);
        let day = ref.getDay() || 7;
        let start = new Date(ref); start.setDate(start.getDate() - day + 1);
        let end = new Date(start); end.setDate(start.getDate() + 6);

        let settimana = `${start.toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric'})} ➔ ${end.toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric'})}`;

        let report = `╔════════════════════╗\n`
        report += `║  🏛️ *NETWORK WEEKLY* ║\n`
        report += `╚════════════════════╝\n\n`
        report += `📅 ${settimana}\n\n`
        report += `┌───⊷ *STATISTICHE* ⊶\n`
        report += `▢ 💬 *Msg Totali:* ${formatNumber(gruppiWeekStats.totali)}\n`
        report += `▢ 👥 *Gruppi:* ${formatNumber(gruppiWeekStats.attiviSettimana)}\n`
        report += `└───────────────\n\n`
        report += `┌───⊷ *TOP GRUPPI* ⊶\n`;

        const medaglie = ['🥇','🥈','🥉','4️⃣','5️⃣'];

        classifica.forEach(([gid, g], i) => {
          let nome = gruppi[gid]?.subject || "Gruppo sconosciuto";
          let membri = Object.keys(g?.utenti || {}).length || 0;

          report += `│ ${medaglie[i]} *${nome}*\n`;
          report += `│ ➔ ${formatNumber(g?.conteggio || 0)} msg | ${formatNumber(membri)} attivi\n`;
          if (i < classifica.length - 1) report += `│\n`
        });

        report += `└───────────────\n\n`
        report += `_Classifica globale resettata._`;

        for (let gid in gruppiWeekStats.gruppi) {
          if (!gid.endsWith('@g.us')) continue;
          try {
            await global.conn.sendMessage(gid, { text: report });
          } catch {}
        }

        global.db.data.statsGruppiSettimanali = { totali:0, media:0, gruppi:{}, attiviSettimana:0 };
      }
    }

  } else if (minuti !== 0) {
    isResetting = false;
  }

}, 60000);

handler.help = ['resoconto','resoconto settimana','topgruppi','topgruppi settimana']
handler.tags = ['main']
handler.command = /^(resoconto|topgruppi)$/i
handler.group = true

export default handler
