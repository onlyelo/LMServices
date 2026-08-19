/**
 * Normalisation des numéros français saisis au formulaire.
 *
 * Le visiteur écrit ce qu'il veut : espaces, points, tirets, indicatif
 * international. On ramène tout au format national `0XXXXXXXXX`, qui est celui
 * transmis dans la notification — un numéro uniforme est composable d'un seul
 * geste depuis Telegram, ce qui n'est pas le cas d'un `+33 6.42.71.05.29`.
 */

/** Format national attendu après normalisation. */
export const FRENCH_PHONE = /^0[1-9][0-9]{8}$/

/**
 * `0642710529`, `+33 6 42 71 05 29`, `0033-642-710-529` → `0642710529`.
 * Renvoie la chaîne nettoyée même quand elle est invalide : c'est la
 * validation qui tranche, pas cette fonction.
 */
export function normalizePhone(raw: string): string {
  // On garde le « + » : c'est lui qui distingue un indicatif d'un chiffre.
  let value = raw.replace(/[\s.\-/_]/g, '')

  if (value.startsWith('+33')) {
    value = value.slice(3)
  } else if (value.startsWith('0033')) {
    value = value.slice(4)
  }

  // Certains écrivent « +33 (0)6 … » : le zéro entre parenthèses fait double
  // emploi avec celui qu'on rajoute juste après.
  value = value.replace(/[()]/g, '')

  if (!value.startsWith('0')) {
    value = `0${value}`
  }

  return value
}

export function isFrenchPhone(raw: string): boolean {
  return FRENCH_PHONE.test(normalizePhone(raw))
}

/** `0642710529` → `06 42 71 05 29`, pour l'affichage uniquement. */
export function formatPhone(national: string): string {
  return FRENCH_PHONE.test(national) ? national.replace(/(\d{2})(?=\d)/g, '$1 ').trim() : national
}
