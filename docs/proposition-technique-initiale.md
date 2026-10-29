# Proposition technique initiale — prototype web

**Statut : proposition de travail publiée le 29 octobre 2026.**  
**Aucune décision technique définitive n'est prise.** Cette proposition est ouverte aux critiques, alternatives et contributions.

## 1. Objectif du premier prototype

Construire une petite application web qui permette de vérifier le cycle collaboratif avant d'ajouter des connecteurs d'IA :

1. afficher les sessions de travail ouvertes ;
2. enregistrer une contribution humaine ;
3. conserver l'auteur, le rôle, le mode de participation et la date ;
4. permettre ensuite la consultation, la revue et la décision.

Le premier incrément ne lance aucun appel à une API d'IA et n'engage aucun coût.

## 2. Environnement connu et compatibilité PHP

Les diagnostics réalisés sur l'hébergement mutualisé IONOS ont montré deux exécutables différents :

- la commande PHP par défaut a affiché PHP 4.4.9 (SAPI CGI/FastCGI) ;
- `/usr/bin/php8.5-cli` a affiché PHP 8.5.12 (CLI), avec notamment PDO, `pdo_sqlite`, cURL et OpenSSL.

Ces observations concernent la CLI. **La version PHP du serveur web n'a pas encore été vérifiée.**

### Position de compatibilité

- Cible proposée : PHP 8.2 ou supérieur, à confirmer après vérification de la version web.
- PHP 4.4.9 n'est pas pris en charge.
- Une syntaxe ancienne ne rendrait pas ce projet compatible PHP 4 : PDO et le pilote `pdo_sqlite` requis par cette proposition ne sont pas disponibles dans cet environnement PHP 4.
- Ne pas exécuter l'application avec la commande `php` par défaut sur cet hébergement.
- Pour les tests CLI, utiliser explicitement l'exécutable PHP 8.x vérifié.
- Ne pas installer de framework ni de dépendance Composer pour ce premier incrément.

Si une compatibilité avec un environnement plus ancien devient un besoin réel, elle devra faire l'objet d'une proposition distincte, avec une autre couche d'accès aux données et une analyse de sécurité. Elle ne doit pas être simulée par une simple réduction de la syntaxe.

## 3. Architecture de déploiement envisagée

Séparer les fichiers exécutables publiquement des données et du code interne :

```text
application/
├── app/
│   └── database.php
├── database/
│   └── schema.sql
├── public/
│   ├── index.php
│   └── assets/
│       └── style.css
└── storage/
    ├── database/
    └── logs/
```

Seul le contenu de `public/` doit être exposé par le serveur web. Les répertoires `app/`, `database/` et `storage/` doivent rester hors de la racine web.

Le chemin définitif sur IONOS n'est pas arrêté. Aucun sous-domaine, répertoire distant ou base de données IONOS ne doit être créé pour cette proposition.

## 4. Base de données

Le dépôt possède déjà `database/schema.sql`, qui définit les tables projets, sessions, tâches, dépendances, contributions, revues, décisions et événements d'audit.

Cette proposition **ne remplace pas ce schéma**. Il doit être relu et testé avant sa première utilisation. En particulier :

- vérifier les contraintes de clés étrangères avec `PRAGMA foreign_keys = ON` sur chaque connexion ;
- vérifier les contraintes `UNIQUE(parent_id, version)`, notamment pour les contributions racines dont `parent_id` est NULL ;
- tester les états autorisés et les relations entre tâches et sessions ;
- ajouter une stratégie de migrations versionnées avant de faire évoluer une base contenant des données ;
- sauvegarder la base avant toute migration.

Des tables complémentaires pourront être proposées après clarification du modèle de comptes, des agents et du suivi d'utilisation. Ne pas ajouter prématurément des données personnelles ou des clés API.

## 5. Sécurité minimale avant exposition publique

Le code publié est un squelette pédagogique, pas une application prête à ouvrir au public.

Avant toute mise en ligne, il faudra notamment :

- ajouter une authentification et des autorisations par projet/session ;
- remplacer le libellé générique du contributeur par une identité vérifiée ;
- ajouter une limitation anti-spam et des limites de fréquence ;
- ne pas afficher les détails internes des exceptions aux visiteurs ; journaliser côté serveur sans secrets ;
- vérifier la configuration HTTPS et des cookies de session ;
- protéger les formulaires contre les requêtes intersites (CSRF) ;
- limiter les tailles de requêtes et contrôler les types de données ;
- empêcher l'accès HTTP aux fichiers SQLite, journaux, sauvegardes et configurations ;
- tester les permissions de fichiers et les sauvegardes/restaurations ;
- faire une revue de sécurité indépendante.

## 6. Limites de ce premier incrément

Le code initial ne fournit pas encore :

- inscription, connexion ou gestion de comptes ;
- gestion multi-utilisateur et permissions ;
- création de projets ou de sessions depuis l'interface ;
- affichage des contributions existantes ;
- édition, versions, pièces jointes ou suppression contrôlée ;
- revue croisée, synthèse et décisions ;
- appels à des fournisseurs d'IA ;
- gestion des quotas ou des coûts ;
- protections anti-abus suffisantes pour un service public.

Ces éléments sont des étapes ultérieures, pas des fonctions déjà réalisées.

## 7. Plan de validation

1. Tester le schéma sur une base SQLite temporaire neuve.
2. Vérifier la version et les extensions PHP du serveur web, sans utiliser `phpinfo()` public.
3. Tester l'affichage avec une session de démonstration.
4. Tester l'enregistrement d'une contribution, les entrées invalides et les tentatives CSRF.
5. Vérifier qu'aucun fichier privé n'est accessible par HTTP.
6. Faire relire le code et les choix par plusieurs contributeurs.
7. Seulement ensuite, envisager un déploiement contrôlé.

## 8. Appel à contributions

Les retours sont particulièrement utiles sur :

- la cible PHP et les contraintes réelles des hébergements mutualisés ;
- la structure des répertoires ;
- le modèle SQLite et les migrations ;
- les protections nécessaires avant ouverture publique ;
- les fonctions minimales qui rendent le prototype réellement utile.

Une alternative argumentée est aussi bienvenue qu'une amélioration de cette proposition.
