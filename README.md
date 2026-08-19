# LMS — Luke Mury Services

Site vitrine one-page pour une activité de nettoyage de vitres haut de gamme en Alsace.

## Démarrer

```bash
npm run dev
```

Affiche l'URL locale, l'URL LAN (iPad, même Wi-Fi) et un QR code à scanner, puis lance Vite sur
le port **5174**.

| Script          | Effet                                            |
| --------------- | ------------------------------------------------ |
| `npm run dev` | URL LAN + QR code, puis **Vite (5174) et l API (3001) en parallèle** |
| `npm run dev:front` | Vite seul |
| `npm run server` | Backend Express seul |
| `npm run telegram:chat-id` | Récupère le chat_id Telegram et l écrit dans `.env` |
| `npm run lan` | Réaffiche les URL sans rien démarrer |
| `npm run build` | Typecheck + build de production dans `dist/` |
| `npm run preview` | Sert le build de production (port 4174) |

## Stack

React 18 · Vite · TypeScript strict · Tailwind CSS 3 · Framer Motion · React Hook Form + Zod ·
React Leaflet.

## Où modifier quoi

Tout le contenu éditorial est centralisé dans **`src/data/site.ts`** : coordonnées, forfaits et
tarifs, option douche, frais de déplacement, barème d'annulation, communes couvertes, liens de
navigation. Il n'y a normalement pas besoin de toucher aux composants pour une mise à jour de
contenu.

| Besoin                        | Fichier                                   |
| ----------------------------- | ----------------------------------------- |
| Prix, forfaits, textes        | `src/data/site.ts`                        |
| Couleurs, typographie         | `tailwind.config.js`                      |
| Styles de base, classes `.btn-*` | `src/index.css`                        |
| Visuel du hero                | `public/hero-facade.svg`                  |

## Points d'attention

**Tarifs — source unique.** Toute la grille vit dans `src/data/site.ts` (`openings` +
`showerPricing`) et alimente le calcul de `src/lib/estimate.ts`. **Tarifs à la pièce**, rien au m² :
le client n a aucune mesure à fournir.

| Ouvrant | Premium | Excellence |
| --- | --- | --- |
| Fenêtre standard | 7 € | 10 € |
| Double vantail | 11 € | 15 € |
| Baie vitrée | 28 € | 38 € |
| Velux | 14 € | 19 € |
| Porte-fenêtre | 13 € | 18 € |
| Vitres de douche | 39 € | 79 € |

La grille **n est pas affichée publiquement** : elle sert uniquement au calcul de l estimation. Les
cartes forfaits annoncent le prix d une fenêtre standard, présenté comme tel et jamais comme un
forfait minimum. Les mentions « à partir de 84 / 120 € » sont un *exemple* pour 12 fenêtres.

**Option douche.** Deux niveaux qui suivent le forfait, pas deux options séparées : Premium =
nettoyage complet (39 €), Excellence = nettoyage + traitement nano hydrophobe (79 €). La carte,
la case du formulaire, l estimation et le message Telegram lisent tous `showerPricing`.

**Estimation en direct.** `EstimatePreview` se recalcule à chaque changement. Tant qu aucun forfait
n est choisi, elle affiche une fourchette Premium–Excellence ; d où le fait qu **aucun forfait ne
soit présélectionné**. Le montant est toujours introduit par « à partir de ».

**Centre géographique ≠ siège.** Les distances se mesurent depuis **Barr (48.4097, 7.4554)**,
déclaré une seule fois dans `serviceBase` et importé par `geo.ts`. Le siège de l entreprise est à
**Andlau**. Ne pas confondre les deux, et ne jamais redéclarer les coordonnées ailleurs.

**Géolocalisation du code postal.** `useTravelZone` interroge Nominatim (débounce 600 ms, cache,
`AbortController`) et pilote le badge de zone ainsi que l ajout automatique des 15 € de déplacement
dans l estimation. Un code introuvable n affiche rien — jamais d erreur agressive.

**Témoignages.** Aucun faux avis. La section « Avis » est un emplacement réservé, à remplacer par de
vrais retours Google / Trustpilot.

**Hero.** `public/hero-facade.svg` est un visuel abstrait de substitution. Le remplacer par de
vraies photos de chantier reste le point le plus rentable du site.

