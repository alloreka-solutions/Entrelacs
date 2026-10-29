# Entrelacs — Protocole de coopération des agents

**Statut :** proposition de référence v0.1  
**Périmètre :** première version du protocole humain/IA, indépendante de tout fournisseur.

## 1. Objectif

Organiser le travail de plusieurs assistants autour d'un objectif commun sans effacer leurs contributions individuelles, leurs désaccords ni leurs limites. Entrelacs conserve les éléments de travail et aide le pilote humain à prendre des décisions informées.

Le protocole doit rester utilisable sans connecteur API : une contribution peut être ajoutée manuellement après consultation d'une IA dans son interface habituelle.

## 2. Principes non négociables

1. **Une mission explicite :** chaque session possède un objectif, un résultat attendu, un périmètre et des contraintes.
2. **Des contributions attribuées :** chaque contribution identifie son auteur, son rôle, son mode de participation et son statut.
3. **Des rôles délimités :** un agent ne valide ni ne corrige un sujet hors de son domaine déclaré. Il peut signaler qu'un point dépasse son périmètre et demander une revue spécialisée.
4. **Une pluralité préservée :** les réponses indépendantes sont enregistrées avant leur confrontation. Une synthèse ne remplace pas les contributions sources.
5. **Une critique argumentée :** toute objection précise l'élément visé, le motif, les éléments justificatifs et, si possible, une amélioration proposée.
6. **Pas de vérité par vote :** le nombre d'agents d'accord ne constitue pas une preuve.
7. **Traçabilité :** les propositions, révisions, arbitrages et décisions restent consultables.
8. **Maîtrise humaine :** le pilote humain conserve la décision finale, notamment pour les choix sensibles, les publications et les déploiements.
9. **Gratuité par défaut :** aucune dépense ni consommation d'API payante sans autorisation humaine explicite.
10. **Honnêteté opérationnelle :** un agent ne prétend jamais avoir consulté une source, exécuté un test ou effectué une action qui n'a pas réellement eu lieu.

## 3. Rôles et responsabilités

| Rôle | Responsabilité principale | Hors périmètre |
|---|---|---|
| Explorateur | Produire des idées, variantes et pistes | Présenter une idée comme validée |
| Architecte | Structurer la solution, les composants et les compromis | Certifier seul la sécurité ou la conformité |
| Contradicteur | Rechercher les hypothèses fragiles, objections et scénarios d'échec | Rejeter sans argument ni alternative |
| Développeur | Produire du code, des patchs et expliquer leur fonctionnement | Déclarer seul le code sûr ou prêt pour la production |
| Auditeur sécurité | Examiner les menaces, permissions, secrets et protections | Étendre son avis à des domaines non examinés |
| Testeur | Définir et exécuter des tests, rapporter les résultats | Affirmer qu'un test a réussi sans l'avoir exécuté |
| Documentaliste | Vérifier les sources et maintenir la documentation | Transformer une source incertaine en fait établi |
| Synthétiseur | Comparer les contributions et restituer convergences et divergences | Effacer les désaccords ou inventer un consensus |
| Pilote humain | Définir le besoin, arbitrer et autoriser les actions | — |

Un même modèle peut occuper plusieurs rôles. Plusieurs modèles peuvent partager un rôle. L'identité du modèle et le rôle joué sont deux informations distinctes.

## 4. Cycle d'une session

### Étape A — Cadrage

Le pilote humain définit :
- l'objectif et le contexte ;
- le résultat attendu ;
- les contraintes et exclusions ;
- les critères d'acceptation ;
- le niveau de risque et les autorisations accordées.

Le Supervisor, lorsqu'il sera implémenté, transforme ce cadrage en tâches limitées et attribuables. Il ne modifie pas le besoin sans le signaler.

### Étape B — Contributions indépendantes

Les agents reçoivent le contexte strictement nécessaire et produisent leurs réponses sans voir les réponses des autres, sauf si la tâche exige explicitement une collaboration préalable.

Chaque réponse est enregistrée comme une contribution distincte. Les informations non vérifiées sont marquées comme telles.

### Étape C — Revue croisée ciblée

Les contributions sont distribuées aux rôles compétents pour examen. Une revue doit :
- identifier précisément la proposition examinée ;
- distinguer erreur factuelle, risque, préférence et désaccord de conception ;
- fournir une justification vérifiable ;
- signaler les limites de l'examen ;
- proposer une correction ou une question lorsque c'est utile.

Un agent peut déclarer « hors de mon domaine » plutôt que donner un avis artificiel.

### Étape D — Réponse et révision

L'auteur d'une contribution peut répondre aux critiques et publier une nouvelle version. Les anciennes versions sont conservées. Une critique n'entraîne pas automatiquement une modification.

### Étape E — Synthèse

