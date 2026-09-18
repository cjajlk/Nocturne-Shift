# CHECKPOINT — PACK 6 : FRAGMENT INSTABLE

## Base et fichiers

- Dossier : `E:\cj_project\Nocturne-Shift`.
- HEAD initial : `141028fd1133141ad4d677745a602061982cbd15`, état Git propre au départ.
- Modifié : `js/game.js`.
- Ajouté : `docs/CHECKPOINT_PACK_6.md`.
- Archive : `Nocturne-Shift-PACK-6.zip`.

## Apparition et identité

- Aucune anomalie avant 20 lignes supprimées.
- À partir de 20 lignes : chaque nouvelle pièce tirée du sac a une probabilité de 10 % de contenir exactement un fragment instable. Aucun quota, garantie ou rattrapage.
- La sélection porte uniformément sur l'un des quatre blocs occupés de la forme canonique. La valeur 2 dans la matrice désigne ce bloc ; elle reste une cellule occupée normale pour les collisions et rotations.
- Le tirage spécial est réalisé une fois lors de la création de la prochaine pièce. Une pièce déjà préparée avant le seuil reste normale.
- L'identité est conservée dans le descripteur de pièce lors d'un échange en réserve. Un échange ne relance pas la probabilité et ne crée pas de second fragment. La rotation déplace la cellule spéciale avec la matrice.
- À la pose, la grille conserve le type de tétrimino et le marqueur instable de cette cellule. Aucune nouvelle forme ou collision spéciale.

## Décharge et suppression

- Les sources sont identifiées uniquement parmi les fragments instables présents dans les lignes complètes, avant toute suppression.
- Chaque source choisit au plus un voisin immédiat : celui du dessus s'il existe ; sinon celui du dessous ; sinon aucune cible.
- Aucun saut au-delà d'une case vide. Aux bords du plateau, seules les coordonnées valides sont examinées.
- Les cibles sont déterminées à partir de la grille avant résolution. Si une cible est elle-même instable, elle disparaît sans déclencher une nouvelle décharge. Aucun parcours récursif ou cascade.
- Plusieurs sources présentes dans les lignes supprimées peuvent chacune agir ; une cible partagée disparaît une seule fois.
- Cas de lignes adjacentes : si le voisin prioritaire appartient lui aussi à une ligne déjà complète, il disparaît avec cette ligne. Aucun autre bloc plus éloigné n'est recherché et le comptage des lignes est préservé.
- Les cibles hors lignes complètes sont supprimées à la fin de la résolution, puis la fonction existante de suppression/compaction est appelée. Les cellules des lignes complètes sont laissées intactes jusque-là pour ne pas changer le nombre de lignes ou le score.

## Score, combo et Éclipse

- Le bloc supplémentaire ne produit aucun point, aucune ligne, aucune progression de combo, aucune charge ou prolongation Éclipse.
- Seule la suppression normale des lignes alimente les systèmes existants.
- Comportement strictement identique pendant l'Éclipse.
- Fonctions de score des lignes, combo, charge, durée Éclipse, ralentissement et collision inchangées.

## Visuel et durée

- Centre astral sombre conservé ; fissure violet/magenta plus claire et petit noyau lumineux. Pulsation douce, sans gros glow ; statique si la réduction des animations est demandée.
- Marqueur visible sur le plateau, la pièce active, la réserve et la prochaine pièce.
- Aspiration PACK 4 inchangée à 420 ms. Décharge de 200 ms, de 220 à 420 ms, superposée à sa seconde moitié : trait vertical et éclair local sur le voisin.
- La cible s'efface visuellement dans les dernières 100 ms, puis est retirée de la grille au terme des 420 ms avant la compaction. La logique reste suspendue pendant cette séquence, comme au PACK 4.
- Aucun nouveau système de particules, filtre, timer ou boucle d'animation. Les décharges appartiennent aux instantanés visuels existants.

## Suspensions et nettoyage

- Paysage et onglet masqué : horloge visuelle et résolution figées ; aucune destruction en arrière-plan. Reprise au même instant.
- Game over : les instantanés visuels et la résolution, donc les décharges prévues, sont supprimés immédiatement.
- Rejouer : grille, réserve, pièces, effets et compteurs réinitialisés ; aucune anomalie héritée. Les premiers tirages sont normaux puisque les lignes reviennent à zéro.

## Tests effectués

- PASS : syntaxe JavaScript et `git diff --check`.
- PASS : 2 000 tirages à 19 lignes sans anomalie ; 20 000 tirages à 20 lignes donnant 1 977 pièces spéciales (9,885 %), quatre positions de sélection rencontrées, maximum un fragment par pièce.
- PASS : sept formes × quatre positions, géométrie identique, conservation d'un seul marqueur après quatre rotations. Conservation après rotation, mise en réserve et reprise.
- PASS : dessus présent, dessous seul, aucun voisin, priorité dessus lorsque les deux existent, voisin instable détruit sans cascade, voisin appartenant à une autre ligne complète.
- PASS : ces scénarios répétés sous Éclipse ; score, lignes, combo, charge, durée et prolongation identiques au scénario témoin sans décharge.
- PASS : résolution unique de 420 ms ; pas de suppression anticipée, nettoyage des effets à la fin.
- PASS : paysage 30 secondes et onglet masqué 10 secondes pendant la décharge ; temps restant et grille figés, reprise correcte.
- PASS : game over pendant la décharge, nettoyage, Rejouer sans état spécial, grille vide et zéro ligne.
- PASS : 1 000 états identiques au PACK 5 pour le jeu avant le seuil ; comparaison textuelle des fonctions de score, charge, combo, durée/vitesse Éclipse et collision : inchangées.
- PASS : aperçu navigateur 360 × 640 du fragment actif, des aperçus réserve/suivante et du trait vertical pendant l'aspiration ; aucune erreur ou alerte JavaScript observée.
- Limite : validation dans le navigateur de bureau au format mobile ; confort et fluidité sur téléphone physique à confirmer.

## Livraison et périmètre

- Audio existant intact et inutilisé. SHA-256 de `assets/audio/gameplay/Blocs de nuit.mp3` : `8566C1F40F3F36DC422802510054BCF259B7C537BC974FB22A32190E9FCBB6CF`.
- ZIP complet : sources, assets existants et documentation ; sans `.git`, anciens ZIP ou fichiers temporaires de test. Aucun audio chargé ou joué.
- Aucun commit/push effectué dans cette intervention.
- Verdict : **PASS technique**. Test sur téléphone réel restant à effectuer.
- Aucun PACK 7+ commencé : une seule anomalie, aucun autre pouvoir, mode, forme, son, musique, campagne, boutique, skin, CJ ou statistique de fin.
