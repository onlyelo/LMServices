import type { OpeningId } from '@/data/site'

/**
 * Pictogrammes de traits, volontairement schématiques : ils servent à
 * distinguer les lignes du regard, pas à illustrer. Un seul jeu partagé entre
 * la grille tarifaire et les compteurs du formulaire.
 */
const paths: Record<OpeningId, React.ReactNode> = {
  // Fenêtre simple : un cadre, une croisée
  standard: (
    <>
      <rect x="5" y="3.5" width="14" height="17" rx="1" />
      <path d="M12 3.5v17M5 12h14" />
    </>
  ),
  // Double vantail : deux cadres accolés
  double: (
    <>
      <rect x="2.5" y="3.5" width="9" height="17" rx="1" />
      <rect x="12.5" y="3.5" width="9" height="17" rx="1" />
      <path d="M2.5 12h9M12.5 12h9" />
    </>
  ),
  // Porte-fenêtre : cadre pleine hauteur, poignée
  porteFenetre: (
    <>
      <rect x="4" y="2.5" width="16" height="19" rx="1" />
      <path d="M12 2.5v19" />
      <path d="M9.6 12.5h1.2M13.2 12.5h1.2" />
    </>
  ),
  // Velux : cadre incliné, sous rampant
  velux: (
    <>
      <path d="M3 19.5L8.5 5h10.2l2.3 14.5z" />
      <path d="M6.2 12.2h13.4" />
    </>
  ),
  // Baie vitrée : large, trois panneaux
  baie: (
    <>
      <rect x="1.5" y="5" width="21" height="14" rx="1" />
      <path d="M8.5 5v14M15.5 5v14" />
    </>
  ),
}

export default function OpeningIcon({
  id,
  className = 'h-5 w-5',
}: {
  id: OpeningId
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths[id]}
    </svg>
  )
}
