# Guide detaille du dossier devops

Ce document explique en detail la structure, le role de chaque fichier et la logique d'utilisation du dossier devops.

## Vue d'ensemble

Le dossier devops est organise en 3 blocs principaux:

- k8s: manifests Kubernetes en mode Kustomize (base + overlays par environnement)
- helm: chart Helm equivalent pour deploiement parametre
- observability: stack monitoring/logs et regles d'alerte

Documentation deja presente:

- devops/README.md
- devops/observability/README.md

Ce guide est un complement plus detaille, fichier par fichier.

---

## 1) Dossier k8s

### 1.1 Objectif

Le dossier devops/k8s fournit:

- une base reutilisable (manifests communs)
- des overlays dev/staging/prod qui adaptent la base sans la dupliquer

### 1.2 Base commune

Le fichier central est:

- devops/k8s/base/kustomization.yaml

Il reference toutes les briques techniques communes:

- configmap.yaml
- secret.example.yaml
- storage.yaml
- postgres.yaml
- backend-deployment.yaml
- frontend-deployment.yaml
- services.yaml
- ingress.yaml
- hpa.yaml
- rbac.yaml
- networkpolicy.yaml
- resourcequota.yaml
- cert-manager-clusterissuer.yaml

### 1.3 Detail des fichiers de base

1. namespaces.yaml
- Cree les namespaces logiques:
  - agence-dev
  - agence-staging
  - agence-prod
- Ajoute des labels d'environnement.

2. configmap.yaml
- Variables non sensibles de l'application:
  - profile Spring
  - CORS
  - URL datasource
  - URL API frontend

3. secret.example.yaml
- Exemple de secret Kubernetes (template).
- A adapter avec des valeurs reelles avant production.

4. storage.yaml
- Definit un PersistentVolume et un PVC pour PostgreSQL.
- Politique Retain pour eviter la perte de donnees.

5. postgres.yaml
- StatefulSet PostgreSQL + Service interne.
- Probes pg_isready.
- Volume persistent monte dans /var/lib/postgresql/data.

6. backend-deployment.yaml
- Deploie le backend Spring Boot.
- Rolling update zero-downtime: maxUnavailable 0, maxSurge 1.
- Probes startup/liveness/readiness.
- Env charge depuis ConfigMap + Secret.
- Security hardening:
  - runAsNonRoot
  - drop capabilities
  - readOnlyRootFilesystem

7. frontend-deployment.yaml
- Deploie le frontend React/Nginx.
- Probes HTTP sur /.
- Security context similaire au backend.

8. services.yaml
- Service backend en port 8080.
- Service frontend expose en port 80 (target 8080).

9. ingress.yaml
- Routage host-based:
  - frontend: app-*.example.com
  - backend: api-*.example.com
- TLS via cert-manager + ClusterIssuer letsencrypt-prod.

10. hpa.yaml
- Autoscaling backend (CPU + memoire).
- Parametres par defaut: min 2, max 8.

11. rbac.yaml
- ServiceAccount agence-app.
- Role de lecture configmaps/secrets.
- RoleBinding associe.

12. networkpolicy.yaml
- Default deny all (ingress + egress).
- Exception ingress depuis namespace ingress-nginx vers pods web.

13. resourcequota.yaml
- Quotas namespace (CPU, memoire, pods) pour limiter les abus.

14. cert-manager-clusterissuer.yaml
- Configure letsencrypt-prod (ACME HTTP-01 via ingress nginx).

### 1.4 Overlays par environnement

Les overlays sont dans:

- devops/k8s/overlays/dev
- devops/k8s/overlays/staging
- devops/k8s/overlays/prod

Chaque overlay:

- pointe vers ../../base
- applique des patches YAML
- change le namespace cible
- ajuste les tags d'images

#### dev

Fichiers:

- kustomization.yaml
- patch-configmap.yaml
- patch-ingress.yaml

Effet:

- profile dev
- hosts app-dev/api-dev
- TLS agence-dev-tls
- images tag dev-latest

#### staging

Fichiers:

- kustomization.yaml
- patch-configmap.yaml
- patch-ingress.yaml
- patch-replicas.yaml

Effet:

- profile staging
- hosts app-staging/api-staging
- replicas backend/frontend a 2
- images tag staging-latest

#### prod

Fichiers:

- kustomization.yaml
- patch-configmap.yaml
- patch-ingress.yaml
- patch-replicas.yaml
- patch-hpa.yaml

