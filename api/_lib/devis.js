import multer from 'multer'

/**
 * Logique métier de la demande de devis, partagée par les deux exécutions :
 *
 * - `api/devis.js`    — fonction serverless Vercel, utilisée en production ;
 * - `server.js`       — serveur Express, utilisé en développement local.
 *
 * Un seul fichier de vérité : deux copies auraient dérivé à la première
 * modification de tarif ou de message.
 *
 * Le préfixe `_` du dossier `_lib` est ce qui empêche Vercel d'exposer ce
 * fichier comme une route publique.
 */

const TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? ''
const CHAT_ID = process.env.TELEGRAM_CHAT_ID ?? ''
const API = `https://api.telegram.org/bot${TOKEN}`

export const isConfigured = () =>
  (process.env.TELEGRAM_BOT_TOKEN ?? '').length > 0 &&
  (process.env.TELEGRAM_CHAT_ID ?? '').length > 0

/**
 * Limites volontairement plus basses que ce qu'accepte Telegram (10 Mo) :
 * des photos de constat n'ont pas besoin de plus, et cela borne l'empreinte
 * mémoire de la fonction. Le front applique les mêmes valeurs.
 */
export const MAX_FILE_BYTES = 4 * 1024 * 1024
export const MAX_FILES = 5
export const MAX_TOTAL_BYTES = 15 * 1024 * 1024
const MEDIA_GROUP_SIZE = 10

/** Délai minimum de remplissage crédible pour un humain, en millisecondes. */
const MIN_FILL_MS = 3000

/** Quotas anti-spam, appliqués à l'identique dans les deux exécutions. */
export const RATE_LIMIT = { windowMs: 24 * 60 * 60 * 1000, limit: 2 }

// Stockage mémoire : les photos ne touchent jamais le disque, il n'y a donc
// aucun fichier temporaire à nettoyer ni aucune rétention possible.
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES, files: MAX_FILES },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Seules les images sont acceptées.'))
      return
    }
    cb(null, true)
  },
})

/** Exécute un middleware Express hors d'Express, pour la fonction serverless. */
export function runMiddleware(req, res, middleware) {
  return new Promise((resolve, reject) => {
    middleware(req, res, (result) => (result instanceof Error ? reject(result) : resolve(result)))
  })
}

/** Traduit une erreur multer en réponse JSON lisible. */
export function multerErrorMessage(err) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return `Photo trop lourde (${MAX_FILE_BYTES / 1024 / 1024} Mo maximum).`
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return `Trop de photos (${MAX_FILES} maximum).`
    }
    return 'Fichier refusé.'
  }
  return err?.message ?? 'Requête invalide.'
}

/**
 * Telegram est appelé en `parse_mode: HTML` plutôt qu'en Markdown : le Markdown
 * hérité casse dès qu'une valeur saisie contient *, _, ` ou [, et l'API répond
 * alors 400 sans envoyer le message. En HTML il suffit d'échapper trois
 * caractères, ce qui est fiable quel que soit le texte du client.
 */
function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

const OPENING_LABELS = [
  ['standard', 'Fenêtres standard'],
  ['double', 'Double vantail'],
  ['baie', 'Baies vitrées'],
  ['velux', 'Velux'],
  ['porteFenetre', 'Portes-fenêtres'],
]

export function buildMessage(d, photoCount) {
  const counts = d.counts ?? {}
  const lines = [
    '🔔 <b>Nouvelle demande de devis LMS</b>',
    '',
    `👤 <b>Client :</b> ${esc(d.name)}`,
    `📞 <b>Téléphone :</b> ${esc(d.phone)}`,
    `📧 <b>Email :</b> ${esc(d.email || 'non communiqué')}`,
    `📍 <b>Adresse :</b> ${esc(d.address)}, ${esc(d.postalCode)} ${esc(d.city)}`,
    '',
    `🏠 <b>Type de logement :</b> ${esc(d.housing)}`,
    '🪟 <b>Ouvrants :</b>',
  ]

  for (const [key, label] of OPENING_LABELS) {
    lines.push(`  • ${label} : ${Number(counts[key] ?? 0)}`)
  }

  lines.push(
    '',
    `⭐ <b>Forfait choisi :</b> ${esc(d.pack)}`,
    `🚿 <b>Option vitres de douche :</b> ${esc(d.showerDetail ?? (d.shower ? 'oui' : 'non'))}`,
    `📅 <b>Date souhaitée :</b> ${esc(d.date)}`,
    `💬 <b>Message :</b> ${esc(d.message || '(aucun)')}`,
  )

  if (photoCount > 0) {
    lines.push(`📷 <b>Photos :</b> ${photoCount} — envoyée(s) juste après ce message`)
  }

  lines.push(
    '',
    d.acceptedTerms ? '✅ Conditions d’annulation acceptées' : '⚠️ Conditions NON acceptées',
  )

  return lines.join('\n')
}

async function callJson(method, body) {
  const res = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, ...body }),
  })
  const data = await res.json()
  if (!data.ok) throw new Error(`${method} : ${data.description ?? res.status}`)
  return data.result
}

async function callForm(method, form) {
  form.append('chat_id', CHAT_ID)
  const res = await fetch(`${API}/${method}`, { method: 'POST', body: form })
  const data = await res.json()
  if (!data.ok) throw new Error(`${method} : ${data.description ?? res.status}`)
  return data.result
}

function toBlob(file) {
  return new Blob([file.buffer], { type: file.mimetype })
}

