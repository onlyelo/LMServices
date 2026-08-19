#!/usr/bin/env node
/**
 * Prépare les déclinaisons du logo à partir du fichier source.
 *
 * Le logo d'origine est une raclette dorée sur fond noir **opaque**, en 1246 px
 * et 812 Ko. Tel quel il poserait deux problèmes : un carré noir visible sur la
 * barre de navigation transparente au-dessus du hero, et un poids absurde pour
 * une image affichée en 36 px.
 *
 * On reconstruit donc la transparence : le fond étant du noir pur, la
 * luminance du pixel EST son opacité. On pose alpha = max(r, g, b), puis on
 * « dé-prémultiplie » la couleur (rgb / alpha) pour retrouver l'or saturé
 * plutôt qu'un or assombri par le fond.
 *
 *   node scripts/build-logo.mjs [source]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')
const source = process.argv[2] ?? join(publicDir, 'logo-source.png')

const input = sharp(readFileSync(source)).ensureAlpha()
const { width, height } = await input.metadata()
const { data } = await input.raw().toBuffer({ resolveWithObject: true })

// Pixel le plus lumineux de l’image : sert de référence pour que les aplats
// deviennent parfaitement opaques, sans toucher aux bords antialiasés.
let peak = 0
for (let i = 0; i < data.length; i += 4) {
  const luma = Math.max(data[i], data[i + 1], data[i + 2])
  if (luma > peak) peak = luma
}

for (let i = 0; i < data.length; i += 4) {
  const luma = Math.max(data[i], data[i + 1], data[i + 2])
  // La couleur d’origine est conservée telle quelle : la « dé-prémultiplier »
  // délave l’or vers le blanc. Le logo n’est utilisé que sur fond sombre,
  // où l’or composité rend exactement la teinte voulue.
  data[i + 3] = Math.min(255, Math.round((luma / peak) * 255))
}

const transparent = sharp(data, { raw: { width, height, channels: 4 } })
  // trim() retire la marge devenue transparente autour de la raclette.
  .trim({ threshold: 12 })

const targets = [
  { file: 'logo.png', width: 256 },
  { file: 'apple-touch-icon.png', width: 180, background: '#0A0A0B' },
  { file: 'favicon-32.png', width: 32, background: '#0A0A0B' },
  // Vignette de partage : format paysage attendu par les réseaux sociaux.
  // Un PNG transparent de 256 px y apparaîtrait minuscule et sur un fond
  // imprévisible selon la plateforme.
  { file: 'og-image.png', width: 1200, height: 630, background: '#0A0A0B', logoWidth: 420 },
]

for (const target of targets) {
  const framed = Boolean(target.background)
  const canvasWidth = target.width
  const canvasHeight = target.height ?? target.width
  // Largeur de la raclette DANS le cadre. Sans cette contrainte, un
  // redimensionnement « contain » agrandirait le logo jusqu’aux bords.
  const inner = target.logoWidth ?? (framed ? Math.round(canvasWidth * 0.62) : canvasWidth)

  const mark = await transparent
    .clone()
    .resize({ width: inner, fit: 'inside', withoutEnlargement: false })
    .png()
    .toBuffer()

  let out
  if (framed) {
    // Canevas plein, puis la raclette déposée au centre : la transparence
    // interne du logo laisse voir le fond au lieu de rester à nu.
    out = await sharp({
      create: {
        width: canvasWidth,
        height: canvasHeight,
        channels: 4,
        background: target.background,
      },
    })
      .composite([{ input: mark, gravity: 'center' }])
      .png({ compressionLevel: 9 })
      .toBuffer()
  } else {
    out = mark
  }

  writeFileSync(join(publicDir, target.file), out)

  const meta = await sharp(out).metadata()
  console.log(
    `  ${target.file.padEnd(22)} ${String(meta.width).padStart(4)}x${String(meta.height).padEnd(4)} ${String(
      Math.round(out.length / 1024),
    ).padStart(4)} Ko`,
  )
}

console.log('\nDéclinaisons du logo régénérées.')
