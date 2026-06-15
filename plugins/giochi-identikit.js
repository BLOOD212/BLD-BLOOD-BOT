let currentGame = {};

let handler = async (m, { conn, usedPrefix, command, text }) => {
    const chatId = m.chat;

    if (!m.isGroup) return m.reply(`『 🔤 』 \`Questo comando può essere usato solo nei gruppi.\``);

    global.db = global.db || { data: { users: {} } };
    global.db.data = global.db.data || { users: {} };
    global.db.data.users = global.db.data.users || {};
    global.db.data.users[m.sender] = global.db.data.users[m.sender] || {};

    const animali = [
        { nome: 'cane', difficolta: '🟢 FACILE', premio: 150, indizi: ['È il migliore amico dell\'uomo', 'Abbaia quando sente qualcuno', 'Ama rincorrere le palline', 'Fa le feste muovendo la coda'] },
        { nome: 'gatto', difficolta: '🟢 FACILE', premio: 150, indizi: ['I suoi baffi si chiamano vibrisse', 'Adora farsi le unghie sui divani', 'Fa le fusa quando riceve le coccole', 'Dice miao ed è un felino domestico'] },
        { nome: 'elefante', difficolta: '🟢 FACILE', premio: 150, indizi: ['È il mammifero terrestre più pesante', 'Le sue zanne sono fatte di avorio', 'Ha grandi orecchie e una lunga proboscide', 'Ha paura dei topolini nelle favole'] },
        { nome: 'leone', difficolta: '🟢 FACILE', premio: 150, indizi: ['Le femmine cacciano mentre lui riposa', 'Vive in branchi nella savana', 'È conosciuto da tutti come il Re della foresta', 'I maschi hanno una folta criniera'] },
        { nome: 'pesce rosso', difficolta: '🟢 FACILE', premio: 150, indizi: ['Vive dentro le bocce di vetro', 'Ha le pinne e le branchie', 'Ha una memoria che dura pochissimi secondi', 'È un piccolo animale d\'acqua dolce arancione'] },
        { nome: 'mucca', difficolta: '🟢 FACILE', premio: 150, indizi: ['Passa le giornate a brucare l\'erba', 'Produce il latte che beviamo la mattina', 'Ha le mammelle e vive nella stalla', 'Fa il verso del muggito'] },
        { nome: 'gallina', difficolta: '🟢 FACILE', premio: 150, indizi: ['Ha le piume ma fa solo piccoli voli bassi', 'Vive nel pollaio', 'Fa le uova ogni giorno', 'Il maschio della sua specie è il gallo'] },
        { nome: 'cavallo', difficolta: '🟢 FACILE', premio: 150, indizi: ['Dorme spesso stando in piedi', 'Ha gli zoccoli che vengono ferrati', 'Viene cavalcato con sella e redini', 'Mangia fieno e nitrisce'] },
        { nome: 'maiale', difficolta: '🟢 FACILE', premio: 150, indizi: ['Ama rotolarsi nel fango per rinfrescarsi', 'La sua coda è fatta a ricircolo', 'Il suo naso si chiama grugno', 'Vive nel porcile e fa grugniti'] },
        { nome: 'scimmia', difficolta: '🟢 FACILE', premio: 150, indizi: ['Usa la coda come un quinto arto', 'È un animale molto agile e intelligente', 'Adora mangiare le banane', 'Passa da un albero all\'altro oscillando'] },
        { nome: 'topo', difficolta: '🟢 FACILE', premio: 150, indizi: ['Ha una lunga coda sottile e glabra', 'Rosicchia formaggio e mobili', 'Scappa sempre quando vede un gatto', 'Fa piccoli squittii'] },
        { nome: 'pecora', difficolta: '🟢 FACILE', premio: 150, indizi: ['Il suo maschio è l\'ariete', 'Vive in greggi guidate dal pastore', 'Ci dona la lana con la tosatura', 'Il suo verso è il belato'] },
        { nome: 'serpente', difficolta: '🟢 FACILE', premio: 150, indizi: ['Non ha le zampe e striscia sul terreno', 'Cambia la pelle facendo la muta', 'Alcuni uccidono col veleno, altri stringendo', 'Ha la lingua biforcuta e sibila'] },
        { nome: 'rana', difficolta: '🟢 FACILE', premio: 150, indizi: ['Inizia la sua vita come girino d\'acqua', 'Ha zampe posteriori forti per saltare', 'Cattura gli insetti con la lingua appiccicosa', 'Vive negli stagni e fa cra cra'] },
        { nome: 'uccello', difficolta: '🟢 FACILE', premio: 150, indizi: ['Ha il corpo ricoperto di piume', 'Costruisce il nido sui rami degli alberi', 'Ha il becco e depone le uova', 'Canta la mattina e vola nel cielo'] },
        { nome: 'giraffa', difficolta: '🟡 MEDIO', premio: 350, indizi: ['Ha la lingua di colore bluastro', 'Le sue macchie sono uniche come impronte digitali', 'Ha piccole corna ricoperte di pelle sulla testa', 'È l\'animale più alto del mondo'] },
        { nome: 'delfino', difficolta: '🟡 MEDIO', premio: 350, indizi: ['Dorme con un solo emisfero cerebrale alla volta', 'Comunica con click e fischi complessi', 'Salta fuori dall\'acqua per respirare dallo sfiatatoio', 'È un mammifero marino super intelligente'] },
        { nome: 'squalo', difficolta: '🟡 MEDIO', premio: 350, indizi: ['Il suo scheletro è di cartilagine, non ha ossa', 'Ha più file di denti che si rigenerano sempre', 'Ha un olfatto pazzesco per il sangue a km di distanza', 'È il grande predatore dell\'oceano con la pinna dorsale'] },
        { nome: 'lupo', difficolta: '🟡 MEDIO', premio: 350, indizi: ['Vive in branchi con regole sociali rigidissime', 'I capi del gruppo sono la coppia Alpha', 'È l\'antenato selvaggio dei cani', 'Ulughia di notte per comunicare col branco'] },
        { nome: 'canguro', difficolta: '🟡 MEDIO', premio: 350, indizi: ['Le femmine hanno una tasca sul ventre', 'Usa la grande coda per non perdere l\'equilibrio', 'Non è capace di camminare all\'indietro', 'È un marsupiale che si sposta saltando in Australia'] },
        { nome: 'aquila', difficolta: '🟡 MEDIO', premio: 350, indizi: ['Ha una vista otto volte più acuta di quella umana', 'I suoi artigli sono letali per le prede', 'Costruisce il nido su vette altissime e inacessibili', 'È la regina dei volatili rapaci'] },
        { nome: 'orso', difficolta: '🟡 MEDIO', premio: 350, indizi: ['Passa tutto l\'inverno a dormire nella tana', 'È un grande mammifero plantigrado', 'Va pazzo per il miele e per i salmoni', 'Esiste sia in versione bruna che polare'] },
        { nome: 'volpe', difficolta: '🟡 MEDIO', premio: 350, indizi: ['Appartiene ai canidi ma caccia da sola come i gatti', 'Ha una splendida coda folta', 'Nelle favole popolari rappresenta sempre l\'astuzia', 'Ha spesso il pelo fulvo e le orecchie a punta'] },
        { nome: 'pipistrello', difficolta: '🟡 MEDIO', premio: 350, indizi: ['Vede perfettamente nel buio usando l\'eco', 'Le sue ali sono membrane di pelle', 'È l\'unico mammifero capace di volare davvero', 'Dorme appeso a testa in giù nelle grotte'] },
        { nome: 'tartaruga', difficolta: '🟡 MEDIO', premio: 350, indizi: ['Può vivere tranquillamente oltre i 100 anni', 'È un rettile che depone le uova nella sabbia', 'Ha un becco osseo ma è del tutto priva di denti', 'Si rifugia dentro il suo guscio protettivo'] },
        { nome: 'ape', difficolta: '🟡 MEDIO', premio: 350, indizi: ['Comunica ballando a forma di otto', 'Ha cinque occhi ma noi ne notiamo solo due', 'Muore subito dopo aver usato il suo pungiglione', 'È l\'insetto operaio che produce il miele'] },
        { nome: 'pinguino', difficolta: '🟡 MEDIO', premio: 350, indizi: ['Vive nelle zone più fredde del sud del mondo', 'Usa le ali come pinne per nuotare velocissimo', 'I maschi covano l\'uovo tenendolo sui piedi', 'È un uccello freddoloso con la camminata dondolante'] },
        { nome: 'ippopotamo', difficolta: '🟡 MEDIO', premio: 350, indizi: ['Il suo sudore rosso funge da crema solare', 'Passa la giornata in acqua per non bruciare la pelle', 'Anche se cicciottello, corre più veloce di un uomo', 'È tra gli animali più territoriali e pericolosi d\'Africa'] },
        { nome: 'struzzo', difficolta: '🟡 MEDIO', premio: 350, indizi: ['I suoi occhi sono più grandi del suo cervello', 'Ha zampe potentissime in grado di uccidere un leone', 'È l\'uccello più grande e veloce sulla terra', 'Non vola ma depone le uova più grandi del mondo'] },
        { nome: 'balena', difficolta: '🟡 MEDIO', premio: 350, indizi: ['I suoi canti viaggiano per oceani interi', 'Ha i fanoni al posto dei denti per filtrare l\'acqua', 'Si nutre quasi solo di minuscoli gamberetti chiamati krill', 'È l\'animale più grande mai esistito sul pianeta'] },
        { nome: 'camaleonte', difficolta: '🟠 DIFFICILE', premio: 600, indizi: ['I suoi occhi si muovono in direzioni diverse insieme', 'Ha una lingua più lunga del suo intero corpo', 'Le sue dita sono fuse a pinza per afferrare i rami', 'È il rettile mutaforma che cambia colore per mimetizzarsi'] },
        { nome: 'polpo', difficolta: '🟠 DIFFICILE', premio: 600, indizi: ['Ha tre cuori e il suo sangue è di colore blu', 'Ha un cervello in ogni singolo arto', 'Può rigenerare i tentacoli se vengono tagliati', 'Spruzza inchiostro nero per scappare dai predatori'] },
        { nome: 'scimpanze', difficolta: '🟠 DIFFICILE', premio: 600, indizi: ['Condivide quasi il 98% del DNA con gli esseri umani', 'Fabbrica e usa utensili come bastoni e pietre', 'Ha braccia molto più lunghe delle gambe', 'È il primate più intelligente e vicino all\'uomo'] },
        { nome: 'gufo', difficolta: '🟠 DIFFICILE', premio: 600, indizi: ['Può ruotare il collo fino a 270 gradi', 'Le sue piume non fanno alcun rumore mentre vola', 'I suoi occhi sono cilindrici e non possono ruotare', 'È un rapace notturno con ciuffi che sembrano orecchie'] },
        { nome: 'formica', difficolta: '🟠 DIFFICILE', premio: 600, indizi: ['Non ha polmoni e respira da piccoli fori sul corpo', 'Può sollevare fino a 50 volte il suo peso', 'Comunica rilasciando tracce chimiche dette feromoni', 'Lavora instancabilmente nel formicaio per la Regina'] },
        { nome: 'koala', difficolta: '🟠 DIFFICILE', premio: 600, indizi: ['Ha impronte digitali quasi identiche a quelle umane', 'Non beve acqua, la assume mangiando verdura', 'Passa fino a 20 ore al giorno a dormire sui rami', 'Mangia solo foglie di eucalipto ed è un marsupiale'] },
        { nome: 'lontra', difficolta: '🟠 DIFFICILE', premio: 600, indizi: ['Dorme galleggiando in acqua tenendosi per mano', 'Ha una tasca nella pelle dove conserva la sua pietra preferita', 'Usa sassi per spaccare i gusci dei molluschi', 'È un mammifero semiacquatico dalla pelliccia densissima'] },
        { nome: 'castoro', difficolta: '🟠 DIFFICILE', premio: 600, indizi: ['I suoi denti arancioni non smettono mai di crescere', 'Ha una coda piatta che usa come timone o per dare l\'allarme', 'È considerato l\'ingegnere del regno animale', 'Costruisce dighe di legno fango nei fiumi'] },
        { nome: 'ornitorinco', difficolta: '🟠 DIFFICILE', premio: 600, indizi: ['Ha il becco da anatra ma il corpo da mammifero', 'I maschi hanno uno sprone velenoso sulle zampe', 'È uno dei pochissimi mammiferi che depone le uova', 'Vive in Australia ed è un animale semiacquatico bizzarro'] },
        { nome: 'formichiere', difficolta: '🟠 DIFFICILE', premio: 600, indizi: ['Non ha nemmeno un dente in bocca', 'Ha una lingua lunga 60 cm ricoperta di saliva appiccicosa', 'Usa i suoi enormi artigli per distruggere nidi durissimi', 'Si nutre esclusivamente di piccoli insetti sociali striscianti'] },
        { nome: 'bradipo', difficolta: '🟠 DIFFICILE', premio: 600, indizi: ['La sua digestione può durare fino a un mese intero', 'Scende dall\'albero solo una volta alla settimana per i bisogni', 'Sulla sua pelliccia crescono alghe che lo fanno sembrare verde', 'È l\'animale più lento del mondo'] },
        { nome: 'scorpione', difficolta: '🟠 DIFFICILE', premio: 600, indizi: ['Brilla di un colore azzurro fluo se illuminato da luce UV', 'Può sopravvivere un anno intero senza mangiare', 'Ha il corpo protetto da un esoscheletro rigido', 'È un aracnide con le chele e un aculeo velenoso sulla coda'] },
        { nome: 'fenicottero', difficolta: '🟠 DIFFICILE', premio: 600, indizi: ['Nasce con le piume grigie e cambia colore crescendo', 'Mangia tenendo la testa completamente capovolta nell\'acqua', 'Dorme stando in equilibrio su una sola zampa', 'Il suo piumaggio diventa rosa grazie ai gamberetti che mangia'] },
        { nome: 'lucertola', difficolta: '🟠 DIFFICILE', premio: 600, indizi: ['È in grado di staccarsi la coda da sola se minacciata', 'È un rettile a sangue freddo che adora stare al sole', 'La sua coda ricresce dopo essere stata persa', 'Striscia sui muri grazie a minuscoli artigli'] },
        { nome: 'medusa', difficolta: '🟠 DIFFICILE', premio: 600, indizi: ['Il suo corpo è composto al 95% da acqua', 'Non ha un cervello, un cuore o gli occhi', 'Fluttua seguendo le correnti marine', 'I suoi tentacoli contengono cellule urticanti per gli umani'] },
        { nome: 'tardigrado', difficolta: '🔴 IMPOSSIBILE', premio: 1000, indizi: ['Può sopravvivere nel vuoto dello spazio cosmico', 'Resiste a temperature vicine allo zero assoluto', 'Se si disidrata entra in uno stato di animazione sospesa', 'È chiamato anche orsetto d\'acqua ed è microscopico'] },
        { nome: 'narvalo', difficolta: '🔴 IMPOSSIBILE', premio: 1000, indizi: ['Vive esclusivamente nelle fredde acque dell\'Artico', 'Il suo lungo dente è un organo sensoriale pieno di terminazioni', 'I maschi lo usano per duellare o rompere il ghiaccio', 'È un cetaceo famoso per il suo dente a spirale simile a un corno'] },
        { nome: 'pangolino', difficolta: '🔴 IMPOSSIBILE', premio: 1000, indizi: ['È l\'unico mammifero al mondo interamente ricoperto di squame', 'Se si spaventa si appallottola diventando una sfera corazzata', 'È purtroppo l\'animale più contrabbandato del pianeta', 'Si nutre di formiche ed ha grandi artigli da scavo'] },
        { nome: 'axolotl', difficolta: '🔴 IMPOSSIBILE', premio: 1000, indizi: ['Può rigenerare parti del suo cervello e persino il cuore', 'Passa tutta la vita allo stadio di larva senza mai fare la metamorfosi', 'Ha branchie esterne ramificate che sembrano piume rosa sul collo', 'È una rara salamandra acquatica originaria del Messico'] },
        { nome: 'kiwi', difficolta: '🔴 IMPOSSIBILE', premio: 1000, indizi: ['Depone l\'uovo più grande del mondo in proporzione al suo corpo', 'Le sue piume somigliano moltissimo a dei peli ruvidi', 'Ha le narici poste proprio sulla punta del suo lungo becco', 'È un uccello notturno della Nuova Zelanda che non vola'] },
        { nome: 'quokka', difficolta: '🔴 IMPOSSIBILE', premio: 1000, indizi: ['Appartiene alla famiglia dei macropodi come i canguri', 'Non ha paura degli umani ed è estremamente curioso', 'La conformazione del suo muso lo fa sembrare perennemente felice', 'È conosciuto in tutto il mondo come l\'animale più felice della terra'] },
        { nome: 'okapi', difficolta: '🔴 IMPOSSIBILE', premio: 1000, indizi: ['Ha strisce bianche e nere sulle zampe posteriori come una zebra', 'Ha il collo robusto e la testa simile a una giraffa', 'È il parente più stretto della giraffa rimasto in vita', 'Vive nascosto nelle fitte foreste pluviali del Congo'] },
        { nome: 'tarsio', difficolta: '🔴 IMPOSSIBILE', premio: 1000, indizi: ['Ogni suo singolo occhio pesa quanto il suo intero cervello', 'Non può assolutamente ruotare le pupille nelle orbite', 'Può fare salti lunghi fino a 40 volte il proprio corpo', 'È un piccolissimo primate notturno dalle dita allungate'] },
        { nome: 'pesce goccia', difficolta: '🔴 IMPOSSIBILE', premio: 1000, indizi: ['Il suo corpo ha una densità leggermente inferiore a quella dell\'acqua', 'Vive ad abissali profondità dove la pressione è distruttiva', 'Fuori dal suo habitat collassa prendendo un aspetto flaccido', 'È stato eletto più volte come l\'animale più brutto del mondo'] },
        { nome: 'aye aye', difficolta: '🔴 IMPOSSIBILE', premio: 1000, indizi: ['Ha un dente medio lunghissimo e scheletrico', 'Usa l\'ecolocalizzazione picchiettando sui tronchi d\'albero', 'È un lemure notturno avvolto da superstizioni locali', 'Vive solo in Madagascar ed ha grandi occhi arancioni'] },
        { nome: 'echidna', difficolta: '🔴 IMPOSSIBILE', premio: 1000, indizi: ['Insieme all\'ornitorinco fa parte dei monotremi', 'Il suo corpo è un misto tra un riccio e un formichiere', 'Ha una sacca sul ventre dove alloggia l\'uovo fino alla schiusa', 'È un mammifero spinoso australiano che depone uova'] },
        { nome: 'cefaloto', difficolta: '🔴 IMPOSSIBILE', premio: 1000, indizi: ['È un mollusco cefalopode che vive negli abissi più oscuri', 'I suoi occhi giganteschi sono rivolti verso l\'alto per captare le ombre', 'Il suo corpo è quasi completamente trasparente', 'Viene chiamato anche polpo dagli occhi telescopici'] },
        { nome: 'lemure volante', difficolta: '🔴 IMPOSSIBILE', premio: 1000, indizi: ['Nonostante il nome, non è affatto un lemure e non vola', 'Ha una membrana cutanea che unisce collo, zampe e coda', 'È un abile aliante che si lancia tra le chiome degli alberi', 'È conosciuto anche con il nome scientifico di Galeopiteco'] },
        { nome: 'dugongo', difficolta: '🔴 IMPOSSIBILE', premio: 1000, indizi: ['È un grande mammifero marino completamente erbivoro', 'Si nutre solo di piante acquatiche sul fondale', 'In passato i marinai lo scambiavano per una sirena', 'È imparentato strettamente con il lamantino'] },
        { nome: 'tenrec', difficolta: '🔴 IMPOSSIBILE', premio: 1000, indizi: ['Può strofinare le sue spine per produrre suoni striduli come le cicale', 'Ha la capacità di abbassare la sua temperatura corporea a comando', 'Somiglia a un piccolo riccio ma appartiene a un\'altra famiglia', 'Vive quasi esclusivamente sull\'isola del Madagascar'] }
    ];

    let cmd = command.toLowerCase();

    if (cmd === 'identikit') {
        if (currentGame[chatId]) {
            return m.reply(`⚠️ C'è già una sessione attiva! Rispondi con \`${usedPrefix}indovina [nome]\``);
        }

        let animale = animali[Math.floor(Math.random() * animali.length)];
        
        currentGame[chatId] = {
            animale: animale.nome,
            difficolta: animale.difficolta,
            indizi: animale.indizi,
            premioBase: animale.premio,
            indice: 1,
            timeoutId: null
        };

        let msg = `🔍 *IDENTIKIT: INVESTIGAZIONE APERTA* 🔍\n`;
        msg += `====================================\n\n`;
        msg += `📊 *DIFFICOLTÀ:* ${animale.difficolta}\n`;
        msg += `💰 *PREMIO IN PALIO:* Fino a *${animale.premio * 2}€*\n\n`;
        msg += `📌 *INDIZIO N.1:*\n`;
        msg += `👉 _"${animale.indizi[0]}"_\n\n`;
        msg += `------------------------------------\n`;
        msg += `🎮 *COME RISPONDERE:* Usa \`${usedPrefix}indovina [nome]\``;

        let gestisciIndizi = () => {
            currentGame[chatId].timeoutId = setTimeout(() => {
                if (!currentGame[chatId]) return;
                
                let corrente = currentGame[chatId].indice;
                if (corrente < currentGame[chatId].indizi.length) {
                    let rilascio = `💡 *NUOVO INDIZIO (Livello ${corrente + 1})* 💡\n`;
                    rilascio += `👉 _"${currentGame[chatId].indizi[corrente]}"_`;
                    
                    conn.sendMessage(chatId, { text: rilascio });
                    currentGame[chatId].indice++;
                    gestisciIndizi();
                } else {
                    let fallimento = `💀 *INVESTIGATORI SCONFITTI* 💀\n`;
                    fallimento += `====================================\n\n`;
                    fallimento += `⏳ Tempo scaduto! Il fuggitivo è scappato.\n`;
                    fallimento += `🎯 L'animale misterioso era: *${currentGame[chatId].animale.toUpperCase()}* 🐾`;
                    
                    conn.sendMessage(chatId, { text: fallimento });
                    delete currentGame[chatId];
                }
            }, 20000);
        };

        gestisciIndizi();
        return conn.sendMessage(chatId, { text: msg }, { quoted: m });
    }

    if (cmd === 'indovina') {
        if (!currentGame[chatId]) {
            return m.reply(`❌ Nessun caso aperto al momento. Digita \`${usedPrefix}identikit\` per iniziare.`);
        }
        if (!text) {
            return m.reply(`⚠️ Specifica il nome di un animale! Esempio: \`${usedPrefix}indovina elefante\``);
        }

        let tentativo = text.trim().toLowerCase();
        let dati = currentGame[chatId];

        if (tentativo === dati.animale) {
            clearTimeout(dati.timeoutId);
            
            let vincitore = m.sender;
            let moltiplicatore = 1;
            let grado = 'Principiante 🐢';

            if (dati.indice === 1) {
                moltiplicatore = 2.0;
                grado = 'Mente Suprema 🧠🔥';
            } else if (dati.indice === 2) {
                moltiplicatore = 1.5;
                grado = 'Detective d\'Élite 🕵️‍♂️✨';
            } else if (dati.indice === 3) {
                moltiplicatore = 1.2;
                grado = 'Buon Osservatore 🔎';
            }

            let vincitaFinale = Math.floor(dati.premioBase * moltiplicatore);
            global.db.data.users[vincitore].euro = (global.db.data.users[vincitore].euro || 0) + vincitaFinale;

            let ris = `🎉 *IDENTIKIT COMPLETATO!* 🎉\n`;
            ris += `====================================\n\n`;
            ris += `📊 *Difficoltà:* ${dati.difficolta}\n`;
            ris += `👤 *Risolto da:* @${vincitore.split('@')[0]}\n`;
            ris += `🎯 *Soluzione:* *${dati.animale.toUpperCase()}* 🐾\n`;
            ris += `🏅 *Rango ottenuto:* ${grado}\n\n`;
            ris += `💰 *RICOMPENSA ACCREDITATA:* *+${vincitaFinale}€* 💵`;

            delete currentGame[chatId];
            return conn.sendMessage(chatId, { text: ris, mentions: [vincitore] }, { quoted: m });
        } else {
            return m.reply(`❌ *SBAGLIATO!* Non è un ${tentativo.toUpperCase()}. L'indagine continua!`);
        }
    }
};

handler.help = ['identikit', 'indovina'];
handler.tags = ['giochi'];
handler.command = ['identikit', 'indovina'];
handler.group = true;

export default handler;