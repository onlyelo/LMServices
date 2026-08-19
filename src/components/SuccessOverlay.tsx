import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { company } from '@/data/site'

/**
 * Confirmation en plein écran, montée dans un portail à la racine du document.
 *
 * Le passage par `createPortal` n'est pas cosmétique : rendu à sa place dans
 * le formulaire, l'overlay hériterait des contextes d'empilement créés par les
 * `transform` de Framer Motion des sections parentes, et se retrouverait
 * derrière le header fixe malgré son z-index.
 */

const GOLD = ['#C9A24A', '#E3C77E', '#8E6F2C']
const WHITE = ['#F4F1EA', '#FFFFFF']

function burst() {
  const shared = {
    disableForReducedMotion: true,
    colors: [...GOLD, ...WHITE],
    zIndex: 100,
  }

  // Deux jets latéraux plutôt qu'une explosion centrale : le panneau reste
  // lisible, les confettis passent devant sans masquer le texte.
  confetti({ ...shared, particleCount: 60, spread: 70, origin: { x: 0.1, y: 0.7 }, angle: 60 })
  confetti({ ...shared, particleCount: 60, spread: 70, origin: { x: 0.9, y: 0.7 }, angle: 120 })

  window.setTimeout(() => {
    confetti({ ...shared, particleCount: 40, spread: 100, origin: { x: 0.5, y: 0.35 }, startVelocity: 28 })
  }, 220)
}

export default function SuccessOverlay({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    burst()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Le focus part sur « Fermer » : sans cela il resterait sur le bouton
    // d'envoi, désormais masqué derrière l'overlay.
    closeRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
      confetti.reset()
    }
  }, [onClose])

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-5 backdrop-blur-md"
    >
      <motion.div
        // Le clic sur le panneau ne doit pas refermer : seul l'extérieur ferme.
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        className="card-lux relative w-full max-w-md overflow-hidden p-8 text-center sm:p-10"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,162,74,0.16),transparent_65%)]"
        />

        <div className="relative">
          <motion.img
            src="/logo.png"
            alt={`${company.name} — ${company.fullName}`}
            width={256}
            height={172}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.18, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto h-16 w-auto sm:h-20"
          />

          <motion.h2
            id="success-title"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-8 font-display text-3xl leading-tight text-gold sm:text-4xl"
          >
            Demande envoyée <span aria-hidden>✓</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52, duration: 0.5 }}
            className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-cream-dim"
          >
            Nous avons bien reçu votre demande. Luke vous recontacte sous 24 h.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.68, duration: 0.5 }}
            className="mt-9"
          >
            <div className="mx-auto h-px w-14 bg-gold-line" />
            <p className="mt-6 text-sm text-cream-dim">
              Une précision à ajouter ?{' '}
              <a
                href={company.phoneHref}
                className="text-gold underline underline-offset-4 transition hover:text-gold-light"
              >
                {company.phone}
              </a>
            </p>

            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="mt-7 rounded-full px-6 py-2.5 text-xs uppercase tracking-widest2 text-cream-dim transition hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              Fermer
            </button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  )
}
