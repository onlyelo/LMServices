import { motion } from 'framer-motion'
import { company } from '@/data/site'
import { scrollToId } from '@/lib/utils'

const fade = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export default function Hero() {
  return (
    <section id="accueil" className="relative flex min-h-[100svh] items-center overflow-hidden">
      {/* Visuel de fond — remplacer /hero-facade.svg par une photo du chantier */}
      <div
        aria-hidden
        className="absolute inset-0 bg-ink bg-cover bg-center"
        style={{ backgroundImage: 'url(/hero-facade.svg)' }}
      />
      {/* Voiles de lisibilité : dégradé vertical + vignette latérale */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/70 to-ink"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,rgba(201,162,74,0.10),transparent_62%)]"
      />

      <div className="container-lux relative z-10 pt-28 pb-24 sm:pt-32">
        <motion.h1
          custom={1}
          initial="hidden"
          animate="show"
          variants={fade}
          className="mt-6 max-w-3xl font-display text-[2.6rem] leading-[1.08] text-cream sm:text-6xl md:text-7xl"
        >
          Retrouvez la lumière,
          <br />
          <span className="italic text-gold">sans reflets gênants.</span>
          <br />
          Naturellement éclatant.
        </motion.h1>

        <motion.p
          custom={2}
          initial="hidden"
          animate="show"
          variants={fade}
          className="mt-7 max-w-xl text-base leading-relaxed text-cream-dim sm:text-lg"
        >
          Nettoyage de vitres sur mesure pour particuliers et professionnels.
        </motion.p>

        <motion.p
          custom={3}
          initial="hidden"
          animate="show"
          variants={fade}
          className="mt-4 max-w-xl text-base leading-relaxed text-cream-dim sm:text-lg"
        >
          Chaque vitre est prise en charge de A à Z : encadrements, rails et rebords compris. Le
          séchage est garanti sans traces, contrôlé sous tous les angles à la lumière du jour.
        </motion.p>

        <motion.p
          custom={4}
          initial="hidden"
          animate="show"
          variants={fade}
          className="mt-4 max-w-xl text-base leading-relaxed text-cream-dim sm:text-lg"
        >
          Vous n’avez rien à préparer, nous nous occupons de tout.
        </motion.p>

        <motion.div
          custom={5}
          initial="hidden"
          animate="show"
          variants={fade}
          className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <a
            href="#reservation"
            onClick={(e) => {
              e.preventDefault()
              scrollToId('#reservation')
            }}
            className="btn-gold w-full sm:w-auto"
          >
            Réserver maintenant
          </a>
          <a href={company.phoneHref} className="btn-ghost w-full sm:w-auto">
            <span aria-hidden>☎</span> {company.phone}
          </a>
        </motion.div>

        <motion.dl
          custom={6}
          initial="hidden"
          animate="show"
          variants={fade}
          className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-ink-line pt-8"
        >
          {[
            { k: 'Réponse', v: '24 h' },
            { k: 'Rayon', v: `${company.radiusKm} km` },
            { k: 'Devis', v: 'Gratuit' },
          ].map((s) => (
            <div key={s.k}>
              <dt className="text-[10px] uppercase tracking-widest2 text-cream-dim">{s.k}</dt>
              <dd className="mt-1.5 font-display text-2xl text-gold sm:text-3xl">{s.v}</dd>
            </div>
          ))}
        </motion.dl>
      </div>

      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute inset-x-0 bottom-7 z-10 flex justify-center"
      >
        <motion.div
          animate={{ y: [0, 9, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="h-9 w-[22px] rounded-full border border-cream/25 p-1.5"
        >
          <span className="mx-auto block h-1.5 w-px bg-gold" />
        </motion.div>
      </motion.div>
    </section>
  )
}
