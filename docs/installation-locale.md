# Lancer le prototype Entrelacs en local

## Prérequis

- PHP 8.2 ou supérieur ;
- extension PHP `pdo_sqlite` ;
- accès en écriture au répertoire de données SQLite.

Vérifier l'environnement :

```sh
php -v
php -m
```

## Démarrage

Depuis la racine du dépôt :

```sh
php -S 127.0.0.1:8080 -t public
```

Ouvrir ensuite http://127.0.0.1:8080.

Par défaut, la connexion définie dans `app/database.php` utilise `storage/database/app.sqlite`, en dehors du répertoire public. Pour exécuter des tests isolés ou choisir un autre emplacement, définir `ENTRELACS_DB_PATH` avant de lancer PHP. Le dossier parent doit exister ou pouvoir être créé par le processus PHP.

## État des fonctionnalités

Le prototype actuel permet de proposer des noms, de voter de manière indicative depuis une session de navigateur et, si des sessions de travail ouvertes sont présentes dans la base, d'y déposer manuellement une contribution. Aucun fournisseur d'IA n'est connecté automatiquement.

Le vote n'est pas un scrutin vérifié : il ne prouve pas l'identité d'une personne et peut être contourné avec plusieurs navigateurs ou en supprimant les cookies.

Le schéma général décrit dans `database/schema.sql` est une proposition distincte ; il n'est pas appliqué automatiquement par la migration actuelle. Ne pas supposer que toutes les tables du schéma général sont disponibles dans la base de démonstration.

## Sécurité et limites

- Les formulaires de l'interface utilisent un jeton CSRF de session.
- Les requêtes SQL sont paramétrées et les valeurs affichées sont échappées.
- Le répertoire `storage/` ne doit jamais être servi publiquement.
- Il n'y a pas encore d'authentification multi-utilisateur ; ne pas exposer ce prototype publiquement ni y enregistrer d'informations sensibles.
- Avant tout déploiement, vérifier la version PHP réellement utilisée par le serveur web, configurer HTTPS, vérifier les permissions, mettre en place des sauvegardes testées et valider les migrations sur une copie.
- Ne jamais committer le fichier SQLite, les secrets ou des données réelles.

## Tests

Le workflow GitHub Actions vérifie la syntaxe PHP et lance `php tests/smoke.php` avec une base SQLite temporaire. Pour exécuter les vérifications localement :

```sh
find app public -name '*.php' -print0 | xargs -0 -n1 php -l
php tests/smoke.php
```
