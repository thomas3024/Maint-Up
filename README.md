# Maint-Up

Maint-Up est une application web permettant de suivre l'activité financiere d'une petite entreprise ou d'un freelance. Elle centralise les clients, les factures et les coûts afin de fournir un tableau de bord complet et des rapports annuels.

## Installation

1. Cloner ce répertoire.
2. Installer les dépendances :

```bash
npm install
```

3. Lancer l'application en mode développement :

```bash
npm run dev
```

Par défaut, l'application est accessible sur `http://localhost:5173`.

## Utilisation

La barre latérale donne accès aux différentes pages :

- **Dashboard** : synthèse des revenus, coûts et bénéfices.
- **Clients** : gestion des clients (ajout, modification, suppression) et suivi du chiffre d'affaires par client.
- **Factures** : création de factures et suivi de leur statut (payée, en attente ou en retard). Il est possible de lier un fichier PDF.
- **Coûts** : enregistrement des dépenses par client ou générales.
- **Analytics** : graphiques et indicateurs pour visualiser la rentabilité.
- **Reports** : génération d'un rapport annuel exportable au format PDF.

## Fonctionnalités principales

- Gestion complète des clients, factures et coûts.
- Calcul automatique du chiffre d'affaires, des marges et du bénéfice.
- Visualisation des performances par client et par période.
- Export du rapport annuel en PDF.

