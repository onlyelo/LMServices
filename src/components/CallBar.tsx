import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { company } from '@/data/site'
import { scrollToId } from '@/lib/utils'

/**
 * Barre d'action fixe en bas d'écran, mobile uniquement.
 * Apparaît une fois le hero dépassé, disparaît sur la section réservation
 * pour ne pas masquer le formulaire.
 */
export default function CallBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const past = window.scrollY > window.innerHeight * 0.85
      const form = document.getElementById('reservation')
      const onForm = form ? form.getBoundingClientRect().top < window.innerHeight * 0.6 : false
      setVisible(past && !onForm)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-line bg-ink/95 backdrop-blur-md lg:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="container-lux flex gap-3 py-3">
            <a href={company.phoneHref} className="btn-ghost flex-1 !px-4 !py-3 text-xs">
              Appeler
            </a>
            <button
              type="button"
              onClick={() => scrollToId('#reservation')}
              className="btn-gold flex-[1.4] !px-4 !py-3 text-xs"
            >
              Réserver maintenant
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
