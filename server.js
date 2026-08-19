import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import {
  MAX_FILES,
  MAX_FILE_BYTES,
  MAX_TOTAL_BYTES,
  RATE_LIMIT,
  isConfigured,
  multerErrorMessage,
  processDevis,
  upload,
} from './api/_lib/devis.js'

/**
 * Serveur de développement local.
 *
 * En production, c'est `api/devis.js` — fonction serverless Vercel — qui
 * répond. Les deux appellent la même `processDevis` : ce fichier ne contient
 * que la plomberie Express, aucune logique métier.
 *
 * Le token du bot ne doit JAMAIS transiter par le front. Il est lu depuis
 * `.env` sans préfixe `VITE_`, ce qui garantit que Vite ne l'inclut pas dans
 * le bundle envoyé au navigateur.
 */

const app = express()

// Derrière un reverse proxy, l'IP réelle arrive dans X-Forwarded-For. Sans ce
// réglage, le limiteur verrait une seule IP pour tout le monde.
app.set('trust proxy', 1)

app.use(cors())
app.use(express.json({ limit: '256kb' }))

/** Garde-fou général : absorbe les balayages automatisés. */
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Trop de requêtes. Réessayez dans quelques minutes.' },
  }),
)

/** Même quota que la fonction serverless, appliqué ici par express-rate-limit. */
const devisLimiter = rateLimit({
  windowMs: RATE_LIMIT.windowMs,
  limit: RATE_LIMIT.limit,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: 'Trop de demandes. Vous pouvez soumettre au maximum 2 devis par jour.',
  },
})

const PORT = Number(process.env.API_PORT ?? 3001)

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, telegramConfigured: isConfigured() })
})

app.post('/api/devis', devisLimiter, upload.array('photos', MAX_FILES), processDevis)

/** Erreurs multer : renvoyer du JSON, pas la page d'erreur HTML d'Express. */
app.use((err, _req, res, next) => {
  if (!err) return next()
  console.error('[LMS] requête refusée :', err.message)
  return res.status(400).json({ ok: false, error: multerErrorMessage(err) })
})

app.listen(PORT, '0.0.0.0', () => {
  const line = '─'.repeat(52)
  console.log(`\x1b[35m${line}\x1b[0m`)
  console.log(`  API devis   \x1b[1mhttp://localhost:${PORT}/api/devis\x1b[0m`)
  console.log(
    `  Telegram    ${
      isConfigured()
        ? '\x1b[32mconfiguré\x1b[0m'
        : '\x1b[33mnon configuré — renseigner TELEGRAM_CHAT_ID dans .env\x1b[0m'
    }`,
  )
  console.log(
    `  Photos      \x1b[2m${MAX_FILES} max, ${MAX_FILE_BYTES / 1024 / 1024} Mo chacune, ${
      MAX_TOTAL_BYTES / 1024 / 1024
    } Mo au total — en mémoire\x1b[0m`,
  )
  console.log(
    `  Anti-spam   \x1b[2m${RATE_LIMIT.limit} devis / 24 h par IP, champ piège, délai minimum\x1b[0m`,
  )
  console.log(`\x1b[35m${line}\x1b[0m`)
})
