let handler = async (m, { conn, command, participants }) => {
  let mentions = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

  if (command.toLowerCase() === 'orgiacasuale' || command.toLowerCase() === 'orgiarandom') {
    let groupMembers = participants.map(u => u.id).filter(v => v !== conn.user.jid);
    let randomCount = Math.floor(Math.random() * (15 - 4 + 1)) + 4;
    let finalCount = Math.min(randomCount, groupMembers.length);
    if (finalCount < 4) return conn.sendMessage(m.chat, { text: "❌ *Errore:* Ci vuole un branco per questo massacro!" }, { quoted: m });
    mentions = groupMembers.sort(() => Math.random() - 0.5).slice(0, finalCount);
  }

  if (mentions.length < 4 || mentions.length > 15) {
    return conn.sendMessage(m.chat, { text: `🔞 *L'ARENA DELLA CARNE* 🔞\n\nTagga da 4 a 15 vittime o usa *.orgiacasuale* per scatenare l'inferno.` }, { quoted: m });
  }

  const tag = (jid) => `@${jid.split('@')[0]}`;
  let p = mentions.sort(() => Math.random() - 0.5).map(tag); 
  let sufferer = p[Math.floor(Math.random() * p.length)]; 
  let story = "";
  const count = mentions.length;

  switch (count) {
    case 4:
      story = `🔥 ${p[0]} afferra ${p[1]} per i capelli e lo sbatte senza sosta, mentre ${p[1]} grida: *"Sbattetemi più forte!"*. Nel frattempo ${p[2]} e ${p[3]} si scambiano bava e morsi, pronti a inondare ogni centimetro di pelle di seme bollente.`;
      break;
    case 5:
      story = `🔞 ${p[0]} e ${p[1]} spalancano ${p[2]} esponendo la sua carne tremante a ${p[3]}, che lo sventra con una foga disumana. ${p[4]} osserva il delirio prima di soffocare ${p[2]} con una scarica di sperma densa, mentre le urla di piacere squarciano il silenzio.`;
      break;
    case 6:
      story = `⛓️ CAOS TOTALE: ${p[0]} strozza ${p[1]} mentre ${p[2]} lo possiede brutalmente da dietro. ${p[3]} implora ${p[4]} di caricarlo ancora più forte, mentre ${p[5]} sigilla l'orgia marchiando tutti con spruzzi violenti e caldi.`;
      break;
    case 7:
      story = `🤤 ${p[0]}, ${p[1]} e ${p[2]} formano un cerchio di lussuria attorno a ${p[3]}, che geme: *"Voglio la sborra di tutti!"*. ${p[4]} e ${p[5]} lo accontentano sventrandolo a turno, mentre ${p[6]} annega la loro dignità sotto litri di bava e siero.`;
      break;
    case 8:
      story = `🔞 ${p[0]} viene usato come un trofeo da ${p[1]} e ${p[2]}, mentre ${p[3]} artiglia ${p[4]} in un treno di carne che vibra sotto i colpi di ${p[5]} e ${p[6]}. ${p[7]} chiude il massacro eiaculando con violenza su ogni volto presente.`;
      break;
    case 9:
      story = `🌊 Nove corpi fusi nel peccato: ${p[0]} urla dal piacere estremo mentre ${p[1]}, ${p[2]} e ${p[3]} lo riempiono fino all'orlo. ${p[4]} morde le natiche di ${p[5]} mentre ${p[6]}, ${p[7]} e ${p[8]} inondano la stanza di fluido seminale denso e appiccicoso.`;
      break;
    case 10:
      story = `🫦 L'INFERNO: ${p[0]} grida: *"Non fermatevi, distruggetemi!"* mentre ${p[1]}, ${p[2]} e ${p[3]} lo sfondano all'unisono. ${p[4]} e ${p[5]} si intrecciano con ${p[6]}, mentre il resto del branco (${p[7]}, ${p[8]}, ${p[9]}) scarica sborra bollente sui loro petti sudati.`;
      break;
    case 11:
      story = `🔥 ${p[0]} viene schiacciato dal peso di ${p[1]} e ${p[2]}, mentre ${p[3]} lo penetra con una cattiveria inaudita. ${p[4]}, ${p[5]} e ${p[6]} formano una catena di bava e sesso, mentre ${p.slice(7).join(', ')} sigillano l'orgia con una pioggia di sperma accecante.`;
      break;
    case 12:
      story = `🔞 APOCALISSE DELLA CARNE: ${p[0]} geme disperato sotto i colpi di ${p[1]}, implorando pietà, ma ${p[2]} e ${p[3]} lo incastrano ancora più a fondo. ${p.slice(4, 9).join(', ')} creano un groviglio di membra, mentre ${p.slice(9).join(', ')} sommergono tutto con eiaculazioni di massa.`;
      break;
    case 13:
      story = `⛓️ Tredici peccatori senza legge: ${p[0]} viene posseduto da ${p[1]} e ${p[2]}, mentre ${p[3]} e ${p[4]} lo obbligano a ingoiare il loro seme. Intorno, ${p.slice(5, 10).join(', ')} si massacrano di lussuria, mentre ${p.slice(10).join(', ')} riducono il gruppo a un ammasso di bava e sperma.`;
      break;
    case 14:
      story = `🤤 IL BRANCO ASSATANATO: ${p[0]} urla: *"Voglio sentirvi tutti dentro!"* e ${p.slice(1, 6).join(', ')} lo sventrano senza pietà. Nel caos, ${p.slice(6, 11).join(', ')} si scambiano colpi brutali e ${p.slice(11).join(', ')} chiudono il rito con una scarica di sborra leggendaria.`;
      break;
    case 15:
      story = `🔞 MASSACRO TOTALE: Quindici corpi in fiamme. ${p[0]} sviene dal piacere mentre ${p.slice(1, 6).join(', ')} lo sbranano. ${p.slice(6, 11).join(', ')} urlano in preda a un'estasi violenta, mentre gli ultimi ${p.slice(11).join(', ')} inondano il pavimento e i corpi di litri di sborra bollente.`;
      break;
  }

  let responseText = `🔞 *CRONACHE DELL'ESTASI COLLETTIVA* 🔞\n`;
  if (command.includes('casuale')) responseText += `🎲 _Modalità Casuale: ${count} corpi estratti dal branco_\n\n`;
  responseText += `${story}\n\n`;
  responseText += `───────────────\n`;
  responseText += `🏆 *LA CARNE TRITA DELLA SERATA:* ${sufferer}\n`;
  responseText += `*(Dopo aver incassato ogni colpo, aver implorato per averne ancora e aver ospitato il seme di tutti, è ufficialmente ridotto a un contenitore di fluidi esausto)* 💦💀`;

  await conn.sendMessage(m.chat, { text: responseText, mentions: mentions }, { quoted: m });
};

handler.help = ['orgia', 'orgiacasuale'];
handler.tags = ['giochi'];
handler.command = /^(orgia|orgiacasuale|orgiarandom)$/i;

export default handler;
