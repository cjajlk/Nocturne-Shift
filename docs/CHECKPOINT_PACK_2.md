# CHECKPOINT — PACK 2

## Base autorisée

- Dossier réel : `E:\cj_project\Nocturne-Shift`.
- Branche : `main`, propre avant intervention.
- HEAD réel : `3841649afc420fef51fc41bed1d16aa001d01920`, explicitement autorisé par l'utilisateur en remplacement du HEAD initialement demandé.
- `origin` : `https://github.com/cjajlk/Nocturne-Shift.git` ; référence locale `origin/main` absente. Aucun fetch, commit, push ou déploiement effectué.

## Fichiers modifiés

- `js/game.js` : rendu des fragments, décor, projection, réactions visuelles.
- `css/style.css` : présentation des panneaux, bordures et couleurs ; retrait du flou de superposition.
- `docs/CHECKPOINT_PACK_2.md` : ce document.
- `index.html` et les checkpoints précédents restent inchangés.

## Choix visuels

Le plateau reste sombre et calme ; une réussite produit un éclair bref ; une pile haute développe une tension violette progressive. Les sept formes sont conservées, avec une palette commune plutôt que sept couleurs arcade.

Palette : bleu profond (`#070b19`, `#0d1427`), cyan froid (`#79dced`), bleu électrique/indigo (`#648cf0`, `#8993ed`), violet (`#b18ae8`) et blanc cyan (`#b4e7f2`, `#c4f3ff`). Le signal de tension utilise une variante rouge-violet désaturée (`#cf79c5`).

Fragments : centre de verre fumé, facette translucide, contour fin et fissure ramifiée discrète. Les pièces actives et les aperçus ont un contour plus clair que les fragments posés. Aucun glow permanent.

Grille : traits à faible opacité sur fond bleu nuit, bordure extérieure fine. Dimensions logiques et canvas inchangés : 10 × 20, 300 × 600 pixels.

Faille : ouverture anguleuse verticale sombre, bords violet/cyan discrets et halo statique diffus, dessinés une seule fois dans un canvas de fond. Purement décorative, sans animation permanente, jauge ni activation.

Fantôme : le socle local n'en contenait pas ; ajout d'une projection strictement visuelle à partir des collisions existantes, sans modifier la pièce active. Contours fins à 28 % d'opacité, aucun remplissage.

Pose : éclair de contour d'environ 175 ms sur les cellules posées. Les coordonnées suivent la compression immédiate des lignes lors de la pose.

Ligne : trace lumineuse de 280 ms maximum ; fissures après les premiers 20 % de l'effet, puis extinction. La ligne logique est supprimée immédiatement comme dans le PACK 1 ; la trace visuelle n'introduit aucun délai et ne bloque jamais les contrôles ou l'apparition suivante. Aucune aspiration.

Danger : tension graduelle lorsque des cellules posées occupent les sept premières lignes ; teinte discrète en haut du plateau et fissures rouge-violet sur les blocs supérieurs. Aucun texte ni changement de vitesse ou de règle.

Interface : score, lignes, record, suivante, réserve et fin de partie conservés. Panneaux plus sobres, bordures froides, boutons indigo ; aucune statistique ajoutée.

## Validation

- PASS : `node --check js/game.js`.
- PASS : comparaison automatisée avec le JavaScript du HEAD de départ, dans deux environnements déterministes : 1 214 états identiques, dont 1 200 étapes de simulation, scores des suppressions de 1/2/3/4 lignes, déplacements, rotations, chutes, réserve, gestes tactiles, réinitialisations et suspension paysage.
- PASS : comparaison du texte des fonctions de gameplay préexistantes ; seuls un appel de capture visuelle dans le verrouillage et la remise à zéro des effets au redémarrage sont ajoutés. Les fonctions de rendu sont les autres changements JavaScript.
- PASS : aperçu navigateur en 360 × 640 ; paysage en 640 × 360 avec écran portrait requis ; retour en 390 × 844 avec interface rétablie. Contrôle visuel supplémentaire de scènes de pile haute et de lignes.
- PASS : aucune erreur ni alerte JavaScript signalée dans les aperçus consultés.
- PASS : règles, formes, grille, barème, progression de vitesse, collisions, rotation, réserve, gestes et persistance locale inchangés.

## Performance et limites

- Fond dessiné une fois, aucune bibliothèque, particule, animation de décor ou nouveau minuteur.
- Réutilisation de la boucle de rendu existante. Au plus huit événements visuels simultanés, automatiquement expirés ; aucun stockage durable des effets.
- Réduction des ombres CSS et suppression de `backdrop-filter`. La préférence de réduction des animations ramène les effets à 100 ms.
- La projection parcourt au plus la hauteur du plateau. Aucun changement des temporisations du jeu.
- Ces contrôles établissent la conformité technique et un aperçu navigateur, pas une mesure FPS sur téléphone réel. Une validation du confort visuel et de la fluidité sur appareil reste à faire pour ce nouveau rendu.

## Livraison

- Archive : `Nocturne-Shift-PACK-2.zip`, à la racine du dossier autorisé.
- Contenu : projet exécutable complet (`index.html`, `css`, `js`, `assets`, `docs`) ; sans métadonnées `.git`, archive imbriquée ni fichiers temporaires de validation.
- Verdict : **PASS technique**, sous réserve de la validation visuelle sur téléphone réel.
- Aucun élément du PACK 3+ : ni Éclipse, mécanique de faille, aspiration, combo avancé, nouvelle forme, anomalie, campagne, boutique, skin, CJ, son ou musique.
- Arrêt à la fin du PACK 2.
