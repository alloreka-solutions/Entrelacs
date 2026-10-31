# Directive de déploiement Alloreka

Dernière mise à jour : 2026-10-30.

Cette directive s'applique aux agents ChatGPT, assistants de développement, contributeurs et automatisations. Elle complète les règles propres à chaque projet ; en cas de conflit, appliquer la règle la plus restrictive.

## 1. Développement et publications indépendants

Le développement, les tests locaux, les commits, les revues et la préparation des branches continuent même si un déploiement est indisponible.

Aucune publication automatique ou manuelle SFTP vers IONOS depuis GitHub Actions n'est autorisée. Ne pas créer, réactiver ou utiliser de workflow GitHub Actions qui téléverse des fichiers applicatifs vers un hébergement. Ne pas réintroduire de déclencheur `push`, `schedule` ou équivalent de publication. Les workflows historiques de publication restent désactivés.

## 2. Circuits officiels

- **CAP** (`alloreka-solutions/cap-centre-action-pilotage`) : IONOS Deployer exclusivement : https://ionos-deployer.alloreka.support/. PREVIEW : https://deployer-preview.alloreka.support/.
- **Odile** (`alloreka-solutions/odile-en-bonne-sante`) : IONOS Deployer exclusivement : https://ionos-deployer.alloreka.support/. PREVIEW : https://deployer-preview.alloreka.support/.
- **Statut** (`alloreka-solutions/alloreka.solutions`, statut.alloreka.solutions) : Cloudflare Pages. Ne pas substituer IONOS Deployer et ne pas utiliser GitHub Actions pour publier. Les workflows de tests GitHub du projet Statut restent désactivés jusqu'à nouvelle décision.
- **IONOS Deployer** (`alloreka-solutions/Application-IONOS-Deployer`) : son propre transfert vers IONOS est distinct du déploiement des projets administrés. Utiliser https://deployer-preview.alloreka.support/ et son répertoire isolé pour les essais ; ne jamais écraser l'installation de production pour tester.
- **Autres dépôts Alloreka** : conserver le circuit propre à chaque projet et toute autorisation explicite. Cette directive ne les convertit pas automatiquement à IONOS Deployer.

## 3. PREVIEW puis MAIN pour CAP et Odile

Toute modification doit d'abord être testée sur PREVIEW. Avant publication, contrôler le dépôt, la branche configurée, le projet, la destination autorisée, les fichiers runtime/configuration, les migrations, les sauvegardes vérifiées et les risques d'écrasement. Après transfert, consulter les journaux et tester réellement le site et les fonctions concernées. Un transfert déclaré réussi ne prouve pas à lui seul le bon fonctionnement.

MAIN est une publication de production. Elle exige une autorisation explicite pour l'opération concernée et la validation préalable de PREVIEW. La capacité technique d'un agent à appeler l'API ne vaut jamais autorisation de publier en MAIN.

## 4. Accès des agents à Deployer sans TinyFish

Les agents autorisés peuvent publier sans navigateur, TinyFish ni GitHub Actions, par l'une des deux interfaces :

### API HTTPS v1 — méthode recommandée

- PREVIEW : `https://deployer-preview.alloreka.support/api/v1/deployments.php`
- Production : `https://ionos-deployer.alloreka.support/api/v1/deployments.php`
- Authentification : `Authorization: Bearer <jeton>`, HTTPS obligatoire.
- POST JSON : `{"project_id":12,"target":"preview"}` ou `{"project_id":12,"target":"main"}`.
- GET : `?project_id=ID&limit=20` pour lire les journaux.
- Scopes indépendants : `deploy:preview`, `deploy:main`, `status:read`. Chaque jeton est limité aux identifiants de projets autorisés ou à `*`.

Client : `scripts/agent-deploy.sh`, configuré par `IONOS_DEPLOYER_API_URL` et `IONOS_DEPLOYER_API_TOKEN` :
```bash
export IONOS_DEPLOYER_API_URL="https://deployer-preview.alloreka.support/api/v1/deployments.php"
export IONOS_DEPLOYER_API_TOKEN="iond_..."
bash scripts/agent-deploy.sh <project_id> preview
```

Création des jetons depuis la racine de l'installation Deployer, via PHP CLI :
```bash
/bin/php8.4-cli bin/agent-api-token.php create "Agent preview" "status:read,deploy:preview" "<project_id>"
/bin/php8.4-cli bin/agent-api-token.php create "Agent release" "status:read,deploy:preview,deploy:main" "<project_id>"
```
Le secret complet n'est affiché qu'une fois. Le stocker dans un gestionnaire de secrets sécurisé, jamais dans Git, un commit, un journal ou des instructions partagées. N'accorder `deploy:main` qu'aux agents explicitement habilités. Révoquer tout jeton exposé.

### SSH direct — alternative

Client : `scripts/agent-deploy-ssh.sh`, authentification par clé SSH autorisée :
```bash
export IONOS_SSH_TARGET="alias-ssh-ou-utilisateur@hote"
export IONOS_DEPLOYER_REMOTE_PATH="/chemin/absolu/vers/ionos-deployer"
bash scripts/agent-deploy-ssh.sh <project_id> preview
```
La clé doit être protégée et révocable. Le chemin désigne l'installation Deployer, pas le dossier du projet cible. Remplacer `preview` par `main` uniquement avec autorisation MAIN.

Vérifier les scripts et variables dans la version effectivement installée. Ne jamais inventer un endpoint, identifiant, jeton ou résultat. Si PREVIEW n'est pas installée ou validée, le dire explicitement et poursuivre le développement sans prétendre qu'une publication a eu lieu.

## 5. Webhooks

Les webhooks GitHub, GitLab ou Bitbucket ne sont utilisables que s'ils sont configurés dans Deployer et que leur signature/secret est validé côté serveur. Ils ne remplacent pas l'API agent v1 et ne contournent jamais les autorisations, les branches configurées ou la liste blanche des destinations.

## 6. Sécurité et séparation

- Ne jamais mélanger destinations, bases, secrets, jetons ou configurations CAP et Odile.
- Ne pas modifier les paramètres d'un autre projet sans demande explicite.
- Ne jamais exposer de secret dans Git, une réponse publique, un ticket ou un journal.
- Ne pas contourner authentification, CSRF, scopes, contrôles de branches ou liste blanche.
- Ne jamais utiliser le stockage privé de Deployer comme destination de projet.
- Ne pas tester en production, lancer deux déploiements simultanés du même projet ou supprimer des fichiers distants pour forcer une publication.
- Vérifier les chemins, liens symboliques et la préservation des fichiers de configuration et données propres à l'environnement.
- Distinguer le transfert de Deployer lui-même de celui des projets qu'il administre.
- Les transferts d'archive ne sont pas atomiques : vérifier les journaux et le fonctionnement réel après chaque publication.

## 7. Compte rendu obligatoire

Pour chaque opération, indiquer le projet et son ID Deployer, la cible, la branche, l'heure, le résultat renvoyé et les tests réellement effectués. Distinguer code préparé, commit Git, demande de déploiement, transfert terminé et application vérifiée. Ne jamais annoncer une publication réussie sur la seule base d'un commit ou d'une requête acceptée.
