# talentpulse-demo — sources de la vidéo de démonstration produit

Vidéo de démonstration produit de **30 s**, en français, **sans voix off**, avec **sous-titres
français incrustés**, pour le SaaS **TalentPulse**. Ce dossier vit **hors du build Next.js** : rien ici n'est importé par
`frontend/app/` ou `frontend/components/`. Les seuls fichiers que la vidéo dépose dans
l'application sont ses deux livrables, dans `frontend/public/product/`.

## Livrables

| Fichier | Ce que c'est |
| --- | --- |
| `frontend/public/product/demo.mp4` | 1920×1080, H.264 / yuv420p, **aucune piste audio**, ~30 s, `moov` en tête |
| `frontend/public/product/demo-poster.jpg` | affiche 1920×1080 tirée de la scène 2 (produit visible, sous-titre affiché) |

## Reproduire

```bash
cd videos/talentpulse-demo
npm run build:index     # STORYBOARD.md + captions.json → index.html
npm run lint            # npx hyperframes@0.8.34 lint
npm run check           # lint + runtime + layout + motion + contrast
npm run snapshot        # planche contact des images clés
npm run render          # rendu + conteneur faststart + affiche + vérifications
```

`npm run render` appelle `render.mjs`, qui : rend la composition en qualité haute, **vérifie**
que la sortie est bien `h264`/`yuv420p`/1920×1080 **et qu'elle ne porte aucune piste audio**
(une piste résiduelle ferait échouer le script — ce film est muet), réécrit le conteneur en
`-c copy -an -movflags +faststart` (aucune perte de génération : les flux sont copiés), extrait
l'affiche à **6,2 s** (sous-titre 2 complètement installé), et **mesure la luminance moyenne de
l'affiche** pour refuser une image noire.

Version du CLI : **hyperframes 0.8.34**, épinglée dans `package.json`. Le projet a été créé avec
`npx hyperframes init … --skill=product-launch-video` ; la route de composition est
`/product-launch-video`.

## Contenu du dossier

```
BRIEF.md              l'intention verrouillée (charte, voix, musique, mode, livrables)
frame.md              le design system à l'échelle de l'image (frontmatter = normatif)
SCRIPT.md             le script verrouillé, ligne par ligne, avec la grille des sous-titres
STORYBOARD.md         6 scènes, chacune avec sa séquence plan par plan et ses timecodes
captions.json         les 6 sous-titres : texte, début, durée, variante de couleur
build-index.mjs       assemble index.html (voir « Deux écarts assumés » ci-dessous)
render.mjs            rendu, conteneur, affiche, vérifications
compositions/
  scene-base.css      LE fichier de design : tokens, chrome, cadre navigateur, surimpression
  frames/01-annonce.html … 06-signature.html   les 6 scènes
assets/
  product/            les 7 captures réelles du produit (copiées de frontend/public/product/)
  fonts/              Inter, Instrument Serif, IBM Plex Mono (copiées de frontend/app/fonts/)
  voice/01.mp3 … 06.mp3   l'ANCIENNE voix off ElevenLabs — plus référencée par rien
  brand/talentpulse-pulse.svg   le tracé « pulse » du produit, copié verbatim
capture/extracted/    tokens.json / visible-text.txt (mode sans capture : écrits à la main)
.hyperframes/
  frame-packets/      les paquets de travail par scène (traçabilité de la construction)
  caption-skin.html   la peau de sous-titres du preset (non utilisée : la nôtre vit dans scene-base.css)
renders/              la sortie brute du CLI avant habillage
```

## Deux écarts assumés par rapport à la recette standard

1. **`build-index.mjs` remplace `assemble-index.mjs` du workflow.** Le script est verrouillé : le
   texte ne bouge pas. L'assembleur standard ancre chaque clip audio au **début de sa scène** et
   l'étape `sync-durations` réécrirait chaque durée de scène avec la longueur du fichier audio —
   deux comportements incompatibles avec une grille verrouillée, et de toute façon sans objet
   depuis que la voix est partie. `build-index.mjs` conserve toutes les conventions du workflow
   (sous-compositions sur la voie 1, fond du projet peint sur `#root`) et s'en écarte sur trois
   points : les durées viennent de `STORYBOARD.md` telles quelles, **aucun `<audio>` n'est émis**,
   et chaque sous-titre est posé à son `start_s` **absolu** de `captions.json` (voie 2), avec un
   timeline GSAP racine qui ne fait que les fondre.

