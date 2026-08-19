import { frDate, packLabel, showerDetail, type BookingPayload } from './booking'

/**
 * Canal principal : la demande part vers le backend Express, qui la relaie
 * dans Telegram. Le token du bot vit uniquement côté serveur.
 *
 * L'URL est relative à dessein : en développement, le proxy Vite renvoie
 * `/api` vers le port 3001, ce qui fait fonctionner le formulaire aussi bien
 * depuis le PC que depuis un téléphone sur le réseau local. En production,
 * il suffit que le backend soit servi sous le même domaine.
 */

const ENDPOINT = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}/api/devis`
  : '/api/devis'

/** Quota de soumissions atteint — traité à part pour un message dédié. */
export class RateLimitError extends Error {
  readonly kind = 'rate-limit'
}

/** Délai au-delà duquel on cesse d'attendre le backend. */
const TIMEOUT_MS = 12_000

/**
 * Le backend se contente de mettre en forme : il reçoit donc des valeurs déjà
 * lisibles (« Premium » et non « premium », « 10 septembre 2026 » et non
 * « 2026-09-10 »), ce qui évite de dupliquer côté serveur la liste des
 * forfaits et le formatage des dates.
 */
function toApiBody(v: BookingPayload) {
  // acceptTerms est le nom du champ de formulaire, acceptedTerms celui du
  // modèle : on n’envoie que le second pour éviter un doublon ambigu.
  const { acceptTerms: _ignored, ...rest } = v as BookingPayload & { acceptTerms?: boolean }
  return {
    ...rest,
    pack: v.pack ? packLabel(v.pack) : 'sans objet (douche seule)',
    date: frDate(v.date),
    // Le serveur ne connaît pas la grille : il reçoit le libellé tout fait.
    showerDetail: showerDetail(v),
  }
}

/** Signaux anti-robot, transmis à part du devis lui-même. */
export type SpamGuard = {
  /** Champ piège : vide chez un humain, rempli par un robot. */
  website: string
  /** Temps écoulé entre l’affichage du formulaire et l’envoi, en ms. */
  elapsedMs: number
}

/**
 * Les photos sont jointes en multipart : les données du devis voyagent dans un
 * champ `payload` JSON, les fichiers dans des champs `photos` répétés.
 * On ne fixe pas Content-Type à la main — le navigateur doit y ajouter lui-même
 * la « boundary » du multipart, sans quoi le serveur ne sait pas découper.
 *
 * Les signaux anti-robot voyagent en champs de premier niveau : le serveur les
 * lit directement dans `req.body`, sans avoir à ouvrir le devis.
 */
function buildRequestBody(payload: BookingPayload, files: File[], guard: SpamGuard): FormData {
  const form = new FormData()
  form.append('payload', JSON.stringify(toApiBody(payload)))
  form.append('website', guard.website)
  form.append('elapsedMs', String(guard.elapsedMs))
  for (const file of files) {
    form.append('photos', file, file.name)
  }
  return form
}

export async function sendViaTelegram(
  payload: BookingPayload,
  files: File[] = [],
  guard: SpamGuard = { website: '', elapsedMs: Number.NaN },
): Promise<void> {
  const controller = new AbortController()
  // Un envoi de photos prend plus longtemps qu’un simple message texte.
  const budget = files.length > 0 ? TIMEOUT_MS + files.length * 15_000 : TIMEOUT_MS
  const timer = window.setTimeout(() => controller.abort(), budget)

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      body: buildRequestBody(payload, files, guard),
      signal: controller.signal,
    })

    // Une erreur serveur peut renvoyer du HTML (proxy absent, 404) : on ne
    // suppose pas que le corps est du JSON.
    const data = await res.json().catch(() => null)

    // 429 : quota atteint. Le corps porte le message du limiteur, qui est
    // rédigé pour être affiché tel quel au visiteur.
    if (res.status === 429) {
      throw new RateLimitError(
        data?.error ??
          'Trop de demandes. Vous pouvez soumettre au maximum 2 devis par jour.',
      )
    }

    if (!res.ok || !data?.ok) {
      throw new Error(data?.error ?? `Réponse ${res.status} du serveur.`)
    }
  } finally {
    window.clearTimeout(timer)
  }
}
