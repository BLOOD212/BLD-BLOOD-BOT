import fs from 'fs';

let handler = async (m, { text }) => {
  if (!text) return m.reply('🌙 Inserisci il nome con cui verrà salvato il file');
  if (!m.quoted || !m.quoted.mimetype) throw `[🌟] Rispondi a un messaggio contenente un file (immagine, audio, video o sticker)`;

  let media = await m.quoted.download();
  let ext = '';
  let folder = 'media';
  switch (m.quoted.mimetype) {
    case 'image/png':
      ext = 'png';
      break;
    case 'image/jpeg':
    case 'image/jpg':
      ext = 'jpg';
      break;
    case 'image/webp':
      ext = 'webp';
      folder = 'media/sticker';
      break;
    case 'audio/mpeg':
      ext = 'mp3';
      folder = 'media/audio';
      break;
    case 'video/mp4':
      ext = 'mp4';
      break;
    default:
      ext = m.quoted.mimetype.split('/')[1] || 'bin';
  }
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

  const path = `${folder}/${text}.${ext}`;
  await fs.writeFileSync(path, media);
  m.reply(`✨ File salvato in: ${path}`);
};

handler.help = ['savemedia'];
handler.tags = ['creatore'];
handler.command = /^(savemedia|salvamedia)$/i;
handler.owner = true;

export default handler;