# TalentPulse — Design System

> Registre : **sobre & institutionnel clair**. L'objectif n'est pas d'impressionner un
> designer, c'est qu'un DRH puisse montrer l'écran à son COMEX sans avoir l'air d'avoir
> acheté un gadget. Papier chaud, encre presque noire, **un seul accent cobalt**.

---

## 1. Couleurs

Toutes les couleurs vivent dans `tailwind.config.ts`. **N'utilise jamais** les palettes
Tailwind par défaut dans du code neuf (`slate-*`, `indigo-*`, `rose-*`, `emerald-*`,
`amber-*`, `blue-*`, `violet-*`, `gray-*`) : elles sont froides, saturées et génériques.

| Rôle | Classe | Valeur |
|---|---|---|
| Fond de page | `bg-paper` | `#FAFAF8` (blanc cassé chaud) |
| Surface (carte) | `bg-surface` | `#FFFFFF` |
| Fond en creux (hover, zone dense) | `bg-sunken` | `#F3F2ED` |
| Filet 1 px | `border-line` | `#E6E4DD` |
| Filet marqué (bord de champ) | `border-line-strong` | `#D5D2C8` |
| Texte principal | `text-ink` | `#14161A` |
| Texte secondaire | `text-ink-2` | `#4B5058` |
| Texte tertiaire / libellés | `text-ink-3` | `#82868E` |
| Texte désactivé | `text-ink-4` | `#A9ADB4` |
| Accent | `accent-600` | `#1A43C4` (cobalt) |
| Bandeau sombre | `graphite-900` | `#14161A` |
| Risque élevé | `danger-600` / `bg-danger-50` | `#B3261E` |
| Vigilance | `warn-600` / `bg-warn-50` | `#96590F` |
| Situation saine | `ok-600` / `bg-ok-50` | `#0B6B4F` |

**Règle d'usage de l'accent** : le cobalt est réservé aux **liens**, aux **chiffres clés**,
aux **états actifs** et aux **séries de graphiques**. Les boutons d'action principaux sont
**encre** (`btn-primary` = fond `ink`), pas cobalt. Un seul bouton cobalt par écran, maximum.

`primary-*` existe encore comme alias de `accent-*` : c'est un filet de sécurité pour le
markup pas encore migré, pas une invitation à l'utiliser.

---

## 2. Typographie

| Famille | Variable | Usage |
|---|---|---|
| **Inter** | `font-sans` | Tout : UI, corps de texte, libellés |
| **Instrument Serif** | `font-display` | Accents éditoriaux **uniquement** : fin d'un H1 de hero, citation, statement. 2–3 fois par page maximum. |
| **IBM Plex Mono** | `font-mono` | Chiffres, KPI, en-têtes de tableau, libellés `micro` |

- Échelle : `text-micro` (11 px) · `text-small` (13 px) · `text-base` (15 px) ·
  `text-lead` (17 px) · `text-title` · `text-h3` · `text-h2` · `text-h1` · `text-display`
- Les grands titres sont **serrés** (`tracking-[-0.028em]` déjà inclus dans l'échelle).
- Les chiffres utilisent la classe `.figure` (mono + `tabular-nums`) pour s'aligner en colonne.
- Les libellés de section utilisent `.eyebrow` (mono, majuscules, filet de 24 px devant).

---

## 3. Surfaces, rayons, ombres

- Rayons **serrés** : `rounded` (7 px) par défaut, `rounded-xl` (14 px) pour une carte,
  `rounded-2xl` (18 px) pour une modale. On n'arrondit pas tout en `3xl`.
- Ombres **diffuses et basses**, jamais colorées :
  `shadow-card` (repos) → `shadow-lift` (survol) → `shadow-float` (modale, menu) →
  `shadow-frame` (capture d'écran du produit).
- Séparateurs : un `border-line` de 1 px, ou la classe `.hairline`. Pas de bordure épaisse.
- **Interdits** : dégradés, `shadow-glow`, halos colorés, `backdrop-blur` décoratif,
  pastilles d'icônes colorées, emojis dans l'interface.

---

## 4. Classes composants (`app/globals.css`)

À réutiliser au lieu d'empiler des utilitaires.

| Classe | Rôle |
|---|---|
| `container-page` | Largeur de contenu (max 1180 px) + gouttières |
| `section` | Rythme vertical d'une section marketing (`py-20 sm:py-28`) |
| `eyebrow` | Libellé mono majuscule avec filet |
| `hairline` | Filet horizontal 1 px |
| `btn` + `btn-primary` `btn-secondary` `btn-ghost` `btn-accent` `btn-danger` | Boutons |
| `input` / `label` | Champs de formulaire |
| `card` / `card-hover` / `panel` | Surfaces |
| `badge` + `badge-neutral` `badge-risk-high` `badge-risk-medium` `badge-risk-low` | Pastilles |
| `figure` | Chiffre mono tabulaire |
| `frame` / `frame-bar` / `frame-dot` | Cadre navigateur autour d'une capture produit |
| `bg-grid` | Trame discrète pour un fond de hero |
| `mask-fade-b` | Fondu bas (captures qui « sortent » de l'écran) |

---

## 5. En-tête de page applicative

Toutes les pages de `app/(app)/` ouvrent sur le même bloc :

```tsx
<header className="border-b border-line pb-5">
  <p className="eyebrow">Pilotage du risque</p>
  <h2 className="mt-2 text-h2 font-semibold">Titre de la page</h2>
  <p className="mt-1.5 max-w-2xl text-base text-ink-2">
    Une phrase qui dit à quoi sert l'écran, pas ce qu'il contient.
  </p>
</header>
```

Les actions de page (bouton principal, filtre) se placent à droite du titre sur
`flex flex-wrap items-end justify-between gap-4`.

---

## 6. Ton rédactionnel

- **Français**, phrases courtes, verbes d'action. Pas de « Solution innovante ».
- On décrit ce que l'écran **permet de décider**, pas ce qu'il affiche.
- Les libellés de chiffres sont en `micro` majuscule (`TALENTS SURVEILLÉS`), les valeurs
  en `.figure`.
- Aucun emoji dans l'interface. Aucune promesse qui ne soit pas dans le code.

---

## 7. Accessibilité (non négociable)

- Contraste minimum AA : `ink-3` sur `paper` est la limite basse, ne pas descendre en dessous.
- Tout contrôle interactif a un nom accessible (texte visible, `aria-label`, ou `title`).
- Le focus est visible partout (`:focus-visible` est défini globalement).
- `prefers-reduced-motion` est respecté globalement : ne pas contourner avec des animations
  en JavaScript.
