# K8s 部署配置

Gateway Pool Pod、Webhook Router、Control Plane 的 K8s 部署清单。

## 组件

- `control-plane/` — Control Plane Deployment (2 replicas)
- `webhook-router/` — Webhook Router Deployment (3 replicas, always-on)
- `gateway-pool/` — Gateway Pool Deployment + HPA + EFS PVC
- `secrets/` — ExternalSecret 定义 (AWS Secrets Manager)

## 部署

```bash
# TODO: 待配置
kubectl apply -k overlays/prod/
```
