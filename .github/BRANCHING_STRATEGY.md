# Stratégie de branches — Entrelacs

Mise en place : 2026-11-01.

## Branches

- `main` : version de référence / production.
- `develop` : intégration des développements en cours.
- `feature/<sujet>` : fonctionnalité isolée, créée depuis `develop`, proposée vers `develop`.
- `fix/<sujet>` : correction non urgente, créée depuis `develop`, proposée vers `develop`.
- `hotfix/<sujet>` : correction urgente créée depuis `main`, puis réintégrée dans `develop`.

## Préproduction

Aucune branche `preview` n'est créée à ce stade : aucun environnement de préproduction dédié et vérifié n'a été confirmé pour ce dépôt. Si un environnement PREVIEW est établi, créer `preview` depuis `develop` et documenter sa destination avant toute publication.

## Publication

Développement local et publication uniquement après décision et circuit explicitement documentés ; aucun déploiement automatique GitHub Actions.

Les commits, tests et revues restent indépendants des publications. Une fusion Git n'autorise jamais à elle seule un déploiement. Ne jamais supprimer ou forcer une branche existante sans audit préalable.

Les branches et Pull Requests historiques sont conservées ; elles ne sont pas automatiquement rebasées ou fusionnées dans `develop`. Les nouveaux travaux suivent cette convention.