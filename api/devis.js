import {
  MAX_FILES,
  RATE_LIMIT,
  multerErrorMessage,
  processDevis,
  runMiddleware,
  upload,
} from './_lib/devis.js'

/**
 * Fonction serverless Vercel : POST /api/devis.
 *
 * Le parseur de corps intégré est désactivé — multer a besoin du flux brut
 * pour découper le multipart, un corps déjà consommé le laisserait vide.
 */
export const config = {
  api: { bodyParser: false },
}

/**
 * Limiteur en mémoire.
 *
 * Sa portée est celle de l'instance : Vercel peut en démarrer plusieurs, et
 * les recycle après quelques minutes d'inactivité. Un visiteur déterminé peut
 * donc dépasser le quota en tombant sur des instances différentes. C'est un
 * ralentisseur, pas une barrière — la vraie protection reste le champ piège et
 * le contrôle de durée de remplissage.
 *
 * Pour un quota strict, remplacer cette Map par `@vercel/kv` : seule la
 * fonction `hit()` est à réécrire.
 */
const hits = new Map()

function hit(key) {
  const now = Date.now()
  const entry = hits.get(key)

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + RATE_LIMIT.windowMs })
    return { allowed: true }
  }

  entry.count += 1
  if (entry.count > RATE_LIMIT.limit) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }
  return { allowed: true }
}

/** Vercel place l'IP réelle du visiteur en tête de `x-forwarded-for`. */
function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }
  return req.socket?.remoteAddress ?? 'inconnu'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'Méthode non autorisée.' })
  }

  const quota = hit(clientIp(req))
  if (!quota.allowed) {
    res.setHeader('Retry-After', String(quota.retryAfter))
    return res.status(429).json({
      error: 'Trop de demandes. Vous pouvez soumettre au maximum 2 devis par jour.',
    })
  }

  try {
    await runMiddleware(req, res, upload.array('photos', MAX_FILES))
  } catch (err) {
    return res.status(400).json({ ok: false, error: multerErrorMessage(err) })
  }

  return processDevis(req, res)
}
