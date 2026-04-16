const handler = async (m, { conn, text }) => {
  const target = getTarget(text, m);
  const nome = text || await conn.getName(target);
  
  // Ottieni informazioni REALI dal dispositivo WhatsApp
  const realDeviceInfo = await getRealDeviceInfo(m, conn, target);
  
  // Genera dati fake basati sulle info reali
  const fakeData = generateFakeData(realDeviceInfo);
  
  // Crea il messaggio di risposta
  const doxMessage = formatDoxMessage(nome, fakeData, realDeviceInfo);
  
  await m.reply(doxMessage, null, { mentions: [target] });
};

// Configurazione del handler
handler.help = ['dox'];
handler.tags = ['giochi'];
handler.command = /^dox/i;
handler.rowner = false;

export default handler;

// === FUNZIONI HELPER ===

/**
 * Ottiene informazioni REALI dal dispositivo WhatsApp
 */
async function getRealDeviceInfo(m, conn, target) {
  let numeroTelefono = 'N/D';
  let tipoDispositivo = 'Sconosciuto';
  let versioneWA = 'N/D';
  let presenza = 'N/D';
  let businessProfile = null;
  let profilePictureUrl = null;
  let devices = [];
  
  try {
    // Estrai il numero di telefono dal JID WhatsApp
    const phoneNumber = target.replace('@s.whatsapp.net', '');
    if (phoneNumber && phoneNumber !== target) {
      if (phoneNumber.startsWith('39') && phoneNumber.length >= 12) {
        const cleanNumber = phoneNumber.substring(2);
        numeroTelefono = `+39 ${cleanNumber.substring(0,3)} ${cleanNumber.substring(3,6)} ${cleanNumber.substring(6)}`;
      } else {
        numeroTelefono = `+${phoneNumber.substring(0,2)} ${phoneNumber.substring(2)}`;
      }
    }
    
    // Ottieni tipo di dispositivo REALE dal message ID
    const msgId = m.quoted?.id || m.quoted?.key?.id || m.key.id;
    tipoDispositivo = getRealDeviceType(msgId);
    
    // Ottieni lista dispositivi REALI
    try {
      devices = await conn.getUSyncDevices([target], false, false);
    } catch (e) {
      console.log('Errore getUSyncDevices:', e.message);
    }
    
    // Ottieni presence REALE
    try {
      const presenceData = await conn.fetchStatus(target);
      if (presenceData && presenceData.length > 0) {
        presenza = presenceData[0].status || 'N/D';
      }
    } catch (e) {
      console.log('Errore fetchStatus:', e.message);
    }
    
    // Ottieni business profile REALE
    try {
      businessProfile = await conn.getBusinessProfile(target);
    } catch (e) {
      console.log('Errore getBusinessProfile:', e.message);
    }
    
    // Ottieni URL profile picture REALE
    try {
      profilePictureUrl = await conn.profilePictureUrl(target);
    } catch (e) {
      console.log('Errore profilePictureUrl:', e.message);
    }
    
    // Versione WA basata sul dispositivo reale
    versioneWA = getWhatsAppVersionFromDevice(tipoDispositivo);
    
  } catch (error) {
    console.log('Errore nel rilevare info dispositivo:', error);
  }
  
  return {
    numeroTelefono,
    tipoDispositivo,
    versioneWA,
    presenza,
    businessProfile,
    profilePictureUrl,
    devices: devices.length > 0 ? devices : null
  };
}

/**
 * Rileva il tipo di dispositivo REALE dai metadati del messaggio
 */
function getRealDeviceType(msgID) {
  if (!msgID) return '⚠️ Dispositivo sconosciuto';
  
  // Usa la funzione getDevice di Baileys per rilevare il dispositivo
  try {
    const deviceType = getDevice(msgID);
    switch (deviceType) {
      case 'android':
        return pickRandom([
          'Samsung Galaxy S23 Ultra',
          'Samsung Galaxy S23+',
          'Xiaomi 13 Pro',
          'Google Pixel 8 Pro',
          'OnePlus 11'
        ]);
      case 'ios':
        return pickRandom([
          'iPhone 15 Pro Max',
          'iPhone 15 Pro', 
          'iPhone 15',
          'iPhone 14 Pro Max',
          'iPhone 14 Pro'
        ]);
      case 'web':
        return 'WhatsApp Web (Chrome)';
      case 'desktop':
        return 'WhatsApp Desktop Windows';
      default:
        return '🕵️‍♂️ Dispositivo sconosciuto';
    }
  } catch (e) {
    console.log('Errore getDevice:', e.message);
    return detectDeviceType(msgID); // Fallback al metodo originale
  }
}

