# CHECKPOINT — PACK 9 : RUSH NOCTURNE

## Base et livraison

- Dossier exclusif : `E:\cj_project\Nocturne-Shift`.
- Base : `main`, `0aaee6138dc801e011d9e6cc68455fbe9a627eec`, état initial propre.
- Modifiés : `index.html`, `css/style.css`, `js/menu.js`, `js/profile.js`, `js/game.js`, `tests/profile-cj.cjs` (adaptation du faux DOM).
- Ajoutés : `tests/rush.cjs`, ce checkpoint et l'archive `Nocturne-Shift-PACK-9.zip`.
- Aucun commit/push. Aucun PACK 10 ni troisième mode commencé.

## Sélection et interface

L'écran Modes propose Infini et Rush Nocturne ; Mode 3 reste désactivé. Une carte sélectionnée porte une bordure et la mention SÉLECTIONNÉ, ainsi que aria-pressed. La sélection revient au menu, où son nom est visible ; JOUER lance ce mode. Infini est le choix initial.

La sélection est conservée dans `settings.selectedMode` du profil local existant `nocturneShiftLocalProfileV1`. Aucune nouvelle clé de stockage. Rejouer conserve le mode courant ; Menu principal revient au menu sans perdre la sélection.

Le chrono Rush se trouve dans l'en-tête, au-dessus de la grille. Format 3:00 → 0:00, chiffres tabulaires ; accent mauve discret à dix secondes, sans flash, vibration ou animation supplémentaire. Il est masqué en Infini. Les URL des ressources modifiées sont versionnées `pack-9`.

## Temps actif et suspensions

Durée : **180 000 ms**. La boucle RAF existante appelle la mise à jour du chrono. Les contrôles consultent également l'horloge monotone avant d'accepter une action, pour bloquer une commande arrivée à l'échéance entre deux frames. Aucune nouvelle boucle ni setInterval/setTimeout.

Le chrono mesure le temps réel actif, sans facteur Éclipse : chute, combos, résolution de ligne de 420 ms, aspiration et décharges consomment du temps. Il est indépendant du temps de combo existant, dont le fonctionnement reste inchangé.

Paysage, document masqué et perte de focus suspendent le chrono. Resize/orientationchange, visibilitychange, blur/focus et pagehide/pageshow réinitialisent sa référence. La première mesure de reprise établit une nouvelle référence ; aucun temps masqué n'est rattrapé. Un trou supérieur à 200 ms est rejeté, comme pour la mesure active CJ. Une mesure négative ne fait pas reculer la référence.

## Vitesse et règles

Rush : intervalle initial **765 ms** contre **900 ms** en Infini, soit un intervalle réduit de 15 %. Réglage isolé `RUSH_SPEED_FACTOR = 0.85`. La progression reste liée à chaque tranche de cinq lignes et conserve le plancher de 180 ms ; le facteur Éclipse s'applique ensuite.

Pièces, contrôles, barème, faille, aspiration, probabilités et pouvoirs réutilisent le même code. Combo : ×1 à ×8, fenêtre de 4 000 ms, aucun bonus Rush. Éclipse : mêmes charge, durée, extensions, récupération, ralentissement des pièces et multiplicateur de score ; aucun ralentissement du chrono Rush.

Fragment instable : seuil `totalLines >= 20` de la partie courante, probabilité 10 % et une cellule instable inchangées. Le compteur de partie revient à zéro à chaque départ, sans utiliser les lignes historiques du profil. Décharge et cibles inchangées.

## Fin et résolution déjà engagée

À zéro : commandes bloquées, gestes annulés, aucune nouvelle pièce, session CJ suspendue. Sans résolution en cours, résultat immédiat. Avec résolution déjà engagée, seule celle-ci finit, en respectant les suspensions réelles ; puis résultat, sans spawn.

Pour respecter l'absence de score après zéro, **Rush attribue le score d'une ligne lors de son verrouillage, avant son animation**. Le barème et les multiplicateurs sont inchangés. La suppression visuelle différée n'attribue pas une seconde fois le score, les lignes ou les statistiques. Infini conserve son attribution après résolution comme auparavant.

