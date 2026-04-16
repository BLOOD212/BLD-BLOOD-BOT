import axios from 'axios';
import React from 'react';
import { renderToString } from 'react-dom/server';

// ... (mantieni la funzione getRank invariata) ...
const getRank = (euro) => {
    if (euro >= 100000) return { name: 'CEO', emoji: '💼' };
    if (euro >= 50000) return { name: 'Investitore', emoji: '📈' };
    if (euro >= 25000) return { name: 'Avvocato', emoji: '⚖️' };
    if (euro >= 10000) return { name: 'Ingegnere', emoji: '🛠️' };
    if (euro >= 5000) return { name: 'Commesso', emoji: '🛍️' };
    return { name: 'Tirocinante', emoji: '🧑‍💼' };
};

// ... (mantieni la funzione createBankCard invariata) ...
const createBankCard = (props) => {
    const { user, name, isOwner } = props;
    const totalStars = user.euro + user.bank;
    const bankPercentage = ((user.bank / totalStars) * 100 || 0).toFixed(1);
    const userRank = getRank(user.euro);
    
    // Stili CSS aggiuntivi per le animazioni, se necessario
    const animationStyles = `
        @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
    `;

    return React.createElement('div', {
        style: {
            fontFamily: 'Arial, sans-serif',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            position: 'relative',
            margin: '0',
            boxSizing: 'border-box'
        }
    }, 
        React.createElement('style', null, animationStyles), // Aggiungi gli stili globali qui
        React.createElement('div', {
            style: {
                position: 'absolute',
                top: '10%',
                left: '10%',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                opacity: '0.3'
            }
        }),
        React.createElement('div', {
            style: {
                position: 'absolute',
                top: '70%',
                right: '15%',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                opacity: '0.3'
            }
        }),
        React.createElement('div', {
            style: {
                position: 'absolute',
                bottom: '20%',
                left: '5%',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                opacity: '0.3'
            }
        }),
        
        React.createElement('div', {
            style: {
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '25px',
                padding: '30px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
                maxWidth: '600px',
                width: '100%',
                backdropFilter: 'blur(15px)',
                border: '2px solid rgba(255,255,255,0.3)',
                position: 'relative',
                overflow: 'hidden'
            }
        },
            React.createElement('div', {
                style: {
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    height: '4px',
                    background: 'linear-gradient(90deg, #667eea, #764ba2, #667eea)',
                    backgroundSize: '200% 100%',
                    animation: 'gradient 3s ease infinite'
                }
            }),
            
            React.createElement('div', {
                style: {
                    textAlign: 'center',
                    marginBottom: '25px',
                    borderBottom: '3px solid #667eea',
                    paddingBottom: '20px',
                    position: 'relative'
                }
            },
                React.createElement('div', {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '5px'
                    }
                },
                    React.createElement('div', {
                        style: {
                            width: '45px',
                            height: '45px',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '15px',
                            boxShadow: '0 5px 15px rgba(102, 126, 234, 0.3)'
                        }
                    },
                        React.createElement('span', {
                            style: { fontSize: '22px' }
                        }, '🏦')
                    ),
                    React.createElement('h1', {
                        style: {
                            color: '#2d3748',
                            fontSize: '30px',
                            fontWeight: 'bold',
                            margin: '0',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }
                    }, 'BANCA VAREBOT')
                )
            ),
            
            React.createElement('div', {
                style: {
                    backgroundColor: '#f7fafc',
                    borderRadius: '20px',
                    padding: '25px',
                    marginBottom: '25px',
                    border: '2px solid #e2e8f0',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                }
            },
                React.createElement('div', {
                    style: {
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        width: '100px',
                        height: '100px',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        borderRadius: '50%',
                        opacity: '0.1',
                        transform: 'translate(30px, -30px)'
                    }
                }),
                React.createElement('div', {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '20px',
                        position: 'relative'
                    }
                },
                    React.createElement('div', {
                        style: {
                            width: '60px',
                            height: '60px',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '18px',
                            boxShadow: '0 10px 20px rgba(102, 126, 234, 0.3)',
                            border: '3px solid rgba(255,255,255,0.8)'
                        }
                    },
                        React.createElement('span', {
                            style: { fontSize: '24px' }
                        }, '👤')
                    ),
                    React.createElement('div', null,
                        React.createElement('h2', {
                            style: {
                                color: '#2d3748',
                                fontSize: '24px',
                                margin: '0',
                                fontWeight: 'bold'
                            }
                        }, name),
                        React.createElement('div', {
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                marginTop: '8px'
                            }
                        },
                            React.createElement('span', {
                                style: {
                                    backgroundColor: isOwner ? '#48bb78' : '#667eea',
                                    color: 'white',
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    marginRight: '8px'
                                }
                            }, isOwner ? 'PROPRIETARIO' : 'UTENTE'),
                            React.createElement('span', {
                                style: {
                                    backgroundColor: '#ffd700',
                                    color: '#2d3748',
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    fontSize: '11px',
                                    fontWeight: 'bold'
                                }
                            }, 'PREMIUM')
                        )
                    )
                )
            ),
            
            React.createElement('div', {
                style: {
                    backgroundColor: '#fff',
                    borderRadius: '20px',
                    padding: '25px',
                    marginBottom: '25px',
                    border: '2px solid #e2e8f0',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                }
            },
                React.createElement('div', {
                    style: {
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        fontSize: '35px',
                        opacity: '0.1'
                    }
                }, '💰'),
                React.createElement('div', {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '15px'
                    }
                },
                    React.createElement('span', {
                        style: { fontSize: '20px', marginRight: '10px' }
                    }, '💰'),
                    React.createElement('h3', {
                        style: {
                            color: '#2d3748',
                            fontSize: '18px',
                            margin: '0',
                            fontWeight: 'bold'
                        }
                    }, 'Patrimonio in Banca')
                ),
                
                React.createElement('div', {
                    style: {
                        background: 'linear-gradient(135deg, #48bb78, #38a169)',
                        borderRadius: '15px',
                        padding: '20px',
                        color: 'white',
                        boxShadow: '0 8px 16px rgba(72, 187, 120, 0.3)',
                        position: 'relative',
                        overflow: 'hidden'
                    }
                },
                    React.createElement('div', {
                        style: {
                            position: 'absolute',
                            top: '0',
                            right: '0',
                            width: '80px',
                            height: '80px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '50%',
                            transform: 'translate(20px, -20px)'
                        }
                    }),
                    React.createElement('div', {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            position: 'relative'
                        }
                    },
                        React.createElement('div', {
                            style: { display: 'flex', alignItems: 'center' }
                        },
                            React.createElement('span', {
                                style: { fontSize: '32px', marginRight: '15px' }
                            }, '🪙'),
                            React.createElement('div', null,
                                React.createElement('p', {
                                    style: {
                                        fontSize: '14px',
                                        margin: '0',
                                        fontWeight: 'bold',
                                        opacity: '0.9'
                                    }
                                }, 'Euro Depositati'),
                                React.createElement('p', {
                                    style: {
                                        fontSize: '26px',
                                        margin: '5px 0 0 0',
                                        fontWeight: 'bold'
                                    }
                                }, user.bank.toLocaleString())
                            )
                        ),
                        React.createElement('div', {
                            style: {
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                padding: '10px 15px',
                                borderRadius: '20px',
                                textAlign: 'center',
                                border: '2px solid rgba(255,255,255,0.3)'
                            }
                        },
                            React.createElement('div', {
                                style: { fontSize: '12px', opacity: '0.8' }
                            }, 'Percentuale'),
                            React.createElement('div', {
                                style: { fontSize: '16px', fontWeight: 'bold' }
                            }, `${bankPercentage}%`)
                        )
                    )
                )
            ),
            
            React.createElement('div', {
                style: {
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '15px',
                    marginBottom: '25px'
                }
            },
                React.createElement('div', {
                    style: {
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '2px solid #f6ad55',
                        textAlign: 'center',
                        boxShadow: '0 5px 15px rgba(246, 173, 85, 0.2)',
                        background: 'linear-gradient(135deg, #fef5e7, #fed7aa)'
                    }
                },
                    React.createElement('div', {
                        style: { fontSize: '22px', marginBottom: '6px' }
                    }, '🆙'),
                    React.createElement('p', {
                        style: {
                            color: '#2d3748',
                            fontSize: '10px',
                            margin: '0',
                            fontWeight: 'bold'
                        }
                    }, 'Livello'),
                    React.createElement('p', {
                        style: {
                            color: '#d69e2e',
                            fontSize: '18px',
                            margin: '4px 0 0 0',
                            fontWeight: 'bold'
                        }
                    }, user.level)
                ),
                
                React.createElement('div', {
                    style: {
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '2px solid #4fd1c7',
                        textAlign: 'center',
                        boxShadow: '0 5px 15px rgba(79, 209, 199, 0.2)',
                        background: 'linear-gradient(135deg, #e6fffa, #b2f5ea)'
                    }
                },
                    React.createElement('div', {
                        style: { fontSize: '22px', marginBottom: '6px' }
                    }, '⚜️'),
                    React.createElement('p', {
                        style: {
                            color: '#2d3748',
                            fontSize: '10px',
                            margin: '0',
                            fontWeight: 'bold'
                        }
                    }, 'Ruolo'),
                    React.createElement('p', {
                        style: {
                            color: '#319795',
                            fontSize: '18px',
                            margin: '4px 0 0 0',
                            fontWeight: 'bold'
                        }
                    }, user.role)
                ),
                
                React.createElement('div', {
                    style: {
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '2px solid #9f7aea',
                        textAlign: 'center',
                        boxShadow: '0 5px 15px rgba(159, 122, 234, 0.2)',
                        background: 'linear-gradient(135deg, #faf5ff, #e9d5ff)'
                    }
                },
                    React.createElement('div', {
                        style: { fontSize: '22px', marginBottom: '6px' }
                    }, userRank.emoji),
                    React.createElement('p', {
                        style: {
                            color: '#2d3748',
                            fontSize: '10px',
                            margin: '0',
                            fontWeight: 'bold'
                        }
                    }, 'Lavoro'),
                    React.createElement('p', {
                        style: {
                            color: '#805ad5',
                            fontSize: '18px',
                            margin: '4px 0 0 0',
                            fontWeight: 'bold'
                        }
                    }, userRank.name)
                )
            ),
            
            React.createElement('div', {
                style: {
                    backgroundColor: '#f7fafc',
                    borderRadius: '15px',
                    padding: '20px',
                    border: '2px solid #e2e8f0',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                    marginBottom: '15px'
                }
            },
                React.createElement('div', {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '15px'
                    }
                },
                    React.createElement('span', {
                        style: { fontSize: '18px', marginRight: '8px' }
                    }, '📈'),
                    React.createElement('h3', {
                        style: {
                            color: '#2d3748',
                            fontSize: '16px',
                            margin: '0',
                            fontWeight: 'bold'
                        }
                    }, 'Informazioni Aggiuntive')
                ),
                
                React.createElement('div', {
                    style: {
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px'
                    }
                },
                    React.createElement('div', {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: '#fff',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                        }
                    },
                        React.createElement('span', {
                            style: { fontSize: '16px', marginRight: '8px' }
                        }, '💎'),
                        React.createElement('div', null,
                            React.createElement('p', {
                                style: {
                                    color: '#4a5568',
                                    fontSize: '10px',
                                    margin: '0',
                                    fontWeight: 'bold'
                                }
                            }, 'Patrimonio Totale'),
                            React.createElement('p', {
                                style: {
                                    color: '#2d3748',
                                    fontSize: '14px',
                                    margin: '2px 0 0 0',
                                    fontWeight: 'bold'
                                }
                            }, totalStars.toLocaleString())
                        )
                    ),
                    React.createElement('div', {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: '#fff',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                        }
                    },
                        React.createElement('span', {
                            style: { fontSize: '16px', marginRight: '8px' }
                        }, '🔒'),
                        React.createElement('div', null,
                            React.createElement('p', {
                                style: {
                                    color: '#4a5568',
                                    fontSize: '10px',
                                    margin: '0',
                                    fontWeight: 'bold'
                                }
                            }, 'Sicurezza'),
                            React.createElement('p', {
                                style: {
                                    color: '#48bb78',
                                    fontSize: '14px',
                                    margin: '2px 0 0 0',
                                    fontWeight: 'bold'
                                }
                            }, 'ATTIVA')
                        )
                    )
                )
            ),
            
            React.createElement('div', {
                style: {
                    textAlign: 'center',
                    marginTop: '20px',
                    paddingTop: '15px',
                    borderTop: '2px solid #e2e8f0'
                }
            },
                React.createElement('div', {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '5px'
                    }
                },
                    React.createElement('span', {
                        style: { fontSize: '14px', marginRight: '6px' }
                    }, '✨'),
                    React.createElement('p', {
                        style: {
                            color: '#718096',
                            fontSize: '12px',
                            margin: '0',
                            fontWeight: 'bold'
                        }
                    }, '*─ׄ✦⋆⁺₊✧ 𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙 ✧₊⁺⋆✦─ׅ⭒*')
                ),
                React.createElement('p', {
                    style: {
                        color: '#a0aec0',
                        fontSize: '10px',
                        margin: '3px 0 0 0',
                        fontStyle: 'italic'
                    }
                }, 'Sicuro • Veloce • Affidabile')
            )
        )
    );
};

