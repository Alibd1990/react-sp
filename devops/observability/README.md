# Observabilite

## Installation Prometheus + Grafana + Alertmanager

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  -n observability --create-namespace \
  -f devops/observability/helm-values/kube-prometheus-stack-values.yaml
kubectl apply -n observability -f devops/observability/prometheus-rules.yaml
```

## Installation Loki + Promtail

```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
helm upgrade --install loki grafana/loki -n observability -f devops/observability/helm-values/loki-values.yaml
helm upgrade --install promtail grafana/promtail -n observability -f devops/observability/helm-values/loki-values.yaml
```

## Logs disponibles

- Logs Spring Boot: namespace agence-* pod backend
- Logs React/Nginx: namespace agence-* pod frontend
- Logs Kubernetes: via Promtail DaemonSet

## Dashboard

Importer le fichier devops/observability/grafana/dashboards/springboot-overview.json dans Grafana.
