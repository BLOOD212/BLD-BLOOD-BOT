import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const [voiceKey, ...textArr] = m.text.split('|').map(v => v.trim());
  const voice = voiceKey?.replace(usedPrefix + command, '').trim().toLowerCase();
  const text = textArr.join(' ');

  const voices = {
    diego: 'it-IT-DiegoNeural', 
    elsa: 'it-IT-ElsaNeural',
    cosimo: 'it-IT-CosimoNeural',
    fabiola: 'it-IT-FabiolaNeural',
    gianni: 'it-IT-GianniNeural',
    imelda: 'it-IT-ImeldaNeural',
    iacopo: 'it-IT-IacopoNeural',
    iris: 'it-IT-IrisNeural',
    christopher: 'en-US-ChristopherNeural',
    sofia: 'en-US-AriaNeural',
    david: 'en-US-AriaRUS',
    emma: 'en-US-ZiraRUS',
    james: 'en-GB-SoniaNeural',
    lily: 'en-GB-LibbyNeural',
    alvaro: 'es-ES-AlvaroNeural',
    elvira: 'es-ES-ElviraNeural',
    denise: 'fr-FR-DeniseNeural',
    henri: 'fr-FR-HenriNeural'
  };

  if (!voice || !text) {
    return m.reply(`『 ❌ 』 *Uso corretto:* ${usedPrefix}voce <voce> | <testo>

『 🇮🇹 』 *Voci Italiane:*
- *diego, elsa, cosimo, fabiola, gianni, imelda, iacopo, iris*

『 🇺🇸🇬🇧 』 *Voci Inglesi:*
- *christopher, sofia, david, emma, james, lily*

『 🇪🇸 』 *Voci Spagnole:*
- *alvaro, elvira*

『 🇫🇷 』 *Voci Francesi:*
- *denise, henri* 

> 『 💡 』 *Esempio:* ${usedPrefix}voce diego | Se non sei furbo non hai futuro!`);
  }

  const voiceId = voices[voice];
  if (!voiceId) return m.reply(`❌ Voce non trovata. Usa una di queste: ${Object.keys(voices).join(', ')}`);

  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voiceId, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
    const result = await tts.toStream(text);
    const readable = result.audioStream;
    const audio = await streamToBuffer(readable);

    await conn.sendFile(m.chat, audio, `voce-${Date.now()}.mp3`, null, m, true, {
      mimetype: 'audio/mpeg',
      ptt: false
    });

  } catch (e) {
    console.error('[ERROR VOCE]', e);
    m.reply('❌ Errore nella generazione vocale.');
  }
};

handler.help = ['voce <voce> | <testo>'];
handler.tags = ['ai', 'audio'];
handler.command = /^voce$/i;
handler.register = true
export default handler;