export const generateBankImage = async (userData) => {
    const screenshotone = `${global.APIKeys.screenshotone || global.APIKeys.screenshotone_default}`;
    try {
        const reactElement = createBankCard(userData);
        const htmlContent = renderToString(reactElement);

        const fullHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Bank Card</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                        font-family: Arial, sans-serif;
                        background: transparent;
                    }
                    /* Includi qui gli stili @keyframes se non sono già nel componente React */
                    @keyframes gradient {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                </style>
            </head>
            <body>
                ${htmlContent}
            </body>
            </html>
        `;
        const screenshotOneUrl = `https://api.screenshotone.com/take?access_key=${screenshotone}&html=${encodeURIComponent(fullHtml)}&viewport_width=480&viewport_height=640&format=png&full_page=true&device_scale_factor=2`;
        const response = await axios.get(screenshotOneUrl, {
            responseType: 'arraybuffer'
        });
        return response.data;

    } catch (error) {
        console.error('Errore durante la generazione dello screenshot con ScreenshotOne:', error.response ? error.response.data : error.message);
        throw new Error('Impossibile generare l\'immagine della banca. Riprova più tardi.');
    }
};
let handler = async (m, { conn, usedPrefix }) => {
    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender;
    if (who == conn.user.jid) return m.react('✖️');
    if (!(who in global.db.data.users)) return m.reply(`*L'utente non si trova nel mio database*`);
    
    let user = global.db.data.users[who];
    let name = conn.getName(who);
    let isOwner = who === m.sender;
    
    try {
        await m.reply('『 🧑‍💻 』 *Intrufolandomi nella tua app bancaria...*');
        
        const imageBuffer = await generateBankImage({
            user,
            name,
            who,
            usedPrefix,
            isOwner
        });

        const buttons = [
            { buttonId: `${usedPrefix}lavoro`, buttonText: { displayText: '🧑‍💼 Lavora' }, type: 1 },
            { buttonId: `${usedPrefix}deposita all`, buttonText: { displayText: '💰 Deposita Tutto' }, type: 1 },
            { buttonId: `${usedPrefix}menueuro`, buttonText: { displayText: '🏦 Menu Euro' }, type: 1 }
        ];

        await conn.sendMessage(m.chat, {
            image: imageBuffer,
            caption: ` ⋆｡˚『 ╭ \`BANCA BLOODBOT\` ╯ 』˚｡⋆\n╭\n│\n│ 『 💰 』 \`Euro in banca:\`\n│ ➤ *${user.bank.toLocaleString()}*\n│『 📊 』 \`Livello:\` *${user.level}*\n│『 ⚜️ 』 \`Ruolo:\` *${user.role}*\n│\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`,
            buttons: buttons,
            footer: 'vare ㌌ bot',
            mentions: [who]
        }, { quoted: m });
        
    } catch (error) {
        console.error('Errore nella generazione dell\'immagine o nell\'invio del messaggio:', error);
        let txt = `
 ⋆｡˚『 ╭ \`BANCA VAREBOT\` ╯ 』˚｡⋆\n╭\n│
│ 『 👤 』 \`Nome:\` ${name}
│ 『 🍥 』\`Utente:\` @${who.split('@')[0]}
│
│『 💰 』 _*Patrimonio in banca:*_
│ 『 🪙 』 \`euro:\` *${user.bank.toLocaleString()}*
│
│『 📊 』 _*Statistiche:*_
│ 『 🆙 』 \`Livello:\` *${user.level}*
│ 『 ⚜️ 』 \`Ruolo:\` *${user.role}*
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

『 💡 』 *Comandi Disponibili:*
> • ${usedPrefix}deposita all
> • ${usedPrefix}ritira all`;

        await m.reply(txt, null, {
            mentions: [who]
        });
    }
};

handler.help = ['banca', 'bank'];
handler.tags = ['euro'];
handler.command = ['bank', 'banca'];
handler.register = true;
handler.group = true;

export default handler;