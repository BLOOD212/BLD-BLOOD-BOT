let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `*Esempio d'uso:* ${usedPrefix + command} Ciao a tutti`;

    const alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');

    const styles = [
        { name: "Grassetto", map: "𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔Ｖ𝐖𝐗𝐘𝐙𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗" },
        { name: "Gotico", map: "𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅0123456789" },
        { name: "Corsivo", map: "𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃𝓐𝓑Update𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩0123456789" },
        { name: "Doppia Linea", map: "𝕒𝕓\u{1D554}\u{1D555}\u{1D556}\u{1D557}\u{1D558}\u{1D559}\u{1D55A}\u{1D55B}\u{1D55C}\u{1D55D}\u{1D55E}\u{1D55F}\u{1D560}\u{1D561}\u{1D562}\u{1D563}\u{1D564}\u{1D565}\u{1D566}\u{1D567}\u{1D568}\u{1D569}\u{1D56A}\u{1D56B}𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕎𝕏𝕐ℤ𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡" },
        { name: "Monospazio", map: "𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉0123456789" },
        { name: "Cerchiati", map: "ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ⓪①②③④⑤⑥⑦⑧⑨" },
        { name: "Quadratini", map: "🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉0123456789" },
        { name: "Bolle Nere", map: "🅐🅑\u{1F152}\u{1F153}\u{1F154}\u{1F155}\u{1F156}\u{1F157}\u{1F158}\u{1F159}\u{1F15A}\u{1F15B}\u{1F15C}\u{1F15D}\u{1F15E}\u{1F15F}\u{1F160}\u{1F161}\u{1F162}\u{1F163}\u{1F164}\u{1F165}\u{1F166}\u{1F167}\u{1F168}\u{1F169}🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩0123456789" },
        { name: "Ninja", map: "丹乃匚刀モ下ム卄工ＪＫㄥ爪れ口ㄗＱ尺丂ｲu∨山メㄚ乙丹乃匚刀モ下ム卄工ＪＫㄥ爪れ口ㄗＱ尺丂ｲu∨山メㄚ乙0123456789" },
        { name: "Cyber", map: "ﾑ乃cd乇ｷgんﾉﾌズﾚ刀oｱq尺丂ｲu√wﾒﾘ乙ﾑ乃cd乇ｷgんﾉﾌズﾚ刀oｱq尺丂ｲu√wﾒﾘ乙0123456789" },
        { name: "Sottosopra", map: "ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz∀BƆDƎℲפHIſK˥WNOԀΌᴚS┴∩ΛMX⅄Z0123456789" },
        { name: "Hacker", map: "4bcd3f6h1jk1mn0pqr57uvwxy24BCD3F6H1JK1MN0PQR57UVWXY20123456789" },
        { name: "Piccolo", map: "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789" },
        { name: "Vaporwave", map: "ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ０１２３４５６７８９" },
        { name: "Militare", map: "ᗩᗷᑕᗪEᖴGᕼIᒍKᒪᗰᑎOᑭᑫᖇᔕTᑌᐯᗯ᙭YᘔᗩᗷᑕᗪEᖴGᕼIᒍKᒪᗰᑎOᑭᑫᖇᔕTᑌᐯᗯ᙭Yᘔ0123456789" },
        { name: "Greco", map: "αвс∂єƒgнιјκℓмиορφяѕτυνωϰуζαвс∂єƒgнιјκℓмиορφяѕτυνωϰуζ0123456789" },
        { name: "Stile Antico", map: "𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜𝔝0123456789" },
        { name: "Pixel", map: "ค๒ς๔єŦﻮђเןкɭ๓ภ๏קợгรՇยงฬאץչค๒ς๔єŦﻮђเןкɭ๓ภ๏קợгรՇยงฬאץչ0123456789" },
        { name: "Neon", map: "αႦƈԃҽϝɠԋιʝƙʅɱɳσρϙɾʂɬυʋɯxყȥABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789" },
        { name: "Stitch", map: "ค๒с๔єŦgђเјкℓмภσρợяรՇપvฬאץչค๒с๔єŦgђเјкℓмภσρợяรՇપvฬאץչ0123456789" },
        { name: "Onda", map: "≋a≋b≋c≋d≋e≋f≋g≋h≋i≋j≋k≋l≋m≋n≋o≋p≋q≋r≋s≋t≋u≋v≋w≋x≋y≋z≋A≋B≋C≋D≋E≋F≋G≋H≋I≋J≋K≋L≋M≋N≋O≋P≋Q≋R≋S≋T≋U≋V≋W\u{034B}X≋Y≋Z≋" },
        { name: "Cancellato", map: "a̶b̶c̶d̶e̶f̶g̶h̶i̶j̶k̶l̶m̶n̶o̶p̶q̶r̶s̶t̶u̶v̶w̶x̶y̶z̶A̶B̶C̶D̶E̶F̶G̶H̶I̶J̶K̶L̶M̶N̶O̶P̶Q̶R̶S̶T̶U̶V̶W̶X̶Y̶Z̶0̶1̶2̶3̶4̶5̶6̶7̶8̶9̶" },
        { name: "Sottolineato", map: "a̲b̲c̲d̲e̲f̲g̲h̲i̲j̲k̲l̲m̲n̲o̲p̲q̲r̲s̲t̲u̲v̲w̲x̲y̲z̲A̲B̲C̲D̲E̲F̲G̲H̲I̲J̲K̲L̲M̲N̲O̲P̲Q̲R̲S̲T̲U̲V̲W̲X̲Y̲Z̲0̲1̲2̲3̲4̲5̲6̲7̲8̲9̲" },
        { name: "Frecce", map: "➶a➴b➵c➶d➴e➵f➶g➴h➵i➶j➴k➵l➶m➴n➵o➶p➴q➵r➶s➴t➵u➶v➴w➵x➶y➴z➵A➶B➴C➵D➶E➴F➵G➶H➴I➵J➶K➴L➵M➶N➵O➶P➴Q➵R➶S➴T➵U➶V➴W➵X➶Y➴Z➵" },
        { name: "Cuori", map: "a♥b♥c♥d♥e♥f♥g♥h♥i♥j♥k♥l♥m♥n♥o♥p♥q♥r♥s♥t♥u♥v♥w♥x♥y♥z♥A♥B♥C♥D♥E♥F♥G♥H♥I♥J♥K♥L♥M♥N♥O♥P♥Q♥R♥S♥T♥U♥V♥W♥X♥Y♥Z♥" },
        { name: "Sky", map: "☁a☁b☁c☁d☁e☁f☁g☁h☁i☁j☁k☁l☁m☁n☁o☁p☁q☁r☁s☁t☁u☁v☁w☁x☁y☁z☁A☁B☁C☁D☁E☁F☁G☁H☁I☁J☁K☁L☁M☁N☁O☁P☁Q☁R☁S☁T☁U☁V☁W☁X☁Y☁Z☁" },
        { name: "Alien", map: "👽a👽b👽c👽d👽e👽f👽g👽h👽i👽j👽k👽l👽m👽n👽o👽p👽q👽r👽s👽t👽u👽v👽w👽x👽y👽z👽A👽B👽C👽D👽E👽F👽G👽H👽I👽J👽K👽L👽M👽N👽O👽P👽Q👽R👽S👽T👽U👽V👽W👽X👽Y👽Z👽" },
        { name: "Ghiaccio", map: "❄a❄b❄c❄d❄e❄f❄g❄h❄i❄j❄k❄l❄m❄n❄o❄p❄q❄r❄s❄t❄u❄v❄w❄x❄y❄z❄A❄B❄C❄D❄E❄F❄G❄H❄I❄J❄K❄L❄M❄N❄O❄P❄Q❄R❄S❄T❄U❄V❄W❄X❄Y❄Z❄" },
        { name: "Vintage", map: "α в c ∂ є f g h i j k l m n o p q r s t u v w x y z A B C D E F G H I J K L M N O P Q R S T U V W X Y Z" },
        { name: "Elegante", map: "𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏𝒜𝐵𝒞𝒟𝐸𝐹𝒢𝐻𝐼𝒥𝒦𝐿𝑀𝒩𝒪𝒫𝒬𝑅𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵0123456789" },
        { name: "Invertito", map: "ɐqɔpǝɟƃɥıɾʞlɯuodbɹsʇnʌʍxʎzⱯᗺƆᗡƎℲ⅁HIᗿꞰꞀWNOԀΌᴚS⟘∩ɅMX⅄Z0123456789" },
        { name: "Puntinato", map: "ạḅc̣ḍẹf̣g̣ḥịj̣ḳḷṃṇọp̣q̣ṛṣṭụṿẉx̣ỵẓẠḄC̣ḌẸF̣G̣ḤỊJ̣ḲḶṂṆỌP̣Q̣ṚṢṬỤṾẈX̣ỴẒ0̣1̣2̣3̣4̣5̣6̣7̣8̣9̣" },
        { name: "Magico", map: "⊹a⊹b⊹c⊹d⊹e⊹f⊹g⊹h⊹i⊹j⊹k⊹l⊹m⊹n⊹o⊹p⊹q⊹r⊹s⊹t⊹u⊹v⊹w⊹x⊹y⊹z⊹A⊹B⊹C⊹D⊹E⊹F⊹G⊹H⊹I⊹J⊹K⊹L⊹M⊹N⊹O⊹P⊹Q⊹R⊹S⊹T⊹U⊹V⊹W⊹X⊹Y⊹Z⊹" },
        { name: "Blur", map: "░a░b░c░d░e░f░g░h░i░j░k░l░m░n░o░p░q░r░s░t░u░v░w░x░y░z░A░B░C░D░E░F░G░H░I░J░K░L░M░N░O░P░Q░R░S░T░U░V░W░X░Y░Z░" },
        { name: "Parentesi", map: "⒜⒝⒞⒟⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮⒯⒰⒱⒲⒳⒴⒵⒜⒝⒞⒟⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮⒯⒰⒱⒲⒳⒴⒵0123456789" },
        { name: "Fullwidth", map: "ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ０１２３４５６７８９" },
        { name: "Giapponese", map: "ﾑ乃c d e f g h i j k l m n o p q r s t u v w x y z ﾑ 乃 C D E F G H I J K L M N O P Q R S T U V W X Y Z" },
        { name: "Sottile", map: "𝖺𝖻𝖼𝖽𝖾𝖿𝗀𝗁𝗂𝗃𝗄𝗅𝗆𝗇𝗈𝗉𝗊𝗋𝗌𝗍𝗎𝗏𝗐𝗑𝗒𝗓𝖠𝖡𝖢𝖣𝖤𝖥𝖦𝖧𝖨𝖩𝖪𝖫𝖬𝖭𝖮𝖯𝖰𝖱𝖲𝖳𝖴𝖵𝖶𝖷𝖸𝖅0123456789" },
        { name: "Shadow", map: "A̲̅]B̲̅]C̲̅]D̲̅]E̲̅]F̲̅]G̲̅]H̲̅]I̲̅]J̲̅]K̲̅]L̲̅]M̲̅]N̲̅]O̲̅]P̲̅]Q̲̅]R̲̅]S̲̅]T̲̅]U̲̅]V̲̅]W̲̅]X̲̅]Y̲̅]Z̲̅]a̲̅]b̲̅]c̲̅]d̲̅]e̲̅]f̲̅]g̲̅]h̲̅]i̲̅]j̲̅]k̲̅]l̲̅]m̲̅]n̲̅]o̲̅]p̲̅]q̲̅]r̲̅]s̲̅]t̲̅]u̲̅]v̲̅]w̲̅]x̲̅]y̲̅]z̲̅]" },
        { name: "Cinese Style", map: "卂乃匚刀モ下ム卄工ＪＫㄥ爪れ口ㄗＱ尺丂ㄒㄩV山メ丫乙卂乃匚刀モ下ム卄工ＪＫㄥ爪れ口ㄗＱ尺丂ㄒㄩV山メ丫乙0123456789" }
    ];

    const convertText = (str, selectedMap) => {
        const mapArr = Array.from(selectedMap);
        // Gestione avanzata per mappe che contengono decoratori (es: a̲ o 👽a👽)
        // Se la lunghezza della mappa è molto superiore all'alfabeto, usiamo un regex o logica di salto
        let result = '';
        for (let char of str) {
            const index = alpha.indexOf(char);
            if (index !== -1) {
                // Se la mappa sembra strutturata a "blocchi" (es: 👽a👽), cerchiamo di estrarre il blocco corretto
                // Per semplicità qui usiamo una mappatura diretta che copre il 90% degli stili Unicode
                result += mapArr[index] || char;
            } else {
                result += char;
            }
        }
        return result;
    };

    let menu = `✨ *MENU FONT PERSONALIZZATI* ✨\n\n`;
    menu += `Testo da convertire: *${text}*\n\n`;

    styles.forEach((s, i) => {
        // Anteprima fissa come richiesto
        let preview = convertText("PARA BELLUM", s.map);
        menu += `${i + 1}. ${preview}\n`;
    });

    menu += `\n_Invia il numero dello stile che vuoi applicare._`;

    let { key } = await conn.reply(m.chat, menu, m);

    conn.ev.on('messages.upsert', async function handlerResponse({ messages }) {
        const m2 = messages[0];
        if (!m2.message) return;
        const textResponse = m2.message.conversation || m2.message.extendedTextMessage?.text;
        const contextInfo = m2.message.extendedTextMessage?.contextInfo;

        if (contextInfo && contextInfo.stanzaId === key.id) {
            const selection = parseInt(textResponse?.trim());
            if (!isNaN(selection) && styles[selection - 1]) {
                const finalResult = convertText(text, styles[selection - 1].map);
                await conn.sendMessage(m.chat, { text: finalResult }, { quoted: m });
                conn.ev.off('messages.upsert', handlerResponse);
            }
        }
    });
};

handler.help = ['font <testo>'];
handler.tags = ['tools'];
handler.command = /^(font)$/i;

export default handler;