/**
 * Envoie les photos en réponse au message de devis.
 * Si un lot est refusé — un HEIC d'iPhone, que Telegram n'accepte pas comme
 * photo — chaque fichier est réessayé en document, ce qui préserve l'original
 * plutôt que de perdre l'envoi.
 */
async function sendPhotos(files, replyTo, clientName) {
  if (files.length === 0) return { sent: 0, failed: [] }

  const caption = `📷 Photos — ${clientName}`
  let sent = 0
  const failed = []

  for (let i = 0; i < files.length; i += MEDIA_GROUP_SIZE) {
    const chunk = files.slice(i, i + MEDIA_GROUP_SIZE)

    try {
      if (chunk.length === 1) {
        const form = new FormData()
        form.append('photo', toBlob(chunk[0]), chunk[0].originalname)
        if (i === 0) form.append('caption', caption)
        if (replyTo) form.append('reply_to_message_id', String(replyTo))
        await callForm('sendPhoto', form)
      } else {
        const form = new FormData()
        const media = chunk.map((file, index) => ({
          type: 'photo',
          media: `attach://file${index}`,
          ...(i === 0 && index === 0 ? { caption } : {}),
        }))
        form.append('media', JSON.stringify(media))
        for (const [index, file] of chunk.entries()) {
          form.append(`file${index}`, toBlob(file), file.originalname)
        }
        if (replyTo) form.append('reply_to_message_id', String(replyTo))
        await callForm('sendMediaGroup', form)
      }
      sent += chunk.length
    } catch (err) {
      console.warn('[LMS] envoi photo refusé, repli en document :', err.message)

      for (const file of chunk) {
        try {
          const form = new FormData()
          form.append('document', toBlob(file), file.originalname)
          if (replyTo) form.append('reply_to_message_id', String(replyTo))
          await callForm('sendDocument', form)
          sent += 1
        } catch (docErr) {
          console.error(`[LMS] photo perdue (${file.originalname}) :`, docErr.message)
          failed.push(file.originalname)
        }
      }
    }
  }

  return { sent, failed }
}

/** Relâche les buffers dès l'envoi terminé. */
function release(files) {
  for (const file of files) {
    file.buffer = null
  }
}

/**
 * Détection de robot. Deux signaux fournis par le formulaire :
 * `website` est un champ piège invisible, `elapsedMs` mesure le temps de
 * remplissage. Renvoie le motif détecté, ou null si la requête semble humaine.
 */
function detectBot(body) {
  const honeypot = String(body?.website ?? '').trim()
  if (honeypot.length > 0) {
    return `champ piège rempli (« ${honeypot.slice(0, 40)} »)`
  }

  const elapsed = Number(body?.elapsedMs)
  if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < MIN_FILL_MS) {
    return `formulaire soumis en ${elapsed} ms`
  }

  return null
}

/** Validation volontairement minimale : le front valide déjà finement. */
function validate(body) {
  return ['name', 'phone', 'address', 'postalCode', 'city'].filter(
    (k) => !String(body?.[k] ?? '').trim(),
  )
}

/**
 * Traitement complet, une fois les fichiers déjà lus par multer.
 * Écrit lui-même la réponse : les deux exécutions se contentent de l'appeler.
 */
export async function processDevis(req, res) {
  const files = req.files ?? []

  try {
    if (!isConfigured()) {
      console.error('[LMS] TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID manquant')
      return res
        .status(503)
        .json({ ok: false, error: 'Le service de notification n’est pas configuré.' })
    }

    // Multipart : les données du devis arrivent dans un champ `payload` JSON.
    // Le corps JSON direct reste accepté, ce qui garde l'endpoint testable.
    let data = req.body
    if (typeof req.body?.payload === 'string') {
      try {
        data = JSON.parse(req.body.payload)
      } catch {
        return res.status(400).json({ ok: false, error: 'Champ payload illisible.' })
      }
    }

    // Le contrôle anti-robot passe avant la validation : inutile de détailler
    // à une machine ce qui manque dans sa requête.
    const suspicion = detectBot(req.body)
    if (suspicion) {
      console.warn(
        `[LMS] robot détecté — ${suspicion} — requête ignorée` +
          (data?.name ? ` (soumis : ${data.name} / ${data.phone ?? 'sans téléphone'})` : ''),
      )
      // Faux succès : un robot qui reçoit une erreur réessaie.
      return res.status(200).json({ ok: true })
    }

    const totalBytes = files.reduce((sum, f) => sum + f.size, 0)
    if (totalBytes > MAX_TOTAL_BYTES) {
      return res.status(400).json({
        ok: false,
        error: `Photos trop volumineuses (${Math.round(MAX_TOTAL_BYTES / 1024 / 1024)} Mo au total maximum).`,
      })
    }

    const missing = validate(data)
    if (missing.length > 0) {
      return res.status(400).json({ ok: false, error: `Champs manquants : ${missing.join(', ')}` })
    }

    const message = await callJson('sendMessage', {
      text: buildMessage(data, files.length),
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    })

    const { sent, failed } = await sendPhotos(files, message?.message_id, data.name)

    console.log(
      `[LMS] demande transmise — ${data.name} (${data.phone})` +
        (files.length > 0 ? ` — ${sent}/${files.length} photo(s)` : ''),
    )

    // Le texte est parti : la demande n'est pas perdue même si une photo a
    // échoué. On le signale sans faire échouer la requête.
    return res.status(200).json({ ok: true, photos: { received: files.length, sent, failed } })
  } catch (err) {
    console.error('[LMS] échec de l’envoi vers Telegram :', err)
    return res.status(502).json({ ok: false, error: 'L’envoi a échoué. Réessayez dans un instant.' })
  } finally {
    release(files)
  }
}
