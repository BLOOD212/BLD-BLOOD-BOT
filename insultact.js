const playAgainButtons = (prefix) => [
    {
        buttonId: `${prefix}insultact`,
        buttonText: { displayText: '🤬 nautra pigghiata po culu!!' },
        type: 1
    }
];

let handler = async (m, { conn, usedPrefix, text }) => {
    // Controllo se è un gruppo
    if (!m.isGroup) return

    // Controllo se il bot è attivo per la chat (database)
    let gruppi = global.db.data.chats[m.chat]
    if (gruppi.spacobot === false) return

    // Gestione Cooldown (5 secondi)
    const cooldownKey = `insultact_${m.chat}`;
    const now = Date.now();
    const lastUse = global.cooldowns?.[cooldownKey] || 0;
    const cooldownTime = 5000;

    if (now - lastUse < cooldownTime) {
        const remaining = Math.ceil((cooldownTime - (now - lastUse)) / 1000);
        return m.reply(`⏳ Aspetta ${remaining}s, minchia npocu ri rispetto!`);
    }

    global.cooldowns = global.cooldowns || {};
    global.cooldowns[cooldownKey] = now;

    // Target dell'insulto
    let menzione = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text
    if (!menzione) throw 'Cu vo pigghiari po culu?'

    // Categorie di insulti catanesi
    const categorie = {
        pesanti: [
            "cunnutu tu to oma to opa da sucaminchi ri to soru e tutta a to razza",
            "figghiu ri setti sucaminchi si chiu lariu ra motti buttama",
            "speci ri cosu moncu, spakkiu sta scrivennu ca hai 40anni e ancora taratti i baddi"
        ],
        estetica: [
            "mammoriri si accussi lariu ca quannu nascisti u dutturi ti resi na pirata pi fariti tunnari intra",
            "mbare ma non taffrunti? pisi 600kila hai 40anni e ancora fai u lesu areri du telefunu ra fera",
            "hai chiu conna tu ca na pignata ri vaccareddi"
        ],
        varie: [
            "ancora sta parannu? ma quannu cia tagghi ri ncucchiari minchiati e tuoccuchi npocu",
            "pigghiari po culu a tia e comu pigghialla ndo culu, pi picca cridtiani",
            "insultarti in dialetto sarebbe uno spreco di tempo e un insulto verso il catanese ietta sangu",
            "maffruntu a pigghiariti po culu"
        ]
    };

    const keys = Object.keys(categorie);
    const randomCategory = keys[Math.floor(Math.random() * keys.length)];
    const lista = categorie[randomCategory];
    const insultoRandom = lista[Math.floor(Math.random() * lista.length)];

    const emojiCategoria = {
        pesanti: "🌋",
        estetica: "👹",
        varie: "🤌"
    };

    // Invio messaggio con bottoni e menzione
    await conn.sendMessage(m.chat, {
        text: `*${emojiCategoria[randomCategory]} INSULTO CATANESE ${randomCategory.toUpperCase()}* \n\n@${menzione.split`@`[0]} ${insultoRandom}`,
        buttons: playAgainButtons(usedPrefix),
        headerType: 1,
        mentions: [menzione]
    }, { quoted: m });
};

handler.help = ['insultact'];
handler.tags = ['giochi'];
handler.command = /^(insultact)$/i;
handler.group = true;

export default handler;
