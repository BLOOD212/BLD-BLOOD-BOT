const playAgainButtons = (prefix) => [
    {
        buttonId: `${prefix}insultarm`,
        buttonText: { displayText: '🤬 n\'antr\'andata de sganassoni!!' },
        type: 1
    }
];

let handler = async (m, { conn, usedPrefix, text }) => {
    if (!m.isGroup) return

    let gruppi = global.db.data.chats[m.chat]
    if (gruppi.spacobot === false) return

    const cooldownKey = `insultarm_${m.chat}`;
    const now = Date.now();
    const lastUse = global.cooldowns?.[cooldownKey] || 0;
    const cooldownTime = 5000;

    if (now - lastUse < cooldownTime) {
        const remaining = Math.ceil((cooldownTime - (now - lastUse)) / 1000);
        return m.reply(`⏳ Aspetta ${remaining}s, oh ma che stai a rota de brutto? Porta rispetto!`);
    }

    global.cooldowns = global.cooldowns || {};
    global.cooldowns[cooldownKey] = now;

    let menzione = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text
    if (!menzione) throw 'A chi dovemo pija pel culo?'

    const categorie = {
        pesanti: [
            "te si' n'accozzaglia de corna, ti, quer dritto de tu' padre, quella caciara de tu' madre e tutta la stirpe da andove vieni",
            "figlio de na mignotta fracica e stralunata, saresti da pija a carci in bocca finché nun t'allineo i denti col cervello",
            "sei na chiavica de omo, a parlà co' te me pare de buttà er fiato drento ar secchione dell'umido d'agosto",
            "ma vaffanculo te e chi nun t'o dice co' la mano arzata, sei n'infame e te meriteresti solo de sputà l'anima",
            "tu' madre raccoglie i carciofi cor culo e tu' padre se sbraca de tavernello nei cartoni, vatte a morì ammazzato da un treno",
            "vali meno de na caciotta bofonchiata e andata a male, te si' sfonnato de dignità, sei er vuoto cosmico"
        ],
        estetica: [
            "sei talmente brutto che quanno sei nato er dottore ha buttato la cicca per terra e ha cullato la monnezza",
            "ma nun te vergogni? Pari n'incidente stradale sur raccordo, peggio de na fratta sgarrupata cor tagliaerba rotto",
            "c'hai più corni te de na sporta de lumache a Campo de' Fiori, vatte a piantà le rape cor naso che t'aritrovi",
            "sei così cesso che pure i cani randagi se grattano le palle quanno passi, pari n'animale scuoiato male",
            "co' quella faccia da schiaffi che c'hai pari uscito da n'incendio e spento a zampate sur muso",
            "sei così secco e buttato via che pari campato a pane e veleno per topi, mettete du' piombi in tasca sennò te porta via er venticello"
        ],
        varie: [
            "Ancora stai a parlà? Ma vatte a buttà da un ponte e tasi, che quanno apri bocca pare che sona er mortorio de San Pietro",
            "Pijà pel culo a te è come buttà i sordi drento a la fontana de Trevi de spalle senza desideri, na perdita de tempo per poacci",
            "Insultarte in romano è n'insulto a la città eterna, vatte a magnà du' spaghi scondi e sparisci da la circolazione",
            "Me viè er vomito solo a guardarte da lontano, vatte a fa na lavanda gastrica col ddt",
            "C'hai meno educazione de n'asino drento a na chiesa, vatte a zappà la terra che è l'unica cosa che poi fa",
            "Inutile che fai er bullo dietro ar telefono, sei solo un poveraccio che piagne se se pesta er ditone sur comodino"
        ]
    };

    const keys = Object.keys(categorie);
    const randomCategory = keys[Math.floor(Math.random() * keys.length)];
    const lista = categorie[randomCategory];
    const insultoRandom = lista[Math.floor(Math.random() * lista.length)];

    const emojiCategoria = {
        pesanti: "🐺",
        estetica: "👹",
        varie: "🏛️"
    };

    await conn.sendMessage(m.chat, {
        text: `*${emojiCategoria[randomCategory]} INSULTO ROMANO ${randomCategory.toUpperCase()}* \n\n@${menzione.split`@`[0]} ${insultoRandom}`,
        buttons: playAgainButtons(usedPrefix),
        headerType: 1,
        mentions: [menzione]
    }, { quoted: m });
};

handler.help = ['insultarm'];
handler.tags = ['giochi'];
handler.command = /^(insultarm)$/i;
handler.group = true;

export default handler;
