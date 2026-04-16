// Database temporaneo (in produzione usa qualcosa come Lowdb o un JSON)
const msgStorage = {};

sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m.message) return;

    const chat = m.key.remoteJid;
    const msgId = m.key.id;

    // 1. SALVATAGGIO: Se non è un messaggio di sistema, salvalo
    if (!m.message.protocolMessage) {
        msgStorage[msgId] = m;
    }

    // 2. RECUPERO: Se arriva un comando di eliminazione (ProtocolMessage tipo 0)
    if (m.message.protocolMessage && m.message.protocolMessage.type === 0) {
        const deletedKey = m.message.protocolMessage.key;
        const savedMsg = msgStorage[deletedKey.id];

        if (savedMsg) {
            const user = deletedKey.participant || deletedKey.remoteJid;

            await sock.sendMessage(chat, { 
                text: `🚨 *ANTI-DELETE RILEVATO* 🚨\n\n@${user.split('@')[0]} aveva eliminato questo:`,
                mentions: [user]
            });

            // Inoltra il messaggio originale (testo, immagine, etc.)
            await sock.copyNForward(chat, savedMsg, true);

            // Pulisci la memoria
            delete msgStorage[deletedKey.id];
        }
    }
});