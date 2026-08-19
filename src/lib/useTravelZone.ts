import { useEffect, useState } from 'react'
import { BASE, geocodePostalCode, haversineKm, zoneForKm, type Zone } from './geo'

export type TravelState =
  /** Code postal incomplet : rien à afficher. */
  | { status: 'idle' }
  | { status: 'loading' }
  /** Commune introuvable : on reste muet plutôt que d'alerter le visiteur. */
  | { status: 'unknown' }
  | { status: 'ok'; km: number; zone: Zone }

const DEBOUNCE_MS = 600

/**
 * Résout la zone de déplacement à partir du code postal saisi.
 *
 * Le débounce de 600 ms évite de lancer une requête à chaque frappe : sans lui,
 * saisir « 67210 » en déclencherait cinq, ce que la politique d'usage de
 * Nominatim (1 req/s) interdit.
 */
export function useTravelZone(postalCode: string, city: string): TravelState {
  const [state, setState] = useState<TravelState>({ status: 'idle' })

  useEffect(() => {
    const code = postalCode.trim()

    if (!/^\d{5}$/.test(code)) {
      setState({ status: 'idle' })
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setState({ status: 'loading' })
      try {
        const point = await geocodePostalCode(code, city, controller.signal)
        if (controller.signal.aborted) return

        if (!point) {
          setState({ status: 'unknown' })
          return
        }

        const km = haversineKm(BASE, point)
        setState({ status: 'ok', km, zone: zoneForKm(km) })
      } catch (err) {
        // L'annulation est le cas normal quand la saisie continue.
        if ((err as Error)?.name === 'AbortError') return
        console.warn('[LMS] géocodage indisponible :', err)
        setState({ status: 'unknown' })
      }
    }, DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [postalCode, city])

  return state
}
