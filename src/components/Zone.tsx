import { useState } from 'react'
import { Circle, CircleMarker, MapContainer, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { cities, company, serviceBase, travelFee } from '@/data/site'
import { BASE, haversineKm, zoneForKm } from '@/lib/geo'
import Section from './Section'
import Reveal from './Reveal'
import ZoneChecker, { zoneStyle, type FoundPlace } from './ZoneChecker'

/**
 * La carte porte seule l'information de zone : deux cercles, des marqueurs
 * cliquables et une légende. Pas de liste textuelle — énumérer des villes en
 * clair laissait croire à une couverture limitée à celles-ci, alors que le
 * critère réel est la distance.
 *
 * Distances et zones sont calculées ici à partir des coordonnées, avec la même
 * fonction que le badge du formulaire : un seul calcul, aucun risque d'écart.
 */
/** Recentre la carte sur la commune trouvée, sans casser le zoom manuel. */
function FlyTo({ place }: { place: FoundPlace | null }) {
  const map = useMap()
  if (place) map.flyTo([place.lat, place.lon], Math.max(map.getZoom(), 9), { duration: 0.8 })
  return null
}

export default function Zone() {
  const [found, setFound] = useState<FoundPlace | null>(null)

  return (
    <Section
      id="zone"
      eyebrow="Zone d’intervention"
      title={
        <>
          Nettoyage de vitres dans toute l’Alsace centrale,
          <br />
          <span className="text-cream-dim">
            à {company.radiusKm} km de {serviceBase.name}.
          </span>
        </>
      }
      className="bg-ink-soft/40"
    >
      <Reveal>
        <div className="overflow-hidden rounded-2xl border border-ink-line shadow-lux">
          <MapContainer
            center={[serviceBase.lat, serviceBase.lon]}
            zoom={8}
            scrollWheelZoom={false}
            style={{ height: '420px', width: '100%' }}
            aria-label={`Carte de la zone d’intervention, rayon de ${company.radiusKm} km autour de ${serviceBase.name}`}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />

            {/* Deux zones concentriques — Leaflet attend des mètres.
                Extérieur (50 km) en pointillés, intérieur (25 km) en trait
                plein doré : la zone offerte doit se lire au premier coup d’œil.
                L’ordre de rendu compte, le grand cercle d’abord. */}
            <Circle
              center={[serviceBase.lat, serviceBase.lon]}
              radius={travelFee.maxRadiusKm * 1000}
              pathOptions={{
                color: '#C9A24A',
                weight: 1.25,
                opacity: 0.6,
                dashArray: '6 5',
                fillColor: '#C9A24A',
                fillOpacity: 0.05,
              }}
            >
              <Tooltip direction="top" sticky opacity={1}>
                Forfait déplacement {travelFee.fee} €
              </Tooltip>
            </Circle>

            <Circle
              center={[serviceBase.lat, serviceBase.lon]}
              radius={travelFee.freeRadiusKm * 1000}
              pathOptions={{
                color: '#E3C77E',
                weight: 2,
                opacity: 0.95,
                fillColor: '#C9A24A',
                fillOpacity: 0.14,
              }}
            >
              <Tooltip direction="top" sticky opacity={1}>
                Déplacement offert
              </Tooltip>
            </Circle>

            {cities.map((city) => {
              const km = haversineKm(BASE, { lat: city.lat, lon: city.lng })
              const zone = zoneForKm(km)
              const isBase = km < 1

              return (
                <CircleMarker
                  key={city.name}
                  center={[city.lat, city.lng]}
                  radius={isBase ? 7 : 5}
                  pathOptions={{
                    color: isBase ? '#E3C77E' : zone === 'free' ? '#F4F1EA' : '#C9A24A',
                    weight: isBase ? 2 : 1.25,
                    fillColor: isBase ? '#C9A24A' : zone === 'free' ? '#F4F1EA' : '#C9A24A',
                    fillOpacity: isBase ? 1 : 0.8,
                  }}
                >
                  <Tooltip direction="top" offset={[0, -6]} opacity={1}>
                    {city.name}
                  </Tooltip>
                  <Popup>
                    <strong>{city.name}</strong>
                    <br />
                    {isBase ? (
                      <>Base — {company.fullName}</>
                    ) : (
                      <>
                        à {Math.round(km)} km de {serviceBase.name}
                        <br />
                        {zone === 'free'
                          ? 'Déplacement offert'
                          : `Forfait déplacement +${travelFee.fee} €`}
                      </>
                    )}
                  </Popup>
                </CircleMarker>
              )
            })}
            {found && (
              <>
                <FlyTo place={found} />
                <CircleMarker
                  center={[found.lat, found.lon]}
                  radius={9}
                  pathOptions={{
                    color: '#F4F1EA',
                    weight: 2.5,
                    fillColor:
                      found.zone === 'free'
                        ? '#34D399'
                        : found.zone === 'fee'
                          ? '#FBBF24'
                          : '#F87171',
                    fillOpacity: 1,
                  }}
                >
                  <Popup autoClose={false}>
                    <strong>{found.name}</strong>
                    <br />
                    {zoneStyle(found.zone).label}
                    <br />
                    à {Math.round(found.km)} km de {serviceBase.name}
                  </Popup>
                </CircleMarker>
              </>
            )}
          </MapContainer>
        </div>

        {/* Légende : au tactile il n’y a pas de survol, les tooltips Leaflet
            ne suffisent donc pas à expliquer les deux zones. */}
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          <li className="flex items-center gap-2.5 text-xs text-cream">
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-gold-light bg-gold/25"
            />
            0 – {travelFee.freeRadiusKm} km · Déplacement offert
          </li>
          <li className="flex items-center gap-2.5 text-xs text-cream-dim">
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-full border border-dashed border-gold/70 bg-gold/10"
            />
            {travelFee.freeRadiusKm} – {company.radiusKm} km · Forfait déplacement {travelFee.fee} €
          </li>
        </ul>

        <div className="mt-6">
          <ZoneChecker onFound={setFound} />
        </div>

        <p className="mt-4 border-t border-ink-line pt-4 text-xs text-cream-dim">
          Touchez un point de la carte pour connaître sa distance et sa zone. Distances à vol
          d’oiseau depuis {serviceBase.name}, données à titre indicatif.
        </p>
      </Reveal>
    </Section>
  )
}
