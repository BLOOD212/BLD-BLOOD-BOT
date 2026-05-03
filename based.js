process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
process.setMaxListeners(0); // Risolve definitivamente il MaxListenersExceededWarning

import './config.js';
import { createRequire } from 'module';
import path, { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import fs, { readdirSync, statSync, unlinkSync, existsSync, readFileSync, mkdirSync, rmSync, watch } from 'fs';
import yargs from 'yargs';
import { spawn } from 'child_process';
import lodash from 'lodash';
import chalk from 'chalk';
import { tmpdir } from 'os';
import { format } from 'util';
import pino from 'pino';
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import { Low, JSONFile } from 'lowdb';
import NodeCache from 'node-cache';
import { ripristinaTimer } from './plugins/gp-configgruppo.js';

const DisconnectReason = {
    connectionClosed: 428,
    connectionLost: 408,
    connectionReplaced: 440,
    timedOut: 408,
    loggedOut: 401,
    badSession: 500,
    restartRequired: 515,
    multideviceMismatch: 411,
    forbidden: 403,
    unavailableService: 503
};

const { useMultiFileAuthState, makeCacheableSignalKeyStore, Browsers, jidNormalizedUser, getPerformanceConfig, setPerformanceConfig, Logger, makeInMemoryStore } = await import('@realvare/based');
const { chain } = lodash;
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;

protoType();
serialize();

global.isLogoPrinted = false;
global.qrGenerated = false;
global.connectionMessagesPrinted = {};
let methodCodeQR = process.argv.includes("qr");
let methodCode = process.argv.includes("code");
let MethodMobile = process.argv.includes("mobile");
let phoneNumber = global.botNumberCode;

function redefineConsoleMethod(methodName, filterStrings) {
    const originalConsoleMethod = console[methodName];
    console[methodName] = function () {
        const message = arguments[0];
        if (typeof message === 'string' && filterStrings.some(filterString => message.includes(Buffer.from(filterString, 'base64').toString()))) {
            arguments[0] = "";
        }
        originalConsoleMethod.apply(console, arguments);
    };
}

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
    return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
};

global.__dirname = function dirname(pathURL) {
    return path.dirname(global.__filename(pathURL, true));
};

global.__require = function require(dir = import.meta.url) {
    return createRequire(dir);
};

