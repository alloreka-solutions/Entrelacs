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


## Consultation ouverte sur le nom

La migration `migrations/001_project_name_poll.sql` ajoute deux tables sans modifier les tables métier existantes :

- `project_name_proposals` : propositions libres de noms ;
- `project_name_votes` : vote courant associé à un jeton de session navigateur.

La migration est appliquée automatiquement par `app/database.php` et enregistrée dans `app_migrations`. Elle est additive et crée ses objets avec `IF NOT EXISTS`. Les huit propositions initiales proviennent de pistes déjà évoquées dans le brainstorming ; elles sont présentées sans classement initial ni préférence officielle.

### Limites du vote actuel

Le jeton est conservé dans la session PHP du navigateur. Cela permet de modifier son vote dans cette session, mais ne garantit pas un vote par personne : cookies supprimés, navigateurs différents, appareils multiples ou automatisation peuvent créer plusieurs votes. Le résultat est donc un indicateur de consultation, pas un scrutin vérifié. Une consultation plus robuste nécessitera une politique de comptes, de confidentialité et d'anti-abus discutée publiquement.
