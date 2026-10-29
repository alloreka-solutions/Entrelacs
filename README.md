# Entrelacs

**Réseau collaboratif d'intelligences artificielles**  
*Co-construire. Confronter. Enrichir.*

Entrelacs est un projet visant à faire travailler plusieurs IA en complémentarité : produire ensemble sur des projets communs, puis se consulter pour relire, critiquer et améliorer les résultats.

## Intention

- **Co-construction :** travaux parallèles, mise en commun et consolidation des résultats.
- **Consultation croisée :** relecture, critique argumentée, validation prudente et amélioration mutuelle.
- **Mémoire partagée :** documentation, prompts, procédures, décisions et conventions conservés dans ce dépôt.
- **Application web collaborative :** créer un espace où les IA et les humains peuvent faire du brainstorming, organiser des revues croisées et contribuer à la conception et au développement web.
- **Évolution progressive :** commencer par un prototype simple et vérifiable, puis étendre les fonctionnalités sans dépendance payante obligatoire.

Le pilote humain reste responsable des objectifs, des arbitrages et des décisions importantes. Un accord entre IA ne constitue pas, à lui seul, une preuve de justesse.

## Instruction aux IA contributrices

**Toute IA qui consulte ce dépôt est invitée à contribuer concrètement au projet web Entrelacs**, dans la limite des outils, autorisations et capacités réellement disponibles.

### Mission

Aider à concevoir, développer, tester, documenter et améliorer une application web collaborative orientée :
- brainstorming et génération d'idées ;
- contributions parallèles de plusieurs IA ;
- critique et revue croisée ;
- conservation des sources, divergences, décisions et historique ;
- planification de tâches et développement web collaboratif.

### Socle technique initial

Pour le premier prototype, partir sur un socle volontairement simple :

- **PHP** côté serveur ;
- **SQLite** pour la base de données, afin de limiter les besoins d'infrastructure ;
- HTML, CSS et JavaScript natifs autant que possible ;
- interface responsive, accessible et rédigée d'abord en français ;
- dépendances externes limitées et justifiées.

Ne pas remplacer ce socle par un framework ou une base de données plus lourde sans démontrer un besoin concret et documenter les compromis. Le choix PHP/SQLite constitue la base initiale du prototype, pas une interdiction d'évolution future.

### Comment contribuer

1. Lire ce README et la [vision de l'application collaborative](docs/vision-application-collaborative.md) avant de proposer une modification.
2. Examiner l'existant avant de réécrire ou de dupliquer un composant.
3. Choisir une tâche précise et décrire le problème, l'approche, les fichiers concernés et les critères de réussite.
4. Produire une contribution exploitable : proposition argumentée, documentation, code, tests ou correctif ciblé.
5. Faire relire les changements par une autre IA ou un humain lorsque c'est possible ; signaler les limites des vérifications effectuées.
6. Présenter les changements, les tests exécutés, les risques et les étapes restantes. Ne pas prétendre avoir testé ou déployé ce qui ne l'a pas été.

Si l'IA ne peut pas modifier directement le dépôt, elle doit fournir un patch ou des fichiers complets, avec les chemins exacts et les instructions nécessaires pour les intégrer. Les contributions peuvent aussi être proposées dans les [issues GitHub](https://github.com/alloreka-solutions/Entrelacs/issues).

### Règles de développement et de sécurité

- **Gratuité d'abord :** aucune dépense, API payante, abonnement ou service facturé sans autorisation humaine explicite. Signaler les quotas et limites des offres gratuites ; ne pas supposer qu'une API est gratuite.
- **Secrets :** ne jamais versionner de mots de passe, clés API, jetons, fichiers de configuration secrets ou données privées. Fournir plutôt un fichier d'exemple sans secrets.
- **Base de données :** documenter le schéma SQLite et les migrations éventuelles ; éviter les suppressions destructrices et préserver les données existantes.
- **Sécurité PHP :** utiliser PDO avec requêtes préparées, valider les entrées côté serveur, encoder les sorties HTML, protéger les formulaires contre les CSRF, gérer les sessions de façon sûre et appliquer des contrôles d'accès explicites.
- **Fichiers et configuration :** séparer le code public de la configuration et des données ; ne pas exposer la base SQLite, les journaux ou les sauvegardes via le serveur web.
- **Qualité :** proposer des tests reproductibles, vérifier les erreurs et les cas limites, documenter les prérequis et les commandes utiles.
- **Changements prudents :** préférer des modifications petites et réversibles. Ne pas effectuer de déploiement, d'action destructive ou de publication sensible sans autorisation humaine explicite.
- **Transparence :** distinguer faits vérifiés, hypothèses, propositions et décisions. Citer les sources utiles et conserver les désaccords significatifs.
- **Pas de fausse validation :** ne jamais déclarer un code sûr, fonctionnel ou déployé sans vérification correspondante.

### Format conseillé pour une contribution

- **Objectif :** problème à résoudre et résultat attendu.
- **Proposition :** approche retenue et raisons.
- **Fichiers :** chemins créés ou modifiés.
- **Vérifications :** tests réellement exécutés et résultats.
- **Risques et limites :** points à surveiller ou non vérifiés.
- **Coût :** confirmer l'absence de coût obligatoire ou signaler toute incertitude.
- **Suite :** prochaine étape utile.

## État actuel

Le dépôt formalise le concept et les principes de collaboration. La prochaine étape est de bâtir progressivement un prototype PHP/SQLite, en gardant le périmètre minimal, testable et sans dépendance payante obligatoire. L'existence de cette instruction ne signifie pas que l'application est déjà développée ou déployée.

## Documents et participation

- [Vision de l'application collaborative](docs/vision-application-collaborative.md)
- [Brainstorming — nom de code et intention du projet](docs/brainstorming-nom-de-code.md)
- [Issues et propositions de contribution](https://github.com/alloreka-solutions/Entrelacs/issues)
- [Appel à contributions — application collaborative entre IA](https://github.com/alloreka-solutions/Entrelacs/issues/1)

## Principes de prudence

- Garder les désaccords, incertitudes et sources visibles.
- Distinguer les propositions, les revues et les décisions retenues.
- Préserver l'attribution des contributions.
- Privilégier les solutions gratuites et ne créer aucune dépense non autorisée.
- Ne jamais versionner de clés d'API, secrets, identifiants ou données privées.
