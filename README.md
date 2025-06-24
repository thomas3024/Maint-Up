# Maint-Up Comptabilité

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

### Backend

Un petit serveur Express est fourni pour persister les données dans `server/data.json`.
Lancez-le dans un terminal séparé :

```bash
npm run server
```

L'application communiquera alors avec ce backend pour sauvegarder clients, factures
et coûts. Par mesure de sécurité, seules les requêtes provenant du domaine
`https://maint-up.vercel.app` sont acceptées.
Si le serveur n'est pas disponible, l'application fonctionne quand même grâce
à un stockage dans le `localStorage` du navigateur. Vos données seront ainsi
conservées localement et synchronisées automatiquement avec le backend dès que
la connexion internet est rétablie. Les modifications effectuées hors
connexion persistent même après un rechargement de la page et seront envoyées
au serveur dès que possible.

## Utilisation

La barre latérale donne accès aux différentes pages :

- **Dashboard** : synthèse des revenus, coûts et bénéfices.
- **Clients** : gestion des clients (ajout, modification, suppression) et suivi du chiffre d'affaires par client.
- **Factures** : création de factures et suivi de leur statut (payée, en attente ou en retard). Il est possible de lier un fichier PDF.
- **Coûts** : enregistrement des dépenses par client ou générales. Un menu déroulant en haut de la page permet désormais de sélectionner rapidement un client et d'afficher automatiquement ses coûts.
- **Analytics** : graphiques et indicateurs pour visualiser la rentabilité.
- **Reports** : génération d'un rapport annuel exportable au format PDF.

## Fonctionnalités principales

- Gestion complète des clients, factures et coûts.
- Calcul automatique du chiffre d'affaires, des marges et du bénéfice.
- Visualisation des performances par client et par période.
- Export du rapport annuel en PDF.
- Mode sécurisé : l'application démarre en mode "Visualisation". Cliquez sur le
  bouton "Mode" pour passer administrateur et saisissez le mot de passe
  **THABARY**.
## Déploiement sur Vercel

Ce projet inclut un fichier `vercel.json` qui associe automatiquement l'application au domaine https://maint-up.vercel.app lors du déploiement.

Pour récupérer les variables d'environnement ou déclencher une prévisualisation
avec Vercel, installez d'abord l'outil en ligne de commande :

```bash
npm install -g vercel
```

Connectez ensuite le dépôt à votre compte Vercel :

```bash
vercel login
vercel link
```

Une fois le projet lié, vous pouvez extraire les variables définies dans Vercel
à l'aide de :

```bash
vercel env pull .env
```
vercel --prod
Cette commande recréera un fichier `.env` local et permettra à nouveau de faire
des demandes d'extraction ou des déploiements comme auparavant.

## Sécurisation de l'API

Le serveur Express peut être protégé par un jeton d'API. Définissez la variable
d'environnement `API_TOKEN` lors du démarrage du serveur pour activer cette
protection. Toutes les requêtes d'écriture (POST, PUT, DELETE et `/sync`) doivent
alors fournir l'en-tête `Authorization: Bearer <token>`.

Pour utiliser cette authentification côté client, créez un fichier `.env` avec
la variable `VITE_API_TOKEN` contenant le même jeton. Si cette variable n'est
pas définie, l'application fonctionne en lecture seule.


## Licence

Ce projet est distribué sous licence MIT. Voir le fichier [LICENSE](LICENSE).

