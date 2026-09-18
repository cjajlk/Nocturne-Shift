# CHECKPOINT — PACK 1

## Fichiers modifiés

- `index.html`
- `css/style.css`
- `js/game.js`
- `docs/CHECKPOINT_PACK_1.md` créé

## Fonctionnalités ajoutées

- Grille mobile portrait de 10 colonnes × 20 lignes.
- Sept tétriminos classiques composés de quatre blocs : I, J, L, O, S, T et Z.
- Apparition, chute automatique, collisions et verrouillage des pièces.
- Contrôles tactiles : glissement gauche/droite, tap court pour tourner, glissement bas pour accélérer et swipe bas rapide pour poser immédiatement.
- Suppression simple des lignes complètes et descente des blocs supérieurs.
- Score : 100 / 300 / 600 / 1000 points pour 1 / 2 / 3 / 4 lignes simultanées.
- Compteur de lignes et meilleur score local.
- Prévisualisation de la prochaine pièce.
- Réserve avec limitation à un échange par pièce active.
- Game over, score final, total de lignes et réinitialisation complète avec le bouton Rejouer.
- Interface nocturne bleu/violet simple, sans assets externes.

## Geste tactile de réserve

Un **swipe vers le haut sur la grille** place la pièce active en réserve ou l’échange avec la pièce stockée. Un seul échange est autorisé pendant la chute d’une même pièce. La réserve redevient disponible après le verrouillage et l’apparition de la pièce suivante.

## Verrouillage paysage

Lorsque la largeur de l’écran dépasse sa hauteur, le gameplay est suspendu et un écran demande de remettre le téléphone en portrait. Aucun temps de chute n’est accumulé. Au retour en portrait, les compteurs temporels sont remis à zéro afin que la partie reprenne sans saut de pièce.

## Progression de vitesse

La chute commence avec un intervalle de 900 ms. Toutes les 5 lignes supprimées, l’intervalle diminue de 55 ms. Une limite minimale de 180 ms conserve une progression douce et jouable.

## Tests effectués

- Validation syntaxique JavaScript avec `node --check`.
- Vérification statique des sept formes classiques et de leurs quatre blocs.
- Vérification du barème 100 / 300 / 600 / 1000.
- Vérification de la grille 10 × 20, de la progression par lignes et de la limite de vitesse.
- Vérification des cinq gestes tactiles demandés, dont le swipe haut pour la réserve.
- Vérification de la limitation de réserve à un échange par pièce.
- Vérification du game over et de la réinitialisation complète.
- Vérification du verrouillage paysage et de la remise à zéro du temps accumulé.
- Vérification de la persistance locale du meilleur score.
- Vérification de l’absence de dépendance, framework, asset ou fichier imprévu.

## Limites connues

- Aucun test automatisé ne peut reproduire exactement la sensation des gestes sur tous les modèles de téléphone ; une validation tactile réelle reste recommandée.
- Le navigateur mobile automatisé n’a pas pu être téléchargé dans l’environnement de contrôle ; la validation d’exécution réelle reste donc à effectuer sur téléphone.
- Les rotations utilisent des décalages latéraux simples et non un système de rotation avancé complet.

## Périmètre

Aucun élément des PACK suivants n’a été commencé. Aucun système Éclipse, faille animée, combo avancé, aspiration, particule, danger, anomalie, campagne, boutique, skin, CJ ou son avancé n’a été ajouté.
