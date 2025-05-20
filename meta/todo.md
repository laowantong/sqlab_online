# TODO list

## Prioritaire

- [x] Rendre hidden le bouton feedBack lorsque la zone de codeMirrorEditor est dirty
- [ ] Refonte Drag to reorder (+ Icone de zone préhension (à droite) et pour dérouler le bandeau (à gauche) l'icone de zone de préhension doit être fixe et ne pas pouvoir être repoussé par le nom des colonnes)
- [ ] Implémenter clique to insert pour les données dans le bandeau (après avoir fait la refonte Drag to reorder)
- [ ] Implémenter système de score en utilisant `task.reward` généré à partir de SQLab 0.7.9.
    - Bouton mise score -> Un slider pour miser un pourcentage de son score 10 à 50% de son score. 
    - Dans local storage : `score/${activityNumber}`.
    - Adapter le modèle de slider donné dans `public/assets`.
- [ ] Côté modèle, traitement des requêtes de l'utilisateur : transmettre au client des données comportant une réponse (ok ou non) et un message d'erreur si la requête a échoué (erreur SQL) ou si la vérification n'a pas produit de feedback ; dans le client, afficher les erreurs éventuelles dans la zone appropriée.

## Non prioritaire

- [ ] Aventure d'accueil/Tutoriel
- [ ] Page d'accueil pour selectionner sa base puis l'aventure ou la série d'exercices
- [ ] Gestion des utilisateurs
- [ ] Tester les trucs importants (fonctions du modèle serveur, certaines fonctions du client ?  )