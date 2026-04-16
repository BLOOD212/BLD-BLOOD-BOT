import { createHash } from 'crypto';
import moment from 'moment-timezone';
moment.locale('it');

let Reg = /^\s*([\w\s]+)[.| ]+(\d{1,3})\s*$/i;

let handler = async function (m, { conn, text, usedPrefix, command }) {
    // --- INTEGRAZIONE ATTIVA/DISATTIVA ---
    // Controlla se il modulo 'registrazioni' è attivo per il bot (store: 'bot')
    const botJid = conn.decodeJid(conn.user.jid);
    const botSettings = global.db.data.settings[botJid] || {};
    
    if (!botSettings.registrazioni && !m.fromMe) {
        return m.reply('『 🛑 』 Il sistema di registrazione è attualmente *DISATTIVATO* dal Master Control.');
    }
    // -------------------------------------

    const isOwner = global.owner?.includes(m.sender);

    let target = m.sender;
    if (isOwner && (m.mentionedJid?.length || m.quoted)) {
        target = m.mentionedJid?.[0] || m.quoted?.sender;
        if (!target) return m.reply('『 ⚠️ 』 *ERRORE* | Soggetto non identificato.');
    }

    let user = global.db.data.users[target] || (global.db.data.users[target] = {});

    let perfil = await conn.profilePictureUrl(target, 'image').catch(async _ => {
        return 'https://i.ibb.co/BKHtdBNp/default-avatar-profile-icon-1280x1280.jpg';
    });

    if (user.registered) {
        const timeSinceReg = moment(user.regTime).fromNow();
        return conn.sendMessage(m.chat, {
            text: `⚠️ *ATTENZIONE* ⚠️\n\nL'utente è già schedato nel sistema.\n『 ⏳ 』 *Data ingresso:* ${timeSinceReg}\n\n_Per ricominciare usa: ${usedPrefix}unreg_`,
            contextInfo: {
                externalAdReply: {
                    title: 'SISTEMA MALAVITA',
                    body: 'Identità già presente.',
                    thumbnailUrl: perfil,
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: m });
    }

    if (!Reg.test(text))  {
        return m.reply(`╔════════════════════╗\n║   ❌ *FORMATO ERRATO* ❌   \n╚════════════════════╝\n\n『 📝 』 *Usa:* \`${usedPrefix + command} nome anni\`\n『 💡 』 *Esempio:* \`${usedPrefix + command} Blood 17\``);
    }

    let [_, name, age] = text.match(Reg);
    if (!name) return m.reply('『 ❗ 』 Inserisci un nome valido.');
    if (!age) return m.reply('『 ❗ 』 Inserisci l\'età.');
    if (name.length > 32) return m.reply('『 ❗ 』 Nome troppo lungo.');

    age = parseInt(age);
    if (age > 69 || age < 10) return m.reply('『 ❗ 』 Età non valida (10-69).');

    // Salvataggio dati
    user.name = name.trim();
    user.age = age;
    user.regTime = +new Date();
    user.registered = true;
    user.euro = (user.euro || 0) + 15;
    user.exp = (user.exp || 0) + 245;
    user.hp = 100;
    user.level = 1;

    await global.db.write();

    let sn = createHash('md5').update(target).digest('hex');
    const registrationTime = moment().format('DD/MM/YYYY');

    let regbot = `
   ┏━━━━━━━━━━━━━━━━━━━━━━━━┓
   ┃   ⚔️  *NÜÖVÖ ÄFFÏLÏÄTÖ* ⚔️   ┃
   ┗━━━━━━━━━━━━━━━━━━━━━━━━┛

   『 👤 』 *NOME:* ${name}
   『 🎂 』 *ETÀ:* ${age} Anni
   『 📅 』 *DATA:* ${registrationTime}
   『 🆔 』 *ID:* ${sn.slice(0, 8).toUpperCase()}

   ┈──────────────────┈
      💰 *BÖNÜS DÏ BËNVËNÜTÖ*
   ┈──────────────────┈
   『 🪙 』 *Euro:* +15
   『 🌟 』 *Exp:* +245

   _Benvenuto nella famiglia, rispetta il codice._
`;

    await conn.sendMessage(m.chat, {
        text: regbot,
        contextInfo: {
            mentionedJid: [target],
            externalAdReply: {
                title: 'MBARUZZO CHE ENTRA NELLA MALAVITA!',
                body: `Rispetto per ${name}!`,
                thumbnailUrl: perfil,
                mediaType: 1,
                renderLargerThumbnail: true,
                showAdAttribution: false,
                sourceUrl: null
            }
        }
    }, { quoted: m });

};

handler.help = ['reg'];
handler.tags = ['main'];
handler.command = ['verify', 'registrazione', 'reg', 'register', 'registrare'];

export default handler;