2. **Pas de musique.** HeyGen n'est pas connecté (`npx hyperframes auth status` → *not signed in*)
   et le CLI `heygen` n'est pas installé, donc le résolveur BGM de `media-use` n'a aucune source.
   Le brief autorisait le repli « voix seule et propre » ; depuis le passage aux sous-titres
   incrustés, le film est **entièrement muet** et c'est cohérent : pas de nappe synthétisée à la
   main, qui sonnerait bon marché sous un registre de dirigeant.

## Les sous-titres incrustés

Cinq des six phrases du script sont incrustées, une par scène (01 à 05), dans le bas du cadre.
**La scène 06 n'a pas de sous-titre**, à dessein : sa phrase est déjà affichée par la carte
elle-même (la ligne de signature de `06-signature.html`), et incruster la même phrase en dessous
donnait un doublon mot pour mot sur la dernière image — celle qui reste. La phrase est donc
**retenue, pas perdue**, et les 4,9 dernières secondes respirent sans sous-titre. Elles vivent **au
niveau de l'hôte**, pas dans les scènes : `build-index.mjs` émet un `.tp-subtitle` par ligne comme
enfant direct de `#root`, `scene-base.css` porte la peau, et un seul timeline GSAP racine fond
chaque ligne (200 ms entrée, 200 ms sortie, `opacity` nu — **jamais `autoAlpha`**, voir la règle en
tête de `scene-base.css`).

