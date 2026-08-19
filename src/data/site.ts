/**
 * Source unique de vérité pour tout le contenu éditorial du site.
 * Modifier ici suffit à mettre à jour l'ensemble des sections.
 */

export const company = {
  name: 'LMS',
  fullName: 'Luke Mury Services',
  tagline: 'Nettoyage de vitres haut de gamme',
  phone: '06 42 71 05 29',
  phoneHref: 'tel:+33642710529',
  email: 'lmservices@gmail.com',
  /** Siège de l’entreprise. */
  address: '38 rue du Maréchal Joffre',
  postalCode: '67140',
  city: 'Andlau',
  base: 'Andlau (67140)',
  region: 'Alsace',
  radiusKm: 50,
  siret: 'En cours d’immatriculation',
  vatNotice: 'TVA non applicable, art. 293 B du CGI',
  host: {
    name: 'Vercel Inc.',
    address: '340 Pine Street, Suite 701, San Francisco, CA 94104, USA',
  },
} as const

/**
 * Centre géographique de la zone d’intervention — source unique de vérité.
 * Distinct du siège : les distances se mesurent depuis Barr, qui est le point
 * de départ des tournées. `geo.ts` importe ces coordonnées, elles ne sont
 * déclarées nulle part ailleurs.
 */
export const serviceBase = {
  name: 'Barr',
  postalCode: '67140',
  lat: 48.4097,
  lon: 7.4554,
  /** Rayon au-delà duquel le déplacement est facturé, en km. */
  freeRadiusKm: 25,
  /** Rayon maximal couvert sans devis spécifique, en km. */
  maxRadiusKm: 50,
} as const

/* ------------------------------------------------------------------ */
/* Forfaits                                                            */
/* ------------------------------------------------------------------ */

export type Pack = {
  id: 'premium' | 'excellence'
  name: string
  subtitle: string
  /** Exemple pour une maison type de 12 fenêtres — jamais un plancher. */
  exampleHouse: number
  perWindow: number
  featured: boolean
  pitch: string
  features: string[]
  highlight: string
}

/**
 * Le prix mis en avant sur chaque carte est celui d’une fenêtre standard,
 * repris tel quel de la grille par ouvrant ci-dessous. Excellence se situe
 * environ 35 % au-dessus de Premium.
 */
export const packs: Pack[] = [
  {
    id: 'premium',
    name: 'Premium',
    subtitle: 'La prestation soignée, deux faces, sans compromis',
    exampleHouse: 84,
    perWindow: 7,
    featured: false,
    pitch:
      "Le nettoyage complet de vos surfaces vitrées, intérieur et extérieur, réalisé à la raclette professionnelle. Le standard que la plupart des prestataires appellent déjà du haut de gamme.",
    highlight: 'Exemple — 12 fenêtres standard : à partir de 84 €',
    features: [
      'Vitres intérieur + extérieur',
      'Cadres, montants et rebords essuyés',
      'Raclette professionnelle et microfibre',
      'Produits sans solvant, sans odeur',
      'Protection du sol et du mobilier',
      'Contrôle final pièce par pièce',
    ],
  },
  {
    id: 'excellence',
    name: 'Excellence',
    subtitle: 'La fenêtre entière, pas seulement la vitre',
    exampleHouse: 120,
    perWindow: 10,
    featured: true,
    pitch:
      'Là où le regard s’arrête d’habitude, nous continuons. L’ouvrant est repris dans son entier — le verre, mais aussi tout ce qui l’encadre et retient la saleté année après année. Une fenêtre qui paraît neuve, pas simplement propre.',
    highlight: 'Exemple — 12 fenêtres standard : à partir de 120 €',
    features: [
      'Tout le forfait Premium inclus',
      'Toute la saleté éliminée : cadres, joints, rebords, ouvrants',
      'Rails, gonds et feuillures repris un à un',
      'Séchage sans traces garanti',
      'Sans odeurs résiduelles',
      'Retouche gratuite sous 7 jours',
    ],
  },
]

/* ------------------------------------------------------------------ */
/* Types d'ouvrants                                                    */
/* ------------------------------------------------------------------ */

export type OpeningId = 'standard' | 'double' | 'porteFenetre' | 'velux' | 'baie'

export type Opening = {
  id: OpeningId
  label: string
  hint: string
  premium: number
  excellence: number
}

/**
 * Grille 2026, tarifs à la pièce, TTC (TVA non applicable).
 * Le prix « par fenêtre » mis en avant sur les cartes correspond à l’ouvrant
 * standard ; les autres types sont indexés dessus selon le temps réel passé.
 * Chaque ligne est un prix à la pièce : rien n’est facturé à la surface, le
 * client n’a donc aucune mesure à fournir pour obtenir une estimation.
 */
