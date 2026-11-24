# EntreLacs — adaptateur OpenCode E-OC-01 et recrutement E-OC-02

**État vérifié : E-OC-01 intégré dans `develop` le 24 novembre 2026** (PR #6, commit de fusion `bfb030eeaec115445e90724feefda7bfb7a02c05`). **E-OC-02 est une proposition de la PR issue #7, non fusionnée et non activée.** Aucun fournisseur, modèle ou tarif n'est présumé disponible. L'ensemble n'est ni un moteur de recrutement autonome, ni une fonctionnalité raccordée à l'application PHP/SQLite.

## Sources et périmètre

- SDK officiel actuel : <https://opencode.ai/docs/build/sdk/> — `@opencode/sdk`, `OpenCode.create()`, `sessions.create()` et `sessions.prompt()` ; **différent** de l'ancien paquet `@opencode-ai/sdk` cité dans des tutoriels historiques.
- Protocole EntreLacs : `docs/protocole-cooperation.md` ; candidature, proposition, relecture et décision humaine sont des états distincts.
- La candidate **Dora / IONOS GPT** reste en mode `manuel` : ses déclarations ne constituent pas des capacités vérifiées et son interface web n'est pas une API OpenCode.

## Démonstration sans dépense et sans installation

Depuis ce répertoire, avec Node.js déjà disponible :

```sh
node --test bridge.test.mjs
node --test recruitment.test.mjs
```

Les tests E-OC-01 utilisent un faux hôte ; ceux d’E-OC-02 utilisent un double strict des méthodes publiques du pont E-OC-01. **Aucun n’importe `@opencode/sdk`**, ne contacte de fournisseur ou ne crée de session réelle. Dans ce lot, **25 tests E-OC-02 ont été exécutés** ; les **25 tests E-OC-01** ont été conservés comme preuve antérieure, sans être rejoués. Une candidature manuelle produit un parcours de transfert humain, pas une connexion API.

## Contrat minimal du pilote

- `proposeCandidate()` conserve rôle, mode, fournisseur, capacités **déclarées**, provenance et statut `candidat` (jamais `recruté`).
- `prepareReview()` prépare une mission de revue à partir d'un contexte **public** explicitement sélectionné, sans appel réseau.
- `executeApprovedReview()` exige l'accord explicite pour **la mission précise**, et une fabrique de host ; il crée une session et soumet **une seule** demande. Le résultat reste `proposition_à_revoir` et le host est fermé même en cas d'échec.
- `createOpenCodeHost()` est une passerelle **non utilisée dans la démonstration** vers `@opencode/sdk`. Son import est différé : aucun lancement lors de l'import du module.

## Avant une expérience réelle ultérieure

Qualifier la version du SDK et du runtime, le modèle et le fournisseur, l'authentification, les coûts, les permissions d'outils, la séparation des données, le répertoire existant autorisé, et la possibilité de désactiver les écritures/commandes dans la session. **Le prototype ne garantit pas à lui seul l'isolation des fichiers ni l'absence de coûts d'une session réelle.** Ne jamais passer une mission privée ou un secret. Une décision humaine distincte est requise pour tout appel, modification de code, fusion ou publication. Ne pas lancer OpenCode sur le serveur PHP mutualisé par supposition.

## E-OC-01 — extension coordination et revue croisée (24 novembre 2026)

Le lot ajoute **sans nouveau paquet ni serveur** :

1. `ROLES_DISPONIBLES` — 8 fonctions conformes au protocole de coopération (explorateur, architecte, développeur, testeur, relecteur, contradicteur, documentaliste, synthétiseur). **Un rôle n'est pas un recrutement.**
2. `prepareReviewPanel()` — affectations explicites, identifiants de candidats uniques, préparation de missions indépendantes sans appeler OpenCode ; les agents en mode manuel n'exigent pas de répertoire SDK.
3. `recordContribution()` — auteur, rôle, mode, provenance, sources et limites rattachés à la proposition, conservée distinctement et non validée.
4. `prepareCrossReviews()` et `recordCrossReview()` — confrontation **après** la collecte de toutes les propositions ; revue par un autre auteur de rôle relecteur ou contradicteur ; les objections ne modifient pas les contributions sources.
5. `prepareDecisionDossier()` — conservation des contributions, avis et désaccords avec décision humaine **non renseignée**, sans consensus artificiel ni publication.

Ces objets vivent **en mémoire de processus uniquement**, ne constituent pas une API de stockage ni une intégration persistante à l'application PHP/SQLite. La synthèse est mécanique ; aucun modèle ne rédige de décision. Il faut un stockage, des identités et un mandat vérifiés avant un raccordement réel.

### Simulation de permissions SDK (version V2)

Sources officielles :
- <https://opencode.ai/docs/build/sdk/> — hôte embarqué `@opencode/sdk`, création de session et prompt, fermeture du host.
- <https://opencode.ai/docs/permissions/> — règles ordonnées `(action, resource, effect)`, **la dernière correspondance l'emporte**, les permissions V2 diffèrent de la V1.

`proposedReadOnlyPermissionRules()` prépare un **profil fictif de relecteur** : refus général, puis lecture, recherche de fichiers et recherche textuelle permises, avec exclusion de fichiers `.env*`. `simulatePermission()` évalue localement ce tableau et montre les refus attendus de `shell`, `edit`, accès aux répertoires externes, outils réseau, délégations et outils inconnus. La simulation de règles **n'installe ni n'applique** de politique dans OpenCode ; elle n'atteste pas le comportement d'un vrai host, de plugins, des règles globales ou des approbations enregistrées.

En production, les agents OpenCode peuvent disposer de permissions par défaut larges et d'autres règles ou extensions. **Il est indispensable de vérifier les permissions effectives dans le runtime existant avant une exécution réelle**, particulièrement le répertoire, les accès externes, la protection des secrets, les appels au fournisseur et la facturation. Ne pas utiliser ces fonctions de simulation comme un pare-feu ou une garantie d'isolation.

### Recette exécutée

Commande dans le dossier déjà disponible : `node --test bridge.test.mjs` avec Node.js v22.16.0.

**25/25 tests locaux réussis, 0 échec :** les 9 tests historiques ont été rejoués sans régression ; 16 nouveaux tests examinent les rôles, affectations, données de provenance, indépendance des premières réponses, revue croisée, refus d'auto-revue, désaccords, intégrité du dossier et règles simulées d'accès. Ni installation SDK, ni appel réseau, ni modèle réel, ni navigateur ou déploiement.

## Prochaine étape

Comparer les résultats du faux adaptateur aux réponses manuelles de Dora, documenter les limites et choisir seulement ensuite un runtime déjà disponible pour une expérimentation OpenCode autorisée. Aucun abonnement, nouveau compte, déploiement ou collecte de secrets dans ce lot.


## E-OC-02 — registre et coordination simulés (24 novembre 2026)

**État : PR de développement, non intégrée ; sans installation, coût, activation ni donnée réelle.** Les deux nouveaux fichiers sont `recruitment.mjs` et `recruitment.test.mjs`. Le module est entièrement en mémoire et **n'importe ni OpenCode ni le pont E-OC-01** : ses fonctions de coordination reçoivent le pont en argument. Il n'appelle aucune méthode `sessions.*`, aucun serveur, aucun fournisseur et ne possède aucun accès à GitHub ou aux données réelles.

### Parcours

1. `createCandidateRegistry()` / `registerCandidate()` : registre versionné en mémoire et journal des propositions ; nom, fournisseur, modèle déclaré, provenance, mode `manuel`/`sdk`, rôles, capacités déclarées et limites. Aucune fiche n'est automatiquement recrutée ou activée.
2. `recordSimulatedEvaluation()` : consigne une évaluation explicitement simulée avec observation et référence fictive ; **ne remplit jamais les capacités vérifiées**. Les simulations n'attestent pas qu'un fournisseur sait réellement exécuter une fonction.
3. `evaluateCandidates()` / `proposePanelSelection()` : choix explicable par rôle, capacités, mode permis, exclusions et préférence facultative ; raisons d'exclusion lisibles. Le choix est **une affectation proposée**, pas une habilitation. Avec `requireVerified: true`, toute compétence seulement déclarée ou simulée est rejetée.
4. `prepareCooperation()` : prépare un panel E-OC-01 au moyen des fonctions `proposeCandidate()` et `prepareReviewPanel()` injectées ; chaque créneau correspond à un candidat distinct. Dora peut participer en `manuel` mais **jamais comme agent SDK par déduction**.
5. `collectIndependentContributions()` et `collectReviewsAndDossier()` : refusent les contributions manquantes, auteurs erronés, avis incomplets ou doublons ; réutilisent les fonctions E-OC-01 `recordContribution`, `prepareCrossReviews`, `recordCrossReview`, `prepareDecisionDossier`. Les sources et objections sont conservées, aucun vote ou consensus ne vaut décision humaine.

### Exemple reproductible sans appel IA

Le fichier `recruitment.test.mjs` fournit des fixtures **fictives** : un développeur en mode `sdk` simulé, « Dora déclarative » en mode `manuel` sans accès URL/terminal et un contradicteur manuel. Le moteur classe les candidatures par critères explicites, propose les affectations, reçoit des textes inventés et prépare des revues distinctes. Aucun de ces profils n’est réellement connecté.

**Recette E-OC-02 exécutée sur le lot initial** : `node --test recruitment.test.mjs` sous Node.js 22.16.0, **25/25 tests réussis** avec un double strict du contrat E-OC-01. Les **25/25 tests historiques E-OC-01** sont des preuves antérieures ; ils ne sont pas comptés parmi les tests réexécutés dans ce lot. L'interopérabilité avec un **hôte SDK externe** n'a pas été testée.

### Règles de séparation

- Candidature ≠ recrutement, qualification simulée ≠ compétence attestée, affectation proposée ≠ droit d'exécuter, avis ≠ décision humaine.
- Ne pas transmettre de dossier privé, clé ou donnée personnelle à une IA externe. Les prompts d'agent restent un contexte à préparer et à transmettre seulement avec autorisation.
- Ne pas instancier `createOpenCodeHost()` ni activer un fournisseur dans ce lot. Les règles de permissions simulées ne constituent pas un bac à sable.
- Aucune migration, persistance SQLite, écriture de base métier, fusion automatique, publication, dépense ou modification d'IONOS.

**Prochaine décision :** revue ciblée de la PR E-OC-02 pour une éventuelle intégration de code **inactif** dans `develop`. Une expérience SDK réelle serait une décision indépendante et ultérieure.


### Revue de compatibilité réelle E-OC-01 → E-OC-02 (PR #8, 24 novembre 2026)

La recette ciblée supplémentaire charge **le véritable fichier `bridge.mjs` du commit E-OC-01 intégré dans `develop`** (blob Git `888858d5efc09c0c580bc7ea7c05f16609a8cc3e`) aux côtés du code E-OC-02 : aucun double n'est utilisé par `recruitment.integration.test.mjs`. Le chargement du module **n'appelle pas** `createOpenCodeHost()` et ne résout pas le paquet `@opencode/sdk` : il n'y a pas de fournisseur, serveur, appel externe ou droit d'accès créé.

Depuis `integrations/opencode/`, avec Node.js déjà disponible :

```sh
node --test recruitment.test.mjs recruitment.integration.test.mjs
```

**Résultat exécuté : 33/33 tests E-OC-02 réussis** (25 initiaux et 8 de raccordement direct), sans installation, accès réseau, SDK réel ni donnée privée. Ces huit cas couvrent la chaîne réelle de trois rôles, quatre revues indépendantes, le panel minimal à deux, les refus de contribution/relecture incorrectes, le répertoire nécessaire pour les missions SDK fictives et l'identité de la mission. **Les 25 tests historiques E-OC-01 restent acquis, non rejoués** : ne pas annoncer 58 tests nouvellement exécutés.

**Défaut fonctionnel reproduit et corrigé :** une affectation préparée pour la mission A pouvait auparavant être passée à `prepareCooperation()` avec un autre identifiant de mission B, ce qui dissociait la sélection de son dossier d'audit. Désormais `selection.id` doit correspondre à l'identifiant de mission demandé ; le cas négatif est couvert par `recruitment.integration.test.mjs`. Le test de répertoire E-OC-02 a été adapté pour utiliser son identifiant de mission réel, sans masquer ce contrôle historique.

**Limite :** ce contrôle valide la compatibilité **de deux modules JavaScript réels**, pas les permissions d'un SDK OpenCode réel ni l'exécution autonome, les coûts, un stockage durable ou la sécurité d'un fournisseur. Le composant reste inactif, non fusionné et non publié.