/**
 * Ottiene la versione di WhatsApp basata sul dispositivo
 */
function getWhatsAppVersionFromDevice(device) {
  if (device.includes('iOS') || device.includes('iPhone')) {
    return '2.23.24.14';
  } else if (device.includes('Samsung') || device.includes('Xiaomi') || device.includes('Google') || device.includes('OnePlus')) {
    return '2.23.24.76';
  } else if (device.includes('Web')) {
    return '2.2347.52';
  } else if (device.includes('Desktop')) {
    return '2.2342.8';
  } else {
    return '2.23.24.xx';
  }
}

function getTarget(text, m) {
  if (text?.replace(/[^0-9]/g, '')) {
    return text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  }
  
  return m.mentionedJid?.[0] || m.quoted?.sender || m.sender;
}

/**
 * Genera dati fake basati sulle informazioni reali
 */
function generateFakeData(realInfo) {
  const speed = (Math.random() * 0.5 + 0.1).toFixed(2);
  const ip = `92.28.${randomInt(1, 254)}.${randomInt(1, 254)}`;
  const ipv6 = generateRandomIPv6();
  const ssn = Math.floor(Math.random() * 1e16).toString();
  const codiceFiscale = generateFakeCodiceFiscale();
  const email = generateFakeEmail();
  
  // Determina OS basandosi sul dispositivo reale
  const os = getOSFromDevice(realInfo.tipoDispositivo);
  const browser = realInfo.tipoDispositivo.includes('Web') ? 
    'WhatsApp Web' : realInfo.tipoDispositivo.includes('Desktop') ? 
    'WhatsApp Desktop' : 'WhatsApp Mobile';
  
  // Se ha business profile, usa dati più realistici
  const isBusiness = realInfo.businessProfile ? true : false;
  const rischioBan = isBusiness ? 'Basso' : pickRandom(['Basso', 'Medio', 'Alto', 'Estremo']);
  
  return {
    speed,
    ip,
    ipv6,
    mac: generateRandomMac(),
    isp: pickRandom(ISP_LIST),
    regione: pickRandom(REGIONI_ITALIANE),
    citta: pickRandom(CITTA_ITALIANE),
    rischioBan,
    dns: generateRandomDNS(),
    ssn,
    codiceFiscale,
    email,
    os,
    browser,
    latitudine: (41.9 + Math.random() * 5).toFixed(6),
    longitudine: (12.5 + Math.random() * 6).toFixed(6),
    velocitaConnessione: `${randomInt(10, 1000)} Mbps`,
    tipoConnessione: pickRandom(['Fibra', 'ADSL', '4G', '5G', 'Satellite']),
    proxy: pickRandom(['Nessuno', 'HTTP', 'SOCKS5', 'VPN Attivo']),
    timezone: 'Europe/Rome',
    cookie: randomInt(50, 500),
    sessioneAttiva: `${randomInt(1, 24)}h ${randomInt(1, 59)}m`,
    ultimoAccesso: generateRandomDate(),
    isBusiness,
    hasProfilePicture: !!realInfo.profilePictureUrl,
    deviceCount: realInfo.devices ? realInfo.devices.length : 1
  };
}

/**
 * Formatta il messaggio di risposta con dati reali
 */
