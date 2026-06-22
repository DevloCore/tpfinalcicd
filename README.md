# TaskFlow API

[![Build Status](http://localhost:8080/buildStatus/icon?job=TaskFlow-API)](http://localhost:8080/job/TaskFlow-API/)

## Description
TaskFlow API est une interface de programmation (API REST) conçue pour la gestion industrialisée de tâches (To-Do list). 
Elle permet de créer, lire, mettre à jour et supprimer des tâches de manière fiable et rapide.
Développée avec Node.js, Express et MongoDB, elle est entièrement conteneurisée et dispose d'un pipeline CI/CD automatisé de A à Z.


## Prérequis
- **Docker** installé sur votre machine
- **Docker Compose** pour l'orchestration locale
- **Jenkins** configuré avec les plugins requis (Docker Pipeline, Git)

## Démarrage rapide

1. Cloner le repository :
```bash
git clone https://github.com/DevloCore/tpfinalcicd.git
cd tpfinalcicd
```

2. Configurer l'environnement :
```bash
cp .env.example .env
```

3. Lancer la stack complète :
```bash
docker compose up -d --build
```
L'API sera ensuite directement accessible sur `http://localhost/api/tasks`.

## Variables d'environnement

| Nom de la variable | Description | Exemple de valeur |
| :--- | :--- | :--- |
| `PORT` | Port d'écoute de l'API Node.js dans le conteneur | `5000` |
| `MONGO_URI` | Chaine de connexion à la base de données MongoDB | `mongodb://mongodb:27017/taskflow` |

## Architecture du Pipeline CI/CD

Le fichier `Jenkinsfile` déclare un pipeline comprenant les 6 étapes suivantes :
1. **Checkout** : Récupération du code source depuis GitHub.
2. **Install** : Installation des dépendances Node.js via `npm ci` dans un conteneur éphémère.
3. **Lint** : Vérification stricte du code source via ESLint (échoue immédiatement si la moindre violation est détectée).
4. **Test** : Exécution des tests unitaires et d'intégration avec Jest avec affichage de la couverture.
5. **Build Docker** : Construction de l'image Docker de l'API, taggée avec `:latest` et `:build-N`.
6. **Deploy** : Déploiement automatique de la nouvelle image via Docker Compose.

## Répartition des tâches

| Membre du binôme | Tâches réalisées |
| :--- | :--- |
| **Rémi PORQUET** | 100% (Projet réalisé seul : Développement de l'API, Tests Jest, Dockerfile, Nginx, Docker Compose, Jenkinsfile, Documentation) |
