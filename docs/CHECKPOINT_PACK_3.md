# CHECKPOINT — PACK 3 : ÉCLIPSE

## Base et périmètre

- Travail dans `E:\cj_project\Nocturne-Shift` uniquement.
- Dépôt propre au départ, branche `main`, HEAD `793a233491b35dbe49ce0fbca3c989d2e5f2e38f`.
- Fichiers modifiés : `index.html`, `css/style.css`, `js/game.js`.
- Document ajouté : `docs/CHECKPOINT_PACK_3.md`.
- Aucun commit, push ou déploiement GitHub Pages effectué.

## Charge et activation

- Jauge sous le plateau, en dehors de la surface qui reçoit les gestes de déplacement et rotation.
- Une suppression de 1 / 2 / 3 / 4 lignes ajoute 20 / 35 / 55 / 80 points de pourcentage.
- Bonus interne de 5 points si la précédente suppression date d'au plus 5 secondes de jeu actif. Aucun compteur de combo, multiplicateur cumulatif ou nouvelle statistique.
- Charge plafonnée à 100 %, conservée indéfiniment sans consommation automatique.
- Bouton natif de 48 pixels de hauteur : état « ACTIVER » à pleine charge, activation par le clic natif produit par un tap, avec `touch-action: manipulation`. Compatible également avec clavier et pointeur.
- Activation refusée à charge partielle, pendant une Éclipse ou lorsque le jeu est suspendu/terminé.
- Pendant l'Éclipse, la jauge montre le temps restant. Les lignes prolongent l'effet sans préparer une seconde charge. À expiration, la charge revient à zéro ; les suppressions suivantes peuvent la recharger.

## Durée, vitesse et score

- Durée initiale : 6 secondes de jeu non suspendu.
- Chaque ligne ajoute 0,5 seconde, avec un budget global d'extension de 4 secondes : durée totale au maximum 10 secondes depuis l'activation, hors suspensions. Ce plafond n'est pas une réserve renouvelable.
- Chute automatique ralentie de 33 % : intervalle normal divisé par 0,67. Les gestes, mouvements, rotations, réserve et pose rapide restent disponibles et inchangés.
- Score des lignes pendant l'Éclipse : ×1,5, soit 150 / 450 / 900 / 1500. Hors Éclipse : 100 / 300 / 600 / 1000, inchangé. Le meilleur score utilise ces points normalement.
- Aucune suppression automatique et aucune destruction gratuite de pièce.
- À expiration, retour progressif à la vitesse normale pendant 600 ms. Le bonus de score cesse dès l'expiration des 6 à 10 secondes.
- La fraction de progression vers la prochaine chute est conservée lors des changements du facteur de vitesse : aucune pose ou descente n'est déclenchée par l'activation elle-même.

## Rendu

- Réutilisation du tracé de faille PACK 2 : contour cyan froid plus clair, intérieur violet et légère pulsation pendant l'effet, retour au repos pendant les 600 ms de transition.
- Léger assombrissement du fond et contours des fragments rehaussés.
- Pulsation figée lorsque le jeu est suspendu ; supprimée si la préférence système de réduction des animations est activée.
- Aucun flou, flash plein écran, particule ou bibliothèque ajouté.
- Ajustement de la largeur du plateau pour conserver son rapport 1:2 et loger la jauge sur petit écran.

## Suspensions et fin de partie

- Toute progression de l'Éclipse et du délai de continuité se fait dans la boucle existante, uniquement lorsque `isPlayable()` est vrai.
- Paysage : jeu, durée d'Éclipse et transition de retour suspendus ; reprise sans consommation du temps passé en paysage.
- Onglet masqué : même suspension, avec remise à zéro de la référence temporelle au changement de visibilité.
- Game over : charge, durée, extension et transition annulées immédiatement. Aucun minuteur indépendant créé.
- Rejouer : charge zéro, Éclipse inactive, délai de continuité et effets précédents réinitialisés.
- Aucun nouveau système de pause ajouté.

## Tests effectués

- PASS — syntaxe : `node --check js/game.js` ; différences : `git diff --check`.
- PASS — tests déterministes : états de charge 0 / 55 / 100 %, refus d'activation partielle, plafonnement, maintien à 100 %, bonus de continuité et expiration du délai.
- PASS — activation via le gestionnaire du bouton, pas de réactivation pendant l'effet, aucune modification de la grille ou de la pièce à l'activation.
- PASS — durée exacte de 6 secondes simulées ; extensions de 0,5 seconde par ligne ; plafond total de 10 secondes y compris après consommation d'une partie du temps.
- PASS — score ×1,5 pour chacune des suppressions de 1 à 4 lignes ; ralentissement de 33 % ; retour progressif à l'intervalle normal et conservation de la progression de chute.
- PASS — suspension paysage/portrait et onglet masqué/visible ; game over pendant Éclipse et bouton Rejouer.
- PASS — 1 004 comparaisons d'états identiques avec le code du HEAD PACK 2 hors activation : grille, pièce active, prochaine pièce, réserve, score, lignes, record, game over, temporisation de chute et tirage des pièces.
- PASS — navigateur : jauges vide, partielle et activable, clic d'activation, compte à rebours et faille active ; paysage puis retour portrait avec le même temps restant affiché. Aucun avertissement ou erreur JavaScript observé.
- PASS — contrôle visuel des formats 360 × 640 et 320 × 568 : jauge et consignes visibles, grille non déformée.
- Limite : l'activation native a été testée au pointeur dans le navigateur et par son gestionnaire dans les tests. Un vrai tap au doigt et une mesure de fluidité sur téléphone physique n'ont pas été effectués ; ils restent à valider via le processus mobile habituel.

## Livraison et verdict

- Archive complète d'exécution : `Nocturne-Shift-PACK-3.zip` (HTML, CSS, JavaScript, assets et documentation). Sans `.git`, ZIP précédent ni fichiers temporaires de test.
- Verdict : **PASS technique**. Validation tactile sur appareil réel restant à faire.
- Aucun PACK 4+ commencé : ni aspiration complète, anomalie, campagne, boutique, skin, CJ, audio, pouvoir secondaire, nouvelle forme ou mode séparé.
