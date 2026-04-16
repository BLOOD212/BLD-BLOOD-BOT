const oldProfilePics = new Map();

const handler = async (m, { conn, command }) => {
  if (command === 'setfotogp' || command === 'fotogp') {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!/image\/(jpe?g|png)/.test(mime)) {
      return conn.reply(m.chat, '『 ⛓️‍💥 』 *\`Rispondi a un\'immagine per impostarla come foto profilo del gruppo.\`*', m);
    }

    try {
      const oldPic = await conn.profilePictureUrl(m.chat, 'image').catch(() => null);
      if (oldPic) {
        const response = await conn.getFile(oldPic);
        oldProfilePics.set(m.chat, response.data);
      } else {
        oldProfilePics.set(m.chat, null);
      }
      let img = await q.download();
      await conn.updateProfilePicture(m.chat, img);

      const restoreButton = {
        text: '✅ *\`Foto del gruppo aggiornata!\`*',
        footer: 'Vuoi ripristinare la foto precedente?',
        buttons: [{
          buttonId: `.ripristinafotogp`,
          buttonText: { displayText: '↩️ Foto Precedente' },
          type: 1
        }],
        headerType: 1
      };
      await conn.sendMessage(m.chat, restoreButton, { quoted: m });

    } catch (e) {
      console.error(e);
      conn.reply(m.chat, `${global.errore}`, m);
    }
  } else if (command === 'ripristinafotogp') {
    const oldPicBuffer = oldProfilePics.get(m.chat);

    if (oldPicBuffer) {
      try {
        await conn.updateProfilePicture(m.chat, oldPicBuffer);
        await conn.reply(m.chat, '『 ✅ 』 *\`Foto profilo del gruppo ripristinata con successo!\`*', m);
        oldProfilePics.delete(m.chat);
        
      } catch (e) {
        console.error(e);
        conn.reply(m.chat, `${global.errore}`, m);
      }
    } else {
      try {
         await conn.removeProfilePicture(m.chat);
         await conn.reply(m.chat, '『 ⛓️‍💥 』 *\`Non vi è alcuna foto precedente in cache, La foto attuale è stata rimossa.\`*', m);
      } catch (e) {
          console.error(e);
          conn.reply(m.chat, `${global.errore}`, m);
      }
    }
  }
};

handler.help = ['fotogp', 'setfotogp', 'ripristinafotogp'];
handler.tags = ['gruppo'];
handler.command = /^(setfotogp|fotogp|ripristinafotogp)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
handler.group = true;
export default handler;