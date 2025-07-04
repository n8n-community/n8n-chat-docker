# Kubernetes Deployment Guide

This directory contains Kubernetes manifests for deploying the n8n chat container in a Kubernetes cluster.

## 📁 Files Overview

| File | Description |
|------|-------------|
| `namespace.yaml` | Creates a dedicated namespace for the chat application |
| `configmap.yaml` | Configuration for environment variables |
| `secret.yaml` | Secure storage for sensitive data like webhook URLs |
| `deployment.yaml` | Main application deployment with 2 replicas |
| `service.yaml` | ClusterIP service to expose the application internally |
| `ingress.yaml` | Ingress configuration for external access with SSL |

## 🚀 Quick Start

### Prerequisites

- Kubernetes cluster (v1.20+)
- `kubectl` configured to access your cluster
- Ingress controller (like NGINX Ingress Controller)
- Cert-manager for SSL certificates (optional)

### Basic Deployment

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ppyly-org/n8n-chat-docker.git
   cd n8n-chat-docker/k8s
   ```

2. **Configure your settings:**
   ```bash
   # Edit the ConfigMap with your n8n webhook URL and chat settings
   kubectl edit configmap/n8n-chat-config
   
   # Or edit the file directly
   nano configmap.yaml
   ```

3. **Deploy everything:**
   ```bash
   # Create namespace first
   kubectl apply -f namespace.yaml
   
   # Deploy all resources
   kubectl apply -f . -n n8n-chat
   ```

4. **Verify deployment:**
   ```bash
   kubectl get all -n n8n-chat
   ```

### Step-by-Step Deployment

1. **Create namespace:**
   ```bash
   kubectl apply -f namespace.yaml
   ```

2. **Configure settings:**
   ```bash
   # Edit configmap.yaml and update:
   # - webhook-url: Your n8n webhook URL
   # - chat-title: Your chat title
   # - chat-subtitle: Your chat subtitle
   # - initial-messages: Welcome messages
   
   kubectl apply -f configmap.yaml -n n8n-chat
   ```

3. **Deploy the application:**
   ```bash
   kubectl apply -f deployment.yaml -n n8n-chat
   kubectl apply -f service.yaml -n n8n-chat
   ```

4. **Set up external access (choose one):**

   **Option A: Using Ingress (Recommended)**
   ```bash
   # Edit ingress.yaml and update the host to your domain
   kubectl apply -f ingress.yaml -n n8n-chat
   ```

   **Option B: Using Port Forward (Development)**
   ```bash
   kubectl port-forward service/n8n-chat-service 3000:80 -n n8n-chat
   # Access at http://localhost:3000
   ```

   **Option C: Using LoadBalancer**
   ```bash
   # Change service type to LoadBalancer in service.yaml
   kubectl patch service n8n-chat-service -p '{"spec":{"type":"LoadBalancer"}}' -n n8n-chat
   ```

## ⚙️ Configuration

### Environment Variables

The application is configured using a ConfigMap. Update `configmap.yaml` with your settings:

```yaml
data:
  webhook-url: "https://your-n8n-instance.com/webhook/your-webhook-id"
  chat-title: "Customer Support"
  chat-subtitle: "We're here to help"
  initial-messages: "Welcome! 👋, How can I assist you today?, Feel free to ask anything"
```

### Secure Configuration with Secrets

For sensitive data like webhook URLs, use secrets instead of ConfigMaps:

1. **Create a secret:**
   ```bash
   kubectl create secret generic n8n-chat-secrets \
     --from-literal=webhook-url="https://your-n8n-instance.com/webhook/your-webhook-id" \
     -n n8n-chat
   ```

2. **Update deployment to use secrets:**
   ```yaml
   env:
   - name: WEBHOOK_URL
     valueFrom:
       secretKeyRef:
         name: n8n-chat-secrets
         key: webhook-url
   ```

### Resource Configuration

The deployment includes resource requests and limits:

```yaml
resources:
  requests:
    memory: "64Mi"
    cpu: "50m"
  limits:
    memory: "128Mi"
    cpu: "200m"
```

Adjust based on your requirements:
- **Small load**: Keep defaults
- **Medium load**: Double the values
- **High load**: Increase limits and replicas manually

## 🌐 Ingress Configuration

### NGINX Ingress Controller

The included `ingress.yaml` is configured for NGINX Ingress Controller:

```yaml
metadata:
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
```

### Traefik Ingress

For Traefik, create this ingress instead:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: n8n-chat-ingress
  annotations:
    traefik.ingress.kubernetes.io/router.entrypoints: websecure
    traefik.ingress.kubernetes.io/router.tls.certresolver: letsencrypt
spec:
  rules:
  - host: chat.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: n8n-chat-service
            port:
              number: 80
```

### Custom Domain Setup

1. **Update ingress.yaml:**
   ```yaml
   spec:
     tls:
     - hosts:
       - chat.yourdomain.com  # Replace with your domain
       secretName: n8n-chat-tls
     rules:
     - host: chat.yourdomain.com  # Replace with your domain
   ```

2. **Configure DNS:**
   Point your domain to your Kubernetes cluster's ingress IP.

