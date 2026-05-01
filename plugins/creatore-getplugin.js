import fs from 'fs'
import syntaxError from 'syntax-error'
import path from 'path'

const _fs = fs.promises

let handler = async (m, { text, usedPrefix, command, __dirname, conn }) => {
  if (!text) {
    let files = await _fs.readdir(__dirname)
    let plugins = files.filter(f => f.endsWith('.js'))
    let list = plugins.map((v, i) => `${i + 1}. ${v.replace('.js', '')}`).join('\n')
    return m.reply(`*LISTA PLUGIN DISPONIBILI*\n\n${list}\n\n> Scrivi *${usedPrefix + command} [nome]* per selezionarne uno.`)
  }

  const args = text.split(' ')
  let fileArg = args[0]
  let option = args[1] ? args[1].toLowerCase() : null

  if (!option) {
    const buttons = [
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: '📄 FILE', id: `${usedPrefix + command} ${fileArg} file` })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: '📝 SCRIPT', id: `${usedPrefix + command} ${fileArg} script` })
        }
    ];

    return await conn.sendMessage(m.chat, {
        text: `Come desideri ricevere il plugin: *${fileArg}*?`,
        footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙',
        buttons: buttons,
        headerType: 1,
        viewOnce: true
    }, { quoted: m });
  }

  let isPlugin = /p(lugin)?/i.test(command)
  let filename, pathFile

  if (isPlugin) {
    filename = fileArg.replace(/plugin(s)?\//i, '') + (/\.js$/i.test(fileArg) ? '' : '.js')
    pathFile = path.join(__dirname, filename)
  } else {
    filename = path.basename(fileArg)
    pathFile = fileArg
  }

  const header = "//Plugin fatto da Gabs & 333 Staff\n"

  try {
    const isJS = /\.js$/i.test(filename)
    let fileContent

    if (isJS) {
      fileContent = await _fs.readFile(pathFile, 'utf8')
    } else {
      fileContent = await _fs.readFile(pathFile)
    }

    if (option === 'file') {
      if (isJS) {
        const contentToSend = header + fileContent
        await conn.sendMessage(m.chat, {
          document: Buffer.from(contentToSend, 'utf8'),
          mimetype: 'application/javascript',
          fileName: filename,
          caption: isPlugin ? `Ecco il plugin: ${filename}` : `Ecco il file: ${filename}`
        }, { quoted: m })
      } else {
        await conn.sendMessage(m.chat, {
          document: fileContent,
          fileName: filename,
          caption: `Ecco il file: ${filename}`
        }, { quoted: m })
      }
    } else if (option === 'script') {
      if (!isJS) throw '❌ L\'opzione script è disponibile solo per file JavaScript.'
      await m.reply(`Codice di ${filename}:\n\n\`\`\`js\n${fileContent}\n\`\`\``)
    }

    if (isJS) {
      const error = syntaxError(fileContent, filename, {
        sourceType: 'module',
        allowReturnOutsideFunction: true,
        allowAwaitOutsideFunction: true
      })
      if (error) await m.reply(`⛔️ Errore sintassi in *${filename}*:\n\n${error}`)
    }
  } catch (err) {
    await m.reply(`❌ Errore: Il file *${filename}* non esiste.`)
  }
}

handler.help = ['getplugin']
handler.tags = ['owner']
handler.command = /^g(et)?(p(lugin)?|f(ile)?)$/i
handler.rowner = true

export default handler