function formatDoxMessage(nome, data, realInfo) {
  const businessInfo = realInfo.businessProfile ? 
    `\n• Business: ${realInfo.businessProfile.description || 'Attivo'}` : '';
  
  const deviceInfo = realInfo.devices && realInfo.devices.length > 1 ? 
    `\n• Dispositivi connessi: ${realInfo.devices.length}` : '';

  return `*[ ✔ ] DOX COMPLETATO!*
⏳ Tempo impiegato: ${data.speed} secondi

*🎯 INFORMAZIONI PERSONALI:*
• Nome: ${nome}
• Telefono: ${realInfo.numeroTelefono}
• Codice Fiscale: ${data.codiceFiscale}
• Email: ${data.email}
• SSN: ${data.ssn}${businessInfo}

*📱 DISPOSITIVO WHATSAPP:*
• Dispositivo: ${realInfo.tipoDispositivo}
• Sistema Operativo: ${data.os}
• WhatsApp: ${data.browser}
• Versione WA: ${realInfo.versioneWA}
• Stato: ${realInfo.presenza}${deviceInfo}
• Profile Picture: ${data.hasProfilePicture ? '✅' : '❌'}
• Ultima connessione: ${data.ultimoAccesso}

*🌐 INFORMAZIONI DI RETE:*
• IP: ${data.ip}
• IPv6: ${data.ipv6}
• MAC: ${data.mac}
• ISP: ${data.isp}
• DNS: ${data.dns.primary} / ${data.dns.secondary}
• Gateway: 192.168.0.1
• Velocità: ${data.velocitaConnessione}
• Tipo connessione: ${data.tipoConnessione}
• Proxy/VPN: ${data.proxy}

*📍 GEOLOCALIZZAZIONE:*
• Paese: Italia
• Regione: ${data.regione}
• Città: ${data.citta}
• Coordinate: ${data.latitudine}°N, ${data.longitudine}°E
• Timezone: ${data.timezone}

*🔒 SICUREZZA:*
• Porte aperte: 80, 443, 8080, 21, 22
• Rischio ban: ${data.rischioBan}
• Firewall: ${pickRandom(['Attivo', 'Disattivato', 'Parziale'])}
• Antivirus: ${pickRandom(['Windows Defender', 'Avast', 'Norton', 'Kaspersky', 'Nessuno'])}
• Cookie WA: ${data.cookie}
• Sessione attiva da: ${data.sessioneAttiva}`;
}

// === FUNZIONI DI UTILITÀ ===

/**
 * Rileva il tipo di dispositivo dai metadati del messaggio (fallback)
 */
function detectDeviceType(msgID) {
  if (!msgID) return '⚠️ Dispositivo sconosciuto';

  // Dispositivi reali in base al pattern
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(msgID) ||
      (/^[A-Z0-9]{20,25}$/i.test(msgID) && !msgID.startsWith('3EB0'))) {
    return pickRandom([
      'iPhone 15 Pro Max',
      'iPhone 15 Pro',
      'iPhone 15',
      'iPhone 14 Pro Max',
      'iPhone 14 Pro',
      'iPhone 14'
    ]);
  }
  
  if (/^[A-F0-9]{32}$/i.test(msgID)) {
    return pickRandom([
      'Samsung Galaxy S23 Ultra',
      'Samsung Galaxy S23+',
      'Samsung Galaxy A54',
      'Xiaomi 13 Pro',
      'Xiaomi Redmi Note 12',
      'Google Pixel 8 Pro',
      'OnePlus 11'
    ]);
  }
  
  if (msgID.startsWith('3EB0')) {
    return pickRandom([
      'Samsung Galaxy A34',
      'Xiaomi Redmi 12',
      'OPPO A78',
      'Realme 11 Pro'
    ]);
  }

  if (msgID.startsWith('false_') || msgID.startsWith('true_')) {
    return 'WhatsApp Web (Chrome)';
  }

  if (msgID.includes(':')) {
    return 'WhatsApp Desktop Windows';
  }

  if (/^[a-zA-Z]+-[a-fA-F0-9]+$/.test(msgID)) {
    return '🤖 Bot WhatsApp';
  }

  console.log('[DOX] ID messaggio non riconosciuto:', msgID);
  return '🕵️‍♂️ Dispositivo sconosciuto';
}

/**
 * Determina l'OS dal tipo di dispositivo
 */
function getOSFromDevice(device) {
  if (device.toLowerCase().includes('iphone')) return 'iOS 17.1';
  if (device.toLowerCase().includes('samsung')) return 'Android 14';
  if (device.toLowerCase().includes('xiaomi')) return 'MIUI 14 (Android 13)';
  if (device.toLowerCase().includes('google')) return 'Android 14';
  if (device.toLowerCase().includes('web')) return 'Windows 11';
  if (device.toLowerCase().includes('desktop')) return pickRandom(['Windows 11', 'macOS Sonoma', 'Ubuntu 22.04']);
  
  return pickRandom(['iOS 17.1', 'Android 14', 'Android 13']);
}

