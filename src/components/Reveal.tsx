import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  /** Décalage en secondes, pour cascader plusieurs éléments. */
  delay?: number
  className?: string
}

/**
 * Apparition sobre au scroll : léger fondu + montée de 16 px.
 * `once` évite que l'animation se rejoue en boucle sur mobile.
 *
 * `amount: 0` est essentiel : cette valeur est une fraction de **l'élément
 * observé**, pas du viewport. Avec l'ancien 0.2, un bloc haut comme le
 * formulaire de devis (~2000 px) n'apparaissait qu'après 400 px de défilement
 * à l'intérieur de sa propre section — le titre était visible depuis longtemps.
 * À zéro, le déclenchement a lieu dès le premier pixel entré dans le viewport.
 *
 * La marge basse est positive : elle étend la zone d'observation sous l'écran,
 * si bien que l'animation démarre juste avant que le bloc ne soit atteint.
 */
export default function Reveal({ children, delay = 0, className }: Props) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0, margin: '0px 0px 80px 0px' }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