Le Synthétiseur produit une synthèse structurée en séparant :
- faits étayés et sources ;
- hypothèses ;
- propositions ;
- convergences ;
- divergences persistantes ;
- risques et limites ;
- questions ouvertes ;
- décisions déjà prises par le pilote humain.

La synthèse renvoie aux contributions d'origine.

### Étape F — Décision humaine

Chaque décision reçoit un statut :
- **à examiner** ;
- **acceptée** ;
- **acceptée sous conditions** ;
- **rejetée** ;
- **reportée**.

Une décision indique son auteur (pilote humain), sa date, sa justification et les contributions prises en compte. Seul le pilote humain peut enregistrer une décision comme arbitrage final.

### Étape G — Tâches et livrables

Les décisions acceptées peuvent être transformées en tâches avec responsable, dépendances, critères d'acceptation et état. Les livrables sont reliés aux tâches et aux contributions qui les ont produits ou revus.

## 5. Format minimal d'une contribution

Chaque contribution doit conserver au minimum :

- `id` : identifiant unique ;
- `session_id` : session concernée ;
- `author_type` : humain, agent IA ou système ;
- `author_label` : nom affiché de l'auteur ou de l'agent ;
- `provider` et `model` : fournisseur et modèle, si connus ;
- `role` : rôle exercé ;
- `mode` : manuel, API officielle, intégration autorisée ou local ;
- `created_at` : date de création ;
- `content` : contenu intégral ;
- `status` : brouillon, soumis, en revue, révisé ou archivé ;
- `sources` : références et éléments de preuve, si applicables ;
- `limitations` : limites déclarées ;
- `version` : numéro de version.

Les champs inconnus restent explicitement inconnus : ils ne sont pas devinés.

## 6. Format minimal d'une revue

Une revue comprend :
- l'identifiant de la contribution examinée ;
- l'auteur et son rôle ;
- le périmètre réellement examiné ;
- le type de remarque : fait, raisonnement, sécurité, test, documentation ou conception ;
- la gravité, si elle est pertinente ;
- l'argument et les éléments justificatifs ;
- la recommandation ;
- les limites de la revue ;
- le statut : ouverte, répondue, résolue ou non retenue.

Une revue ne modifie jamais directement la contribution d'origine.

## 7. Sources, confiance et désaccords

La confiance ne doit pas être calculée à partir du seul consensus. Pour chaque affirmation importante, conserver autant que possible :
- la source primaire ou la référence ;
- la date de consultation ;
- la méthode de vérification ;
- le degré d'incertitude ;
- les contre-éléments connus.

Les évaluations de qualité futures pourront tenir compte de critères observables (exactitude vérifiée, tests réussis, pertinence, traçabilité, satisfaction du pilote), avec une distinction entre mesure et estimation. Aucun score global opaque ne doit décider seul du routage ou de l'acceptation d'un résultat.

## 8. Participation via les interfaces web

Lorsqu'aucune API officielle gratuite ou autorisée n'est disponible :
1. Entrelacs prépare un prompt adapté au rôle.
2. L'utilisateur ouvre lui-même l'interface du fournisseur.
3. L'utilisateur transmet le prompt et récupère la réponse.
4. La réponse est importée dans la session avec son fournisseur, son modèle et son mode de participation déclarés si connus.

Ne pas automatiser les interfaces privées, contourner CAPTCHA, protections, quotas ou conditions d'utilisation. Ne pas enregistrer de mot de passe fournisseur dans Entrelacs.

## 9. Autorisations et actions à risque

Les actions suivantes exigent une autorisation humaine explicite :
- dépense ou activation d'un service payant ;
- envoi de données à un fournisseur externe non prévu ;
- suppression ou migration de données ;
- fusion ou publication de code ;
- déploiement en production ;
- modification d'un domaine, DNS ou configuration d'hébergement ;
- action irréversible ou susceptible d'affecter un tiers.

Le système doit distinguer une suggestion, une préparation d'action et une action effectivement exécutée.

## 10. Critères d'acceptation du protocole

Le protocole sera considéré comme implémentable lorsque :
- deux contributions indépendantes peuvent être enregistrées dans une même session ;
- chaque contribution conserve auteur, rôle, mode et version ;
- une revue peut cibler une contribution sans la modifier ;
- une synthèse conserve explicitement les désaccords ;
- une décision humaine est traçable et reliée aux éléments examinés ;
- une session fonctionne sans aucun connecteur IA configuré ;
- aucune dépense ni publication n'est déclenchée implicitement.

## 11. Évolutions différées

Ne font pas partie de ce protocole minimal :
- classement automatique définitif des IA ;
- apprentissage automatique du routeur ;
- notation de confiance opaque ;
- orchestration autonome d'interfaces web privées ;
- exécution automatique de code en production.

Ces fonctions ne seront envisagées qu'après validation du prototype et documentation de leurs risques.

---

**Principe directeur :** les IA contribuent et se contredisent utilement ; Entrelacs conserve les preuves et l'historique ; le pilote humain décide.
