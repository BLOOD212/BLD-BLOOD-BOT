import { WAMessageStubType } from '@realvare/based';
import axios from 'axios';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const groupBackgroundCache = new Map();
const profilePicCache = new Map();
const DEFAULT_AVATAR_URL = 'https://i.ibb.co/BKHtdBNp/default-avatar-profile-icon-1280x1280.jpg';

let defaultAvatarBuffer = null;
let puppeteer = null;
let browser = null;
let isPuppeteerAvailable = false;

const initPuppeteer = async () => {
    try {
        puppeteer = await import('puppeteer');
        isPuppeteerAvailable = true;
        return true;
    } catch (error) {
        isPuppeteerAvailable = false;
        return false;
    }
};

const initBrowser = async () => {
    if (!puppeteer || !isPuppeteerAvailable) return false;
    try {
        if (!browser) {
            browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            });
        }
        return true;
    } catch (error) {
        isPuppeteerAvailable = false;
        return false;
    }
};

const preloadDefaultAvatar = async () => {
    if (defaultAvatarBuffer) return;
    try {
        const res = await axios.get(DEFAULT_AVATAR_URL, { responseType: 'arraybuffer' });
        defaultAvatarBuffer = Buffer.from(res.data);
    } catch (e) {
        defaultAvatarBuffer = Buffer.from(`<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><circle cx="200" cy="200" r="200" fill="#6B7280"/></svg>`);
    }
};

async function getUserName(conn, jid, pushNameFromStub = '') {
    const isValid = str => str && typeof str === 'string' && str.length > 1 && str.length < 26 && !/^\d+$/.test(str);
    if (isValid(pushNameFromStub) && pushNameFromStub !== 'created') return pushNameFromStub;
    const contact = conn.contacts?.[jid];
    if (contact && isValid(contact.name)) return contact.name;
    try {
        const name = await conn.getName(jid);
        if (isValid(name)) return name;
    } catch (e) {}
    return `Utente ${jid.split('@')[0]}`;
}

async function getUserProfilePic(conn, jid) {
    if (profilePicCache.has(jid)) return profilePicCache.get(jid);
    try {
        const url = await conn.profilePictureUrl(jid, 'image');
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(res.data);
        profilePicCache.set(jid, buffer);
        return buffer;
    } catch (e) {
        return defaultAvatarBuffer;
    }
}

async function getGroupBackgroundImage(groupJid, conn) {
    if (groupBackgroundCache.has(groupJid)) return groupBackgroundCache.get(groupJid);
    let buffer = null;
    try {
        const url = await conn.profilePictureUrl(groupJid, 'image');
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        buffer = Buffer.from(res.data);
    } catch (e) {
        try {
            const fallback = path.join(__dirname, '..', 'media', 'benvenuto-addio.jpg');
            buffer = await fs.readFile(fallback);
        } catch (err) {
            buffer = Buffer.from(`<svg width="1600" height="900" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#764ba2"/></svg>`);
        }
    }
    groupBackgroundCache.set(groupJid, buffer);
    return buffer;
}

const WelcomeCard = ({ backgroundUrl, pfpUrl, isGoodbye, username, groupName }) => {
    const styles = `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 1600px; height: 900px; font-family: 'Poppins', sans-serif; background: #1a1a1a; overflow: hidden; }
        .container { width: 100%; height: 100%; position: relative; display: flex; justify-content: center; align-items: center; }
        .background { position: absolute; width: 100%; height: 100%; background: url('${backgroundUrl || ''}') center/cover; filter: blur(30px) brightness(0.7); opacity: 0.7; }
        .overlay { position: absolute; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); }
        .card { position: relative; width: 90%; height: 85%; background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 50px; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; padding: 45px; z-index: 2; }
        .pfp { width: 280px; height: 280px; border-radius: 50%; border: 8px solid #FFF; box-shadow: 0 0 30px rgba(255, 255, 255, 0.7); object-fit: cover; margin-bottom: 30px; }
        .title { font-size: 100px; text-shadow: 0 0 12px rgba(255,255,255,0.7); line-height: 1; text-transform: uppercase; }
        .username { font-size: 72px; margin: 10px 0; word-break: break-all; text-align: center; }
        .group-name { font-size: 56px; color: #ccc; text-align: center; }
        .footer { position: absolute; bottom: 35px; font-size: 42px; }
    `;

    return React.createElement('html', null,
        React.createElement('head', null, React.createElement('style', { dangerouslySetInnerHTML: { __html: styles } })),
        React.createElement('body', null,
            React.createElement('div', { className: 'container' },
                React.createElement('div', { className: 'background' }),
                React.createElement('div', { className: 'overlay' }),
                React.createElement('div', { className: 'card' },
                    React.createElement('img', { src: pfpUrl, className: 'pfp' }),
                    React.createElement('h1', { className: 'title' }, isGoodbye ? 'ADDIO!' : 'BENVENUTO!'),
                    React.createElement('h2', { className: 'username' }, username),
                    React.createElement('p', { className: 'group-name' }, groupName),
                    React.createElement('div', { className: 'footer' }, '✦ ⋆ ✧ ⭒ 𝓿𝓪𝓻𝓮𝓫𝓸𝓽 ⭒ ✧ ⋆ ✦')
                )
            )
        )
    );
};

