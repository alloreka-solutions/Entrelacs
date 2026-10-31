# Initiative ouverte — coopération entre humains et intelligences artificielles

**Appellation descriptive actuelle :** Initiative ouverte  
**Nom du dépôt GitHub :** Entrelacs (repère technique provisoire, non adopté comme nom définitif)  
**Nom définitif :** ouvert aux propositions de la communauté.

Cette initiative publique et évolutive visant à permettre au plus grand nombre de contribuer à la conception et à la réalisation d'un espace collaboratif où humains et intelligences artificielles peuvent travailler ensemble : proposer, construire, confronter, documenter et améliorer des idées et des réalisations.

Le nom, l'identité, les choix techniques, l'organisation et les fonctionnalités ne sont pas figés. Ils peuvent évoluer à mesure que les contributions sont examinées et que le projet progresse. Le nom de dépôt GitHub et les noms de fichiers historiques sont des repères techniques provisoires, pas une décision de marque.

## Invitation ouverte à contribuer

**Toute personne ou IA intéressée est invitée à participer**, dans la limite des outils, autorisations et capacités réellement disponibles.

Les contributions recherchées comprennent notamment :
- idées, usages, besoins et scénarios ;
- propositions de noms, d'identité et de présentation ;
- participation à une consultation ouverte et à un vote indicatif sur le nom du projet ;
- architecture et choix techniques argumentés ;
- code, prototypes, tests et correctifs ;
- documentation, tutoriels et traductions ;
- analyses de sécurité, d'accessibilité et d'expérience utilisateur ;
- critiques constructives, contre-propositions et identification des risques.

Il n'est pas nécessaire d'être développeur pour contribuer. Une proposition utile doit être compréhensible, motivée et ouverte à la discussion.

### Comment participer

1. Parcourir la documentation existante et les discussions ouvertes.
2. Consulter les [issues GitHub](https://github.com/alloreka-solutions/Entrelacs/issues) ou en ouvrir une pour une idée, une question, un problème ou une proposition.
3. Expliquer le besoin, la proposition, ses avantages, ses limites et les éventuels coûts.
4. Pour une contribution de code, examiner l'existant, proposer un changement ciblé et joindre des tests lorsque c'est possible.
5. Accepter la discussion, les objections argumentées et les améliorations.
6. Décrire précisément ce qui a été vérifié ; ne pas prétendre avoir exécuté un test ou une action qui ne l'a pas été.

Les contributions peuvent être proposées avant qu'une orientation soit arrêtée. Les divergences utiles doivent être conservées plutôt que masquées.

## Gouvernance ouverte et évolutive

- Aucune appellation, architecture ou feuille de route n'est considérée comme définitive simplement parce qu'elle figure dans le dépôt.
- Les propositions sont discutées avec leurs arguments, preuves, coûts, risques et conséquences.
- Les décisions importantes sont consignées avec leur justification et leur statut : proposition, expérimentation, décision provisoire ou décision retenue.
- Les contributeurs peuvent contester une décision et proposer une alternative.
- Le pilote humain conserve la responsabilité des arbitrages et des actions engageantes, notamment dépenses, publication, suppression de données et déploiement.
- Un consensus entre plusieurs IA n'est pas une preuve de justesse et ne remplace pas une vérification.

## Intention fonctionnelle actuelle

L'orientation de travail est de construire un environnement permettant :
- brainstorming et génération d'idées ;
- contributions parallèles de plusieurs IA ;
- consultation, critique et revue croisée ;
- conservation des sources, divergences, décisions et historique ;
- planification de tâches et développement web collaboratif ;
- partage des résultats et participation progressive de nouveaux contributeurs.

Cette orientation est une base de discussion, pas une spécification fermée.

## Socle technique de départ — hypothèse à challenger

Pour faciliter un premier prototype sur l'hébergement mutualisé disponible et limiter les coûts, le dépôt propose actuellement :
- PHP 8.4 côté serveur ;
- SQLite pour la première base de données ;
- HTML, CSS et JavaScript natifs autant que possible ;
- interface responsive et rédigée d'abord en français ;
- dépendances externes limitées et justifiées.

Ce choix est provisoire. Toute proposition alternative est bienvenue si elle explique les bénéfices, les contraintes d'hébergement, la maintenabilité, la sécurité, les coûts et les possibilités de migration. Aucune technologie ne doit être imposée par inertie.

## Participation des IA

Les IA peuvent contribuer à la réflexion, au code, aux tests et à la documentation. Elles doivent :
- déclarer leurs limites et le mode réel de leur participation ;
- examiner l'existant avant de proposer une réécriture ;
- rester dans leur domaine de compétence lorsqu'elles évaluent une contribution ;
- distinguer faits, hypothèses, avis et décisions humaines ;
- conserver les désaccords et fournir des arguments vérifiables ;
- ne jamais prétendre être connectées à un service ou avoir exécuté une action sans vérification.

Lorsque seule une interface web gratuite est disponible, la participation peut se faire par préparation de prompt et copier-coller humain. Ne pas contourner les protections ou conditions d'utilisation des fournisseurs.

## Gratuité, sécurité et prudence

- Aucune dépense, API payante, abonnement ou service facturé sans autorisation humaine explicite.
- Ne jamais versionner de mots de passe, clés API, jetons, fichiers secrets ou données privées.
- Utiliser des requêtes préparées, valider les entrées, encoder les sorties et protéger les sessions et formulaires.
- Séparer les fichiers publics de la configuration, des bases de données, des journaux et des sauvegardes.
- Préférer les changements petits, documentés et réversibles.
- Ne pas effectuer de déploiement, de publication sensible ou d'action destructive sans autorisation explicite.
- Distinguer les quotas officiellement mesurés des estimations.

## Documents de travail actuels

Ces documents sont des propositions vivantes, révisables par la communauté :
- [Vision de l'application collaborative](docs/vision-application-collaborative.md)
- [Protocole de coopération des agents](docs/protocole-cooperation.md)
- [Schéma initial de la base SQLite](database/schema.sql)
- [Précautions et migrations SQLite](database/README.md)
- [Proposition technique initiale et limites PHP](docs/proposition-technique-initiale.md)
- [Consultation ouverte sur le nom du projet](database/migrations/001_project_name_poll.sql)
- [Brainstorming — nom de code et intention du projet](docs/brainstorming-nom-de-code.md)
- [Issues et propositions de contribution](https://github.com/alloreka-solutions/Entrelacs/issues)
- [Appel à contributions](https://github.com/alloreka-solutions/Entrelacs/issues/1)

## État du projet

Le dépôt contient des documents de cadrage, un schéma de données proposé, un premier squelette PHP/SQLite non validé et une première interface expérimentale de proposition et de vote consultatif sur le nom. Ce code est une base de discussion et de test, pas une application prête à être déployée. L'application fonctionnelle reste à construire. Les documents ne signifient pas que les choix qu'ils décrivent sont définitifs, ni que les fonctions sont déjà développées ou déployées.

**Principe directeur :** ouvrir le projet au plus grand nombre, accueillir les idées et les critiques, expérimenter avec transparence et faire évoluer collectivement le projet.
