import { exec } from 'child_process';
import fs from 'fs';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`\`[🌠] Inserisci il nome di un pacchetto NPM. Esempio: ${usedPrefix + command} yt-search,versione (opzionale)\``);

  async function npmdownloader(pkg, pkgver) {
    try {
      const filePath = await new Promise((resolve, reject) => {
        exec(`npm pack ${pkg}@${pkgver}`, (error, stdout) => {
          if (error) {
            m.reply('❌ Errore durante il download del pacchetto.');
            console.error(`exec error: ${error}`);
            reject(error);
            return;
          }
          resolve(stdout.trim());
        });
      });

      const fileName = filePath.split('/').pop();
      const data = await fs.promises.readFile(filePath);
      let Link;
      if (pkgver === 'latest') {
        Link = `https://www.npmjs.com/package/${pkg}`;
      } else {
        Link = `https://www.npmjs.com/package/${pkg}/v/${pkgver}`;
      }
      await conn.sendMessage(m.chat, {
        document: data,
        mimetype: "application/zip",
        fileName: fileName,
        caption: `- \`Nome\`: ${fileName}\n- \`Versione\`: ${pkgver}\n- \`Link\`: ${Link}`
      }, {
        quoted: m
      });

      await fs.promises.unlink(filePath);
    } catch (err) {
      console.error(`Errore: ${err}`);
    }
  }

  conn.sendMessage(m.chat, {
    react: {
      text: "⏱",
      key: m.key,
    }
  });

  try {
    const [text2, ver] = text.split(",");
    await npmdownloader(text2, ver || 'latest');
  } catch (error) {
    m.reply('❌ Si è verificato un errore o il pacchetto non è stato trovato.');
  }
};

handler.help = ["npmdl"];
handler.tags = ["download"];
handler.command = ["npmdownloader", "npmdownload", "npmpkgdownloader", "npmpkgdownload", "npmdl", "npmd"];

export default handler;