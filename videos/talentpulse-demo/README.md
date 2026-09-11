# talentpulse-demo — sources de la vidéo de démonstration produit

Vidéo de démonstration produit de **30 s**, en français, avec voix off, pour le SaaS
**TalentPulse**. Ce dossier vit **hors du build Next.js** : rien ici n'est importé par
`frontend/app/` ou `frontend/components/`. Les seuls fichiers que la vidéo dépose dans
l'application sont ses deux livrables, dans `frontend/public/product/`.

## Livrables

| Fichier | Ce que c'est |
| --- | --- |
| `frontend/public/product/demo.mp4` | 1920×1080, H.264 / yuv420p, AAC, ~30 s, `moov` en tête |
| `frontend/public/product/demo-poster.jpg` | affiche 1920×1080 tirée de la scène 2 (produit visible) |

## Reproduire

```bash
cd videos/talentpulse-demo
npm run build:index     # STORYBOARD.md + audio_meta.json → index.html
npm run lint            # npx hyperframes@0.8.34 lint
npm run check           # lint + runtime + layout + motion + contrast
npm run snapshot        # planche contact des images clés
npm run render          # rendu + conteneur faststart + affiche + vérifications
```

`npm run render` appelle `render.mjs`, qui : rend la composition en qualité haute, **vérifie**
que la sortie est bien `h264`/`yuv420p`/1920×1080 avec une piste audio, réécrit le conteneur en
`-c copy -movflags +faststart` (aucune perte de génération : les flux sont copiés), extrait
l'affiche à **5,0 s**, et **mesure la luminance moyenne de l'affiche** pour refuser une image
noire.

Version du CLI : **hyperframes 0.8.34**, épinglée dans `package.json`. Le projet a été créé avec
`npx hyperframes init … --skill=product-launch-video` ; la route de composition est
`/product-launch-video`.

## Contenu du dossier

```
BRIEF.md              l'intention verrouillée (charte, voix, musique, mode, livrables)
frame.md              le design system à l'échelle de l'image (frontmatter = normatif)
SCRIPT.md             la voix off verrouillée, ligne par ligne, avec la grille de placement
STORYBOARD.md         6 scènes, chacune avec sa séquence plan par plan et ses timecodes
audio_meta.json       les 6 lignes de voix : fichier, début absolu, durée, texte
build-index.mjs       assemble index.html (voir « Deux écarts assumés » ci-dessous)
render.mjs            rendu, conteneur, affiche, vérifications
compositions/
  scene-base.css      LE fichier de design : tokens, chrome, cadre navigateur, surimpression
  frames/01-annonce.html … 06-signature.html   les 6 scènes
assets/
  product/            les 7 captures réelles du produit (copiées de frontend/public/product/)
  fonts/              Inter, Instrument Serif, IBM Plex Mono (copiées de frontend/app/fonts/)
  voice/01.mp3 … 06.mp3   la voix off ElevenLabs, une ligne par fichier
  brand/talentpulse-pulse.svg   le tracé « pulse » du produit, copié verbatim
capture/extracted/    tokens.json / visible-text.txt (mode sans capture : écrits à la main)
.hyperframes/
  frame-packets/      les paquets de travail par scène (traçabilité de la construction)
  caption-skin.html   la peau de sous-titres du preset (non utilisée : pas de sous-titres)
renders/              la sortie brute du CLI avant habillage
```

## Deux écarts assumés par rapport à la recette standard

1. **`build-index.mjs` remplace `assemble-index.mjs` du workflow.** Le script est verrouillé :
   le texte ne bouge pas et les fenêtres de la table livrée totalisent 30 s, alors que la parole
   mesurée en fait 29,21 s. Les scènes et la voix divergent donc volontairement à cinq des six
   frontières. L'assembleur standard ancre chaque clip de voix au **début de sa scène** et
   l'étape `sync-durations` réécrirait chaque durée de scène avec la longueur du fichier audio —
   deux comportements incompatibles avec une grille verrouillée. `build-index.mjs` conserve
   toutes les conventions du workflow (sous-compositions sur la voie 1, voix sur la 10, fond du
   projet peint sur `#root`) et ne change que ces deux points : les durées viennent de
   `STORYBOARD.md` telles quelles, et chaque voix est placée à son `start_s` **absolu**.

2. **Pas de musique.** HeyGen n'est pas connecté (`npx hyperframes auth status` → *not signed
   in*) et le CLI `heygen` n'est pas installé, donc le résolveur BGM de `media-use` n'a aucune
   source ; ElevenLabs via Zapier n'expose que la synthèse vocale. Aucune piste libre de droits
   n'a donc pu être **obtenue et licenciée** dans cette exécution. Le brief autorise explicitement
   le repli « voix seule et propre », et c'est ce qui est livré — pas de nappe synthétisée à la
   main, qui sonnerait bon marché sous une voix de dirigeant.

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

## Dépendances d'exécution

Node ≥ 22, FFmpeg + ffprobe (conteneur, affiche, mesures), et `hyperframes@0.8.34` via `npx`.
Aucun `node_modules` n'est nécessaire pour la construction ; le CLI est épinglé et résolu par
`npx`. (`ws` a été installé temporairement pendant le diagnostic, non suivi.)

## Limites connues

- **Pas de musique** (voir écart 2). Voix seule.
- `npx hyperframes check` passe avec **0 erreur**. Il reste 13 avertissements de contraste, dont
  **12 portent sur du texte à l'intérieur des captures produit** (libellés `ink-3`/`ink-4` du
  tableau de bord, désactivés et tertiaires) : ce sont les pixels de l'application, que le brief
  interdit de retoucher. Le 13e est le filet cobalt de 28 px sous la surimpression, qui est un
  élément graphique et non du texte.
- Pas de sous-titres incrustés (choix explicite du brief) et pas de horodatage mot à mot : sans
  accès HeyGen, aucun alignement forcé n'était possible. Les départs de voix sont donc la grille
  mesurée contre la durée réelle de chaque fichier, à ±40 ms.


## Publier la vidéo dans le site

Le rendu brut pèse ~16 Mo (4,3 Mb/s) : trop lourd pour une page d'accueil. Après **chaque**
rendu, lancez :

```bash
npm run render:publish      # render + publication optimisée
# ou, si le rendu existe déjà :
npm run publish
```

`publish.mjs` réencode en **H.264 CRF 21** (visuellement identique sur du contenu d'interface,
texte net), ajoute **`+faststart`** (atome `moov` en tête, lecture immédiate dans un `<video>`) et
écrit `frontend/public/product/demo.mp4` — **~4,6 Mo au lieu de 16 Mo**.

> [!warning] Ne pas oublier cette étape
> Un `npm run render` seul écrase le fichier publié par une version lourde. C'est déjà arrivé :
> la page servait 16 Mo. `render:publish` enchaîne les deux pour rendre l'oubli impossible.
