// crediti https://github.com/axion-bot/axion-bot-Md

import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { builtinModules, createRequire } from 'module'

const require = createRequire(import.meta.url)

const builtins = new Set([
  ...builtinModules,
  ...builtinModules.map(m => `node:${m}`)
])

const getImports = (code) => {
  const imports = new Set()

  const importRegex = /import\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]/g
  const requireRegex = /require\(\s*['"]([^'"]+)['"]\s*\)/g
  const dynamicImportRegex = /import\(\s*['"]([^'"]+)['"]\s*\)/g

  let match
  while ((match = importRegex.exec(code))) imports.add(match[1])
  while ((match = requireRegex.exec(code))) imports.add(match[1])
  while ((match = dynamicImportRegex.exec(code))) imports.add(match[1])

  return [...imports]
}

const isExternal = (pkg) => {
  return !pkg.startsWith('.') && !pkg.startsWith('/') && !builtins.has(pkg)
}

const getBasePackageName = (pkg) => {
  if (pkg.startsWith('@')) {
    const parts = pkg.split('/')
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : pkg
  }
  return pkg.split('/')[0]
}

const isInstalled = (pkg) => {
  try {
    require.resolve(pkg)
    return true
  } catch {
    try {
      require.resolve(getBasePackageName(pkg))
      return true
    } catch {
      return false
    }
  }
}

const scanMissing = () => {
  const pluginsDir = path.join(process.cwd(), 'plugins')
  let missing = {}

  if (!fs.existsSync(pluginsDir)) return missing

  const files = fs.readdirSync(pluginsDir)

  for (const file of files) {
    if (!file.endsWith('.js')) continue

    const code = fs.readFileSync(path.join(pluginsDir, file), 'utf8')
    const imports = getImports(code)

    for (const imp of imports) {
      if (!isExternal(imp)) continue

      const base = getBasePackageName(imp)

      if (!isInstalled(imp)) {
        if (!missing[base]) missing[base] = []
        missing[base].push(file)
      }
    }
  }

  return missing
}

const install = (pkg) => {
  return new Promise((resolve, reject) => {
    exec(`npm install ${pkg}`, (err, stdout, stderr) => {
      if (err) return reject(stderr || err.message)
      resolve(stdout)
    })
  })
}

let handler = async (m, { conn, args, command, usedPrefix }) => {
  if (command === 'dipendenze') {
    const missing = scanMissing()

    if (!Object.keys(missing).length) {
      return m.reply('✅ Nessuna dipendenza mancante')
    }

    const mods = Object.keys(missing)

    let text = `📦 *DIPENDENZE MANCANTI*\n\n`

    for (const [dep, files] of Object.entries(missing)) {
      text += `❌ *${dep}*\n`
      text += `   ↳ ${[...new Set(files)].join(', ')}\n\n`
    }

    const maxButtons = 10

    const buttons = mods.slice(0, maxButtons).map(dep => ({
      buttonId: `${usedPrefix}installa ${dep}`,
      buttonText: { displayText: `📥 ${dep}` },
      type: 1
    }))

    if (mods.length > maxButtons) {
      text += `⚠️ Mostro i primi ${maxButtons} moduli.\n`
      text += `Usa: ${usedPrefix}installa <modulo> per gli altri`
    }

    return conn.sendMessage(m.chat, {
      text,
      footer: 'Premi per installare',
      buttons,
      headerType: 1
    }, { quoted: m })
  }

  if (command === 'installa') {
    let mod = (args.join(' ') || '').replace(/[()]/g, '').trim()
    if (!mod) return m.reply('📦 Scrivi il modulo')

    await m.reply(`⏳ Installo *${mod}*...`)

    try {
      await install(mod)
      return m.reply(`✅ Installato: ${mod}

⚠️ Riavvia il bot per applicare le modifiche`)
    } catch (e) {
      return m.reply(`❌ Errore:\n${String(e).slice(0, 200)}`)
    }
  }

  if (command === 'installaall') {
    const missing = scanMissing()
    const mods = Object.keys(missing)

    if (!mods.length) return m.reply('✅ Nessuna dipendenza mancante')

    await m.reply(`🚀 Installo:\n${mods.join(', ')}`)

    let ok = []
    let ko = []

    for (const mod of mods) {
      try {
        await install(mod)
        ok.push(mod)
      } catch {
        ko.push(mod)
      }
    }

    let out = `✅ Installate: ${ok.length ? ok.join(', ') : 'nessuna'}`
    if (ko.length) out += `\n❌ Fallite: ${ko.join(', ')}`

    out += `\n\n⚠️ Riavvia il bot per applicare le modifiche`

    return m.reply(out)
  }
}

handler.command = /^(dipendenze|installa|installaall)$/i
handler.owner = true

export default handler