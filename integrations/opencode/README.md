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

## Prochaine étape

Comparer les résultats du faux adaptateur aux réponses manuelles de Dora, documenter les limites et choisir seulement ensuite un runtime déjà disponible pour une expérimentation OpenCode autorisée. Aucun abonnement, nouveau compte, déploiement ou collecte de secrets dans ce lot.
