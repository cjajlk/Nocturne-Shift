# CHECKPOINT — PACK 8 : INTÉGRATION CJ

## Base et fichiers

- Dossier exclusif : `E:\cj_project\Nocturne-Shift`.
- HEAD de départ : `ce06a4aa877b3b8154c8a85d214ce847f8301f1f`, état Git propre.
- Modifiés : `index.html`, `js/game.js`.
- Ajoutés : `js/cj-loader.js`, `docs/CHECKPOINT_PACK_8.md`.
- Aucun fichier du hub ou autre dépôt consulté localement ou modifié. Aucun changement du profil local, des barèmes ou paramètres des PACK précédents.

## Chargement central

Le chargeur est non bloquant pour le menu et la partie, protégé contre une double initialisation. Il ajoute exactement une fois les scripts absolus suivants, dans cet ordre :

1. `https://cjajlk.github.io/cjajlkGames-V2-test/core/cjAccount.js`
2. `https://cjajlk.github.io/cjajlkGames-V2-test/core/cjEngine.js`

Le second est ajouté après le succès ou l'échec du premier. Aucun chargement de shop, collections ou account-transactions. Aucun moteur CJ local livré dans le projet.

Le script compte reçoit `data-readonly="true"`, option officiellement présente dans le script fourni : il expose l'API sans créer ou migrer de portefeuille depuis Nocturne Shift. Le moteur réutilise donc le compte central existant ; sans compte disponible, aucun crédit de secours n'est créé. Le stockage et les Web Locks restent ceux de l'origine de la page : le partage avec le hub suppose la même origine, par exemple les deux projets sur `https://cjajlk.github.io`.

## Temps et état

- Identifiant unique : `shift`.
- `window.getGameState` dans `js/game.js` dérive directement de `sceneActive`, `gameOver`, `landscapeSuspended`, `document.hidden` et `document.hasFocus()`.
- `running` : partie réellement commencée et non terminée. `paused` : cette partie existe mais est suspendue par le paysage, le document masqué ou la perte de focus.
- La résolution de ligne ne définit pas `paused` : ses 420 ms, l'aspiration et la décharge instable font partie du temps CJ actif.
- Le seul appel à `CJEngine.tick` est dans `tickCJ(now)` (ligne 186 au moment de livraison), appelé une fois au début de l'unique fonction `frame(now)` (ligne 707). Aucun autre producteur de temps CJ.
- Le delta provient de deux timestamps RAF consécutifs. Première frame après frontière : référence uniquement. Deltas nuls, négatifs, non finis ou supérieurs à 200 ms : rejetés, référence réinitialisée et session libérée. Aucun clamp ou rattrapage CJ.
- Gameplay, chute, combo, Éclipse, aspiration, résolution et fragment instable : comptés tant que la partie est visible, en portrait et focalisée.
- Menu principal, Modes, Profil, Paramètres, game over et résultats : zéro tick producteur ; tous partagent l'état de partie inactif existant.
- Perte de focus : suspension effective du gameplay, des contrôles et du temps CJ. Aucun paramètre de vitesse ou de pouvoir modifié.

## Frontières et robustesse

- `CJEngine.suspend()` protégé et référence CJ remise à zéro à la fin de partie, sortie vers menu, changement d'orientation, visibilité, blur/focus, pagehide/pageshow et nouvelle partie/Rejouer.
- Visibilité/focus/orientation réinitialisent aussi la référence temporelle de gameplay et l'accumulateur, sans rattrapage des horloges de jeu.
- Appels `tick` et `suspend` entourés de protections contre API absente, incomplète ou exception. Les scripts absents ne bloquent ni menus ni jeu.
- Aucune invocation de spendCJ, addCJ, addPlayTime, reset ou resetAll par les fichiers de production Nocturne Shift. Aucune écriture directe de cjPlayerData, cjActivityV1 ou cjEngineTimers.
- Aucun second portefeuille, compte, identifiant, règle de récompense, compteur CJ de secours ou affichage de solde ajouté.
- Aucune boucle ou setInterval CJ ajouté par Nocturne Shift. Le moteur officiel contient son propre intervalle de gestion du verrou de session, laissé intact ; il ne remplace pas le tick unique du jeu.

