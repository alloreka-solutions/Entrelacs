# Proposition transversale — versionnement et traçabilité des applications

**Statut : proposition soumise à consultation — non définitive.**  
**Date de diffusion : 2026-10-30.**  
**Périmètre : dépôts et applications Alloreka.**

## Objet de la consultation

Examiner le modèle de versionnement proposé ci-dessous, le comparer aux mécanismes déjà présents dans le projet et transmettre une recommandation argumentée. Cette consultation ne vaut pas ordre de modifier immédiatement le code, la base de données ou le processus de déploiement.

Chaque application doit répondre à cette consultation, y compris lorsqu'elle estime que certaines dispositions sont inutiles ou inadaptées à son architecture.

## Modèle proposé

Combiner trois niveaux d'identification :

1. **Version fonctionnelle de l'application**, par exemple `2.1.0`, selon une convention de versionnement cohérente avec le projet.
2. **Identifiant temporel UTC**, au format `YYYYMMDD-HHMMSS UTC`, par exemple `20261030-163025 UTC`.
3. **SHA complet du commit Git** correspondant exactement au code livré, lorsque celui-ci est disponible.

Chaque page ou vue pourrait également disposer d'une version fonctionnelle propre, par exemple `Page Projets 1.3`. Cette granularité est une proposition à évaluer : ne pas l'imposer si elle crée une charge disproportionnée ou si une autre traçabilité fiable est préférable.

## Distinction essentielle des dates

Le projet doit examiner et, si pertinent, distinguer :

- **Version préparée / construite** : date UTC à laquelle l'artefact ou le paquet a été préparé.
- **Version publiée / installée** : date UTC à laquelle cette version a effectivement été installée avec succès sur l'environnement concerné.

Ne jamais présenter une version préparée comme déjà publiée. Les environnements PREVIEW et MAIN/production doivent être identifiables séparément et conserver leurs propres informations d'installation.

## Source des informations affichées

Les informations nécessaires à l'identification de la version installée doivent accompagner le code ou l'artefact livré, par exemple dans un fichier de métadonnées généré pendant la préparation ou l'installation.

- L'affichage des versions ne doit pas dépendre d'un appel à GitHub ou à un autre service distant.
- Le SHA doit identifier le code réellement installé, et non simplement la tête actuelle d'une branche distante.
- Si une donnée n'est pas connue ou vérifiable, afficher explicitement « Commit non renseigné », « Version inconnue » ou un état équivalent ; ne jamais inventer de valeur.
- La consultation d'une page ne doit pas générer une nouvelle version ou un nouvel identifiant de publication.

## Présentation envisagée

- Pied de page discret : version de l'application et date de publication UTC.
- Informations techniques : version de la page, SHA complet, environnement et date de préparation/installation.
- Administration ou écran « À propos » : inventaire des versions et métadonnées disponibles.

Exemple indicatif :  
`Application 2.1.0 · Page Projets 1.3 · Publiée 20261030-163025 UTC · Commit 2277f3b9831c`

L'affichage peut être adapté à l'interface du projet.

## Questions auxquelles chaque projet doit répondre

1. Quel versionnement existe déjà (version d'application, pages, build, release, commit, date de déploiement) ?
2. Où et comment ces informations sont-elles actuellement générées, stockées et affichées ?
3. Le modèle proposé est-il compatible avec l'architecture et le circuit de publication du projet ?
4. Une version par page est-elle réellement utile ? Si oui, comment éviter une maintenance manuelle fragile ?
5. Comment garantir que le SHA et la date affichés correspondent au code effectivement installé sur chaque environnement ?
6. Comment gérer les déploiements manuels, les installations partielles, les retours arrière et les versions inconnues ?
7. Quelles améliorations ou simplifications recommandez-vous, avec leurs bénéfices, coûts, risques et conséquences ?
8. Quelle convention finale recommandez-vous pour ce projet, et quelles différences éventuelles justifiez-vous par rapport au standard commun ?

## Consignes de réponse et de prudence

- Commencer par inspecter l'existant ; ne pas supposer qu'aucun mécanisme n'est déjà présent.
- Distinguer les faits vérifiés, les hypothèses et les recommandations.
- Ne modifier aucun code, schéma de base de données, workflow ou configuration de déploiement au seul motif de cette consultation.
- Ne déclencher aucun déploiement.
- Respecter les règles de publication propres au projet : aucun déploiement via GitHub Actions pour CAP et Odile ; IONOS Deployer reste le circuit prévu pour les projets concernés ; PREVIEW d'abord et MAIN/production uniquement avec autorisation explicite.
- Ne pas remplacer une convention existante sans expliquer précisément pourquoi.
- Toute proposition d'amélioration doit être justifiée par un gain concret de fiabilité, de sécurité, de lisibilité ou de maintenabilité.

## Décision transversale

À ce stade, il s'agit d'une **base de discussion commune**, pas d'une norme définitive. Les retours des applications seront comparés avant de stabiliser la directive. Une adaptation locale est acceptable lorsqu'elle est techniquement justifiée et documentée ; les informations communes de traçabilité et la distinction entre code préparé et code effectivement installé doivent rester compréhensibles.

