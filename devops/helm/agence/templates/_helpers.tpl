{{- define "agence.labels" -}}
app.kubernetes.io/part-of: agence-location
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}