## Validation

- PASS : HTTP 200 pour les deux URL, lecture des sources officielles. Empreintes SHA-256 testées : compte `FD74D74D4758941D68E01ED643B517A2A73D1A4DF0F1FD4CC4605F6768B55054`, moteur `558CD2ED17BF24D9DCC79F3C98C9F33B73C7C12FDDC19C480ABDE4753779DF69`.
- PASS : syntaxe JavaScript et `git diff --check`.
- PASS : navigateur avec le chargeur final : deux scripts présents exactement une fois, dans le bon ordre, moteur disponible, menu avec `running:false`, aucun portefeuille créé à partir d'un stockage sans compte. Aucune erreur/alerte observée.
- PASS : tests de boucle instrumentée, zéro tick en menu/inactif, tick unique en jeu, clé `shift`, deltas positifs <=200 ms.
- PASS : Éclipse, combo, résolution de 420 ms et fragment instable continuent d'alimenter les ticks.
- PASS : paysage/portrait, document masqué/visible, blur/focus, game over, menu et Rejouer : absence de crédit pendant suspension et première frame de reprise sans tick. Trou temporel de 201 ms rejeté sans rattrapage.
- PASS : moteur absent ou méthodes qui lèvent une exception : jeu toujours actif et boucle non interrompue.

### Persistance 599 s + reprise

Test des deux scripts officiels non modifiés dans des contextes JavaScript isolés avec stockage exclusivement en mémoire et horloge virtuelle contrôlée. Il s'agit d'un test accéléré en environnement contrôlé, pas de dix minutes de jeu manuel ni d'une modification du portefeuille permanent.

Après 5 990 ticks acceptés de 100 ms : 599 000 ms de reliquat, `totalCJ = 0`, `playTime.byGame.shift = 599`. Destruction/recréation du contexte, conservation du stockage mémoire, nouvelle référence temporelle puis dix ticks de 100 ms :

- `stats.totalCJ = 1` ;
- `stats.byGame.shift = 1` ;
- `stats.playTime.byGame.shift = 600` ;
- `cjActivityV1.games.shift.cjMs = 0`.

Le crédit est produit uniquement par le tick du moteur officiel. Aucune méthode de crédit appelée par le test pour fabriquer le résultat.

### Deux onglets

- Test déterministe de deux contextes partageant le même verrou et stockage : un seul compte, transfert après libération sans double ajout.
- Test complémentaire avec deux vrais onglets Nocturne Shift sur une origine localhost dédiée, scripts HTTP officiels et Web Locks natifs du navigateur. La fixture rend artificiellement les deux documents éligibles pour solliciter le verrou simultanément, sans contourner ce verrou.
- Résultat observé : premier onglet `tracking:true`, second `tracking:false`, tous deux `running:true/paused:false`. Après suspension du premier : second `tracking:true`.
- Compte central temporaire créé par le script officiel uniquement dans cette fixture de test isolée. Deux sessions arrêtées, second onglet fermé, stockage initial restauré depuis son instantané avant fermeture du premier. Aucun portefeuille de l'origine GitHub Pages touché.
- Fixtures et copies de scripts de test exclues de la livraison et supprimées après contrôle.

## Livraison et limites

- Archive : `Nocturne-Shift-PACK-8.zip`, sources complètes, assets et documentation, sans `.git`, anciennes archives ou fixtures.
- Audio existant intact et inutilisé ; SHA-256 `8566C1F40F3F36DC422802510054BCF259B7C537BC974FB22A32190E9FCBB6CF`.
- Verdict : **PASS technique**. Le test 599 s/reprise est contrôlé et accéléré ; une session réelle sur téléphone et l'origine de déploiement reste à valider après publication.
- Aucun hub modifié, aucune dépense CJ, aucun second portefeuille. Aucun commit/push effectué. Arrêt après PACK 8.
