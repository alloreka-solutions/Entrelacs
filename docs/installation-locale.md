# Installation locale du prototype Entrelacs

## Prérequis

- PHP 8.1 ou supérieur recommandé ;
- extensions PHP `pdo_sqlite` et `mbstring` ;
- accès en écriture au répertoire `var/` (ou au chemin défini dans `ENTRELACS_DB_PATH`).

Vérifier les extensions :

```sh
php -v
php -m
```

## Démarrage

À la racine du dépôt :

```sh
php -S 127.0.0.1:8080 -t public
```

Ouvrir ensuite http://127.0.0.1:8080.

La base SQLite et les tables initiales sont créées automatiquement au premier accès. Par défaut, le fichier de base est `var/entrelacs.sqlite`. Pour utiliser un autre emplacement, définir la variable d'environnement `ENTRELACS_DB_PATH` avant de démarrer PHP. Le chemin doit être hors de la racine publique du serveur web.

## Fonctionnalités initiales

- création de projets ;
- création de sessions de brainstorming ;
- enregistrement manuel de contributions attribuées à un auteur et à un rôle ;
- affichage des contributions par session.

Aucun fournisseur d'IA n'est connecté à ce stade. Les intégrations automatiques, l'authentification multi-utilisateur, la gestion des droits et les workflows de revue sont hors de ce premier squelette et devront être conçus avant une mise en production.

## Sécurité et limites

- Formulaires POST protégés par un jeton CSRF de session.
- Requêtes SQL paramétrées et échappement HTML des données affichées.
- Le répertoire de données ne doit pas être accessible directement depuis le web.
- Le prototype ne comprend pas encore d'authentification utilisateur : ne pas l'exposer publiquement ni y enregistrer des informations sensibles.
- En production, utiliser HTTPS, un compte système aux permissions minimales, des sauvegardes testées et un mécanisme explicite de migration du schéma.
- Ne jamais committer le fichier SQLite, les secrets ou des données réelles.

## Vérifications

Avant de proposer une fusion, contrôler au minimum la syntaxe PHP avec `php -l` sur les fichiers PHP, puis tester la création d'un projet, d'une session et d'une contribution avec une base temporaire. Documenter les commandes réellement exécutées et leurs résultats.
