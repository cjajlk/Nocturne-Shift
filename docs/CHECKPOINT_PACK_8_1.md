# CHECKPOINT — PACK 8.1 : SOLDE CJ DANS LE PROFIL

## Base et périmètre

- Dépôt réel : `E:\cj_project\Nocturne-Shift` ; le chemin `E:\cj\_project\Nocturne-Shift` est absent.
- Branche `main`, HEAD initial et origin/main : `4edfef65b3cb9bf63c395918b87eb82b9b4953df`, état initial propre.
- Fichiers modifiés : `index.html`, `js/menu.js`, `js/cj-loader.js` ; ajouté : ce checkpoint.
- Aucun changement du moteur central, de la règle 1 CJ / 600 s, du hub, du gameplay, du profil statistique local ou de l'audio.

## Source et lecture seule

La ligne « CJ disponibles » lit exclusivement `window.CJajlkAccount.getPlayer()?.stats?.totalCJ`. Le script officiel `https://cjajlk.github.io/cjajlkGames-V2-test/core/cjAccount.js` expose cette méthode, qui relit et désérialise `localStorage.getItem("cjPlayerData")` à chaque appel.

Le chargement conserve `data-readonly="true"`. Aucun nouveau stockage ni solde propre à Shift. Aucun appel à spendCJ, addCJ, addPlayTime, reset ou resetAll ajouté. Aucune écriture directe dans cjPlayerData, cjActivityV1 ou cjEngineTimers. La valeur affichée n'est pas arrondie ; zéro affiche `0 CJ`. API absente, compte absent, lecture impossible ou valeur invalide : `—`.

Les cinq statistiques existantes sont conservées. Le solde est relu à chaque ouverture du Profil, donc après une partie et un crédit éventuel. Quand le Profil est visible, il est aussi relu au chargement tardif du compte, au retour du focus/de la visibilité, ou après un événement storage concernant le compte (autre onglet). Aucun intervalle ni boucle supplémentaire.

## Tests effectués

- PASS : syntaxe des deux scripts modifiés et `git diff --check`.
- PASS : exécution du vrai script cjAccount.js téléchargé, non modifié, et du menu final dans un contexte isolé avec stockage en mémoire instrumenté : 123 CJ, réouverture avec 124 CJ, événement storage, focus, visibilité, zéro, compte absent, JSON invalide, valeur invalide et stockage bloqué. Zéro appel d'écriture ou suppression. Les cinq statistiques restent correctes.
- Le passage 123 → 124 de ce test est une modification de fixture en mémoire, pas un CJ gagné ; il vérifie uniquement la relecture.
- PASS : navigateur local en portrait 390 × 844 : ligne CJ disponibles / —, cinq statistiques visibles, retour au menu et démarrage du jeu fonctionnels sans compte CJ.
- PASS : revue du diff : aucun portefeuille supplémentaire, aucune modification du gameplay ni de l'audio. SHA-256 audio inchangé : `8566C1F40F3F36DC422802510054BCF259B7C537BC974FB22A32190E9FCBB6CF`.

## Hub ↔ Shift et limite de validation

Les deux URL publiées partagent l'origine `https://cjajlk.github.io`, donc le même stockage pour un même navigateur/profil. La prévisualisation locale a une autre origine : elle ne lit pas le portefeuille du hub publié.

Le parcours réel demandé (noter le solde du hub, comparer le nouveau Profil, gagner un CJ puis comparer à nouveau au hub) n'a pas été exécuté. La modification reste locale, conformément à l'interdiction de commit/push sans demande. Les tests contrôlés ne remplacent pas ce parcours de recette sur la version publiée.

Verdict : **PASS technique local ; validation complète FAIL (parcours hub ↔ Shift avec crédit réel non validé)**. Aucun commit ni push effectué. Aucun fichier temporaire ajouté à la livraison.

## Correctif après retour téléphone (base 257f6a7)

Les sections précédentes décrivent la première livraison. Le correctif présent remplace sa méthode de lecture.

### Diagnostic avant correction

- Dépôt réel `E:\cj_project\Nocturne-Shift`, branche main, HEAD initial `257f6a7f394fad5612c29080daeb66c6a5f1bc79`, état propre.
- La ligne `profileCJ` est présente dans le HTML local et celui servi par GitHub Pages. Aucun CSS ne masque spécifiquement le solde, y compris zéro ; le masquage paysage concerne tout le jeu.
- Ancienne lecture exclusivement via `window.CJajlkAccount.getPlayer()`. L'API dépend d'un script distant chargé de façon asynchrone après le menu. En son absence, aucune lecture de la sauvegarde pourtant disponible.
- Défaut reproduit avant correction par `node tests/profile-cj.cjs` : stockage contenant `stats.totalCJ = 3`, API absente, résultat `—` au lieu de `3 CJ`.
- Aucun service worker ou cache applicatif trouvé dans les sources Shift. L'HTML public annonce `Cache-Control: max-age=600`. Les URL de scripts n'étaient pas versionnées. Le cache et l'état du téléphone ne sont pas accessibles ici : cette reproduction identifie une cause logicielle certaine, mais ne prouve pas la cause exacte de l'incident sur cet appareil.

### Correction et fichiers

- `js/menu.js` : lecture directe de `localStorage.getItem("cjPlayerData")`, JSON.parse et récupération de `stats.totalCJ`, dans try/catch. Nombre fini non négatif requis. Ni migration, ni valeur par défaut à zéro, ni écriture. L'API distante n'est plus nécessaire à cet affichage.
- `index.html` : URL du menu versionnée `js/menu.js?v=pack-8.1-readonly-fix` pour distinguer le script corrigé dans le cache une fois l'HTML actualisé. Cela ne force pas le rechargement d'une ancienne page déjà ouverte.
- `tests/profile-cj.cjs` : test de régression conservé, exécutable avec Node, stockage exclusivement en mémoire.
- `docs/CHECKPOINT_PACK_8_1.md` : présent complément.

### Résultats

- PASS : 0 → `0 CJ`, 3 → `3 CJ`, 25 → `25 CJ`.
- PASS : donnée absente, JSON invalide, structure incomplète, chaîne à la place du nombre, nombre négatif/non fini, accès au stockage refusé → `—`.
- PASS : API distante absente ou défaillante ; réouverture après session simulée avec changement 3 → 4 ; cinq statistiques conservées ; zéro écriture/suppression. Le changement de solde est une fixture, pas un crédit gagné.
- PASS : navigateur en portrait 390 × 844, HTML/CSS et menu réels avec une sauvegarde de test à 3 en mémoire et sans chargeur distant : `CJ disponibles / 3 CJ` visible. Style calculé `display:block`, `visibility:visible`, ligne entre y=278 et y=299. Aucun portefeuille réel modifié.
- PASS : syntaxe JavaScript et contrôle du diff. Moteur CJ, CJEngine, règle 600 s, chargeur CJ, gameplay, hub et audio inchangés. Aucune nouvelle clé de stockage, aucune dépense, aucune boucle ajoutée.

Verdict du correctif : **PASS technique**. Vérification sur le téléphone concerné restant à faire après publication. Aucun commit/push pour ce correctif.