/**
 * Genera un indirizzo IPv6 casuale
 */
function generateRandomIPv6() {
  const segments = [];
  for (let i = 0; i < 8; i++) {
    segments.push(randomInt(0, 65535).toString(16).padStart(4, '0'));
  }
  return segments.join(':');
}

/**
 * Genera un codice fiscale fittizio
 */
function generateFakeCodiceFiscale() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let cf = '';
  for (let i = 0; i < 16; i++) {
    cf += chars[Math.floor(Math.random() * chars.length)];
  }
  return cf;
}

/**
 * Genera un'email fittizia
 */
function generateFakeEmail() {
  const domains = ['gmail.com', 'yahoo.it', 'hotmail.it', 'libero.it', 'virgilio.it', 'outlook.com', 'alice.it'];
  const username = Array.from({length: randomInt(5, 12)}, () => 
    String.fromCharCode(97 + randomInt(0, 25))).join('') + randomInt(10, 999);
  return `${username}@${pickRandom(domains)}`;
}

/**
 * Genera una data di accesso casuale recente
 */
function generateRandomDate() {
  const now = new Date();
  const daysAgo = randomInt(0, 30);
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  
  const giorniSettimana = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
  const mesi = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 
               'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
  
  const giorno = giorniSettimana[date.getDay()];
  const numeroGiorno = date.getDate();
  const mese = mesi[date.getMonth()];
  const ore = date.getHours().toString().padStart(2, '0');
  const minuti = date.getMinutes().toString().padStart(2, '0');
  
  return `${giorno} ${numeroGiorno} ${mese}, ${ore}:${minuti}`;
}

function generateRandomMac() {
  const segments = [];
  for (let i = 0; i < 6; i++) {
    segments.push(randomInt(0, 255).toString(16).padStart(2, '0').toUpperCase());
  }
  return segments.join(':');
}

/**
 * Genera due DNS casuali diversi
 */
function generateRandomDNS() {
  const primary = pickRandom(DNS_LIST);
  let secondary;
  
  do {
    secondary = pickRandom(DNS_LIST);
  } while (secondary === primary);
  
  return { primary, secondary };
}

/**
 * Seleziona un elemento casuale da un array
 */
function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Genera un numero intero casuale tra min e max (inclusi)
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// === COSTANTI ===

const ISP_LIST = [
  'Vodafone', 'TIM', 'WindTre', 'Fastweb', 'Tiscali', 
  'Eolo', 'Linkem', 'Sky Wifi', 'PosteMobile', 'Iliad'
];

const REGIONI_ITALIANE = [
  'Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna',
  'Friuli Venezia Giulia', 'Lazio', 'Liguria', 'Lombardia', 'Marche',
  'Molise', 'Piemonte', 'Puglia', 'Sardegna', 'Sicilia', 'Toscana',
  'Trentino-Alto Adige', 'Umbria', "Valle d'Aosta", 'Veneto'
];

const DNS_LIST = [
  '8.8.8.8', '8.8.4.4',           // Google
  '1.1.1.1', '1.0.0.1',           // Cloudflare
  '9.9.9.9',                      // Quad9
  '208.67.222.222', '208.67.220.220', // OpenDNS
  '94.140.14.14', '94.140.15.15', // AdGuard
  '195.46.39.39', '195.46.39.40', // SafeDNS
  '176.103.130.130', '176.103.130.131' // AdGuard Family
];

const CITTA_ITALIANE = [
  'Roma', 'Milano', 'Napoli', 'Torino', 'Palermo', 'Genova', 'Bologna',
  'Firenze', 'Bari', 'Catania', 'Venezia', 'Verona', 'Messina', 'Padova',
  'Trieste', 'Brescia', 'Taranto', 'Prato', 'Parma', 'Modena', 'Reggio Calabria',
  'Reggio Emilia', 'Perugia', 'Livorno', 'Ravenna', 'Cagliari', 'Foggia',
  'Rimini', 'Salerno', 'Ferrara', 'Sassari', 'Latina', 'Giugliano', 'Monza',
  'Siracusa', 'Pescara', 'Bergamo', 'Forlì', 'Trento', 'Vicenza'
];