import { serviceBase } from '@/data/site'

/**
 * Distance entre la commune du client et la base, via Nominatim (OpenStreetMap).
 *
 * Gratuit et sans clé, mais soumis à une politique d'usage stricte : une
 * requête par seconde au maximum. D'où le débounce côté hook et le cache
 * ci-dessous — resaisir un code postal déjà vu ne rappelle pas l'API.
 */

/**
 * Point de référence des distances — importé depuis les données du site,
 * jamais redéclaré ici : une seule source de vérité pour les coordonnées.
 */
export const BASE = { lat: serviceBase.lat, lon: serviceBase.lon } as const

export type Zone = 'free' | 'fee' | 'quote'

export type Point = {
  lat: number
  lon: number
  /** Nom de la commune renvoyé par Nominatim, quand il est disponible. */
  label?: string
}

/** Seuils de facturation du déplacement, en kilomètres. */
export const FREE_RADIUS_KM = serviceBase.freeRadiusKm
export const MAX_RADIUS_KM = serviceBase.maxRadiusKm

export function zoneForKm(km: number): Zone {
  if (km < FREE_RADIUS_KM) return 'free'
  if (km <= MAX_RADIUS_KM) return 'fee'
  return 'quote'
}

/** Distance à vol d'oiseau, formule de haversine. */
export function haversineKm(a: Point, b: Point): number {
  const R = 6371
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)

  return 2 * R * Math.asin(Math.sqrt(h))
}

/** Résultats déjà obtenus, y compris les échecs (`null`), pour ne pas réinterroger. */
const cache = new Map<string, Point | null>()

async function query(params: Record<string, string>, signal?: AbortSignal): Promise<Point | null> {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('countrycodes', 'fr')
  url.searchParams.set('limit', '1')
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } })
  if (!res.ok) return null

  const data: unknown = await res.json()
  if (!Array.isArray(data) || data.length === 0) return null

  const first = data[0] as { lat?: string; lon?: string; name?: string; display_name?: string }
  const lat = Number(first.lat)
  const lon = Number(first.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null

  // `display_name` est très verbeux (« 67210, Obernai, Bas-Rhin, … ») :
  // on garde `name` quand il existe, sinon le premier segment utile.
  const label =
    first.name ??
    first.display_name
      ?.split(",")
      .map((part) => part.trim())
      .find((part) => part.length > 0 && !/^d{5}$/.test(part))

  return { lat, lon, label }
}

/**
 * Géocode un code postal français, la ville servant à départager les codes
 * partagés par plusieurs communes. Si le couple ne donne rien — ville mal
 * orthographiée, par exemple — on retente sur le seul code postal plutôt que
 * d'abandonner.
 */
export async function geocodePostalCode(
  postalCode: string,
  city: string,
  signal?: AbortSignal,
): Promise<Point | null> {
  const cleanCity = city.trim()
  const key = `${postalCode}|${cleanCity.toLowerCase()}`

  const cached = cache.get(key)
  if (cached !== undefined) return cached

  let point: Point | null = null
  if (cleanCity) {
    point = await query({ postalcode: postalCode, city: cleanCity }, signal)
  }
  if (!point) {
    point = await query({ postalcode: postalCode }, signal)
  }

  cache.set(key, point)
  return point
}