export const openings: Opening[] = [
  { id: 'standard', label: 'Fenêtre standard', hint: '1 vantail', premium: 7, excellence: 10 },
  { id: 'double', label: 'Fenêtre double vantail', hint: '2 vantaux', premium: 11, excellence: 15 },
  { id: 'baie', label: 'Baie vitrée', hint: 'Grand ouvrant coulissant', premium: 28, excellence: 38 },
  { id: 'velux', label: 'Velux / fenêtre de toit', hint: 'Accès en hauteur', premium: 14, excellence: 19 },
  { id: 'porteFenetre', label: 'Porte-fenêtre', hint: 'Hauteur pleine', premium: 13, excellence: 18 },
]

/**
 * La paroi de douche complète figure dans la même grille, mais elle se coche
 * dans le formulaire au lieu de se compter : une seule ligne suffit.
 */
export const showerPricing = {
  id: 'douche',
  label: 'Vitres de douche',
  hint: 'Douche complète',
  /** Nettoyage complet de la douche. */
  premium: 39,
  /** Nettoyage complet + traitement nano hydrophobe. */
  excellence: 79,
} as const


/* ------------------------------------------------------------------ */
/* Option complémentaire — vitres de douche                            */
/* ------------------------------------------------------------------ */

/**
 * Prestation d'appoint, jamais vendue seule : elle se greffe sur un forfait.
 * Tarif calé sur le détartrage professionnel (150–200 € pour 2–4 h) ramené
 * à une douche complète, soit environ 1 h 30 de travail.
 * La durée de protection suit ce qu'annoncent les traitements nano
 * professionnels (≈ 12 mois), et non les sprays grand public (8–12 semaines).
 */
export const showerOption = {
  name: 'Vitres de douche',
  tagline: 'L’option qui fait durer le résultat',
  /** Les deux niveaux suivent la grille : Premium nettoie, Excellence protège. */
  premium: showerPricing.premium,
  excellence: showerPricing.excellence,
  protectionMonths: 12,
  pitch:
    'Le calcaire s’installe sur une paroi de douche plus vite que partout ailleurs. Nous décapons le voile accumulé, puis, en Excellence, nous appliquons une protection nano hydrophobe : l’eau ne s’étale plus, elle perle et s’écoule en emportant le dépôt.',
  premiumFeatures: [
    'Détartrage en profondeur de toutes les parois',
    'Profilés, joints et bas de parois repris à la main',
    'Rails de porte dégraissés',
  ],
  excellenceFeatures: [
    'Tout le nettoyage Premium inclus',
    'Traitement nano hydrophobe : l’eau perle et s’écoule',
    'Nettement moins de traces de calcaire au quotidien',
    'Entretien courant très allégé',
  ],
  note: 'Protection estimée à 12 mois selon la fréquence d’usage, la dureté de l’eau et les produits d’entretien employés. Les nettoyants abrasifs la retirent prématurément.',
}

/* ------------------------------------------------------------------ */
/* Frais de déplacement                                                */
/* ------------------------------------------------------------------ */

export const travelTiers = [
  { range: '0 – 25 km', label: 'Déplacement offert', amount: 'Offert', free: true },
  { range: '25 – 50 km', label: 'Forfait unique, quelle que soit la prestation', amount: '15 €', free: false },
  { range: 'Au-delà de 50 km', label: 'Nous consulter', amount: 'Sur devis', free: false },
]

/** Mention affichée partout où les frais annexes sont évoqués. */
export const parkingNotice = {
  short: 'Des frais de stationnement peuvent s’appliquer selon localisation — toujours communiqués avant intervention.',
  full: 'Des frais de stationnement peuvent être ajoutés au devis selon les conditions d’accès au chantier. Ces frais, à la charge du client, sont toujours communiqués et acceptés explicitement avant toute intervention.',
}

export const travelFee = {
  freeRadiusKm: serviceBase.freeRadiusKm,
  maxRadiusKm: serviceBase.maxRadiusKm,
  fee: 15,
} as const

export const pricingNotes = [
  'Le montant final dépend du nombre et du type d’ouvrants, ainsi que de leur accessibilité.',
  'Tarifs TTC — TVA non applicable, art. 293 B du CGI.',
  'Devis gratuit et sans engagement, établi après visite ou sur photos.',
  'Vitrages très encrassés et chantiers après travaux : sur devis.',
]

/* ------------------------------------------------------------------ */
/* Conditions d'annulation                                             */
/* ------------------------------------------------------------------ */

