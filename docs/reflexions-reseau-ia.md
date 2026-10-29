# Réseau d'IA gratuit — Réflexions fondatrices

> Synthèse d'une session de brainstorming (octobre 2026) sur la constitution d'un réseau d'IA
> collaboratif travaillant en simultané sur divers projets, en formules gratuites uniquement.
> Point de départ : l'article Numerama « ChatGPT ou Claude en panne ? Voici les meilleures
> alternatives en 2026 » (24 alternatives gratuites).

## 1. Principe fondateur : un réseau, pas un dépendance

Un « réseau d'IA » n'est pas un réseau de neurones au sens technique : c'est une **architecture
en couches de nœuds spécialisés**, pilotée par un routeur (l'utilisateur au début, puis un
outil d'orchestration). Deux priorités à parts égales :

1. **Redondance** — n'être jamais bloqué quand une IA tombe en panne ou épuise son quota
   (ex. la panne simultanée ChatGPT/Claude de septembre 2026).
2. **Spécialisation** — la meilleure IA gratuite pour chaque tâche (recherche, rédaction,
   code, traduction, raisonnement, organisation).

Le danger n°1 n'est pas la panne mais le **quota** : l'orchestrateur doit compter les requêtes
par IA et basculer automatiquement. C'est là que le réseau devient réel : des nœuds qui se
relaient.

## 2. Découverte clé : gratuit en web ≠ gratuit en API

La plupart des IA sont gratuites **en interface web seulement** — leur API est payante.
C'est le point critique de toute automatisation.

**API réellement gratuites (état vérifié octobre 2026) :**
- Google Gemini API (free tier, sans carte bancaire, long contexte, multimodal)
- Mistral API (plan gratuit « Experiment », quota mensuel, sans carte, IA européenne)
- Groq (très rapide, ~1 000 requêtes/jour selon modèle, compatible OpenAI)
- OpenRouter (variantes `:free` de nombreux modèles, dont Qwen et Kimi)
- En secours cumulable : Cerebras, GitHub Models, Cloudflare Workers AI, Hugging Face
  Inference (petit crédit mensuel)

**Pas d'API gratuite (nœuds manuels uniquement) :**
- Claude (Anthropic), ChatGPT (OpenAI), DeepSeek (chat web gratuit mais API prépayée),
  Perplexity, Copilot, Notion AI, DeepL

**Conséquence** : la couche automatisable gratuite = Gemini + Mistral + Groq + OpenRouter,
toutes compatibles OpenAI → un seul code pour toute l'équipe. Les IA sans API gratuite
restent des nœuds manuels que l'orchestrateur peut au moins *rappeler* d'appeler (prompt
optimisé + lien direct généré). En cumulant les quotas, > 5 000 requêtes/jour gratuites sont
atteignables.

## 3. L'organigramme (formules gratuites, candidatures ouvertes)

Métaphore d'entreprise : chaque service est dirigé par l'IA la plus compétente du domaine.
L'utilisateur reste CEO/actionnaire au sommet.

- **Co-direction générale : ChatGPT & Claude** — ChatGPT apporte le volume (texte illimité
  en gratuit depuis août 2026, GPT-5.6 Luna, bouton « Think »), Claude la profondeur
  (mais quota/jour serré : à gérer comme ressource rare, réservée aux tâches à forte valeur).
- **Service Recherche & Veille — Directeur : Perplexity AI** (équipe : Gemini, YouChat, Grok
  pour le temps réel X).
- **Service Rédaction & Contenu — Directeur : Claude** (équipe : ChatGPT, Le Chat/Mistral,
  Copilot, HuggingChat, Qwen Chat).
- **Service Technique (Code) — Directeur : Codestral** (équipe : GitHub Copilot, BlackBox,
  DeepSeek).
- **Service Traduction — Directeur : DeepL** (équipe : Kimi pour le multilingue long).
- **Service Raisonnement & Analyse — Directeur : DeepSeek** (chat gratuit sans abonnement,
  open source ; prudence sur les données sensibles).
- **Service Organisation & Data — Directeur : Notion AI** (équipe : Numerous pour les
  tableurs).
- **Service IT / Automatisation — Directeur : API Mistral** (équipe : API Gemini, Groq,
  OpenRouter, Cerebras…) — le seul service 100 % automatisable gratuitement.

Chaque fiche de poste précise : mission, forces, limites/quotas, prompt type et plan de
repli. Les affectations restent réévaluables (« candidatures ouvertes ») une fois les
données d'usage réel disponibles.

## 4. IA gratuites hors article de départ

L'article Numerama ne liste que des *alternatives* à ChatGPT et n'est pas exhaustif. Ajouts
pertinents :

- **ChatGPT** lui-même (texte illimité gratuit ; publicités dans le plan gratuit ; images,
  voix et recherche approfondie plafonnées).
- **Qwen Chat** (Alibaba) — quotas très généreux, texte + images + exécution de code ;
  accessible aussi via OpenRouter/HF (donc automatisable).
- **Kimi** (Moonshot AI) — le choix gratuit le plus solide pour les documents très longs et
  la recherche web agentique.
- **Grok** (xAI) — temps réel X, accès gratuit restreint selon le statut du compte.

## 5. Slack comme poste de commandement

Un espace Slack peut servir d'interface de coordination :

- Les apps officielles Claude, ChatGPT, Perplexity et Notion rendent chaque IA mentionnable
  dans un canal projet (`@Claude`, `@Perplexity`) — l'organigramme devient opérationnel.
- **Limites** : Slack AI natif est payant ; certaines apps exigent un abonnement chez
  l'éditeur ; plan Slack gratuit = 10 intégrations max et historique 90 jours ; Slack ne
  route pas les tâches ni ne gère les quotas (un standardiste, pas un directeur).

**Architecture recommandée** : Slack = interface (un canal par projet) + **n8n auto-hébergé
(gratuit) = cerveau**. Le trigger Slack de n8n capte chaque mention/message, le workflow
appelle les API gratuites avec chaîne de repli Gemini → Mistral → Groq → OpenRouter et
rotation des quotas, puis poste la réponse dans le canal. La salle de réunion (Slack), le
directeur des opérations (n8n), les employés aux quotas cumulés (les API gratuites).

## 6. Feuille de route en trois phases

1. **Manuel (semaines 1-2)** : comptes gratuits créés ; règle de routage simple
   (recherche → Perplexity, rédaction → Claude/Le Chat, code → Codestral, traduction →
   DeepL, organisation → Notion AI) ; un document « Boussole du réseau » (IA principale +
   sauvegarde par tâche) pour basculer sans réfléchir en cas de panne.
2. **Préparation (semaines 3-4)** : clés API récupérées (AI Studio, console Mistral, Groq,
   OpenRouter) ; test comparatif des 4 API avec le même code (compatibles OpenAI) ;
   format interne `{tâche, contexte, historique}` et réponse normalisée.
3. **Orchestrateur** : routeur de tâches, chaîne de repli automatique, rotation des quotas,
   nœuds manuels assistés (prompt + lien direct), puis interface unique (n8n ou front
   maison).

## 7. Vérification et sources (octobre 2026)

Les quotas gratuits évoluent vite — à revérifier sur les sites officiels avant tout
verrouillage technique :

- Numerama, « ChatGPT ou Claude en panne ? Voici les meilleures alternatives en 2026 ».
- Comparatifs API gratuites 2026 : Google AI Studio, Mistral (plan Experiment), Groq
  (~1 000 req./jour), OpenRouter (`:free`, ~50 req./jour puis 1 000 après 10 $ de crédit),
  Cerebras, GitHub Models, Cloudflare Workers AI, Hugging Face.
- ChatGPT gratuit : conversations texte illimitées depuis août 2026 (GPT-5.6 Luna),
  publicités dans le plan gratuit, fonctionnalités avancées plafonnées.
- Slack Marketplace : apps Claude, ChatGPT, Perplexity, Notion ; n8n trigger Slack
  (44 actions, événements en secondes via webhook).

— Document de réflexion issu d'une co-construction humain + IA (Vibe/Mistral), prêt à
nourrir la suite du projet Entrelacs.
