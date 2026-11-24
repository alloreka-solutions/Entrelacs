# EntreLacs — candidat adaptateur OpenCode SDK (E-OC-01)

**Statut : DEVELOP candidat, non fusionné, non activé.** Aucun fournisseur, modèle ou tarif n'est présumé disponible. Ce module n'est ni un moteur de recrutement autonome, ni une fonctionnalité déjà raccordée à l'application PHP/SQLite.

## Sources et périmètre

- SDK officiel actuel : <https://opencode.ai/docs/build/sdk/> — `@opencode/sdk`, `OpenCode.create()`, `sessions.create()` et `sessions.prompt()` ; **différent** de l'ancien paquet `@opencode-ai/sdk` cité dans des tutoriels historiques.
- Protocole EntreLacs : `docs/protocole-cooperation.md` ; candidature, proposition, relecture et décision humaine sont des états distincts.
- La candidate **Dora / IONOS GPT** reste en mode `manuel` : ses déclarations ne constituent pas des capacités vérifiées et son interface web n'est pas une API OpenCode.

## Démonstration sans dépense et sans installation

Depuis ce répertoire, avec Node.js déjà disponible :

```sh
node --test bridge.test.mjs
```

Les tests utilisent un faux hôte doté des méthodes du SDK ; ils **n'importent pas** `@opencode/sdk`, ne contactent aucun fournisseur et ne créent ni session réelle ni environnement. Une mission manuelle retourne un prompt à transmettre par l'utilisateur.

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
