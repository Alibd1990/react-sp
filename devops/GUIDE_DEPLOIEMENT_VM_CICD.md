# Guide complet VM: dev, staging, prod avec K8s, Helm, Observability et GitHub CI/CD

Ce guide explique le deploiement pas a pas sur VM locale ou reseau prive.

## 1. Prerequis

Sur la VM:

- Docker (optionnel pour build local)
- Kubernetes (k3s, microk8s, ou cluster externe)
- kubectl
- Helm
- Git

Verification rapide:

```bash
docker --version
kubectl version --client
helm version
git --version
```

## 2. Recuperer le projet

```bash
git clone <votre-repo>
cd react-sp
```

## 3. URLs et DNS pour la VM

Le repo est configure avec:

- frontend: http://app.192.168.56.8.nip.io
- backend: http://api.192.168.56.8.nip.io

Si votre IP VM est differente, remplacez 192.168.56.8 partout dans:

- devops/k8s/base/configmap.yaml
- devops/k8s/base/ingress.yaml
- devops/k8s/overlays/dev/*
- devops/k8s/overlays/staging/*
- devops/k8s/overlays/prod/*
- devops/helm/agence-platform/values*.yaml

## 4. Installer NGINX Ingress Controller

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
kubectl -n ingress-nginx get pods
```

Attendre que les pods soient Running.

## 5. Option TLS (cert-manager)

### Cas A: VM locale/privee (recommande pour test)

Utiliser HTTP seulement:

- Ne pas forcer LetsEncrypt
- Laisser les URLs en http://

### Cas B: environnement public

Installer cert-manager:

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.15.3/cert-manager.yaml
kubectl -n cert-manager get pods
```

Puis appliquer ClusterIssuer du projet:

```bash
kubectl apply -f devops/k8s/base/cert-manager-clusterissuer.yaml
```

## 6. Initialiser les namespaces

```bash
kubectl apply -f devops/k8s/base/namespaces.yaml
kubectl get ns | grep agence-
```

## 7. Secrets applicatifs

Le fichier exemple est:

- devops/k8s/base/secret.example.yaml

Adaptez les mots de passe et JWT, puis appliquez par namespace.

Option simple (copie du fichier puis apply via overlays/base):

```bash
kubectl apply -n agence-dev -f devops/k8s/base/secret.example.yaml
kubectl apply -n agence-staging -f devops/k8s/base/secret.example.yaml
kubectl apply -n agence-prod -f devops/k8s/base/secret.example.yaml
```

## 8. Deploiement avec Kustomize

### 8.1 Dev

```bash
kubectl apply -k devops/k8s/overlays/dev
kubectl -n agence-dev get all
kubectl -n agence-dev get ingress
```

### 8.2 Staging

```bash
kubectl apply -k devops/k8s/overlays/staging
kubectl -n agence-staging get all
kubectl -n agence-staging get ingress
```

### 8.3 Prod

```bash
kubectl apply -k devops/k8s/overlays/prod
kubectl -n agence-prod get all
kubectl -n agence-prod get ingress
```

## 9. Deploiement avec Helm

Le chart est dans:

- devops/helm/agence-platform

### 9.1 Lint

```bash
cd devops/helm/agence-platform
helm lint .
cd ../../..
```

### 9.2 Dev

```bash
helm upgrade --install agence-platform ./devops/helm/agence-platform \
  --namespace agence-dev --create-namespace \
  -f devops/helm/agence-platform/values.yaml \
  -f devops/helm/agence-platform/values-dev.yaml \
  --wait --timeout 10m
```

### 9.3 Staging

```bash
helm upgrade --install agence-platform ./devops/helm/agence-platform \
  --namespace agence-staging --create-namespace \
  -f devops/helm/agence-platform/values.yaml \
  -f devops/helm/agence-platform/values-staging.yaml \
  --wait --timeout 10m
```

### 9.4 Prod

```bash
helm upgrade --install agence-platform ./devops/helm/agence-platform \
  --namespace agence-prod --create-namespace \
  -f devops/helm/agence-platform/values.yaml \
  -f devops/helm/agence-platform/values-prod.yaml \
  --wait --timeout 10m
```

## 10. Verification applicative

Verifier l etat:

```bash
kubectl -n agence-dev get pods,svc,ingress
kubectl -n agence-staging get pods,svc,ingress
kubectl -n agence-prod get pods,svc,ingress
```

Tests HTTP:

- Frontend: http://app.192.168.56.8.nip.io
- Backend health: http://api.192.168.56.8.nip.io/actuator/health

## 11. Observability (Prometheus, Grafana, Alertmanager, Loki)

### 11.1 Installer kube-prometheus-stack

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  -n observability --create-namespace \
  -f devops/observability/helm-values/kube-prometheus-stack-values.yaml
kubectl apply -n observability -f devops/observability/prometheus-rules.yaml
```

### 11.2 Installer Loki + Promtail

```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
helm upgrade --install loki grafana/loki -n observability -f devops/observability/helm-values/loki-values.yaml
helm upgrade --install promtail grafana/promtail -n observability -f devops/observability/helm-values/loki-values.yaml
```

### 11.3 Import dashboard Grafana

Importer:

- devops/observability/grafana/dashboards/springboot-overview.json

## 12. GitHub CI/CD (automatique)

Pipeline utilise:

- .github/workflows/ci-cd.yml

Branches:

- develop -> deploy dev
- staging -> deploy staging
- main -> deploy prod

### 12.1 Configurer GitHub Environments

Creer:

- development
- staging
- production

Option recommandee:

- activation d approbation manuelle sur production

### 12.2 Configurer les secrets GitHub

Secrets obligatoires:

- KUBECONFIG_DEV
- KUBECONFIG_STAGING
- KUBECONFIG_PROD

Secrets optionnels (analyse Sonar):

- SONAR_TOKEN
- SONAR_HOST_URL

### 12.3 Generer KUBECONFIG en base64

Depuis la machine qui possede acces cluster:

```bash
base64 -w 0 ~/.kube/config
```

Copier la sortie dans le secret GitHub correspondant.

## 13. CI/CD end-to-end test

1. Push sur develop.
2. Verifier job GitHub Actions: build, test, trivy, docker push, deploy-dev.
3. Controler namespace agence-dev.
4. Refaire sur staging puis main.

## 14. Rollback

### Helm

```bash
helm history agence-platform -n agence-prod
helm rollback agence-platform <REVISION> -n agence-prod
```

### Kubernetes

```bash
kubectl rollout history deployment/agence-platform-backend -n agence-prod
kubectl rollout undo deployment/agence-platform-backend -n agence-prod
```

## 15. Depannage rapide

1. Pod CrashLoopBackOff:
- kubectl logs -n <ns> <pod>
- verifier secrets/configmap

2. Ingress KO:
- kubectl -n ingress-nginx get pods
- kubectl -n <ns> describe ingress

3. Certificat non emis:
- verifier cert-manager pods
- verifier DNS public (si LetsEncrypt)

4. CI deploy echoue:
- verifier secrets KUBECONFIG_*
- verifier acces cluster depuis runner

## 16. Bonnes pratiques

- Utiliser des secrets differents par environnement.
- Ne pas reutiliser les memes mots de passe dev/prod.
- Garder HPA et resources limites pour stabilite.
- Ajouter sauvegarde PostgreSQL avant production.

## 17. Sequence recommandee

1. VM + K8s + ingress ok
2. Deploiement dev (Kustomize ou Helm)
3. Observability
4. CI/CD develop
5. staging
6. prod avec approbation manuelle