global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}) })) : '');
global.timestamp = { start: new Date };
const __dirname = global.__dirname(import.meta.url);
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp('^[' + (opts['prefix'] || '*/!#$%+£¢€¥^°=¶∆×÷π√✓©®&.\\-.@').replace(/[|\\{}()[\]^$+*.\-\^]/g, '\\$&') + ']');
global.db = new Low(/https?:\/\//.test(opts['db'] || '') ? new JSONFile('database.json') : new JSONFile('database.json'));
global.DATABASE = global.db;

global.loadDatabase = async function loadDatabase() {
    if (global.db.READ) {
        return new Promise((resolve) => setInterval(async function () {
            if (!global.db.READ) {
                clearInterval(this);
                resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
            }
        }, 1 * 1000));
    }
    if (global.db.data !== null) return;
    global.db.READ = true;
    await global.db.read().catch(console.error);
    global.db.READ = null;
    global.db.data = {
        users: {},
        chats: {},
        stats: {},
        settings: {},
        ...(global.db.data || {}),
    };
    global.db.chain = chain(global.db.data);
};
loadDatabase();

if (global.conns instanceof Array) {
    console.log(chalk.cyan('Connessioni già inizializzate...'));
} else {
    global.conns = [];
}

global.creds = 'creds.json';
global.authFile = 'varesession';
global.authFileJB = 'varebot-sub';

setPerformanceConfig({
    performance: { enableCache: true, enableMetrics: true },
    debug: { enableLidLogging: false, logLevel: 'error' }
});

const { state, saveCreds } = await useMultiFileAuthState(global.authFile);
const msgRetryCounterCache = new NodeCache();
const question = (t) => {
    process.stdout.write(t);
    return new Promise((resolve) => {
        process.stdin.once('data', (data) => {
            resolve(data.toString().trim());
        });
    });
};

let opzione;
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${authFile}/creds.json`)) {
    do {
        const color1 = chalk.hex('#00D2FF'); 
        const color2 = chalk.hex('#3A7BD5'); 
        const sm = chalk.bold.hex('#FFFFFF')('SELEZIONE METODO DI ACCESSO ✦');
        opzione = await question(`\n${color1('╭━━━━━━━ ✨ ʙʟᴏᴏᴅ-ʙᴏᴛ ✨ ━━━━━━━╮')}\n\n          ${sm}\n\n 1. Scansione QR Code\n 2. Codice 8 Cifre\n\n${color1('╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯')}\n\n⌯ Inserisci scelta: `);
    } while (opzione !== '1' && opzione !== '2');
}

const filterStrings = ["Q2xvc2luZyBzdGFsZSBvcGVu", "Q2xvc2luZyBvcGVuIHNlc3Npb24=", "RmFpbGVkIHRvIGRlY3J5cHQ="];
console.info = () => {};
console.debug = () => {};
['log', 'warn', 'error'].forEach(methodName => redefineConsoleMethod(methodName, filterStrings));

const logger = pino({ level: 'silent' });
global.jidCache = new NodeCache({ stdTTL: 600, useClones: false });
global.store = makeInMemoryStore({ logger });

const connectionOptions = {
    logger: logger,
    mobile: MethodMobile,
    browser: opzione === '1' ? Browsers.windows('Chrome') : Browsers.macOS('Safari'),
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    connectTimeoutMs: 90000, 
    defaultQueryTimeoutMs: 0,
    keepAliveIntervalMs: 30000, 
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    decodeJid: (jid) => {
        if (!jid) return jid;
        const cached = global.jidCache.get(jid);
        if (cached) return cached;
        let decoded = jid;
        if (/:\d+@/gi.test(jid)) decoded = jidNormalizedUser(jid);
        global.jidCache.set(jid, decoded);
        return decoded;
    },
    printQRInTerminal: (opzione === '1' || methodCodeQR),
    getMessage: async (key) => {
        const jid = jidNormalizedUser(key.remoteJid);
        const msg = await global.store.loadMessage(jid, key.id);
        return msg?.message || undefined;
    },
    msgRetryCounterCache,
    retryRequestDelayMs: 1000,
    maxMsgRetryCount: 3,
};

global.conn = makeWASocket(connectionOptions);

// HEARTBEAT OTTIMIZZATO (30 SECONDI)
setInterval(async () => {
    if (global.conn && global.conn.user) {
        try {
            await global.conn.sendPresenceUpdate('available');
        } catch (e) {}
    }
}, 30000);

global.store.bind(global.conn.ev);

if (!fs.existsSync(`./${authFile}/creds.json`)) {
    if (opzione === '2' || methodCode) {
        if (!conn.authState.creds.registered) {
            let addNumber = phoneNumber ? phoneNumber.replace(/[^0-9]/g, '') : (await question(chalk.cyan('Inserisci numero (+39...): '))).replace(/\D/g, '');
            setTimeout(async () => {
                let codeBot = await conn.requestPairingCode(addNumber, 'BLOODBOT');
                console.log(chalk.bold.black(chalk.bgCyan(' CODICE DI ABBINAMENTO: ')), chalk.bold.cyanBright(codeBot?.match(/.{1,4}/g)?.join("-") || codeBot));
            }, 3000);
        }
    }
}

conn.isInit = false;
async function bysamakavare() {
    try { await global.conn.newsletterFollow('120363418582531215@newsletter'); } catch (e) {}
}

async function connectionUpdate(update) {
    const { connection, lastDisconnect, qr } = update;
    if (qr && !global.qrGenerated) {
        console.log(chalk.bold.cyan(`\n 🌀 SCANSIONA IL QR 🌀`));
        global.qrGenerated = true;
    }
    if (connection === 'open') {
        console.log(chalk.bold.green('\n[SISTEMA]: Il Diplomatico è online.'));
        global.isLogoPrinted = true;
        await bysamakavare();
    }
    if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
        console.log(chalk.yellow(`\n[CONNESSIONE]: Chiusa. Ragione: ${reason}. Riavvio...`));
        if (reason !== DisconnectReason.loggedOut) {
            await global.reloadHandler(true);
        } else {
            process.exit(1);
        }
    }
}

process.on('uncaughtException', console.error);

(async () => {
    conn.ev.on('connection.update', connectionUpdate);
    conn.ev.on('creds.update', saveCreds);
})();

let isInit = true;
let handler = await import('./handler.js');
global.reloadHandler = async function (restatConn) {
    try {
        const Handler = await import(`./handler.js?update=${Date.now()}`);
        if (Object.keys(Handler || {}).length) handler = Handler;
    } catch (e) { console.error(e); }
    if (restatConn) {
        try { global.conn.ws.close(); } catch { }
        conn.ev.removeAllListeners();
        global.conn = makeWASocket(connectionOptions);
        global.store.bind(global.conn.ev);
        isInit = true;
    }
    conn.handler = handler.handler.bind(global.conn);
    conn.connectionUpdate = connectionUpdate.bind(global.conn);
    conn.credsUpdate = saveCreds;
    conn.ev.on('messages.upsert', conn.handler);
    conn.ev.on('connection.update', conn.connectionUpdate);
    conn.ev.on('creds.update', conn.credsUpdate);
    isInit = false;
    return true;
};

// Caricamento plugin e watcher
const pluginFolder = path.join(__dirname, './plugins');
const pluginFilter = (filename) => /\.js$/.test(filename);
global.plugins = {};
async function filesInit() {
    for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
        try {
            const file = global.__filename(join(pluginFolder, filename));
            const module = await import(file);
            global.plugins[filename] = module.default || module;
        } catch (e) { delete global.plugins[filename]; }
    }
}
filesInit().then(() => console.log(chalk.green('Plugin caricati.')));

watch(pluginFolder, async (_ev, filename) => {
    if (pluginFilter(filename)) {
        const dir = path.join(pluginFolder, filename);
        if (existsSync(dir)) {
            const module = await import(`${pathToFileURL(dir).href}?update=${Date.now()}`);
            global.plugins[filename] = module.default || module;
        } else {
            delete global.plugins[filename];
        }
    }
}).setMaxListeners(0);

await global.reloadHandler();

// Pulizia automatica TMP ogni ora
setInterval(() => {
    const tmpDir = join(__dirname, 'tmp');
    if (existsSync(tmpDir)) {
        readdirSync(tmpDir).forEach(f => unlinkSync(join(tmpDir, f)));
    }
}, 3600000);

conn.ev.on('connection.update', (update) => {
    if (update.connection === 'open') ripristinaTimer(conn);
});
