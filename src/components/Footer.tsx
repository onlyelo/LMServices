import { company, navLinks, serviceBase, travelFee } from '@/data/site'
import { scrollToId } from '@/lib/utils'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-ink-line bg-ink-soft/60">
      <div className="container-lux py-16 sm:py-20">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <p className="font-display text-3xl text-cream">{company.name}</p>
            <p className="mt-1 text-[10px] uppercase tracking-widest2 text-gold">
              {company.fullName}
            </p>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream-dim">
              Nettoyage de vitres pour particuliers et professionnels en {company.region}.
              Intervention dans un rayon de {company.radiusKm} km autour de {serviceBase.name} :
              Obernai, Sélestat, Molsheim, Benfeld, Colmar, Strasbourg et alentours.
            </p>
          </div>

          <div>
            <h2 className="text-[10px] uppercase tracking-widest2 text-cream-dim">Contact</h2>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <a href={company.phoneHref} className="text-cream transition hover:text-gold">
                  {company.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${company.email}`}
                  className="text-cream transition hover:text-gold"
                >
                  {company.email}
                </a>
              </li>
              <li className="text-cream-dim">{company.base}</li>
              <li className="text-cream-dim">Lundi – samedi, 8 h – 19 h</li>
            </ul>
          </div>

          <div>
            <h2 className="text-[10px] uppercase tracking-widest2 text-cream-dim">Navigation</h2>
            <ul className="mt-5 space-y-3 text-sm">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToId(l.href)
                    }}
                    className="text-cream-dim transition hover:text-gold"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Conditions essentielles reprises ici : le visiteur qui descend
            directement au footer ne doit pas avoir à remonter pour les trouver. */}
        <div className="mt-14 border-t border-ink-line pt-10">
          <h2 className="text-[10px] uppercase tracking-widest2 text-cream-dim">
            Conditions essentielles
          </h2>

          <dl className="mt-5 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-cream">Déplacement</dt>
              <dd className="mt-1.5 text-[11px] leading-relaxed text-cream-dim">
                Offert de 0 à {travelFee.freeRadiusKm} km de {serviceBase.name}. Forfait unique
                de{' '}
                {travelFee.fee} € entre {travelFee.freeRadiusKm} et {company.radiusKm} km, quelle que
                soit la prestation. Au-delà de {company.radiusKm} km : sur devis.
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-cream">Annulation</dt>
              <dd className="mt-1.5 text-[11px] leading-relaxed text-cream-dim">
                Sans frais plus de 24 h avant l’intervention. Moins de 24 h ou rendez-vous non
                honoré : 30 % du devis, sauf force majeure justifiée. Report gratuit en cas
                d’intempéries.{' '}
                <a
                  href="#conditions"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToId('#conditions')
                  }}
                  className="text-gold underline underline-offset-2"
                >
                  Détail des conditions
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-10 border-t border-ink-line pt-8">
          <div className="flex flex-col gap-3 text-xs text-cream-dim sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} {company.fullName} — Tous droits réservés.
            </p>
            <p className="text-cream-dim">{company.vatNotice}</p>
          </div>
          <p className="mt-4 max-w-3xl text-[11px] leading-relaxed text-cream-dim">
            Entreprise individuelle — {company.fullName}, {company.address}, {company.postalCode}{' '}
            {company.city}. SIREN / SIRET : {company.siret}. Hébergeur : {company.host.name},{' '}
            {company.host.address}.{' '}
            <a
              href="#conditions"
              onClick={(e) => {
                e.preventDefault()
                scrollToId('#conditions')
              }}
              className="text-gold underline underline-offset-2"
            >
              Mentions légales et données personnelles
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  )
}
