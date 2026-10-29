# Prompt maître — Brainstorming : structure du dépôt Entrelacs

> Mode d'emploi pour l'utilisateur : envoyer la **partie 1** à chaque IA du réseau avec le
> contenu de `docs/structure-depot-proposition.md`. Quand plusieurs réponses sont
> réunies, envoyer la **partie 2** à chaque IA avec toutes les réponses compilées.
> 2-3 allers-retours suffisent pour converger (même méthode que le choix du nom).

---

## Partie 1 — Génération

Objet : Brainstorming — structure d'un dépôt GitHub partagé entre IA.

Contexte : je pilote plusieurs IA (ChatGPT, Claude, Le Chat/Mistral, Perplexity, DeepSeek,
Qwen, Kimi…) qui doivent travailler ensemble dans un réseau collaboratif à double
vocation : co-construire (plusieurs IA en parallèle sur les mêmes projets) et se
consulter (critique croisée des travaux). Le socle technique est un dépôt GitHub privé
nommé « Entrelacs » : documents fondateurs, prompts partagés, procédures de collaboration.
À terme, une application d'orchestration s'appuiera dessus.

Contraintes :
- chaque document doit être lisible par une IA sans contexte préalable (fenêtre isolée) ;
- les formules gratuites des IA imposent des documents courts et denses (économie de
  tokens) ;
- la structure doit survivre aux changements de l'« organigramme » des IA (candidatures
  ouvertes, quotas variables) ;
- racine minimale, extensible sans refonte.

Une proposition complète est fournie en pièce jointe (`docs/structure-depot-proposition.md`),
avec quatre questions ouvertes (prompts/ vs procedures/, journal/ vs historique Git,
nommage des fichiers, versionnement des fiches de poste).

Attendu : 1) ta proposition de structure (arborescence + justification de chaque dossier),
2) ton avis argumenté sur les quatre questions ouvertes, 3) une liste des faiblesses de la
proposition jointe, 4) ton verdict final : la proposition telle quelle, amendée (comment),
ou remplacée.

---

## Partie 2 — Critique croisée (« avocat du diable »)

Voici compilées les réponses des autres IA à ce brainstorming [coller les réponses].
Ta mission : te placer en avocat du diable.

1. Pour chaque proposition, identifie la faille la plus sérieuse (pas la plus évidente).
2. Signale toute proposition qui serait l'optimum « local » mais un piège à long terme.
3. Désigne les 2 points de convergence majoritaires et conteste au moins l'un d'eux :
   l'unanimité rapide est souvent un signe de paresse analytique.
4. Propose ensuite, si tu en vois, 1 ou 2 solutions de synthèse (structure hybride).
5. Termine par ton classement final des options viables.

---

## Consignes de publication des réponses

Chaque IA répond dans un document `propositions/<nom-ia>-structure.md` du dépôt
(ou l'utilisateur le dépose pour elle), avec en tête : nom de l'IA, date, phase (1 ou 2).
La synthèse finale convergente sera versionnée dans `docs/` comme référence, et le
désaccord éventuel consigné dans le `journal/` du mois : le désaccord documenté est une
richesse du réseau, pas un échec.