**Logo.** L original (`public/logo-source.png`, raclette dorée sur fond noir opaque, 812 Ko) n est
jamais servi au navigateur. `npm run logo` régénère trois déclinaisons via sharp :

| Fichier | Usage | Poids |
| --- | --- | --- |
| `logo.png` (256x172) | Header et overlay de confirmation | 14 Ko |
| `apple-touch-icon.png` (180x180) | Écran d accueil iOS | 7 Ko |
| `favicon-32.png` (32x32) | Onglet | 1 Ko |

Le script reconstruit la transparence : le fond étant du noir pur, l opacité de chaque pixel est
déduite de sa luminance, puis l image est détourée. **La couleur d origine est conservée telle
quelle** — la « dé-prémultiplier » délave l or vers le blanc, ce qui avait été essayé puis écarté.
Conséquence à connaître : le PNG est optimisé pour un fond sombre, ce qui est le cas partout sur ce
site. Les deux icônes sont aplaties sur `#0A0A0B` car une raclette dorée sur transparent
disparaîtrait sur un thème clair.

Pour changer de logo : remplacer `public/logo-source.png` puis relancer `npm run logo`.

**Confirmation.** `SuccessOverlay` s affiche en plein écran après un envoi réussi, monté par
`createPortal` sur `document.body`. Ce n est pas cosmétique : rendu à sa place dans le formulaire,
il hériterait des contextes d empilement créés par les `transform` de Framer Motion des sections
parentes et passerait derrière le header fixe. Il bloque le scroll, se ferme au bouton, au clic
extérieur ou avec Échap, puis réinitialise le formulaire et remonte en haut de page. Les confettis
(`canvas-confetti`) respectent `prefers-reduced-motion` via `disableForReducedMotion`.

**Annulation.** Sans frais au-delà de 24 h, 30 % du devis en deçà, rendez-vous non honoré = frais de
déplacement uniquement. Report gratuit en cas d intempéries. Barème dans `cancellationPolicy`,
affiché dans l accordéon « Conditions » en bas de page et résumé dans le footer.

**Mentions légales et RGPD.** `legalNotice` et `privacyNotice` dans `site.ts`, rendus dans deux
panneaux de l accordéon Conditions. Le SIRET est à remplacer dès l immatriculation obtenue.

**Compteurs d ouvrants.** `OpeningCounter` reçoit une *fonction* de mise à jour, appliquée sur
`getValues('counts')`. Avec un objet figé, deux appuis rapprochés sur « + » lisaient la même valeur
de closure et le second écrasait le premier. Ne pas revenir à `onChange(next)`.

**`overflow-x: clip`.** Le `body` utilise `clip` et non `hidden` : `hidden` en ferait un conteneur
de défilement et casserait le scroll fluide vers les ancres.

**Champ date sur iOS.** `appearance: none`, `min-width: 0` et `max-width: 100%` dans `index.css`,
plus `min-w-0` sur les pistes de grille du formulaire. Ne pas retirer.


## Formulaire — Telegram (canal principal)

À la soumission, le front poste sur `/api/devis` ; le backend Express relaie vers l'API Bot
Telegram. Le visiteur ne quitte pas la page : il obtient un écran de confirmation animé.

```
Booking.tsx → submitBooking(payload, 'telegram')
                └── POST /api/devis  → server.js → api.telegram.org/sendMessage
```

### Mise en route