3. **SSL Certificate:**
   The ingress uses cert-manager for automatic SSL certificates. Make sure cert-manager is installed.

## 📈 Manual Scaling

### Manual Scaling

```bash
# Scale to 5 replicas
kubectl scale deployment/n8n-chat --replicas=5 -n n8n-chat

# Check scaling status
kubectl get deployment n8n-chat -n n8n-chat
```

## 🔒 Security Features

### Pod Security Context

The deployment runs with security hardening:

```yaml
securityContext:
  allowPrivilegeEscalation: false
  runAsNonRoot: true
  runAsUser: 1001
  runAsGroup: 1001
  readOnlyRootFilesystem: true
  capabilities:
    drop:
    - ALL
```

### Network Policies (Optional)

Create network policies to restrict traffic:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: n8n-chat-netpol
  namespace: n8n-chat
spec:
  podSelector:
    matchLabels:
      app: n8n-chat
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to: []
    ports:
    - protocol: TCP
      port: 443  # HTTPS to n8n
    - protocol: TCP
      port: 53   # DNS
    - protocol: UDP
      port: 53   # DNS
```

## 🔍 Monitoring and Troubleshooting

### Health Checks

The deployment includes readiness and liveness probes:

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

### Common Commands

```bash
# Check pod status
kubectl get pods -n n8n-chat

# View logs
kubectl logs -f deployment/n8n-chat -n n8n-chat

# Describe deployment
kubectl describe deployment n8n-chat -n n8n-chat

# Check events
kubectl get events -n n8n-chat --sort-by='.lastTimestamp'

# Access pod shell
kubectl exec -it deployment/n8n-chat -n n8n-chat -- /bin/sh

# Test health endpoint
kubectl exec -it deployment/n8n-chat -n n8n-chat -- wget -qO- http://localhost:3000/health
```

### Troubleshooting Common Issues

1. **Pods not starting:**
   ```bash
   kubectl describe pod <pod-name> -n n8n-chat
   kubectl logs <pod-name> -n n8n-chat
   ```

2. **Service not accessible:**
   ```bash
   kubectl get endpoints -n n8n-chat
   kubectl port-forward service/n8n-chat-service 3000:80 -n n8n-chat
   ```

3. **Ingress issues:**
   ```bash
   kubectl describe ingress n8n-chat-ingress -n n8n-chat
   kubectl get events -n n8n-chat | grep ingress
   ```

4. **ConfigMap not updated:**
   ```bash
   kubectl rollout restart deployment/n8n-chat -n n8n-chat
   ```

## 🔄 Updates and Rollbacks

### Update Image

```bash
# Update to specific version
kubectl set image deployment/n8n-chat n8n-chat=ghcr.io/ppyly-org/n8n-chat-docker:v1.1.0 -n n8n-chat

# Check rollout status
kubectl rollout status deployment/n8n-chat -n n8n-chat

# View rollout history
kubectl rollout history deployment/n8n-chat -n n8n-chat
```

### Rollback

```bash
# Rollback to previous version
kubectl rollout undo deployment/n8n-chat -n n8n-chat

# Rollback to specific revision
kubectl rollout undo deployment/n8n-chat --to-revision=2 -n n8n-chat
```

## 🧹 Cleanup

### Remove specific resources

```bash
# Remove ingress
kubectl delete -f ingress.yaml -n n8n-chat

# Remove application
kubectl delete -f deployment.yaml -f service.yaml -n n8n-chat
```

### Complete cleanup

```bash
# Delete everything in the namespace
kubectl delete namespace n8n-chat
```

## 🏭 Production Considerations

### Resource Planning

- **CPU**: Start with 50m request, 200m limit per pod
- **Memory**: Start with 64Mi request, 128Mi limit per pod
- **Replicas**: Start with 2, scale based on traffic
- **Storage**: App is stateless, no persistent storage needed

### Backup and Disaster Recovery

- **Configuration**: Store ConfigMaps and Secrets in version control
- **Manifests**: Keep all Kubernetes manifests in Git
- **n8n Instance**: Ensure your n8n instance has proper backup
- **SSL Certificates**: Cert-manager handles automatic renewal

### Monitoring Integration

For production, consider adding:

1. **Prometheus metrics:**
   ```yaml
   annotations:
     prometheus.io/scrape: "true"
     prometheus.io/port: "3000"
     prometheus.io/path: "/metrics"
   ```

2. **Grafana dashboards** for visualization
3. **AlertManager** for notifications
4. **Log aggregation** with ELK or similar

### Multi-Environment Setup

Create separate namespaces for different environments:

```bash
# Development
kubectl apply -f . -n n8n-chat-dev

# Staging  
kubectl apply -f . -n n8n-chat-staging

# Production
kubectl apply -f . -n n8n-chat-prod
```

Each with different ConfigMaps pointing to respective n8n instances.

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- [Cert-Manager](https://cert-manager.io/)

## 🤝 Contributing

Feel free to submit improvements to these Kubernetes manifests. Consider:
- Helm charts for easier deployment
- Kustomize overlays for different environments
- Additional monitoring and logging configurations
- Network policies and security hardening
