# Directive de déploiement Alloreka

Dernière mise à jour : 2026-10-30.

Le développement, les tests locaux, les commits et la préparation des branches restent indépendants des publications. Aucune publication automatique par SFTP depuis GitHub Actions n'est autorisée ; ne pas réintroduire de déclencheur automatique `push`, `schedule` ou équivalent pour téléverser des fichiers.

- **CAP** (`cap-centre-action-pilotage`) : IONOS Deployer (https://ionos-deployer.alloreka.support/) exclusivement. Aucune publication CAP via GitHub Actions, manuelle ou automatique.
- **Odile** (`odile-en-bonne-sante`) : IONOS Deployer (https://ionos-deployer.alloreka.support/) exclusivement. Aucune publication Odile via GitHub Actions, manuelle ou automatique.
- **Statut** (`statut.alloreka.solutions`) : Cloudflare Pages. Les workflows de tests GitHub du projet Statut sont désactivés jusqu'à nouvelle décision.
- **Autres projets** : pas de publication SFTP automatique depuis GitHub ; respecter le circuit propre au projet et obtenir une autorisation explicite.

Pour CAP et Odile, privilégier PREVIEW après vérification du dépôt, branche, destination, code, runtime/configuration, sauvegardes et risques d'écrasement. Vérifier journaux et site réel. MAIN en production exige une autorisation explicite.

Ne jamais mélanger les destinations CAP/Odile, modifier les paramètres d'un autre projet, toucher aux tokens, exposer des secrets, contourner CSRF ou les contrôles de destination, utiliser le stockage privé de Deployer comme destination, tester en production, lancer deux déploiements simultanés du même projet, supprimer manuellement des fichiers distants pour forcer une publication, ni activer un webhook sans validation de signature et de fonctionnement.

L'URL publique de Deployer ne suffit pas à autoriser un agent : il faut une session navigateur authentifiée et autorisée. Ne jamais simuler une authentification ou inventer une API ; sans accès autorisé, demander à l'utilisateur d'effectuer le clic. Le transfert d'archive n'étant pas atomique, vérifier journaux et fonctionnement réel après publication. Distinguer le déploiement de Deployer de celui des projets administrés.
