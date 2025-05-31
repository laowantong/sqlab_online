# TODO list

## Prioritaire

- [x] Rendre hidden le bouton feedBack lorsque la zone de codeMirrorEditor est dirty
- [x] Refonte Drag to reorder (+ Icone de zone préhension (à droite) et pour dérouler le bandeau (à gauche) l'icone de zone de préhension doit être fixe et ne pas pouvoir être repoussé par le nom des colonnes)

- [x] Implémenter click to insert pour les données dans le bandeau.
  Pour la mise en forme du nom de la table et des colonnes, je verrais quelque chose comme ça (ne pas tenir compte des couleurs) :

    <img width="758" alt="image" src="https://github.com/user-attachments/assets/119c2e40-e8eb-4f7f-a50f-98663965b790" />

  Autrement dit, une grande zone cliquable comme fond. Tout clic sur la zone compose le nom de la table, sauf sur :
  - le triangle qui ouvre / ferme.
  - les boutons (?) des noms de colonnes, qui composent un nom de colonne.
  - la zone de préhension.

- [x] Implémenter système de score en utilisant `task.reward` généré à partir de SQLab 0.7.9.
    - Bouton mise score -> Un slider pour miser un pourcentage de son score 10 à 50% de son score. 
    - Dans local storage : `score/${activityNumber}`.
    - Adapter le modèle de slider donné dans `public/assets`.
- [x] Localiser les messages du système de score.
- [x] Au passage, gérer correctement le pluriel (le système de localisation devrait permettre de le faire, regarder).
- [x] Côté modèle, traitement des requêtes de l'utilisateur. Transmettre au client un objet comportant systématiquement un champ `success` (booléen). En cas d'erreur, remplir un champ `message` destiné à être affiché dans la zone de feedback du client, ainsi que `score` et `scoreDelta`. Jusqu'ici, des exceptions sont levées dans les cas problématiques. Il faut que `queryCheckModel.js` les rattrape pour renvoyer l'objet approprié. Pour la structuration du code, je tenterais un [`try/catch`](https://stackoverflow.com/questions/33781818/multiple-catch-in-javascript) avec un seul `return` à la fin de la fonction. Veiller à minimiser les répétitions.
- [x] Côté modèle, ajouter une garde sur la requête de l'utilisateur : si l'**ensemble** des noms de colonnes n'est pas celui attendu, ne pas décrémenter le score, mais juste rappeler la liste des colonnes attendues.
- [x] Faire apparaître systématiquement une icone dans l'onglet :
  - [ Exécuter ↻ ] lorsque cliquer sur l'onglet (ré)exécute la requête.
  - [ Exécuter ✓ ] lorsque l'exécution est à jour.
  - Pour les icones, utiliser [Heroicons](https://heroicons.com) (tailwindlabs), resp. `arrow-path` et `check-circle` dans le pack `solid`.
  - Intégrer les deux SVG inline directement dans le code HTML, avec une classe `.hidden` (déjà stylée qq part) pour les permuter.
  ```html
  <span id="run-icon">
    Run
    <svg class="icon refresh" viewBox="0 0 16 16">...</svg>
    <svg class="icon check hidden" viewBox="0 0 16 16">...</svg>
  </span>
  ```
  Et côté JS:
  ```javascript
  document.querySelector('.refresh').classList.toggle('hidden', !flag);
  document.querySelector('.check').classList.toggle('hidden', flag);
  ```
- [x] Supprimer la dépendance à Font-awesome de la même manière pour les icones des modes sombre et clair.
- [x] Au moment du clic sur Exécuter, reformater la requête SQL avec https://github.com/sql-formatter-org/sql-formatter. C'est la requête formatée qui sera envoyée au serveur. Par défaut, elle remplace également le contenu de l'éditeur.
- [x] Ajouter une option pour ne pas le faire dans le menu Hamburger.
- [ ] Réparer le coin d'agrandissement de la zone de codeMirrorEditor qui ne fonctionne plus sous Safari : https://pagehelper.lets-script.com/blog/codemirror6-resize/
- [x] Transformer l'indication du nombre de lignes d'une table en un bouton (mais garder le même style). Cliquer devrait sauter à l'offset maximum.
- [x] De la même manière, ajouter avant la bande des tâches un bouton « table des matières » (heroicons `numbered-list`), qui déroule une zone de texte avec le contenu de `toc` pour l'activité (à refaire côté Python).
- [x] Il faudrait factoriser les deux dernières fonctionnalités, sans doute en passant un élément du DOM et un callback pour le clic.
- [ ] Vérifier que toutes les colonnes attendues sont dans le SELECT de l'utilisateur. Sinon, dans le message affiché, préciser le nom des colonnes manquantes. Utiliser de simples tableaux.
- [x] Tester toutes les questions des exercices et signaler les problèmes rencontrés (ouvrir des issues). Si un problème se reproduit dans plusieurs tâches, éditer l'issue.
- [ ] Prévoir un style de présentation (ou une icone) spécifique pour chaque type de feedback :
    - Succès (.correction) : check
    - Hint spécifique (.hint) : ampoule (idée)
    - Hint non spécifique (.unknown-token) : ?
    - Avertissement non pénalisant (e.g., colonnes différentes de celles attendues): triangle jaune
    - Erreurs lors de l'injection de la formule : x
    - ?
- [ ] Trouver le texte d'attribution des icones du point précédent.
- [x] Enquêter sur la lenteur du drag n drop.
- [x] Ajouter le dark mode pour la table des matières.
- [ ] Vérifier que tout est responsive.
- [x] Vérifier que la liste de noms de colonnes est scrollable quand elle est trop longue.
- [x] Corriger https://github.com/laowantong/sqlab_online/issues/18.
- [ ] Empêcher de refaire un check d'une requête déjà vérifiée, cf. https://github.com/laowantong/sqlab_online/issues/23.
- [ ] Si on exécute une requête, qu'on change de tâche (p. ex. pour se placer sur le bon exercice), le bouton de vérification devrait apparaître, car il dépend de la requête ET de la tâche.
- Requêtes correctes en échec :
  - [x] Exercice 19. La solution avec LEFT JOIN produit une TooManyTablesError. Celle avec NOT IN passe sans problème.
  - [x] Exercice 21 (amplitude prime) : erreur inédite.
  - [ ] Exercice 27 (animateurs par emploi) : Échec de l'évaluation de l'ajustement.
  - [x] Exercice 28 (animateurs Nice) : Échec de l'exécution de la seconde passe.
  - [ ] Exercice 29 (trois entreprises) : Échec de l'exécution de la seconde passe. tweakEvaluationError: Cannot convert a BigInt value to a number.
  - [ ] Exercice 30 (animateurs parisiens) : Échec de l'évaluation de l'ajustement. tweakEvaluationError: Cannot convert a BigInt value to a number
  - [x] Exercice 32 (sans concurrentes) : La solution avec LEFT JOIN produit une TooManyTablesError. Celle avec NOT EXISTS passe sans problème.
  - [ ] Exercice 34 (nombre clients) : Échec de l'évaluation de l'ajustement.
  - [x] Exercice 35 (sans prérequis) : La solution avec LEFT JOIN produit une TooManyTablesError.
  - [ ] Exercice 39 (sessions par thème) : Échec de l'évaluation de l'ajustement. NB. Il y a un LEFT JOIN.
  - [ ] Exercice 41 (avec CTE) : Fonctionne, mais seulement avec la colonne `hash`, que l'étudiant n'est pas censé utiliser.
- [x] Mettre en forme le nombre de squalions en séparant les milliers par des espaces insécables. `const number = 1234567; console.log(number.toLocaleString("fr"));`.
- [ ] Mettre un message par défaut dans le conteneur de feedback au lieu de jouer sur la classe `hidden`.

## Non prioritaire

- [ ] Aventure d'accueil/Tutoriel
- [ ] Page d'accueil pour selectionner sa base puis l'aventure ou la série d'exercices
- [ ] Quand la page d'accueil sera faite, le menu hamburger sera remplacé par un bouton home, et ses fonctionnalités seront intégrées dans la page d'accueil ou dans une page de paramètres.
- [ ] Gestion des utilisateurs
- [ ] Tester les trucs importants (fonctions du modèle serveur, certaines fonctions du client ?  )
- [ ] Quand on clique sur le score, un carousel de statistiques s'ouvre au-dessous de la barre de titre. Il peut y avoir dedans :
  - Un graphe de l'évolution du score du joueur, sous la forme d'une courbe avec des points apparents. Abscisse : numéro d'exécution (1, 2, ...). Ordonnée : score (échelle semi-logarithmique ?). Au survol d'un point, une info-bulle avec le timestamp et le numéro de la question.
  - Un graphe avec les questions traitées par le joueur, sous la forme d'un nuage de points. Abcisse  numéro d'exécution _successful_ (1, 2, ...). Ordonnée : numéro de la question. Au survol d'un point, une info-bulle avec le timestamp.
  - Une version globale du premier graphe, avec la possibilité de mettre en évidence tel ou tel joueur.
  - Une version globale du second graphe, avec la possibilité de mettre en évidence tel ou tel joueur.
- [ ] N'employer qu'un jeu limité de couleurs, avec des variations de luminosité ou d'opacité. Passer à SCSS. [Conversation avec ChatGPT](https://chatgpt.com/share/6837375e-6c4c-800e-a710-9d53620ae2c6).
