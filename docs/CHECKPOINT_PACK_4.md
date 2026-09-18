# CHECKPOINT — PACK 4

## Base et fichiers

- Dossier : `E:\cj_project\Nocturne-Shift`.
- HEAD au départ : `a2efcb9dc2fa7c5c8c81ffc0c760100a3969c00a`, dépôt propre avant intervention.
- Modifié : `js/game.js`.
- Ajouté : `docs/CHECKPOINT_PACK_4.md`.
- Livrable : `Nocturne-Shift-PACK-4.zip`.
- HTML, CSS, barèmes et fonctions de mécanique Éclipse conservés.

## Animation et résolution

- Durée : 420 ms de temps non suspendu, identique pour 1 à 4 lignes, avec ou sans Éclipse. Résolution à la première frame atteignant cette durée.
- Début : bref éclair des lignes ; fissures entre environ 50 et 210 ms.
- À partir de 126 ms : les cellules des lignes sont masquées uniquement au rendu et remplacées par deux petits éclats par cellule. Leur énergie converge vers le segment central de la faille existante, puis s'éteint avant 420 ms.
- À 420 ms : appel unique de la suppression de lignes existante, compression normale de la grille, attribution des points/charge ou prolongation, puis apparition de la pièce suivante.
- Stratégie : courte suspension de résolution, conformément à l'option recommandée. Les cellules réelles ne sont jamais déplacées par les particules. Pendant ces 420 ms, la pièce est déjà verrouillée ; déplacements, rotation, réserve, pose rapide et activation Éclipse attendent la pièce suivante. Aucun geste n'est reporté sur celle-ci.
- Cette attente visuelle est le seul changement intentionnel de cadence. Les règles, collisions, résultats de suppression et scores restent identiques ; il ne s'agit pas d'une exécution strictement identique frame par frame au PACK 3.
- Le compteur Éclipse et le délai du bonus de continuité sont suspendus pendant la résolution. Une suppression initiée sous Éclipse conserve son score et sa prolongation sans perdre 420 ms de pouvoir dans l'animation.

## Intensité et faille

- 1 / 2 / 3 / 4 lignes : 20 / 40 / 60 / 80 éclats maximum ; coefficients d'intensité 0,52 / 0,64 / 0,76 / 0,88.
- Pendant Éclipse : coefficient augmenté de 0,10 et éclats cyan/blanc froid. Aucun bonus de gameplay supplémentaire.
- Courte pulsation du tracé existant, sans nouveau système de faille, sans filtre ou blur.
- Préférence de réduction des animations : petits résidus fixes qui s'estompent, sans trajet d'aspiration ; même durée logique de 420 ms.

## Nettoyage et suspension

- Horloge visuelle avancée uniquement en jeu visible, portrait et non terminé.
- Paysage ou onglet masqué : progression de résolution et effets figés. Reprise depuis le même instant sans temps perdu ni particules détachées.
- Game over : résolution annulée, tous les effets vidés immédiatement ; l'arrêt Éclipse existant reste appliqué.
- Rejouer : résolution, horloge visuelle et effets remis à zéro.
- Aucun `setTimeout`, `setInterval` ou boucle d'animation supplémentaire. Réutilisation du `requestAnimationFrame` existant ; effets expirés retirés et historique limité à quatre événements. Une seule résolution de lignes peut être active.

## Tests effectués

- PASS : syntaxe JavaScript et `git diff --check`.
- PASS : huit scénarios de suppression — 1, 2, 3, 4 lignes en jeu normal et sous Éclipse. Résolution absente avant 420 ms, exécutée une fois à 420 ms ; grilles, pièce suivante, tirage, scores, lignes, réserve et paramètres Éclipse identiques au PACK 3 après résolution.
- PASS : tentative de pose rapide, déplacement, rotation et réserve pendant la résolution sans double verrouillage ni modification de la pièce suivante.
- PASS : paysage pendant une animation, 30 secondes suspendues ; onglet masqué pendant 20 secondes ; reprise et achèvement sans perte de temps Éclipse.
- PASS : game over appelé pendant puis après résolution, suppression des effets, Rejouer sans état résiduel.
- PASS : absence d'effets restants à la fin des huit scénarios.
- PASS : comparaison textuelle des fonctions `clearLines`, `chargeEclipse`, `activateEclipse`, `advanceEclipse`, `dropInterval`, `collides`, `move`, `rotateActive`, `holdActive` et `spawn` avec le HEAD initial : inchangées.
- PASS : aperçu navigateur 360 × 640 des fissures et de la convergence maximale sous Éclipse ; contrôle de la variante à mouvement réduit ; aucune erreur ou alerte JavaScript observée.

## Performance

- Maximum de 40 descriptions de cellules pour une suppression de quatre lignes, produisant 80 triangles ; positions calculées sans objets de particules créés à chaque frame.
- Aucun nouvel asset, filtre, ombre, effet permanent ou bibliothèque.
- Mesure locale sur 300 dessins d'une scène quatre lignes + Éclipse : temps moyen de soumission des commandes canvas d'environ 0,058 ms, 95e percentile 0,10 ms. Mesure dans le navigateur de bureau, format mobile : ce n'est ni une mesure GPU complète, ni une mesure FPS sur téléphone physique.
- Fluidité et sensation de l'attente de 420 ms à confirmer sur téléphone réel.

## Audio et périmètre

- `assets/audio/gameplay/Blocs de nuit.mp3` conservé intact et sans référence dans le code du jeu. Aucun chargement ou lecture audio ajouté.
- SHA-256 avant intervention : `8566C1F40F3F36DC422802510054BCF259B7C537BC974FB22A32190E9FCBB6CF` ; identique après intervention.
- ZIP complet des sources et assets existants, avec documentation ; sans `.git`, archives précédentes ou fichiers temporaires de test. La présence du fichier audio existant dans les assets n'active aucune musique.
- Aucun commit/push dans cette intervention.
- Verdict : **PASS technique**, avec validation de fluidité sur appareil réel restant à faire.
- Aucun PACK 5+ commencé : ni anomalie, nouvelle pièce, pouvoir, campagne, boutique, skin, CJ, mode, audio, statistique ou combo complet.
