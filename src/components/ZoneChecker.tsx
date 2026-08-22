import { useState } from 'react'
import { travelFee } from '@/data/site'
import { BASE, MAX_RADIUS_KM, geocodePostalCode, haversineKm, zoneForKm, type Zone } from '@/lib/geo'
import { cn } from '@/lib/utils'

/**
 * Vérification de commune depuis la section carte.
 *
 * Contrairement au badge du formulaire, la recherche part ici d'un clic
 * explicite plutôt que d'un débounce : le visiteur qui consulte la carte
 * s'attend à un résultat au moment où il le demande, et cela épargne des
 * requêtes à Nominatim.
 */

export type FoundPlace = {
  name: string
  lat: number
  lon: number
  km: number
  zone: Zone
}

const ZONES: Record<Zone, { dot: string; ring: string; text: string; label: string }> = {
  free: {
    dot: 'bg-emerald-400',
    ring: 'border-emerald-400/40 bg-emerald-400/[0.08]',
    text: 'text-emerald-300',
    label: 'Déplacement offert',
  },
  fee: {
    dot: 'bg-amber-400',
    ring: 'border-amber-400/40 bg-amber-400/[0.08]',
    text: 'text-amber-300',
    label: `Forfait déplacement +${travelFee.fee} €`,
  },
  quote: {
    dot: 'bg-red-400',
    ring: 'border-red-400/40 bg-red-400/[0.08]',
    text: 'text-red-300',
    label: `Zone sur devis (> ${MAX_RADIUS_KM} km)`,
  },
}

export function zoneStyle(zone: Zone) {
  return ZONES[zone]
}

export default function ZoneChecker({ onFound }: { onFound: (place: FoundPlace) => void }) {
  const [code, setCode] = useState('')
  const [state, setState] = useState<
    { status: 'idle' } | { status: 'loading' } | { status: 'unknown' } | { status: 'ok'; place: FoundPlace }
  >({ status: 'idle' })

  const valid = /^\d{5}$/.test(code.trim())

  const check = async () => {
    if (!valid) return
    setState({ status: 'loading' })

    try {
      const point = await geocodePostalCode(code.trim(), '')
      if (!point) {
        setState({ status: 'unknown' })
        return
      }

      const km = haversineKm(BASE, point)
      const place: FoundPlace = {
        name: point.label ?? code.trim(),
        lat: point.lat,
        lon: point.lon,
        km,
        zone: zoneForKm(km),
      }
      setState({ status: 'ok', place })
      onFound(place)
    } catch (err) {
      console.warn('[LMS] vérification de commune indisponible :', err)
      setState({ status: 'unknown' })
    }
  }

  return (
    <div className="card-lux p-5 sm:p-6">
      <h3 className="font-display text-xl text-cream">Vérifier ma commune</h3>
      <p className="mt-2 text-sm text-cream-dim">
        Saisissez votre code postal : nous le plaçons sur la carte et indiquons votre zone.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          void check()
        }}
        className="mt-4 flex flex-col gap-3 sm:flex-row"
      >
        <div className="min-w-0 flex-1">
          <label className="sr-only" htmlFor="zone-postal">
            Code postal
          </label>
          <input
            id="zone-postal"
            inputMode="numeric"
            maxLength={5}
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, ''))
              setState({ status: 'idle' })
            }}
            placeholder="5 chiffres"
            className="field"
          />
        </div>
        <button
          type="submit"
          disabled={!valid || state.status === 'loading'}
          className="btn-gold shrink-0 disabled:opacity-40"
        >
          {state.status === 'loading' ? 'Recherche…' : 'Vérifier'}
        </button>
      </form>

      <div aria-live="polite" className="mt-4 min-h-[2rem]">
        {state.status === 'unknown' && (
          <p className="text-xs text-cream-dim">
            Commune introuvable. Appelez-nous, l’intervention reste souvent possible.
          </p>
        )}

        {state.status === 'ok' && (
          <>
            <p
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs',
                ZONES[state.place.zone].ring,
              )}
            >
              <span
                aria-hidden
                className={cn('h-2 w-2 shrink-0 rounded-full', ZONES[state.place.zone].dot)}
              />
              <span className={ZONES[state.place.zone].text}>{ZONES[state.place.zone].label}</span>
            </p>
            <p className="mt-2 text-xs text-cream-dim">
              {state.place.name} — à {Math.round(state.place.km)} km de nos locaux.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