| | valeur |
| --- | --- |
| Police | Inter 500, 32 px / 1,2 — jamais d'italique, jamais de gras |
| Couleur, scènes 02–05 (papier `#FAFAF8`) | encre `#14161A` → **16,35:1** |
| Couleur, scènes 01 / 06 (encre `#14161A`) | papier `#FAFAF8` → **16,05:1** (18,66:1 après l'assombrissement final) |
| Bloc | 1500 px fixe, centré dans la zone libre x 380→1824 (centre optique x ≈ 1102) |
| Position | bas de cadre, boîte de ligne y 1020→1058, 22 px sous la ligne de base du cadre |
| Fond | **aucune plaque** (voir ci-dessous) |
| Scènes avec sous-titre | 01, 02, 03, 04, 05 — **pas 06** (doublon avec la signature) |

**Lisibilité, chiffrée.** 32 px de corps, la hampe mesurée sur les images livrées fait **31 px**
(sur 1080) — soit, dans un lecteur de **700 px** de large, un corps d'environ **11,7 px CSS** et des
capitales d'environ **8,7 px**. C'est le plafond que la bande basse autorise : agrandir encore
réduirait le dégagement sous la surimpression, qui est le seul endroit où le sous-titre peut vivre
sans jamais rien recouvrir. Si l'on veut un texte plus grand, il faut d'abord faire remonter les
surimpressions.

**Pas de plaque de lisibilité, et c'est une décision mesurée.** Le brief l'autorisait *si
nécessaire*. Elle ne l'est pas : la bande du bas est du fond nu, donc le texte porte déjà 16:1. Et
elle ne rentrait pas — la plus longue ligne fait **1392 px** de glyphes et la surimpression occupe
x 104→345 / y 1015→1033, si bien que toute plaque assez large pour la phrase recouvrait le libellé.
Les trois issues possibles étaient : réduire le sous-titre sous une hauteur de capitale lisible,
faire remonter les surimpressions hors du bas de cadre, ou poser le texte sur son fond. La
troisième a été retenue parce qu'elle ne change rien d'autre au film.

Trois micro-ajustements en découlent, tous mesurés et commentés sur place :

- **Le bloc réserve la colonne de gauche.** Il est ancré à x 380 (et non centré sur le cadre) : la
  plus longue ligne commence donc à x 402, soit 57 px à droite du libellé. Sans cette réserve, elle
  commençait à x 264 et traversait la surimpression.
- **Le filet de pied des scènes 01 / 06 remonte** de y 1032 à y 954, et sa ligne `TALENTPULSE`
  de y 986 à y 908.
- **Le libellé `talentpulse.app` de la scène 06 remonte** à y 966. Il est centré sur le même axe
  que le sous-titre, donc contrairement aux surimpressions de gauche il ne peut pas l'éviter
  latéralement.
- Et sur la scène 05, la plaque `1 PAGE / SORTIE COMEX` passe de 256×84 à 208×52 et recule à
  x 1608 ; sur la scène 03, l'interligne de la légende de risque passe de 26 px à 18 px.

## Charte

Registre **sobre & institutionnel clair**, aligné sur `frontend/DESIGN.md` et
`frontend/tailwind.config.ts` : papier `#FAFAF8`, encre `#14161A`, surfaces `#FFFFFF`, filets
`#E6E4DD`, **un seul accent cobalt `#1A43C4`**, sémantique `#B3261E` / `#B9651B` / `#0B6B4F`.
Inter pour le texte, Instrument Serif pour les accents éditoriaux, IBM Plex Mono pour les chiffres
et les libellés. **Aucun** dégradé, halo, ombre — colorée ou non —, emoji, néon ni ease « bounce ».
`scene-base.css` est le seul endroit où les tokens sont déclarés ; les scènes n'ajoutent que de la
mise en page.

**Une exception documentée au cobalt unique.** Sur le fond encre de la scène 6, `#1A43C4` ne
mesure que **2,28:1** — sous le seuil AA (4,5:1) et même sous le plancher 3:1 du grand texte. Le
mot « Pulse » et l'URL `talentpulse.app` prennent donc **un échelon plus clair de l'échelle cobalt
du produit**, `#7D9AF2` (6,71:1 sur encre, 7,16:1 après l'assombrissement final). Le **tracé
`pulse`** et le filet de 28 px restent, eux, au cobalt de la charte `#1A43C4` : ce sont la marque
et un élément graphique, pas du texte. L'exception est locale à `06-signature.html` et commentée
sur place.

## Vérifié, pas supposé

Quatre défauts réels n'ont été trouvés qu'en **mesurant les pixels** d'images extraites, aucun
n'étant signalé par `lint` ou `check` :

1. **`autoAlpha` casse le rendu.** GSAP écrit `visibility: hidden` avant l'heure de départ du
   tween, et le moteur de rendu rejoue les images en *cherchant* dans la timeline au lieu de la
   lire — le `visibility: hidden` n'est donc jamais levé. Résultat : un élément qui n'apparaît
   **jamais**, sans erreur de lint, sans erreur d'exécution, sans avertissement console. La
   première version de ce film a ainsi livré ses cinq surimpressions **manquantes**. Toutes les
   scènes utilisent désormais `opacity` nu. La règle est en tête de `scene-base.css`.
2. **La feuille partagée ne traversait pas le scoper.** Chaque scène `<link>`e `scene-base.css`,
   mais les règles descendantes d'une feuille *liée* n'arrivent pas dans la page composée :
   le cadre navigateur se rendait à sa taille intrinsèque, son filet, sa barre et ses points
   disparaissaient, et `width:100%` ne s'appliquait pas. `build-index.mjs` recopie donc le
   fichier dans le `<head>` de l'hôte. `scene-base.css` reste la source unique.
3. **Le `moov` n'était pas en tête.** Le premier `render.mjs` remuxait vers un fichier temporaire
   puis le recopiait, et cette seconde passe réordonnait silencieusement les atomes
   (`mdat` avant `moov`) alors que les logs annonçaient le contraire. Le conteneur est maintenant
   écrit en **une seule passe** et `render.mjs` relit l'ordre des boîtes dans le fichier livré,
   octet par octet, en échouant si `moov` ne précède pas `mdat`.
4. **La scène 3 ne recadrait rien.** Son crop (`translate -160,-135`) montrait presque exactement
   la même fenêtre que la scène 2 : aucune mise en avant des cas critiques. Le cadrage est
   désormais ancré au pied de l'image, ce qui amène la bannière et tout le Top 5 dans le champ.

Deux défauts supplémentaires ont été trouvés lors du passage aux sous-titres, tous deux par
`check` et par lecture des pixels rendus :

5. **Le sous-titre se repliait sur deux lignes, hors cadre.** La première version dimensionnait le
   bloc à partir de mesures prises dans un banc de test qui n'avait **pas chargé Inter** : la
   police de repli est ~5 % plus étroite, la plus longue phrase y mesurait 1263 px au lieu de
   **1392 px**, et le bloc de 1360 px la faisait passer à la ligne — la seconde ligne sortait du
   cadre par le bas. Le banc de test déclare désormais le `@font-face` réel
   (`assets/fonts/inter-latin.woff2`) et `--sub-max-width` vaut 1500 px. C'est le seul défaut de ce
   film qui venait d'un **instrument de mesure faux**, pas du film.
6. **Le sous-titre recouvrait la surimpression.** Avec le bloc centré sur le cadre, la plus longue
   ligne commençait à x 264 et traversait le libellé (x 104→345). `check` l'a signalé en
   `text_occluded` / `content_overlap` sur six échantillons. Le bloc réserve maintenant la colonne
   de gauche (ancrage à x 380) : la ligne la plus longue commence à x 402, soit 57 px de marge.
   Après correction, `check` ne rapporte plus **aucun** chevauchement impliquant un sous-titre.

## Dépendances d'exécution

Node ≥ 22, FFmpeg + ffprobe (conteneur, affiche, mesures), et `hyperframes@0.8.34` via `npx`.
Aucun `node_modules` n'est nécessaire pour la construction ; le CLI est épinglé et résolu par
`npx`. (`ws` a été installé temporairement pendant le diagnostic, non suivi.)

Le dossier `.measure/` (non suivi, ajouté au `.gitignore`) est un banc de mesure jetable : il
rend la bande du bas dans le Chrome headless du CLI et lit les boîtes réelles sur un fond
sentinelle. C'est lui qui a produit tous les chiffres cités plus haut. Il se relance à la main si
un élément du bas de cadre bouge.

## Limites connues

- **Le film est muet** (voir écart 2) : aucune piste audio du tout, ni voix ni musique. La voix off
  a été retirée et remplacée par les sous-titres incrustés ; les fichiers `assets/voice/01..06.mp3`
  sont toujours sur le disque mais **plus référencés par rien** (l'ancien `audio_meta.json` a été
  supprimé, remplacé par `captions.json`).
- `npx hyperframes check` passe avec **0 erreur** et sort en code 0. Il reste **13 avertissements de
  contraste**, tous antérieurs au passage aux sous-titres et tous documentés : **12 portent sur du
  texte à l'intérieur des captures produit** (libellés `ink-3`/`ink-4` du tableau de bord,
  désactivés et tertiaires) — ce sont les pixels de l'application, que le brief interdit de
  retoucher — et le 13e est le filet cobalt de 28 px sous la surimpression, qui est un élément
  graphique et non du texte. **Aucun de ces 13 avertissements ne concerne un sous-titre** : les six
  lignes passent l'audit AA (16,05:1 à 18,66:1).
- Il reste un **avertissement de lint** `timeline_track_too_dense` (5 éléments minutés sur la voie
  2, le seuil étant 3). C'est structurel : les cinq sous-titres sont cinq clips distincts, un par
  scène, et la structure du projet est modulaire (chaque scène est une sous-composition), donc il
  n'existe pas de « groupe de scènes cohérent » à extraire dans un fichier à part. Il est cosmétique — il
  n'affecte ni le rendu ni les autres audits — et il est assumé.
- **Pas d'horodatage mot à mot.** Les sous-titres sont posés sur la grille de `captions.json`
  (début juste après la coupe de la scène, fin juste avant la suivante), pas sur un alignement
  forcé du signal vocal — il n'y a plus de signal vocal.
- Les sous-titres ne sont **pas** des pistes de sous-titres (pas de WebVTT, pas de `<track>`) :
  ils sont incrustés dans l'image, comme demandé.

## Publier la vidéo dans le site

Le rendu brut pèse ~16 Mo (4,3 Mb/s) : trop lourd pour une page d'accueil. Après **chaque**
rendu, lancez :

```bash
npm run render:publish      # render + publication optimisée
# ou, si le rendu existe déjà :
npm run publish
```

`publish.mjs` réencode en **H.264 CRF 21** (visuellement identique sur du contenu d'interface,
texte net), ajoute **`+faststart`** (atome `moov` en tête, lecture immédiate dans un `<video>`),
passe **`-an`** pour garantir un fichier sans audio, et écrit `frontend/public/product/demo.mp4`
— **4,31 Mo au lieu de 15,9 Mo** (mesuré sur le rendu livré).

> [!warning] Ne pas oublier cette étape
> Un `npm run render` seul écrase le fichier publié par une version lourde. C'est déjà arrivé :
> la page servait 16 Mo. `render:publish` enchaîne les deux pour rendre l'oubli impossible.