Effet:

- profile prod
- hosts app/api de production
- replicas backend 4, frontend 3
- HPA plus large (min 4, max 12)
- images tag prod-latest

---

## 2) Dossier helm

### 2.1 Objectif

Le dossier devops/helm/agence-platform fournit un chart Helm qui couvre les memes composants que la version Kustomize, mais avec parametrage centralise via values.

### 2.2 Fichiers principaux

1. Chart.yaml
- Metadonnees du chart Helm:
  - nom: agence-platform
  - type: application
  - version chart/app

2. values.yaml
- Valeurs par defaut globales:
  - images backend/frontend
  - replicas
  - probes
  - ressources
  - ingress
  - hpa
  - security context
  - postgres
  - secrets/config

3. values-dev.yaml / values-staging.yaml / values-prod.yaml
- Surcharges par environnement:
  - profile Spring
  - CORS
  - endpoint API
  - replicas
  - hosts ingress
  - secret TLS
  - bornes HPA

### 2.3 Templates Helm

Dossier templates:

- _helpers.tpl
- backend-deployment.yaml
- frontend-deployment.yaml
- postgres.yaml
- services.yaml
- ingress.yaml
- hpa.yaml
- configmap.yaml
- secret.yaml
- serviceaccount.yaml
- rbac.yaml
- networkpolicy.yaml
- resourcequota.yaml

Role:

- Genere les ressources Kubernetes avec des noms et valeurs dynamiques.
- Supporte les differences d'environnements sans multiplier les fichiers manifests.

---

## 3) Dossier observability

### 3.1 Objectif

Le dossier devops/observability installe:

- monitoring metrics: Prometheus + Alertmanager
- visualisation: Grafana
- logs centralises: Loki + Promtail
- alertes metier/techniques: PrometheusRule

### 3.2 Fichiers

1. README.md
- Procedure d'installation des composants observabilite.

2. prometheus-rules.yaml
- Regles d'alerte custom:
  - BackendHigh5xxRate
  - BackendHighLatencyP95

3. helm-values/kube-prometheus-stack-values.yaml
- Parametres du chart kube-prometheus-stack:
  - Grafana active + ingress + TLS
  - Alertmanager active + ingress + TLS
  - selectors Prometheus explicites

4. helm-values/loki-values.yaml
- Parametres Loki/Promtail:
  - loki auth disabled
  - mode singleBinary
  - gateway active
  - promtail pousse vers loki-gateway

5. grafana/dashboards/springboot-overview.json
- Dashboard Grafana preconfigure pour suivre le backend Spring Boot.

---

## 4) Choix d'utilisation: Kustomize ou Helm

1. Kustomize
- Ideal si vous voulez des manifests YAML explicites, lisibles et versionnes tels quels.
- Bon fit pour des patches simples par environnement.

2. Helm
- Ideal si vous voulez une logique de parametrage plus forte et des releases versionnees Helm.
- Bon fit pour CI/CD multi-environnements et rollback Helm.

Le dossier contient les deux approches pour laisser le choix selon le mode operatoire de l'equipe.

---

## 5) Bonnes pratiques recommandees

1. Secrets
- Ne jamais commiter de vrais secrets dans git.
- Utiliser External Secrets, Vault ou SOPS pour la production.

2. Ingress/TLS
- Verifier que cert-manager et ingress-nginx existent avant application.

3. Stockage
- Adapter storage.yaml au provider reel (pas hostPath en cluster managé).

4. Observabilite
- Installer observability dans un namespace dedie.
- Connecter les alertes a un canal incident (email, Slack, PagerDuty).

5. Capacite
- Ajuster requests/limits et HPA selon charge reelle.

---

## 6) Commandes utiles

Kustomize (dev):

- kubectl apply -k devops/k8s/overlays/dev

Helm (dev):

- helm upgrade --install agence-platform ./devops/helm/agence-platform --namespace agence-dev --create-namespace -f devops/helm/agence-platform/values.yaml -f devops/helm/agence-platform/values-dev.yaml

Observabilite:

- kubectl apply -n observability -f devops/observability/prometheus-rules.yaml

---

## 7) Resume final

Le dossier devops est une base complete pour:

- deployer backend/frontend/postgres en Kubernetes
- separer proprement dev/staging/prod
- appliquer des controles securite (RBAC, NetworkPolicy, quota, non-root)
- monitorer metrics/logs/alertes
- choisir entre Kustomize et Helm selon les preferences d'exploitation