async function createImage(username, groupName, profilePicBuffer, isGoodbye, groupJid, conn) {
    const backgroundBuffer = await getGroupBackgroundImage(groupJid, conn);
    const toBase64 = (buffer, type) => `data:image/${type};base64,${buffer.toString('base64')}`;
    const backgroundUrl = toBase64(backgroundBuffer, 'jpeg');
    const pfpUrl = toBase64(profilePicBuffer || defaultAvatarBuffer, 'jpeg');

    const element = React.createElement(WelcomeCard, { backgroundUrl, pfpUrl, isGoodbye, username, groupName });
    const htmlContent = `<!DOCTYPE html>${ReactDOMServer.renderToStaticMarkup(element)}`;

    if (isPuppeteerAvailable && (await initBrowser())) {
        const page = await browser.newPage();
        await page.setViewport({ width: 1600, height: 900 });
        await page.setContent(htmlContent);
        const screenshot = await page.screenshot({ type: 'jpeg', quality: 90 });
        await page.close();
        return screenshot;
    }

    const res = await axios.post(`https://production-sfo.browserless.io/screenshot?token=${global.APIKeys?.browserless}`, {
        html: htmlContent,
        viewport: { width: 1600, height: 900 }
    }, { responseType: 'arraybuffer' });
    return Buffer.from(res.data);
}

initPuppeteer().then(preloadDefaultAvatar);

export async function before(m, { conn, groupMetadata }) {
    if (!m.isGroup || !m.messageStubType) return true;

    const chat = global.db?.data?.chats?.[m.chat];
    if (!chat) return true;

    // CODICI: 27/31 = ENTRATA | 28/32 = USCITA
    const isAdd = [27, 31].includes(m.messageStubType);
    const isRemove = [28, 32].includes(m.messageStubType);

    if (!isAdd && !isRemove) return true; // Ignora tutto il resto (promozioni, nomi, etc)
    if (isAdd && !chat.welcome) return true;
    if (isRemove && !chat.goodbye) return true;

    const who = m.messageStubParameters?.[0];
    const pushNameFromStub = m.messageStubParameters?.[1];
    if (!who || !who.includes('@')) return true;
    
    const jid = conn.decodeJid(who);
    const cleanUserId = jid.split('@')[0];

    const [username, profilePic] = await Promise.all([
        getUserName(conn, jid, pushNameFromStub),
        getUserProfilePic(conn, jid)
    ]);

    const groupName = groupMetadata?.subject || 'Gruppo';
    const memberCount = groupMetadata?.participants?.length || 0;
    const displayName = (username.startsWith('Utente ')) ? cleanUserId : username;

    const caption = isRemove ?
        `*\`Addio\`* @${cleanUserId} 👋\n┊ _Ha abbandonato il gruppo_\n╰► *\`Membri\`* ${memberCount}` :
        `*\`Benvenuto/a\`* @${cleanUserId} *✧*\n┊ *\`In\`* *${groupName}*\n*╰►* *\`Membri:\`* ${memberCount}`;

    try {
        const image = await createImage(displayName, groupName, profilePic, isRemove, m.chat, conn);
        await conn.sendMessage(m.chat, {
            image,
            caption,
            mentions: [jid],
            contextInfo: { ...(global.fake?.contextInfo || {}) }
        });
    } catch (error) {
        await conn.sendMessage(m.chat, { text: caption, mentions: [jid] });
    }
    return true;
}
