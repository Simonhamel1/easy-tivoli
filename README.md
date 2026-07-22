# Easy Tivoli — site vitrine

Site de présentation pour la location de chapiteaux, mobilier et jeux de réception.

## Contenu du dossier

```
easy-tivoli-projet/
├── index.html          ← la page (structure et textes)
├── css/
│   └── style.css       ← toute la mise en forme (couleurs, polices, mise en page)
├── js/
│   └── main.js         ← les animations (menu, apparitions, léger parallaxe)
└── images/
    ├── chapiteau.jpg    ← photo du chapiteau (hero + section chapiteau)
    └── jeux.jpg         ← photo des jeux (section jeux)
```

## Ouvrir le site

Le plus simple : double-clique sur `index.html`, il s'ouvre dans ton navigateur.

Pour le modifier confortablement, ouvre le dossier dans **VS Code** (gratuit).
Astuce : installe l'extension « Live Server » puis clic droit sur `index.html` →
« Open with Live Server ». La page se recharge toute seule à chaque modification.

## Modifier les choses courantes

- **Les textes** → dans `index.html`. Cherche le mot à changer, remplace-le.
- **Les photos** → remplace les fichiers dans `images/` en gardant les mêmes noms
  (`chapiteau.jpg` et `jeux.jpg`), ou change le nom dans `index.html`.
  Compresse tes photos avant (idéalement sous ~300 Ko) pour que le site reste rapide.
- **Les infos techniques** (3 × 6 m, ≈ 30 personnes…) → dans `index.html`,
  section « PRODUIT 1 : CHAPITEAU », liste `.specs`.
- **La couleur d'accent** (le vert) → dans `css/style.css`, tout en haut,
  ligne `--accent:#1f4d3a;`. Change la valeur hex.
- **Les polices** → chargées depuis Google Fonts dans `index.html` (balise `<link>`),
  et appliquées dans `css/style.css` (`--fd` pour les titres, `--fb` pour le texte).

## À faire avant de publier

1. Remplacer les photos par tes versions **sans le filigrane leboncoin**.
2. Vérifier / corriger les infos techniques (dimensions, capacité, etc.).
3. Vérifier le lien Instagram (déjà réglé sur https://www.instagram.com/easy.tivoli/).

## Mettre en ligne (plus tard)

C'est un site statique : tu peux le déposer tel quel sur un hébergement gratuit
comme Netlify (glisser-déposer le dossier sur netlify.com) ou GitHub Pages.
Aucune installation ni base de données nécessaire.