Un top-out normal termine Rush immédiatement, sans bonus pour le temps restant. Le résultat affiche RUSH TERMINÉ, score, lignes, meilleur combo de la partie, temps joué, record Rush, Rejouer et Menu principal.

## Records et profil

`stats.rushBestScore` est distinct de `stats.bestScore` (Infini) dans le profil local existant. Les méthodes de mise à jour reçoivent le mode ; leur valeur par défaut reste Infini. Un ancien profil sans Rush reçoit un record Rush à zéro. La migration de l'ancien record Infini est conservée.

Parties, lignes totales, meilleur combo et Éclipses restent communs. Aucun pseudo, compte ou changement de profil global.

## CJ et audio

Le moteur central et son chargeur sont inchangés. Les deux modes transmettent leurs ticks au même `CJEngine.tick(deltaMs, 'shift')` ; aucun compteur, bonus ou portefeuille Rush. Le dernier tick Rush est limité au temps restant. La résolution visuelle après zéro ne produit plus de ticks ; menus, résultat et suspensions n'en produisent pas non plus. La règle centrale 600 s = 1 CJ n'est pas modifiée.

La lecture du solde du Profil (`cjPlayerData.stats.totalCJ`) et ses événements sont inchangés et restent en lecture seule. Le hub n'est pas modifié.

Audio inchangé, aucun son intégré. SHA-256 : `8566C1F40F3F36DC422802510054BCF259B7C537BC974FB22A32190E9FCBB6CF`.

## Validation

- `node tests/rush.cjs` : PASS. Exécution du véritable jeu/menu/profil dans un DOM simulé avec canvas muet et horloge virtuelle ; accès aux variables de fermeture injecté uniquement dans la copie en mémoire du test, aucun crochet de test dans la production.
- Sélection, défaut Infini, indication du choix, persistance après rechargement, JOUER, Rejouer Rush à 3:00, retour menu : PASS.
- 1 800 frames actives de 100 ms : exactement 180 s, 0:00 et résultat ; grille nettoyée uniquement par la fixture pour empêcher un top-out pendant ce test d'horloge : PASS.
- Éclipse ne ralentissant pas le chrono, paysage/portrait sans rattrapage, hidden/visible, blur/focus et long trou rejeté : PASS.
- Commande arrivée à l'échéance avant la RAF refusée ; résolution de ligne encore en cours à zéro terminée sans score supplémentaire ni spawn ; top-out anticipé : PASS.
- Résultat Rush, record sauvegardé/rechargé, record Infini existant de 1 234 préservé, lignes générales cohérentes : PASS.
- Combo plafonné à ×8 et expiration à 4 s ; fragment absent à 19 lignes et disponible à 20, décharge réelle d'un voisin lors de la résolution : PASS.
- Ticks des deux modes avec la seule clé shift ; aucun tick en suspension, menu, résultat ou résolution après zéro ; une unique RAF réarmée et aucun autre timer autorisé dans le test : PASS. Le crédit central réel après 600 secondes n'est pas rejoué ici, le moteur n'étant pas modifié.
- Infini : 900 ms au départ, chrono caché, barème 100 points pour une ligne, fin normale, record séparé ; constantes et logique Éclipse/combo/fragment préservées : PASS.
- `node tests/profile-cj.cjs` : PASS, soldes 0/3/25 et lecture seule conservés.
- Syntaxe JavaScript et `git diff --check` : PASS.
- Navigateur local 390 × 844 : Modes et choix Rush, JOUER, chrono initial 3:00 puis décroissance, capture visuelle avec chrono lisible sans recouvrir la grille : PASS. Passage paysage à 2:40, temps conservé pendant la suspension, retour portrait à 2:40 : PASS.

Les tests accélérés ne constituent pas une session de recette sur le téléphone de l'utilisateur. Aucun déploiement effectué. ZIP complet contenant index, CSS, JavaScript, assets, documentation et tests, sans `.git`, anciennes archives ou fichiers de travail.

Verdict : **PASS technique PACK 9**. Mode Infini préservé ; aucun Mode 3 commencé. Arrêt après livraison.
