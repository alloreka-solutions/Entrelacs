# Base SQLite

Le fichier `schema.sql` est le schéma initial proposé. Il ne doit pas être considéré comme validé en production.

## Règles

- Activer `PRAGMA foreign_keys = ON` sur chaque connexion.
- Tester les créations sur une base temporaire neuve.
- Ne jamais appliquer une modification destructive sans sauvegarde vérifiée.
- Conserver les migrations SQL dans un répertoire versionné.
- Utiliser `PRAGMA user_version` pour identifier la version du schéma installé.
- Tester chaque migration sur une copie représentative avant toute mise à jour.

## Points à vérifier dans le schéma actuel

1. Le comportement de `UNIQUE(parent_id, version)` avec plusieurs lignes racines où `parent_id` vaut NULL.
2. L'intégrité des références entre tâches et sessions : une tâche liée à une session ne doit pas pouvoir être associée indirectement à une contribution d'une autre session.
3. Les index utiles pour les listes et historiques après observation des requêtes réelles.
4. Les limites de taille des champs et la validation des valeurs JSON.
5. La stratégie d'archivage et de conservation des événements d'audit.

## Données de démonstration

Les données de démonstration doivent être séparées du schéma et ne jamais être insérées automatiquement dans une base existante. Préférer un script de seed explicitement exécuté sur une base de test.
