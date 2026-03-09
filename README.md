# Gestion des retards etudiants - Fondation Mohammed 5 Casablanca

Application web front-end (HTML, CSS, JavaScript) pour suivre les retards des etudiants en mode local, sans backend.

## Description du projet

Ce projet permet a un formateur de:
- gerer les etudiants (ajout, modification, suppression, activation/inactivation),
- enregistrer et suivre les retards,
- filtrer et trier l'historique,
- visualiser des indicateurs et statistiques,
- exporter les donnees en CSV,
- fonctionner hors ligne grace au `localStorage`.

L'interface est construite avec Bootstrap 5 et une navigation en mode SPA (sections sur une seule page).

## Fonctionnalites implementees

### 1. Tableau de bord
- KPI retards du jour
- KPI retards du mois
- KPI minutes cumulees du mois
- Boutons rapides vers ajout retard, ajout etudiant, export CSV

### 2. Gestion des etudiants
- Formulaire CRUD:
	- nom, prenom, groupe,
	- telephone (optionnel),
	- email (optionnel),
	- statut actif/inactif
- Recherche par nom/prenom/groupe
- Suppression avec confirmation

### 3. Gestion des retards
- Formulaire CRUD:
	- etudiant,
	- date,
	- heure (optionnelle),
	- minutes (> 0),
	- motif,
	- justificatif oui/non
- Detection de doublon (meme etudiant/date/minutes) avec avertissement
- Filtres: date, groupe, etudiant, justificatif
- Tri: date/minutes ascendant et descendant

### 4. Statistiques
- Top 5 etudiants en retard (minutes)
- Minutes cumulees par groupe

### 5. Export
- Export CSV etudiants
- Export CSV retards
- Export CSV depuis dashboard/stats
- Encodage UTF-8 avec BOM et separateur `;`

### 6. Stockage local
- Clés `localStorage` utilisees:
	- `app_students`
	- `app_lates`
	- `app_settings`
- Reinitialisation complete des donnees avec confirmation

## Structure du projet

```text
FondationMed5Casablanca/
	index.html
	Said-WAHID.html
	.gitignore
	README.md
	assets/
		js/
			app.js
			storage.js
```

## Stack technique

- HTML5
- Bootstrap 5 (CDN)
- JavaScript ES Modules
- LocalStorage (pas de serveur)

## Lancement

1. Ouvrir `index.html` dans un navigateur.
2. Ajouter des etudiants dans l'onglet `Etudiants`.
3. Ajouter des retards dans l'onglet `Retards`.

Option recommandee: utiliser une extension serveur local (exemple: Live Server) pour un confort de developpement.

## Fichiers principaux

- `index.html`: interface utilisateur complete (sections dashboard, etudiants, retards, stats)
- `assets/js/app.js`: logique applicative (events, CRUD, filtres, stats, export CSV, UI)
- `assets/js/storage.js`: acces et gestion du `localStorage`
- `Said-WAHID.html`: page portfolio personnelle

## Pistes d'amelioration

- Import CSV/JSON
- Sauvegarde cloud (V2)
- Authentification multi-utilisateur
- Graphiques avances (chart library)
- Tests unitaires JavaScript
