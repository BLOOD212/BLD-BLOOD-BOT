const playAgainButtons = (prefix) => [
    {
        buttonId: `${prefix}insultanp`, 
        buttonText: { displayText: '🤬 SFACCIMM, N’ATA VOTA!' },
        type: 1
    }
];

let handler = async (m, { conn, usedPrefix, text }) => {
    if (!m.isGroup) return

    let gruppi = global.db.data.chats[m.chat]
    if (gruppi.spacobot === false) return

    const cooldownKey = `insultanp_${m.chat}`;
    const now = Date.now();
    const lastUse = global.cooldowns?.[cooldownKey] || 0;
    const cooldownTime = 4000;

    if (now - lastUse < cooldownTime) {
        return 
    }

    global.cooldowns = global.cooldowns || {};
    global.cooldowns[cooldownKey] = now;

    let menzione = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text

    if (!menzione) {
        return m.reply('Tagga a nu piezz \'e fango o quota a coccheruno, sinnò chi cazz\' aggia insultà?')
    }

    const categorie = {
        CATTIVERIA_PURA: [
            "mamm\'t è na sbrinfia ca se ffa sburrà n\'faccia pure r\'e marrucchini r\'a ferrovia, bucchenà!",
            "si nu figl \'e na latrina, to patt\' è cornuto e to mamm\'t è na vavosa ca se venne p\'un\'euro \'o mercato!",
            "te n\'aggia ditta tante ca t\'aggia fà passà \'a voglia \'e nascere, piezz \'e rincoglionito e sfaccimm \'e rignante!",
            "si na mappina \'e mmerda, t\'avess\'a piglià n\'infarto m\'miezz \'a via a te e a tutta \'a razza toja!",
            "si na lota senza sango, tu, chillu scemo de patt\' e tutta a stirpe e sfaccimm a andò sî asciuto fuori!",
            "omm \'e mmerda, bucchin\' a strapazzo, si te sputo n\'faccia te ffa sulo ca bbuono, piezz \'e zuzzuso!",
            "mamm\'t se ffa sfunnà pur\'all\'ecocentro d\'a fognatura, si nu rutt\'e culo senza speranza!",
            "t\'avess\'a sfunnà e mazzate finché nun te scuorde pure comm\'azzo te chiamme, piezz \'e fetiento!"
        ],
        SCHIFEZZE_NAPOLETANE: [
            "tieni n\'addore \'e fessa r\'a nonna ca manco \'e mosche te s\'avvicinano, latrina mmerdosa!",
            "si talmente schifoso ca quann\'o patt\' t\'ha portato a ffa \'o rito e\' battesimo, o\' prevete t\'ha sputato \'nfacce!",
            "faje schifo pure a \'e scarrafune d\'a fognatura, tieni \'a faccia comm\'o pertuso r\'o cul\' \'e n\'asino!",
            "si nu scarto \'e mmerda, mamm\'t s\'abbuffa \'e cazz\' e tu stai ancora cca a rompere \'e palle!",
            "tieni n\'addore sotto e mmascelle ca pare ca ce fujuto nu topo muorto e putrefatto drent\', zelluso!",
            "si cchiù lario tu ca na seccia spetacchiata, tene o\' musso ca pare na scarpa vecchia r\'o mercato!",
            "quann\'e nato tu, l\'ostetrica ha jittato a te drent\'o rinfusi e ha crisciuto a placenta, piezz \'e cesso!",
            "faje schifo pur\'all\'anemale, tieni e diente ca sanno \'e mmerda secca e l\'uocchie ca ponno sulo chiagnere!"
        ],
        UMILIAZIONI_TOTALI: [
            "va’ jitt’o sango, tu e chi t'è mmuorto, si na mmerda ca cammina e nisciuno te vò bene!",
            "si cchiù cornuto \'e na sporta \'e purpetielli, a mugliereta se ffa sburrà r\'o vico sano!",
            "nun sî bbuono manco p'essere jittato mmiez'a via, manco \'e cane te pìsciano \'ncuollo, scaurato!",
            "si nu perdente, na schifezza r\'a natura, t\'avesser\'a appennere p\'e palle ncopp\'o Vesuvio!",
            "nun vale manco a sfaccimm ca to patt\' ha buttato chilla sera, sî sulo nu spreco \'e ossigeno!",
            "Inutile ca faje o\' sborone arret\' o\' telefono, si sulo nu poarazzo ca se mette a chiagnere pure si se scassa n\'unghia!",
            "A te t\'hanno cacciato a carci pur\'addò fann\'e carità, si l\'urdemo r\'e strunzi ncopp\'a terra!",
            "A mugliereta se cocca cu tutt\'o rione e tu stai ancora cca a ffa o\' guappo cartone, va scannate!"
        ]
    };

    const keys = Object.keys(categorie);
    const randomCategory = keys[Math.floor(Math.random() * keys.length)];
    const lista = categorie[randomCategory];
    const insultoRandom = lista[Math.floor(Math.random() * lista.length)];

    const emojiCategoria = {
        CATTIVERIA_PURA: "💀",
        SCHIFEZZE_NAPOLETANE: "🤮",
        UMILIAZIONI_TOTALI: "🔥"
    };

    await conn.sendMessage(m.chat, {
        text: `*${emojiCategoria[randomCategory]} SENTENZA: ${randomCategory.replace('_', ' ')}* \n\n@${menzione.split`@`[0]} ${insultoRandom}`,
        contextInfo: {
            mentionedJid: [menzione],
            forwardingScore: 999,
            isForwarded: true
        },
        buttons: playAgainButtons(usedPrefix),
        headerType: 1
    }, { quoted: m });
};

handler.help = ['insultanp'];
handler.tags = ['giochi'];
handler.command = /^(insultanp)$/i;
handler.group = true;

export default handler;