1. Créer le bot via [@BotFather](https://t.me/BotFather) — déjà fait : **@LMS_devis_bot**.
2. Reporter le token dans `.env` sous `TELEGRAM_BOT_TOKEN`.
3. **Ouvrir Telegram, chercher @LMS_devis_bot et appuyer sur « Démarrer ».** Sans ce premier
   message, Telegram ne connaît aucun chat et ne peut fournir aucun `chat_id`.
4. `npm run telegram:chat-id` : le script lit `getUpdates`, affiche les chats trouvés et écrit
   `TELEGRAM_CHAT_ID` dans `.env`.
5. Redémarrer (`npm run dev`). Le backend affiche « Telegram configuré » au démarrage.

`getUpdates` ne conserve les messages que **~24 h** : si le script ne trouve rien, réécrire au bot
puis le relancer.

### Sécurité — le point à ne pas rater

`TELEGRAM_BOT_TOKEN` et `TELEGRAM_CHAT_ID` n'ont **pas** le préfixe `VITE_`, et c'est délibéré :
Vite n'expose au navigateur que les variables préfixées. Le token reste donc côté serveur.
**Ne jamais le renommer en `VITE_TELEGRAM_BOT_TOKEN`** — il se retrouverait dans le bundle public,
et quiconque le lit peut écrire au bot et lire ses messages. En cas de fuite, le régénérer via
@BotFather (`/revoke`).

`.env` est ignoré par git ; seul `.env.example`, sans valeurs, est versionné.

### Le proxy Vite n'est pas décoratif

`vite.config.ts` relaie `/api` vers `http://localhost:3001`. Le front appelle donc `/api/devis` en
**relatif**. Sans ce proxy, une page ouverte depuis l'iPhone sur `192.168.1.82:5174` appellerait le
`localhost:3001` **du téléphone**, qui n'existe pas : le formulaire marcherait sur le PC et
échouerait sur mobile. En production, servir le backend sous le même domaine, ou renseigner
`VITE_API_BASE_URL`.

### Format du message

Envoyé en `parse_mode: HTML`, pas en Markdown. Le Markdown hérité de Telegram casse dès qu'une
valeur saisie contient une astérisque, un tiret bas, un accent grave ou un crochet : l'API répond
400 et le message est perdu. En HTML, échapper `&`, `<` et `>` suffit — c'est ce que fait `esc()`
dans `server.js`. Le rendu est identique, les libellés restent en gras.

Le message reprend le format demandé, complété par l'option vitres de douche et les photos
annoncées : ces informations sont saisies dans le formulaire, les omettre reviendrait à les perdre.

### Anti-spam

`/api/devis` est la seule porte ouverte sur Telegram. Deux limiteurs la protègent
(`express-rate-limit`) :

- **global** : 100 requêtes / 15 min par IP ;
- **devis** : **2 par 24 h et par IP**, réponse 429 avec un message affiché tel quel au visiteur.

Le compteur vit en mémoire : il repart à zéro à chaque redémarrage du serveur. Suffisant pour un
processus unique ; à remplacer par un store partagé (Redis) si l app est répliquée.

`app.set('trust proxy', 1)` est indispensable derrière un reverse proxy, sinon toutes les requêtes
semblent venir d une seule IP. **En développement, le proxy Vite produit exactement cet effet** :
toutes les requêtes arrivent de 127.0.0.1 et partagent donc le même quota. C est normal.

### Photos

Limites appliquées **des deux côtés** — `PhotoUpload.tsx` pour le confort, `server.js` pour la
sécurité :

| Contrainte | Valeur |
| --- | --- |
| Nombre | 5 maximum |
| Taille unitaire | 4 Mo |
| Taille cumulée | 15 Mo |
| Formats | `image/*` uniquement |

Le front affiche des miniatures avec suppression individuelle, et refuse un dépassement avec un
message explicite avant tout téléversement. Les aperçus utilisent `URL.createObjectURL`, révoqués
au changement de liste pour ne pas fuir en mémoire.

Côté serveur, multer travaille en `memoryStorage()` : aucun fichier n atteint le disque, les
buffers sont relâchés dans un `finally`. Une photo refusée par Telegram (HEIC d iPhone) est
réessayée en `sendDocument`.

### Un seul canal

WhatsApp et EmailJS ont été retirés : leur code était devenu inatteignable et `@emailjs/browser`
n était plus installé. `submitBooking()` reste le point d entrée unique — ajouter un transport se
fait là, sans toucher au formulaire.


## Dépannage

**Rien sur l'iPad.** Vérifier que l'iPad est sur le même Wi-Fi, et non sur un VPN. Le script
propose parfois une IP d'interface virtuelle (NordLynx, Docker) — prendre celle marquée `→ iPad`.
Si le pare-feu Windows bloque, autoriser Node.js sur les réseaux privés.

**Port 5174 occupé.** Changer `server.port` dans `vite.config.ts` ; le script LAN relit le port
depuis ce fichier.
