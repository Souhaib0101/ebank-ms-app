# eBank — Client Angular 21

Client de la troisième partie du projet eBank : consultation et création de clients et de comptes bancaires, assistant Spring AI/MCP, Markdown et réponses en streaming.

## Démarrage

Prérequis : Node.js 22.12+ ou 24, npm et Java 21+ pour les microservices. Le CLI Angular 21 est installé localement : aucune mise à jour du CLI global n'est nécessaire.

Depuis ce dossier :

```powershell
npm ci
npm start
```

Ouvrir **http://localhost:4200**. `npm start` utilise le proxy défini dans `proxy.conf.json` : `/api/**` est transmis à **http://localhost:9999**, sans le préfixe `/api`.

### Backend

Démarrer les modules Spring dans cet ordre, chacun dans son terminal depuis la racine du dépôt :

```powershell
mvn -f discovery-service/pom.xml spring-boot:run
mvn -f customer-service/pom.xml spring-boot:run
mvn -f ebank-service/pom.xml spring-boot:run
mvn -f gateway/pom.xml spring-boot:run
mvn -f ebank-bot/pom.xml spring-boot:run
```

Attendre que `customer-service` soit disponible avant `ebank-service` : son initialisation crée des comptes pour les clients existants. Conserver les paramètres d'environnement utilisés pour le backend et le fournisseur IA. Aucune clé IA n'est nécessaire côté Angular.

Vérifier l'enregistrement des services dans Eureka : **http://localhost:8761**. Les pages clients/comptes fonctionnent sans le chatbot ; le service `ebank-bot` est nécessaire pour l'assistant.

## Pages

| Route            | Fonctionnalité                                                    |
| ---------------- | ----------------------------------------------------------------- |
| `/accounts`      | Liste des comptes, solde, date, type et identifiant du client     |
| `/accounts/new`  | Création de compte avec Signal Forms                              |
| `/customers`     | Liste des clients                                                 |
| `/customers/new` | Création de client avec Signal Forms                              |
| `/bot`           | Assistant avec réponses classiques ou streaming et rendu Markdown |

Les listes utilisent des observables et `AsyncPipe`, avec états chargement, succès, erreur, liste vide et actualisation. Un intercepteur fonctionnel et un service à signaux pilotent le spinner global. Le service compte les requêtes simultanées et se réinitialise aussi sur erreur ou annulation.

### Formulaires

- Compte : solde initial d'au moins **1 000**, type obligatoire et client à sélectionner.
- Types conformes au backend : `CURRENT-ACCOUNT` et `SAVING-ACCOUNT`.
- Client : nom obligatoire et adresse e-mail valide.
- Les identifiants et dates sont générés par le backend. L'identifiant sélectionné du client est converti en nombre avant l'envoi.
- Un échec d'enregistrement conserve les valeurs et permet de réessayer.

### Assistant et streaming

Exemples de questions :

- « Liste les clients. »
- « Liste les comptes du client 1 sous forme de tableau. »
- « Ajoute un compte de type CURRENT-ACCOUNT avec un solde de 3400 pour le client 1. »

Les réponses sont rendues par `ngx-markdown`, avec la sanitisation Angular par défaut. Les questions passent par `HttpParams`, ce qui préserve accents et caractères spéciaux.

Le mode classique attend une réponse `text/plain`. Le mode streaming utilise `observe: 'events'`, `reportProgress: true` et les événements `DownloadProgress`/`Response`. **Le backend XHR par défaut d'Angular 21 est conservé** pour obtenir `partialText`. Ne pas ajouter `withFetch()` à cette implémentation sans adapter le traitement du flux.

`partialText` contient le texte cumulé : le contenu est remplacé à chaque événement, puis par le corps final. Il ne faut pas concaténer ces valeurs. Le bouton **Arrêter** désabonne l'`AsyncPipe`, annule la requête et libère le spinner. Quitter la page annule également la requête.

L'endpoint `/chatStream` retourne un `Flux<String>` en `text/plain;charset=UTF-8` via Spring MVC. Ce flux transporte directement du texte, sans enveloppe JSON ni préfixes SSE `data:`. L'en-tête `X-Content-Type-Options: nosniff` permet au navigateur de traiter les premiers petits fragments sans attendre son analyse de type de contenu ; `Cache-Control: no-store` évite la mise en cache de la réponse. Les accents, caractères arabes et emoji sont conservés dans les deux modes de réponse.

Les appels MCP et la génération réelle nécessitent les microservices et le fournisseur IA disponibles.

## Contrat HTTP

Toutes les requêtes passent par la gateway et la découverte des services.

| Méthode | URL via la gateway                | Corps / réponse                             |
| ------- | --------------------------------- | ------------------------------------------- |
| GET     | `/EBANK-SERVICE/accounts`         | `Account[]`                                 |
| POST    | `/EBANK-SERVICE/accounts`         | `{ balance, type, customerId }` → `Account` |
| GET     | `/CUSTOMER-SERVICE/customers`     | `Customer[]`                                |
| POST    | `/CUSTOMER-SERVICE/customers`     | `{ name, email }` → `Customer`              |
| GET     | `/EBANK-BOT/chat?query=...`       | Texte Markdown complet                      |
| GET     | `/EBANK-BOT/chatStream?query=...` | Flux de texte Markdown                      |

Le proxy évite les requêtes inter-origines en développement. La gateway autorise aussi l'origine `http://localhost:4200` pour les appels directs présentés dans la vidéo.

Pour déployer le build statique, servir `dist/angular-front/browser`, rediriger les routes Angular vers `index.html`, et configurer le reverse proxy pour transmettre `/api/*` vers la gateway en retirant `/api`. Le proxy du CLI ne s'applique qu'au serveur de développement.

## Vérification

```powershell
npm run build
npm test
npm run format:check
```

Le budget initial est de 800 kB d'avertissement / 1 MB d'erreur pour inclure Bootstrap, ses icônes et son bundle JavaScript. Les pages sont chargées à la demande.

Les tests Angular vérifient les requêtes simultanées, erreurs et annulations, les deux modes de chatbot, les textes progressifs cumulatifs, la validation des comptes, le corps JSON envoyé et la reprise après un échec.

Les quatre tests ciblés du contrôleur Spring vérifient les réponses classiques et progressives, l'encodage UTF-8, les en-têtes du flux et l'arrivée d'un premier fragment avant la fin de la génération. Ils remplacent l'agent IA par un mock et ne nécessitent aucune clé ni connexion au fournisseur IA.

Test ciblé du contrôleur Spring, depuis la racine du dépôt, sans appel réel au fournisseur IA :

```powershell
mvn -f ebank-bot/pom.xml -Dtest=EBankChatBotControllerTest test
```

## Organisation

```text
src/app/
  models/          Contrats métier, états des requêtes et du chat
  services/        Accès HTTP et état du chargement global
  interceptors/    Intercepteur de chargement
  pages/           Comptes, clients, formulaires et assistant
```
