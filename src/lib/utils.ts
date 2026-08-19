/** Concatène des classes conditionnelles sans dépendance externe. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

/** Formate un prix en euros, sans décimale inutile. */
export function euros(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Scroll vers une ancre en compensant le header fixe.
 * `scroll-padding-top` couvre déjà le cas natif, mais on garde le contrôle
 * pour les clics déclenchés depuis le menu mobile (qui se referme d'abord).
 */
export function scrollToId(id: string) {
  const el = document.querySelector(id)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}
