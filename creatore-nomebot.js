let handler = async (m, { conn, text, usedPrefix, command, isOwner, isROwner }) => {
    if (!isOwner && !isROwner) return m.reply('❌ Solo il proprietario può usare questo comando!');
    if (!text) return m.reply(`✏️ Scrivi il nuovo nome del bot!\n\nEsempio:\n${usedPrefix + command} VareBot`);

    const newName = text.trim();
    const currentName = await conn.getName(conn.user.jid);

    if (newName === currentName) {
        return m.reply('⚠️ Il nome del bot è già questo.');
    }

    try {
        await conn.updateProfileName(newName);
        m.reply(`✅ Nome del bot cambiato con successo!\n\nNuovo nome: *${newName}*`);
    } catch (e) {
        console.error('Errore cambio nome:', e);
        if (e?.message?.includes('rate-limit') || e?.status === 429) {
            return m.reply('⏳ Hai cambiato il nome troppo di recente. Aspetta un po\' prima di riprovare.');
        }
        m.reply('❌ Errore nel cambiare il nome del bot. Riprova più tardi.');
    }
};

handler.help = ['nomebot'];
handler.tags = ['creatore'];
handler.command = ['setbotname', 'nomebot'];
handler.rowner = true;

export default handler;