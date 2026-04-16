import fetch from 'node-fetch';

let handler = async (m, { args, conn, command, text }) => {
  if (!text) throw `📍 Inserisci un luogo o indirizzo.\nEsempi:\n${command} emilia romagna\n${command} via matteotti 25 milano\n${command} da bologna a milano`;
  let from = null, to = null;
  let separators = [' a ', ' -> ', ' verso '];
  let found = false;
  for (let sep of separators) {
    let idx = text.toLowerCase().lastIndexOf(sep);
    if (idx > 0) {
      from = text.slice(0, idx).replace(/^da\s+/i, '').trim();
      to = text.slice(idx + sep.length).trim();
      found = true;
      break;
    }
  }

  if (from && to) {
    const fromQuery = encodeURIComponent(from);
    const fromUrl = `https://nominatim.openstreetmap.org/search?q=${fromQuery}&format=json&limit=1&addressdetails=1`;
    const fromRes = await fetch(fromUrl, { headers: { 'User-Agent': 'varebot' } });
    const fromData = await fromRes.json();
    if (!fromData.length) throw `❌ Partenza non trovata: *${from}*`;
    const toQuery = encodeURIComponent(to);
    const toUrl = `https://nominatim.openstreetmap.org/search?q=${toQuery}&format=json&limit=1&addressdetails=1`;
    const toRes = await fetch(toUrl, { headers: { 'User-Agent': 'varebot' } });
    const toData = await toRes.json();
    if (!toData.length) throw `❌ Destinazione non trovata: *${to}*`;
    const fromPlace = fromData[0];
    const toPlace = toData[0];
    function toRad(x) { return x * Math.PI / 180; }
    function haversine(lat1, lon1, lat2, lon2) {
      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }
    const distanza = haversine(
      parseFloat(fromPlace.lat), parseFloat(fromPlace.lon),
      parseFloat(toPlace.lat), parseFloat(toPlace.lon)
    ).toFixed(2);
    const staticMapUrl = `https://static-maps.yandex.ru/1.x/?lang=en-US&l=map&size=450,450&pt=${fromPlace.lon},${fromPlace.lat},pm2blm~${toPlace.lon},${toPlace.lat},pm2rdm`;
    const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${fromPlace.lat},${fromPlace.lon}&destination=${toPlace.lat},${toPlace.lon}`;

    await conn.sendMessage(m.chat, {
      image: { url: staticMapUrl },
      caption: `ㅤㅤ⋆｡˚『 ╭🌏 \`MAPS\` 🌏╯ 』˚｡⋆\n╭\n│ 『 🗺️ 』 \`Da:\` *${fromPlace.display_name}*\n│ 『 🏁 』 \`A:\` *${toPlace.display_name}*\n│\n│ 『 📏 』 \`Distanza:\` *${distanza} km*\n│ 『 🚗 』 \`Google Maps\`\n*${gmapsUrl}*\n│\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`,
      contextInfo: { ...global.fake.contextInfo,
        externalAdReply: { 
          ...global.fake.contextInfo,
          title: '🗺️ Percorso trovato 🌍',
          body: `${fromPlace.display_name} → ${toPlace.display_name}`,
          thumbnailUrl: staticMapUrl,
          sourceUrl: global.gruppo,
          mediaType: 1,
          renderLargerThumbnail: false
        }
      }
    }, { quoted: m });
    return;
  }

  const query = encodeURIComponent(text);
  const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&addressdetails=1`;
  const res = await fetch(nominatimUrl, {
    headers: { 'User-Agent': 'varebot' }
  });
  const data = await res.json();
  if (!data.length) throw '❌ Nessun luogo trovato. Riprova con un indirizzo più preciso.';
  const place = data[0];
  const { lat, lon, display_name } = place;
  const staticMapUrl = `https://static-maps.yandex.ru/1.x/?lang=en-US&ll=${lon},${lat}&z=17&l=sat&size=450,450&pt=${lon},${lat},pm2rdl`;
  await conn.sendMessage(m.chat, {
    image: { url: staticMapUrl },
    caption: `ㅤㅤ⋆｡˚『 ╭🌏 \`MAPS\` 🌏╯ 』˚｡⋆\n╭\n│ 『 📌 』 *${display_name}*\n│\n│ 『 📍 』 \`Google Maps:\`\n│ *https://maps.google.com/?q=${lat},${lon}*\n│\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`,
    contextInfo: { ...global.fake.contextInfo,
      externalAdReply: {
        ...global.fake.contextInfo,
        title: '🗺️ Posizione trovata 🌍',
        body: display_name,
        thumbnailUrl: staticMapUrl,
        sourceUrl: global.gruppo,
        mediaType: 1,
        renderLargerThumbnail: false
      }
    }
  }, { quoted: m });
};

handler.help = ['maps <luogo>', 'maps da <a> a <b>'];
handler.tags = ['strumenti'];
handler.command = /^maps$/i;
handler.register = true;

export default handler;