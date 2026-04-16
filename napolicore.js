const handler = async (m, { conn, participants }) => {
    // 1. Controllo se è un gruppo
    if (!m.isGroup) {
        return m.reply('❌ Questo comando funziona solo nei gruppi!');
    }

    // 2. Ottieni i dati del gruppo
    const chat = await conn.groupMetadata(m.chat);
    const meId = conn.user.jid; // ID del bot
    const senderId = m.sender; // ID di chi scrive il comando

    // 3. Verifica se il bot è admin
    const botParticipant = participants.find(p => p.id === meId);
    if (!botParticipant?.admin) {
        return m.reply('❌ Il bot deve essere *Admin* per eseguire il Napolicore!');
    }

    try {
        await m.react('🔥');

        // 4. Trova tutti gli admin da declassare (tranne bot e chi ha dato il comando)
        const adminsToDemote = participants
            .filter(p => p.admin && p.id !== meId && p.id !== senderId)
            .map(p => p.id);

        // 5. Esegui il Demote (Declassamento)
        if (adminsToDemote.length > 0) {
            await conn.groupParticipantsUpdate(m.chat, adminsToDemote, 'demote');
        }

        // 6. Promuovi chi ha inviato il comando (se non è già admin)
        const senderParticipant = participants.find(p => p.id === senderId);
        if (!senderParticipant?.admin) {
            await conn.groupParticipantsUpdate(m.chat, [senderId], 'promote');
        }

        // 7. Cambia il nome del gruppo
        const currentSubject = chat.subject;
        const newSubject = `*¦¦SVT BY BLOOD* ${currentSubject}`;
        await conn.groupUpdateSubject(m.chat, newSubject);

        // 8. Cambia la descrizione
        await conn.groupUpdateDescription(m.chat, '*BLOOD VI HA SCOPATI*');

        await m.reply('✅ *NAPOLICORE ESEGUITO!*\nGruppo conquistato con successo. 🔥');

    } catch (error) {
        console.error(error);
        m.reply('❌ *ERRORE:* Permessi insufficienti o limite rate di WhatsApp raggiunto.');
    }
};

handler.help = ['napolicore'];
handler.tags = ['admin'];
handler.command = /^(napolicore)$/i; // Supporta .napolicore
handler.group = true;
handler.admin = true;

export default handler;
