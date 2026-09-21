# CHECKPOINT — PACK 7 : MENU ET PROFIL LOCAL

## Base et fichiers

- Dossier : `E:\cj_project\Nocturne-Shift`.
- HEAD de départ : `740072642030cf367bd68cc6b9b9c5ec790b2216`, dépôt propre avant intervention.
- Modifiés : `index.html`, `css/style.css`, `js/game.js`.
- Ajoutés : `js/profile.js`, `js/menu.js`, `docs/CHECKPOINT_PACK_7.md`.
- Livraison : `Nocturne-Shift-PACK-7.zip`.

## Écrans et navigation

- Menu principal au chargement, titre Nocturne Shift, boutons Jouer, Modes, Profil et Paramètres. Aucune partie ni simulation en arrière-plan dans le menu.
- Jouer lance directement le Mode Infini, seul mode jouable.
- Écran Modes : Mode Infini sélectionnable pour lancer une partie ; Mode 2 et Mode 3 désactivés, libellé « À venir », sans règles nouvelles.
- Profil : uniquement meilleur score, lignes totales supprimées, meilleur combo, Éclipses déclenchées et parties jouées.
- Paramètres : vibrations ON/OFF et effets visuels réduits ON/OFF.
- Retour depuis chaque écran secondaire vers le menu.
- Game over : Rejouer lance une nouvelle partie ; Menu principal ferme l'écran de fin et revient à l'accueil sans démarrer de partie.
- Fondu d'apparition de 180 ms pour les menus, sans attente bloquante ; désactivé avec réduction des effets ou préférence système de réduction des animations.

## Persistance isolée

- Tous les accès au stockage sont centralisés dans `js/profile.js`, sous la clé versionnée `nocturneShiftLocalProfileV1`.
- Reprise de l'ancien record `nocturneShiftBestScore`, avec conservation de la valeur la plus haute. Les autres compteurs commencent à zéro à l'introduction du PACK 7 : les anciennes versions ne les enregistraient pas.
- Validation des nombres et réglages au chargement. Données invalides remplacées par les valeurs par défaut ; ancien record récupéré même si le nouveau JSON est corrompu.
- Stockage indisponible : jeu et compteurs fonctionnent en mémoire, avec indication dans le Profil. Aucun blocage du jeu.
- API dédiée aux événements de partie, indépendante de la navigation : point d'adaptation futur possible, sans aucune connexion ou intégration CJajlk Games.
- Aucun pseudo, nom de joueur, compte, identifiant, connexion, appel externe ou synchronisation.

## Comptage

- Parties : +1 uniquement au démarrage réel, y compris Rejouer ; double clic refusé pendant une partie déjà lancée. L'ouverture du menu et les transitions ne comptent pas.
- Lignes : ajout du nombre effectivement supprimé, une seule fois à la résolution. Aucun ajout au game over, au menu ou au rechargement ; les blocs détruits par anomalie ne comptent pas.
- Meilleur score et meilleur combo : maximum historique enregistré lors des suppressions.
- Éclipses : +1 uniquement après acceptation de l'activation ; aucun ajout pour un tap refusé ou une prolongation.
- Sauvegardes sur les événements utiles et changements de réglages, aucune écriture à chaque frame.

## Réglages et gameplay

- Vibrations OFF par défaut : préférence conservée, aucune vibration ou mécanique nouvelle ajoutée.
- Effets réduits OFF par défaut : l'option ON retire les pulsations, atténue de 25 % l'intensité secondaire des lignes et utilise la variante existante sans déplacement des éclats. Les noyaux instables, projections et informations de jeu restent visibles.
- Préférence système de réduction des animations toujours respectée, même avec le réglage local OFF.
- Aucun changement de forme, collision, score, vitesse, seuil/probabilité instable, combo, durée/charge Éclipse ou résolution de ligne de 420 ms.
- Les seuls ajouts au moteur sont le contrôle d'entrée/sortie de partie, les notifications de statistiques et la prise en compte du réglage visuel.

## Paysage et nettoyage

- Même écran « Mode portrait requis » dans le menu, Modes, Profil, Paramètres et gameplay. Écran sous-jacent masqué ; retour à l'écran précédent en portrait.
- Aucun démarrage de partie en paysage ou onglet masqué ; aucune statistique ni horloge de gameplay ne progresse pendant la suspension.
- Sortie après game over : nettoyage des effets, résolution, geste en cours et accumulateur ; aucun minuteur supplémentaire créé.
- Rejouer conserve les réinitialisations des PACK précédents.

## Validation

- PASS : syntaxe des trois fichiers JavaScript et `git diff --check`.
- PASS : accueil au démarrage, navigation et Retour depuis les trois écrans secondaires, lancement depuis Jouer et Mode Infini, modes futurs désactivés.
- PASS : compteur de parties nul avant Jouer ; double démarrage refusé ; Rejouer compte une partie ; passage par le menu et appels répétés de game over sans double comptage.
- PASS : récupération de l'ancien record, conservation du maximum, cumul de lignes, meilleur combo, compteur d'Éclipses, sauvegarde puis rechargement des cinq statistiques.
- PASS : réglages ON/OFF et persistance au rechargement ; stockage refusé et JSON corrompu testés.
- PASS : paysage dans les cinq écrans, reprise portrait et statistiques figées pendant suspension.
- PASS : parcours navigateur Jouer → Game over → Rejouer → Game over → Menu → Profil : exactement deux parties comptées, aucune autre statistique ajoutée par les transitions. Fin de partie provoquée par un bouton temporaire de test, exclu de la livraison.
- PASS : comparaison de 1 004 états de gameplay avec le HEAD PACK 6 : jeu ordinaire et suppressions de 1 à 4 lignes identiques.
- PASS : contrôle visuel en 320 × 568 et 360 × 640 ; aucun avertissement/erreur JavaScript observé.
- PASS : accès localStorage uniquement dans le module de persistance ; aucun compte, pseudo, audio ou appel réseau ajouté au jeu.
- Limite : validation en navigateur au format mobile, pas de nouveau test au doigt sur téléphone physique.

## Livraison et arrêt

- ZIP complet avec HTML, CSS, JavaScript, documentation et assets existants ; sans `.git`, archives précédentes ou fichiers temporaires de validation.
- Audio intact et inutilisé. SHA-256 de `assets/audio/gameplay/Blocs de nuit.mp3` : `8566C1F40F3F36DC422802510054BCF259B7C537BC974FB22A32190E9FCBB6CF`.
- Verdict : **PASS technique**, test sur téléphone réel restant à effectuer.
- Aucun commit/push effectué. Aucun PACK 8+ commencé.
