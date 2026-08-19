#!/usr/bin/env node
/**
 * Récupère le chat_id Telegram et l'écrit dans .env.
 *
 * Telegram ne connaît un chat qu'après un premier message : il faut donc
 * avoir écrit au bot au moins une fois avant de lancer ce script.
 * Attention, `getUpdates` ne conserve les messages que ~24 h.
 *
 *   npm run telegram:chat-id
 */
import 'dotenv/config'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env')

const TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? ''

if (!TOKEN) {
  console.error('\x1b[31mTELEGRAM_BOT_TOKEN absent de .env\x1b[0m')
  process.exit(1)
}

const res = await fetch(`https://api.telegram.org/bot${TOKEN}/getUpdates`)
const data = await res.json()

if (!data.ok) {
  console.error('\x1b[31mTelegram a répondu une erreur :\x1b[0m', data)
  process.exit(1)
}

const chats = new Map()
for (const update of data.result ?? []) {
  const msg =
    update.message ?? update.edited_message ?? update.channel_post ?? update.my_chat_member
  if (msg?.chat) {
    chats.set(msg.chat.id, msg.chat)
  }
}

if (chats.size === 0) {
  console.log('\x1b[33m─────────────────────────────────────────────\x1b[0m')
  console.log('  Aucun chat trouvé.')
  console.log('')
  console.log('  1. Ouvrir Telegram et chercher \x1b[1m@LMS_devis_bot\x1b[0m')
  console.log('  2. Appuyer sur \x1b[1mDémarrer\x1b[0m, ou envoyer « bonjour »')
  console.log('  3. Relancer \x1b[1mnpm run telegram:chat-id\x1b[0m')
  console.log('')
  console.log('  Note : getUpdates ne garde les messages que ~24 h.')
  console.log('\x1b[33m─────────────────────────────────────────────\x1b[0m')
  process.exit(1)
}

console.log('\nChats détectés :')
for (const [id, chat] of chats) {
  const who = chat.title ?? [chat.first_name, chat.last_name].filter(Boolean).join(' ')
  console.log(`  \x1b[1m${id}\x1b[0m  (${chat.type})  ${who}${chat.username ? ` @${chat.username}` : ''}`)
}

const [chatId] = [...chats.keys()]

let env = ''
try {
  env = readFileSync(envPath, 'utf8')
} catch {
  // .env absent : on le crée
}

const line = `TELEGRAM_CHAT_ID=${chatId}`
env = /^TELEGRAM_CHAT_ID=.*$/m.test(env)
  ? env.replace(/^TELEGRAM_CHAT_ID=.*$/m, line)
  : `${env.trimEnd()}\n${line}\n`

writeFileSync(envPath, env)

console.log(`\n\x1b[32m✓ ${line} écrit dans .env\x1b[0m`)
console.log('  Redémarrer le serveur pour qu\'il le prenne en compte.\n')
