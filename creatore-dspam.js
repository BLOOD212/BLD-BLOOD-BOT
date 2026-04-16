const handler = async (m, { conn, args }) => {
    if (args.length < 1) {
        return m.reply(`Uso corretto: .dspam <quantità>\nEsempio: .dspam 5`);
    }

    let times = parseInt(args[0]);
    if (isNaN(times) || times < 1) return m.reply("La quantità deve essere un numero valido maggiore di 0.");
    if (times > 20) times = 20; // Limite per evitare ban/crash


    const groupMetadata = await conn.groupMetadata(m.chat);
    const mentions = groupMetadata.participants.map(u => u.id);


    const spamText = 
`𝐓𝐔𝐓𝐓𝐈 𝐐𝐔𝐈:
https://chat.whatsapp.com/KUSSxRBOvkiKoiUWmobniC
`;

    const sleep = ms => new Promise(res => setTimeout(res, ms));

    for (let i = 0; i < times; i++) {
        await conn.relayMessage(
            m.chat,
            {
                requestPaymentMessage: {
                    noteMessage: {
                        extendedTextMessage: {
                            text: spamText,
                            contextInfo: {
                                mentionedJid: mentions,
                                externalAdReply: {
                                    title: 'AxtralBot Broadcast',
                                    body: 'Unisciti ora!',
                                    mediaType: 1,
                                    renderLargerThumbnail: true,
                                    showAdAttribution: false
                                }
                            }
                        },
                        currencyCodeIso4217: 'USD',
                        requestFrom: '0@s.whatsapp.net',
                        amount: 99,
                        expiryTimestamp: Date.now() + 99999
                    }
                }
            },
            {}
        );

        if (i < times - 1) {
    await sleep(800);
       }
    }
};

handler.help = ['dspam <quantità>'];
handler.tags = ['fun', 'spam'];
handler.command = /^dspam$/i;
handler.group = true;
handler.owner = true;

export default handler;