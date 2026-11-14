# Partie 3 — Client Angular

Le client se trouve dans [`angular-front/`](angular-front/README.md). Ce document détaille le découpage prévu pour publier la partie Angular en **12 commits**.

| Étape | Message proposé                                    | Contenu                                                                                                                   |
| ----- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 1     | `Initialiser le client Angular 21`                 | Structure du projet, configuration TypeScript et npm, scripts de développement et fichier de verrouillage des dépendances |
| 2     | `Ajouter Bootstrap et la navigation principale`    | Bootstrap, icônes, menu responsive, shell, styles, routage de base et page introuvable                                    |
| 3     | `Configurer les API et les modeles metier`         | Modèles compte/client, services HTTP typés, configuration des URL, proxy vers la gateway et CORS                          |
| 4     | `Afficher les comptes bancaires`                   | Page des comptes, états RxJS, gestion des erreurs, liste vide et actualisation                                            |
| 5     | `Afficher les clients`                             | Page des clients, états de requête, gestion des erreurs, liste vide et actualisation                                      |
| 6     | `Centraliser le chargement des requetes HTTP`      | Service à signaux, intercepteur fonctionnel, spinner global et gestion des requêtes simultanées                           |
| 7     | `Ajouter la creation de clients avec Signal Forms` | Formulaire client, validations du nom et de l'e-mail, enregistrement et retour à la liste                                 |
| 8     | `Ajouter la creation de comptes avec Signal Forms` | Formulaire compte, validation du solde et du type, sélection du client et enregistrement                                  |
| 9     | `Integrer le chatbot bancaire en mode classique`   | Modèle du chat, service HTTP, formulaire de question, réponse texte et gestion des erreurs                                |
| 10    | `Afficher les reponses du chatbot en Markdown`     | Intégration de ngx-markdown, rendu des tableaux et styles du contenu généré                                               |
| 11    | `Ajouter le streaming et l'annulation du chatbot`  | Endpoint Spring /chatStream, événements HTTP progressifs, sélection du mode et annulation                                 |
| 12    | `Tester et documenter le client Angular`           | Tests Angular et Spring ciblés, configuration des vérifications, guide de lancement et documentation                      |

Les fichiers partagés (routes, configuration, dépendances et liens de navigation) sont à intégrer progressivement dans le commit correspondant. Chaque étape doit former une version compilable.

La création et le push de chaque commit attendent une instruction explicite **« commit n »**. L'intervalle demandé entre deux commits est de **16 à 21 minutes**, avec les dates réelles. Si une instruction arrive hors de ce créneau, il faut convenir du calendrier suivant sans modifier rétroactivement les horodatages.

## Lancement rapide

Depuis `angular-front/` :

```powershell
npm ci
npm start
```

Application : **http://localhost:4200**. Gateway : **http://localhost:9999**.

Consulter le [guide du client](angular-front/README.md) pour démarrer les microservices, connaître les routes HTTP et lancer les vérifications.
