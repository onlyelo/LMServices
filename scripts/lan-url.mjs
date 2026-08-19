#!/usr/bin/env node
/**
 * Affiche les URL joignables depuis l'iPad + un QR code a scanner.
 * Lance automatiquement avant `vite` via `npm run dev`.
 */
import os from 'node:os'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

function readPort() {
  try {
    const cfg = readFileSync(join(__dirname, '..', 'vite.config.ts'), 'utf8')
    const m = cfg.match(/port:\s*(\d{2,5})/)
    return m ? Number(m[1]) : 5173
  } catch {
    return 5173
  }
}

/** Interfaces IPv4 externes, VPN et docker relegues en fin de liste. */
function lanAddresses() {
  const out = []
  for (const [name, addrs] of Object.entries(os.networkInterfaces())) {
    for (const a of addrs ?? []) {
      if (a.family !== 'IPv4' || a.internal) continue
      if (a.address.startsWith('169.254.')) continue
      const isPrivate =
        a.address.startsWith('192.168.') ||
        a.address.startsWith('10.') ||
        /^172\.(1[6-9]|2\d|3[01])\./.test(a.address)
      const isVirtual = /vpn|nordlynx|wireguard|tailscale|vethernet|docker|hyper-v|vmware|virtualbox|wsl/i.test(name)
      out.push({ name, address: a.address, isPrivate, isVirtual })
    }
  }
  return out.sort((x, y) => Number(x.isVirtual) - Number(y.isVirtual) || Number(y.isPrivate) - Number(x.isPrivate))
}

const port = readPort()
const addrs = lanAddresses()
const best = addrs.find((a) => a.isPrivate && !a.isVirtual) ?? addrs[0]

const line = '─'.repeat(52)
console.log(`\n\x1b[36m${line}\x1b[0m`)
console.log('\x1b[1m  Acces depuis l\'iPad (meme reseau Wi-Fi)\x1b[0m')
console.log(`\x1b[36m${line}\x1b[0m`)
console.log(`  local     \x1b[2mhttp://localhost:${port}/\x1b[0m`)

if (addrs.length === 0) {
  console.log('  \x1b[33m! aucune adresse reseau detectee — PC hors reseau ?\x1b[0m')
} else {
  for (const a of addrs) {
    const url = `http://${a.address}:${port}/`
    const tag = a === best ? '\x1b[32m→ iPad   \x1b[0m' : '  autre   '
    const note = a.isVirtual ? ' \x1b[2m(interface virtuelle / VPN)\x1b[0m' : ` \x1b[2m(${a.name})\x1b[0m`
    console.log(`${tag}\x1b[1m${url}\x1b[0m${note}`)
  }
}

if (best) {
  const url = `http://${best.address}:${port}/`
  try {
    const { default: qrcode } = await import('qrcode-terminal')
    console.log('')
    qrcode.generate(url, { small: true })
    console.log(`  \x1b[2mScanne ce QR avec l'appareil photo de l'iPad\x1b[0m`)
  } catch {
    console.log(`\n  \x1b[2m(npm i -D qrcode-terminal pour afficher un QR code)\x1b[0m`)
  }
}

console.log(`\x1b[36m${line}\x1b[0m`)
console.log('  \x1b[2mRien ne s\'affiche sur l\'iPad ? -> voir README.md § Depannage\x1b[0m')
console.log(`\x1b[36m${line}\x1b[0m\n`)
