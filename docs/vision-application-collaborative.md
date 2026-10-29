# Entrelacs — Vision de l’application collaborative

## Objectif

Construire une application web gratuite à exploiter dans la mesure du possible, dédiée au brainstorming, à la conception et au développement web en faisant collaborer plusieurs assistants d’intelligence artificielle autour d’un même projet.

Entrelacs ne doit pas être un simple agrégateur de réponses. Il doit conserver le fil du travail : idées, arguments, critiques, tâches, livrables, décisions et validations.

## Principes

- **Gratuité d’abord** : aucune dépendance payante obligatoire, aucune consommation d’API payante par défaut. Les quotas gratuits et leurs limites doivent être explicitement affichés.
- **Humain aux commandes** : les IA proposent et exécutent dans un périmètre autorisé ; les décisions sensibles, les publications et les déploiements restent soumis aux règles du projet.
- **Pluralité réelle** : préserver les contributions distinctes, les divergences, les incertitudes et les sources. Ne pas confondre consensus automatique et validation.
- **Traçabilité** : chaque contribution indique son auteur ou agent, son rôle, son statut et les éléments sur lesquels elle s’appuie.
- **Sécurité** : aucun secret, jeton, mot de passe ou donnée privée dans le dépôt ou les journaux. Permissions minimales, environnements de test et revue avant publication.
- **Interopérabilité** : séparer le cœur de l’application des connecteurs propres à chaque fournisseur, afin d’ajouter ou retirer un agent sans reconstruire le système.

## Parcours utilisateur cible

1. Créer un espace de projet et préciser l’objectif, les contraintes et le résultat attendu.
2. Soumettre un sujet de brainstorming ou une tâche de développement.
3. Choisir les agents disponibles et leurs rôles (idéation, architecture, critique, sécurité, tests, documentation, synthèse).
4. Lancer une première série de contributions indépendantes.
5. Organiser une revue croisée : les agents peuvent commenter et contester les propositions d’autres agents.
6. Produire une synthèse qui conserve les options, les désaccords, les risques et les questions ouvertes.
7. Transformer les décisions retenues en tâches, puis en livrables versionnés.
8. Faire vérifier le résultat avant toute fusion ou publication.

## Architecture envisagée

### 1. Noyau indépendant des fournisseurs
- projets, sessions, tâches, messages, contributions, pièces jointes et décisions ;
- rôles, autorisations et journal d’audit ;
- état des tâches et historique des versions ;
- moteur de workflow avec étapes explicites : proposition, critique, révision, synthèse, décision humaine.

### 2. Adaptateurs d’agents
Chaque adaptateur expose un contrat commun : capacités déclarées, mode d’authentification, limites d’usage, lancement d’une tâche, récupération de la réponse, erreurs et coûts éventuels.

Les voies de participation ne sont pas toutes équivalentes :
- connecteur API officiel, si une API et un quota utilisable existent ;
- outil ou intégration officielle ;
- participation manuelle par copier-coller lorsque l’API n’est pas disponible gratuitement ;
- agent local auto-hébergé, si la machine et les ressources le permettent.

Ne pas automatiser le contrôle d’interfaces web privées ni contourner les conditions d’utilisation d’un fournisseur. Ne jamais prétendre qu’une IA est connectée si le connecteur n’a pas été configuré et testé.

### 3. Espace de travail web
- tableau de bord des projets et sessions ;
- fil de discussion commun et vues par agent ;
- comparaison côte à côte des propositions ;
- commentaires et revue croisée ;
- gestion des tâches et des livrables ;
- historique des décisions et export Markdown/JSON ;
- intégration GitHub progressive : issues, branches, commits et pull requests selon les autorisations.

### 4. Exécution du code
La première version doit privilégier la proposition de code, les patchs et les tests dans un environnement isolé. Pas d’accès automatique à la production. Toute action destructive ou publication doit nécessiter une autorisation explicite.

## MVP recommandé

### Phase 0 — Protocole documentaire
- formaliser le protocole de coopération ;
- définir le format d’une contribution et d’une décision ;
- documenter les règles de sécurité, de gratuité et de validation.

### Phase 1 — Prototype sans coût d’API obligatoire
- application web légère ;
- création de projets, sessions et tâches ;
- contributions d’agents enregistrées manuellement ;
- comparaison, commentaires, synthèse et décisions ;
- export Markdown et dépôt Git ;
- interface claire indiquant les agents manuels, configurés, disponibles ou indisponibles.

Cette phase permet de tester la méthode avant de dépendre d’un fournisseur ou d’un quota.

### Phase 2 — Connecteurs
- contrat d’adaptateur documenté ;
- connecteurs officiels pour les fournisseurs réellement accessibles ;
- prise en charge d’agents locaux si réaliste ;
- affichage des quotas et arrêt préventif avant toute dépense.

### Phase 3 — Développement web collaboratif
- génération de patchs ;
- revue de code indépendante ;
- tests automatisés ;
- intégration GitHub via branches et pull requests ;
- validation humaine avant fusion et déploiement.

## Première liste de rôles

- **Explorateur** : génère des idées et des options.
- **Architecte** : structure la solution et explicite les compromis.
- **Contradicteur** : recherche les hypothèses fragiles et les scénarios d’échec.
- **Développeur** : propose du code et des patchs.
- **Auditeur sécurité** : examine permissions, secrets et risques.
- **Testeur** : définit et exécute des tests autorisés.
- **Documentaliste** : vérifie les sources et maintient la documentation.
- **Synthétiseur** : rapproche les contributions sans effacer les désaccords.
- **Pilote humain** : arbitre les décisions importantes.

Un même modèle peut occuper plusieurs rôles, et plusieurs modèles peuvent partager un même rôle.

## Critères de réussite

- une session peut accueillir plusieurs contributions clairement attribuées ;
- chaque contribution peut être commentée, contestée et révisée ;
- la synthèse distingue faits, hypothèses, recommandations et décisions ;
- le désaccord et les questions ouvertes restent consultables ;
- aucune dépense n’est engagée sans accord explicite ;
- un livrable de développement est traçable jusqu’à ses tâches, revues et validations ;
- l’application reste utile même lorsqu’aucun connecteur IA n’est configuré.

## Questions à trancher plus tard

- PHP/MariaDB ou autre socle technique selon les contraintes d’hébergement ;
- authentification et modèle multi-utilisateur ;
- stockage des conversations et politique de conservation ;
- premier connecteur officiel à tester ;
- exécution locale ou distante des tests ;
- licences et conditions d’utilisation des composants retenus.

## Invitation à contribuer

Les contributions sont bienvenues pour préciser le protocole, comparer les architectures, identifier les options gratuites réalistes, proposer des tests de concept et challenger les risques. Toute proposition doit indiquer ses hypothèses, ses limites, ses coûts éventuels et ses sources.

**Principe directeur : plusieurs intelligences contribuent, une mémoire commune conserve le travail, et l’humain garde la maîtrise des décisions.**
