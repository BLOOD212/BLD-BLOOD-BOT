const { generateWAMessageFromContent, proto } = (await import('@realvare/based')).default;

const handler = async (m, { conn }) => {
  await conn.reply(
    m.chat,
    `\`"${pickRandom(global.consiglio)}"\``,
    m
  );
};

handler.help = ['motivazione'];
handler.tags = ['giochi'];
handler.command = ['motivazione', 'ispirazione'];
handler.register = true;
export default handler;

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())];
}
global.consiglio = [
  "Ricorda che non puoi fallire nell'essere te stesso.",
  "Non è mai troppo tardi per essere ciò che avresti voluto essere.",
  "Solo una cosa rende impossibile un sogno: la paura di fallire.",
  "Quello che fai oggi può migliorare tutti i tuoi domani.",
  "Le piccole azioni di ogni giorno costruiscono il carattere.",
  "Cadi sette volte, rialzati otto.",
  "Perché i cambiamenti abbiano valore, devono essere costanti e duraturi.",
  "Niente accade finché qualcosa non si muove.",
  "Essere un buon perdente è imparare a vincere.",
  "Tutti i nostri sogni possono diventare realtà se abbiamo il coraggio di inseguirli.",
  "Chi trasforma se stesso, trasforma il mondo.",
  "Il tuo tempo è limitato, non sprecarlo vivendo la vita di qualcun altro.",
  "La maggior parte delle persone spende più tempo a parlare dei problemi che a risolverli.",
  "Non è che abbiamo poco tempo, è che ne perdiamo molto.",
  "Per avere successo, il desiderio di riuscire deve essere più grande della paura di fallire.",
  "Il vero cercatore cresce e impara, e scopre che è sempre il principale responsabile di ciò che accade.",
  "Se l'opportunità non bussa, costruisci una porta.",
  "C'è sempre un modo migliore per farlo, trovalo.",
  "Quando non possiamo più cambiare una situazione, siamo chiamati a cambiare noi stessi.",
  "La sconfitta non è tale finché non la accetti nella tua mente.",
  "È difficile fallire, ma è peggio non aver mai provato a riuscire.",
  "La felicità si nasconde nella sala d'attesa della felicità.",
  "La fiducia in se stessi è il primo segreto del successo.",
  "Sappiamo cosa siamo, ma non sappiamo cosa possiamo diventare.",
  "La vita inizia alla fine della tua zona di comfort.",
  "Chi non commette errori non sta provando abbastanza.",
  "Devi fare le cose che pensi di non poter fare.",
  "Fidarsi di se stessi non garantisce il successo, ma non farlo garantisce il fallimento.",
  "Il più grande errore che una persona può fare è aver paura di commettere un errore.",
  "Da un piccolo seme può crescere un grande albero.",
  "L'unico modo per trovare i limiti del possibile è andare oltre l'impossibile.",
  "Quando la vita ti dà un limone, spremilo e fai una limonata.",
  "La misura di ciò che siamo è ciò che facciamo con ciò che abbiamo.",
  "Diventiamo ciò che pensiamo.",
  "Solo chi osa fallire alla grande può ottenere grandi successi.",
  "Prima di tutto, la preparazione è la chiave del successo.",
  "Il modo migliore per predire il futuro è inventarlo.",
  "Le cose non si dicono, si fanno.",
  "Dai luce e l'oscurità scomparirà da sola.",
  "Il problema è che pensi di avere tempo.",
  "Non arrenderti. Spesso l'ultima chiave che provi è quella che apre la serratura.",
  "La vita non è un problema da risolvere, ma una realtà da vivere.",
  "La vittoria è più dolce quando hai conosciuto la sconfitta.",
  "Quello che non ti uccide ti rende più forte.",
  "Un sogno è solo un sogno. Un obiettivo è un sogno con un piano e una scadenza.",
  "La vita è un'opera teatrale che non permette prove. Vivi ogni momento intensamente.",
  "Non puoi sconfiggere chi non si arrende mai.",
  "Sii il cambiamento che vuoi vedere nel mondo.",
  "Quando perdi, non perdere la lezione.",
  "Non aspettare. Non sarà mai il momento giusto.",
  "Puoi più di quanto immagini, vali più di quanto credi.",
  "La fortuna è un dividendo del sudore. Più sudi, più sei fortunato.",
  "Il significato della vita è darle significato.",
  "Non contare i giorni, fai in modo che i giorni contino.",
  "Ogni nuovo giorno porta con sé opportunità per ricominciare.",
  "La determinazione di oggi costruisce il successo di domani.",
  "Non esiste fallimento, solo lezioni che ti rendono più forte.",
  "La passione è il motore che trasforma i sogni in realtà.",
  "Impara dal passato, vivi il presente, sogna il futuro.",
  "La perseveranza è il segreto dei grandi successi.",
  "Ogni passo, per quanto piccolo, ti avvicina alla tua meta.",
  "Credi in te stesso e tutto sarà possibile.",
  "La sfida di oggi è il trampolino di lancio per domani.",
  "Le difficoltà sono opportunità per crescere e migliorare.",
  "Fai di ogni errore una lezione e di ogni lezione un gradino verso il successo."
];