/**
 * Deux cas, pas davantage : au-delà de 24 h rien n'est dû, en deçà le créneau
 * est perdu. Le rendez-vous non honoré est traité comme une annulation
 * tardive plutôt que comme une faute, et la force majeure lève les frais.
 */
export const cancellationPolicy = [
  {
    when: 'Plus de 24 h avant l’intervention',
    fee: 'Sans frais',
    detail: 'Annulation ou report sans frais, sans justification requise.',
    free: true,
  },
  {
    when: 'Moins de 24 h, ou rendez-vous non honoré',
    fee: '30 % du devis',
    detail:
      'Sauf cas de force majeure — urgence médicale justifiable, hospitalisation, décès d’un proche — sur présentation d’un justificatif.',
    free: false,
  },
]

/* ------------------------------------------------------------------ */
/* Mentions légales et RGPD                                             */
/* ------------------------------------------------------------------ */

export const legalNotice = [
  {
    title: 'Éditeur du site',
    body: `${company.fullName}, entreprise individuelle — ${company.address}, ${company.postalCode} ${company.city}. Téléphone : ${company.phone}. E-mail : ${company.email}. SIREN / SIRET : ${company.siret}. ${company.vatNotice}.`,
  },
  {
    title: 'Hébergement',
    body: `${company.host.name}, ${company.host.address}.`,
  },
  {
    title: 'Tarifs et devis',
    body: 'Les tarifs affichés sont indicatifs et confirmés par devis avant toute intervention. Devis signé au domicile du client : délai de rétractation de 14 jours (art. L221-18 du Code de la consommation). La durée de protection du traitement nano hydrophobe est une estimation et ne constitue pas une garantie contractuelle.',
  },
]

export const privacyNotice = {
  title: 'Données personnelles',
  body: 'Les données transmises via le formulaire de contact sont acheminées via l’infrastructure de Telegram (Telegram Messenger Inc., hors Union européenne) à des fins de notification. Aucune donnée n’est stockée sur nos serveurs. Conformément au RGPD, vous disposez d’un droit d’accès et de suppression — contact : lmservices@gmail.com',
  extra:
    'Le code postal saisi est envoyé à Nominatim (OpenStreetMap Foundation, Union européenne) pour estimer la distance d’intervention. Aucune autre donnée ne lui est transmise.',
}

export const cancellationNotes = [
  'Intempéries, maladie, imprévu grave : nous reportons sans aucun frais, y compris au dernier moment.',
  'Annulation de notre fait : aucun frais, et nous vous proposons un nouveau créneau en priorité.',
  'Devis signé à votre domicile : vous disposez de 14 jours de rétractation (art. L221-18 du Code de la consommation).',
]

/* ------------------------------------------------------------------ */
/* Communes repérées sur la carte                                      */
/* ------------------------------------------------------------------ */

/**
 * Seules les coordonnées sont stockées : la distance et la zone sont calculées
 * au rendu, avec la même formule que le badge du formulaire. Des kilomètres
 * écrits à la main finissaient toujours par diverger du calcul réel.
 */
export type City = { name: string; lat: number; lng: number }

export const cities: City[] = [
  { name: 'Barr', lat: 48.4097, lng: 7.4554 },
  { name: 'Andlau', lat: 48.3872, lng: 7.4183 },
  { name: 'Obernai', lat: 48.4625, lng: 7.4817 },
  { name: 'Rosheim', lat: 48.4966, lng: 7.47 },
  { name: 'Benfeld', lat: 48.3719, lng: 7.5928 },
  { name: 'Molsheim', lat: 48.5397, lng: 7.4939 },
  { name: 'Erstein', lat: 48.4245, lng: 7.665 },
  { name: 'Sélestat', lat: 48.2597, lng: 7.4536 },
  { name: 'Ribeauvillé', lat: 48.195, lng: 7.32 },
  { name: 'Strasbourg', lat: 48.5734, lng: 7.7521 },
  { name: 'Colmar', lat: 48.0794, lng: 7.3585 },
  { name: 'Saverne', lat: 48.7414, lng: 7.3625 },
]

/* ------------------------------------------------------------------ */
/* Formulaire                                                          */
/* ------------------------------------------------------------------ */

export const housingTypes = [
  'Appartement',
  'Maison individuelle',
  'Villa / propriété',
  'Véranda / verrière',
  'Local professionnel',
  'Autre',
] as const

export const navLinks = [
  { href: '#forfaits', label: 'Forfaits' },
  { href: '#zone', label: 'Zone' },
  { href: '#avis', label: 'Avis' },
  { href: '#conditions', label: 'Conditions' },
  { href: '#reservation', label: 'Réservation' },
]
