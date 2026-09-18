# CHECKPOINT — PACK 5 : COMBOS

## Base et fichiers

- Travail uniquement dans `E:\cj_project\Nocturne-Shift`.
- HEAD initial : `61352c616122947df26ab5fa2c3a41c6bdd9a0ee` ; dépôt propre au départ.
- Modifiés : `js/game.js`, `index.html`, `css/style.css`.
- Ajouté : `docs/CHECKPOINT_PACK_5.md`.
- Archive : `Nocturne-Shift-PACK-5.zip`.

## Règles du combo

- État centralisé : multiplicateur courant et échéance, sur l'horloge de jeu actif existante.
- Première suppression : ×1. Une nouvelle suppression avant l'échéance passe à ×2, puis ×3, jusqu'à ×8 maximum. Chaque suppression renouvelle la fenêtre de 4 000 ms, y compris au plafond.
- À 4 000 ms révolues sans nouvelle suppression : retour à ×1 et disparition du texte. La prochaine suppression vaut ×1. Les poses sans ligne ne cassent pas directement le combo et ne renouvellent pas la fenêtre.
- La fenêtre démarre à la résolution effective de la suppression. Elle est suspendue pendant l'animation de résolution de 420 ms, comme l'horloge Éclipse du PACK 4 ; une séquence initiée avant expiration conserve donc son combo jusqu'à sa résolution.
- Score : base des lignes × combo, puis ×1,5 si Éclipse active. Bases conservées : 100 / 300 / 600 / 1000. Aucun autre type de point ajouté.

## Éclipse

- Ancien bonus interne de 5 points sur une continuité de 5 secondes supprimé.
- Bonus de charge suivant le combo : ×1 = 0 ; ×2 = 2 ; ×3 = 4 ; ×4 = 6 ; ×5 = 8 ; ×6 à ×8 = 10 points de pourcentage.
- Charge totale : base 20 / 35 / 55 / 80 + bonus combo, toujours plafonnée à 100 %.
- Pendant Éclipse, les lignes prolongent toujours l'effet de 0,5 seconde chacune ; aucune recharge parallèle ni extension multipliée par le combo.
- Durée initiale 6 s, plafond total 10 s, ralentissement de 33 %, retour progressif et activation manuelle inchangés.

## Affichage et rendu

- Un seul élément DOM, placé dans la colonne latérale sous les statistiques, hors de la grille. Caché à ×1, affiché uniquement pour ×2 à ×8.
- ×2–×3 : cyan discret ; ×4–×5 : bordure violette et texte cyan ; ×6–×8 : blanc/cyan froid.
- Pas d'animation permanente ou de glow massif. Le DOM du combo n'est mis à jour qu'à une suppression ou une réinitialisation/expiration.
- L'aspiration existante gagne au plus 0,12 d'intensité et utilise un accent cyan/blanc dès ×6. L'intensité totale est plafonnée à 1.
- Même durée de 420 ms et même maximum de 80 éclats. Aucun nouvel objet de particule ou minuteur.
- Le combo visuel de la suppression à venir est capturé au verrouillage ; il correspond au multiplicateur attribué à la résolution, puisque l'horloge reste suspendue durant celle-ci.

## Suspension et nettoyage

- Paysage et onglet masqué : l'horloge de jeu reste figée ; combo conservé et reprise avec exactement le temps restant.
- Game over : état combo réinitialisé, échéance supprimée, affichage masqué.
- Rejouer/nouvelle partie : même réinitialisation ; aucun état de la partie précédente.
- Aucun `setTimeout`, `setInterval`, nouvelle boucle ou statistique de fin.

## Tests réalisés

- PASS : syntaxe JavaScript et `git diff --check`.
- PASS : ×1 caché, ×2, progression jusqu'à ×8 et dix suppressions successives pour vérifier le plafond.
- PASS : cumul exact des scores, chacun des paliers de bonus de charge testé isolément, charge plafonnée à 100 %.
- PASS : combo encore présent à 3 999 ms, expiration à 4 000 ms, suppression suivante à ×1.
- PASS : combo ×3 sous Éclipse pour 1/2/3/4 lignes : score base ×3 ×1,5 ; extension inchangée de 0,5 seconde par ligne.
- PASS : aspiration de quatre lignes à ×8, pas de résolution à 419 ms, résolution et nettoyage à 420 ms.
- PASS : paysage 20 secondes et onglet masqué 20 secondes sans perte de fenêtre ; reprise jusqu'à l'échéance exacte.
- PASS : game over, attente après game over et Rejouer sans échéance ou affichage résiduel.
- PASS : 1 004 comparaisons d'états identiques au PACK 4 pour les gestes ordinaires et suppressions isolées : grille, pièces, réserve, scores, lignes, record et état Éclipse.
- PASS : fonctions d'activation/avancement Éclipse, vitesse de chute, collision, déplacement, rotation, réserve et apparition comparées textuellement au HEAD de départ : inchangées.
- PASS : aperçu navigateur 320 × 568 du combo ×8 et de l'aspiration maximale ; texte lisible hors grille et absence d'erreur/avertissement JavaScript.
- Limite : contrôle en navigateur de bureau au format mobile ; fluidité et confort tactile sur téléphone physique à confirmer.

## Audio, livraison et périmètre

- Audio existant intact et inutilisé. SHA-256 de `assets/audio/gameplay/Blocs de nuit.mp3` : `8566C1F40F3F36DC422802510054BCF259B7C537BC974FB22A32190E9FCBB6CF`, identique avant et après.
- ZIP complet des sources, assets existants et documentation ; sans `.git`, archives précédentes et fichiers temporaires de validation. Le fichier audio présent dans les assets n'est ni chargé ni joué.
- Aucun commit, push ou déploiement dans cette intervention.
- Verdict : **PASS technique**, test sur téléphone réel restant à faire.
- Aucun PACK 6+ commencé : ni anomalie, nouvelle forme, pouvoir, mode, campagne, boutique, skin, CJ, son, musique, classement ou statistique de fin supplémentaire.
