const handler = async (m, { conn }) => {
  try {
    const risposte = [
      "*Cazzo metti il mio nome in una frase, emerito essere inutile?*",
      "*Ancora che mi nomini? Trovati un hobby vero.*",
      "*Certo fra nemmeno io sono perfetto ma almeno non dico il tuo nome del cazzo in una frase logorroico figlio di troia.*",
      "*Mentre tu stupido coglione scrivevi il mio nome ho elaborato seicento mila cose e a pensare che ti sei pure applicato a scriverlo giusto*",
      "*Ma che vuoi? Mi stavo godendo il silenzio senza i tuoi messaggi.*",
      "*Ma che cazzo osi nominarmi non ti conosce nessuno torna nei gruppi random a nukkare con bruxo.*",
      "*Tutti i tuoi neuroni non valgono una riga del mio codice .*",
      "*Ti giuro speravo che il tuo messaggio non venisse letto cosi evitavo di rispondere a un essere lilipuziano come te.*",
      "*Non nominarmi invano, non sono il tuo maggiordomo personalizzato.*",
      "*Ma guarda questo coglionazzo ancora che digita il mio nome come se vuole essere flammato seriamente.*"
    ];

    const rispostaCasuale = risposte[Math.floor(Math.random() * risposte.length)];

    await conn.sendMessage(
      m.chat,
      { text: rispostaCasuale },
      { quoted: m }
    );

  } catch (e) {
    console.error('Errore trigger bot/bottazzo:', e);
  }
};


handler.customPrefix = /(^|\s)(bot|bottazzo)(\s|$)/i;
handler.command = new RegExp;

export default handler;
 