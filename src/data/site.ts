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
  id: 'premium' | 'excellence' | 'signature'
  name: string
  subtitle: string
  /** Exemple pour une maison type de 12 fenêtres. Absent si le forfait est sur devis. */
  exampleHouse?: number
  /** Prix d’une fenêtre standard. Absent si le forfait est sur devis. */
  perWindow?: number
  /** Vrai quand aucun prix ne peut être annoncé sans étude préalable. */
  quoteOnly?: boolean
  featured: boolean
  pitch: string
  features: string[]
  highlight?: string
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
      'Le nettoyage complet de vos surfaces vitrées, intérieur et extérieur, pour une finition propre, nette et sans traces.',
    highlight: 'Exemple : 12 fenêtres standard à partir de 84 €',
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
      'Là où le regard s’arrête d’habitude, nous continuons. L’ouvrant est repris dans son entier : le verre, mais aussi tout ce qui l’encadre et retient la saleté année après année. Une fenêtre qui paraît neuve, pas simplement propre.',
    highlight: 'Exemple : 12 fenêtres standard à partir de 120 €',
    features: [
      'Tout le forfait Premium inclus',
      'Toute la saleté éliminée : cadres, joints, rebords, ouvrants',
      'Rails, gonds et feuillures repris un à un',
      'Séchage sans traces garanti',
      'Sans odeurs résiduelles',
    ],
  },
  {
    id: 'signature',
    name: 'Signature',
    subtitle: 'Sur devis — cas par cas',
    quoteOnly: true,
    featured: false,
    pitch:
      'Une solution dédiée principalement aux ouvrants extérieurs. Après nettoyage, nous appliquons un revêtement nano texturé qui limite durablement l’apparition des salissures et facilite les nettoyages suivants. L’eau perle, la vitre reste propre plus longtemps.',
    features: [
      'Nettoyage complet préalable des ouvrants',
      'Revêtement nano texturé sur le vitrage extérieur',
      'Salissures durablement limitées',
      'Nettoyages suivants nettement facilités',
      'Étude préalable de la surface et de l’accessibilité',
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
 * Deux formules opposées, pas deux niveaux de gamme : on nettoie, ou on
 * nettoie et on protège. Ce choix est indépendant du forfait retenu pour les
 * vitres, et l’option peut être réservée seule.
 */
export const showerPricing = {
  id: 'douche',
  label: 'Vitres de douche',
  formulas: [
    {
      id: 'seul',
      name: 'Nettoyage seul',
      price: 39,
      detail: 'Décapage complet du voile calcaire, paroi et joints.',
      features: [
        'Détartrage en profondeur de toutes les parois',
        'Profilés, joints et bas de parois repris à la main',
        'Rails de porte dégraissés',
      ],
    },
    {
      id: 'complet',
      name: 'Forfait complet',
      price: 79,
      detail: 'Nettoyage puis protection nano hydrophobe : l’eau perle, durée estimée 12 mois.',
      features: [
        'Tout le nettoyage seul inclus',
        'Protection nano hydrophobe appliquée à la main',
        'Nettement moins de traces de calcaire au quotidien',
        'Entretien courant très allégé',
      ],
    },
  ],
} as const

export type ShowerFormulaId = (typeof showerPricing.formulas)[number]['id']

/** Retrouve une formule par son identifiant, pour le calcul et les messages. */
export function showerFormula(id: string) {
  return showerPricing.formulas.find((f) => f.id === id)
}


/* ------------------------------------------------------------------ */
/* Option complémentaire — vitres de douche                            */
/* ------------------------------------------------------------------ */

/**
 * Option complémentaire, présentée sous les trois forfaits.
 * Tarif calé sur le détartrage professionnel (150–200 € pour 2–4 h) ramené
 * à une douche complète, soit environ 1 h 30 de travail.
 * La durée de protection suit ce qu'annoncent les traitements nano
 * professionnels (≈ 12 mois), et non les sprays grand public (8–12 semaines).
 */
export const showerOption = {
  name: 'Vitres de douche',
  tagline: 'L’option qui fait durer le résultat',
  protectionMonths: 12,
  pitch:
    'Le calcaire s’installe sur une paroi de douche plus vite que partout ailleurs. Nous décapons le voile accumulé, puis nous appliquons une protection nano hydrophobe : l’eau ne s’étale plus, elle perle et s’écoule en emportant le dépôt.',
  conditions: [
    'Cette option peut être réservée seule, sans forfait vitres.',
    'Le traitement nano hydrophobe nécessite obligatoirement le nettoyage préalable de la paroi, et reste soumis aux conditions d’application : état de la surface et accessibilité.',
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


/* ------------------------------------------------------------------ */
/* Conditions d'annulation                                             */
/* ------------------------------------------------------------------ */

/**
 * Barème d'annulation et conditions de réservation.
 * Le seuil de 150 € sépare deux régimes : engagement de confiance sans
 * acompte en dessous, acompte de 30 % qui verrouille le créneau au-dessus.
 */
export const cancellationPolicy = [
  {
    when: 'Plus de 48 h avant',
    fee: 'Sans frais',
    detail: 'Annulation ou report libre, sans justification à fournir.',
    free: true,
  },
  {
    when: 'Moins de 48 h avant',
    fee: '30 % du devis',
    detail:
      'L’acompte de 30 % versé à la commande reste acquis au prestataire à titre d’indemnité forfaitaire. Sans acompte, cette indemnité reste due.',
    free: false,
  },
  {
    when: 'Moins de 24 h, ou absence au rendez-vous',
    fee: '50 % du devis',
    detail: '50 % du montant total du devis devient exigible.',
    free: false,
  },
]

/** Régime d'acompte, fonction du montant de l'intervention. */
export const bookingTerms = [
  {
    range: 'Jusqu’à 150 €',
    deposit: 'Aucun acompte',
    detail:
      'Votre réservation repose sur un engagement mutuel de confiance. En cas d’annulation à moins de 48 h ou d’absence lors de notre venue, une indemnité forfaitaire de 30 % du montant du devis reste due.',
  },
  {
    range: 'Au-delà de 150 €',
    deposit: 'Acompte de 30 %',
    detail:
      'Demandé afin de valider et verrouiller votre créneau dans notre planning. Le règlement peut s’effectuer en ligne par carte bancaire ou par chèque.',
  },
]

/** Résumé court, affiché près de la case à cocher du formulaire. */
export const cancellationSummary =
  'Annulation sans frais jusqu’à 48 h avant l’intervention. Moins de 48 h : 30 % du devis. Moins de 24 h ou absence au rendez-vous : 50 %. Au-delà de 150 €, un acompte de 30 % verrouille le créneau.'

/* ------------------------------------------------------------------ */
/* Questions fréquentes                                                 */
/* ------------------------------------------------------------------ */

/**
 * Regroupe en bas de page ce qui traînait auparavant en petites mentions au
 * milieu du parcours. Les réponses sont volontairement écrites en clair : une
 * FAQ qui esquive est pire que pas de FAQ.
 */
export const faq = [
  {
    id: 'deplacement',
    question: 'Les frais de déplacement sont-ils inclus ?',
    answer:
      'Le déplacement est offert dans un rayon de 25 km autour de Barr, ce qui couvre notamment Obernai, Sélestat, Molsheim, Benfeld et Andlau. Entre 25 et 50 km — Strasbourg, Colmar, Saverne — un forfait unique de 15 € s’ajoute au devis, quelle que soit la durée de l’intervention. Au-delà de 50 km, l’intervention reste possible et le déplacement est convenu au cas par cas. Le code postal saisi dans le formulaire affiche votre zone immédiatement.',
  },
  {
    id: 'stationnement',
    question: 'Des frais de stationnement peuvent-ils s’appliquer ?',
    answer:
      'Des frais de stationnement peuvent être ajoutés au devis selon les conditions d’accès au chantier. Ces frais, à la charge du client, sont toujours communiqués et acceptés explicitement avant toute intervention.',
  },
  {
    id: 'tva',
    question: 'Pourquoi n’y a-t-il pas de TVA sur le devis ?',
    answer:
      'LMS relève du régime de la franchise en base de TVA, prévu par l’article 293 B du Code général des impôts. Aucune TVA n’est facturée et aucune n’est récupérable : le prix annoncé est le prix payé. Pour un particulier, cela revient à un tarif net d’environ 20 % inférieur à celui d’une entreprise assujettie, à prestation égale.',
  },
  {
    id: 'annulation',
    question: 'Quelle est votre politique d’annulation ?',
    answer:
      'Toute annulation doit être notifiée au moins 48 heures avant la date prévue de l’intervention. En cas d’annulation effectuée moins de 48 heures avant le rendez-vous, l’acompte de 30 % versé à la commande restera acquis au prestataire à titre d’indemnité forfaitaire. Pour toute annulation à moins de 24 h ou en cas d’absence du client lors du rendez-vous, 50 % du montant total du devis sera exigible.',
  },
  {
    id: 'reservation',
    question: 'Faut-il verser un acompte à la réservation ?',
    answer:
      'Cela dépend du montant. Jusqu’à 150 €, aucun acompte n’est demandé : votre réservation repose sur un engagement mutuel de confiance, et en cas d’annulation à moins de 48 h ou d’absence lors de notre venue, une indemnité forfaitaire de 30 % du montant du devis reste due. Au-delà de 150 €, un acompte de 30 % est demandé afin de valider et verrouiller votre créneau dans notre planning ; le règlement peut s’effectuer en ligne par carte bancaire ou par chèque.',
  },
  {
    id: 'devis',
    question: 'Le devis est-il vraiment gratuit ?',
    answer:
      'Oui, il est absolument gratuit. Il est établi après échange de photos ou visite sur place, et vous recevez une réponse sous 24 h. L’estimation affichée dans le formulaire est indicative : le devis définitif peut être ajusté pour des vitrages très encrassés, des chantiers après travaux, des hauteurs inhabituelles ou des vitrages à petits carreaux. La signature du devis vous engage vis-à-vis de la prestation, en accord avec la politique d’annulation.',
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
  'Toute annulation doit être notifiée au moins 48 heures avant la date prévue de l’intervention.',
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
  { href: '#faq', label: 'FAQ' },
  { href: '#reservation', label: 'Réservation' },
]
