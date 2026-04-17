// Database temporaneo in memoria (si svuota se riavvii la VPS)
const msgStorage = {};

let handler = m => m;

handler.before = async function (m, { conn }) {
    if (!m) return;
    
    const chat = m.chat;
    const msgId = m.id || m.key?.id;

    // 1. SALVATAGGIO: Se non è un messaggio di sistema, salvalo
    if (!m.message?.protocolMessage) {
        msgStorage[msgId] = m;
    }

    // 2. RECUPERO: Se arriva un comando di eliminazione
    if (m.message?.protocolMessage && m.message.protocolMessage.type === 0) {
        const deletedKey = m.message.protocolMessage.key;
        const savedMsg = msgStorage[deletedKey.id];

        if (savedMsg) {
            const user = deletedKey.participant || deletedKey.remoteJid;

            await conn.sendMessage(chat, { 
                text: `🚨 *ANTI-DELETE RILEVATO* 🚨\n\n@${user.split('@')[0]} aveva eliminato questo:`,
                mentions: [user]
            }, { quoted: savedMsg });

            // Inoltra il messaggio originale (testo, immagine, etc.)
            await conn.copyNForward(chat, savedMsg, true);

            // Pulisci la memoria per non intasare la RAM della VPS
            delete msgStorage[deletedKey.id];
        }
    }
    return true;
};

export default handler;
