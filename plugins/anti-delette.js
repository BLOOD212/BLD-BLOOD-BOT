// Database temporaneo in memoria (si svuota se riavvii la VPS)
const msgStorage = {};

let handler = m => m;

handler.before = async function (m, { conn }) {
    if (!m) return;

    const chat = m.chat;
    const msgId = m.id || m.key?.id;

    // --- AGGIUNTO: Controllo Database ---
    // Recupera i dati della chat dal database globale
    const chatSettings = global.db.data.chats[chat];
    
    // Se la chat non esiste nel database o l'antidelete è disattivato, 
    // salviamo comunque il messaggio per sicurezza ma non eseguiamo il recupero
    const isAntideleteEnabled = chatSettings?.antidelete;
    // -------------------------------------

    // 1. SALVATAGGIO: Salviamo il messaggio in RAM per poterlo recuperare dopo
    if (!m.message?.protocolMessage) {
        msgStorage[msgId] = m;
        
        // Pulizia automatica della RAM: cancella il messaggio dalla memoria dopo 1 ora
        setTimeout(() => {
            if (msgStorage[msgId]) delete msgStorage[msgId];
        }, 3600000);
    }

    // 2. RECUPERO: Se arriva un comando di eliminazione
    if (m.message?.protocolMessage && m.message.protocolMessage.type === 0) {
        // Se l'antidelete è spento nel menu, ci fermiamo qui e non mandiamo nulla
        if (!isAntideleteEnabled) return true;

        const deletedKey = m.message.protocolMessage.key;
        const savedMsg = msgStorage[deletedKey.id];

        if (savedMsg) {
            const user = deletedKey.participant || deletedKey.remoteJid;

            await conn.sendMessage(chat, { 
                text: `🚨 *ANTI-DELETE RILEVATO* 🚨\n\n@${user.split('@')[0]} aveva eliminato questo:`,
                mentions: [user]
            }, { quoted: savedMsg });

            // Inoltra il messaggio originale
            await conn.copyNForward(chat, savedMsg, true);

            // Pulisci la memoria
            delete msgStorage[deletedKey.id];
        }
    }
    return true;
};

export default handler;
