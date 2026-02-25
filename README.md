# Nexu

OpenClaw 多租户平台 — 让用户创建自己的 AI Bot，一键连接 Slack / 飞书等 IM。

## 架构

```
用户浏览器 → Dashboard (React)
                ↓
          Control Plane (NestJS)  ←→  PostgreSQL / Redis
                ↓
          Webhook Router  →  Gateway Pool Pods (OpenClaw)
                                    ↓
                              Slack / 飞书 API
```

**核心思路**：利用 OpenClaw 原生多 Agent + 多 Account + Bindings 路由，一个 Gateway 进程通过配置服务多个用户的 Bot，无需改 OpenClaw 核心代码。

## 目录结构

```
nexu/
├── docs/                    # 技术方案、设计文档
│   └── designs/             # 架构设计
├── experiments/             # 验证实验脚本和结果
├── apps/
│   ├── control-plane/       # NestJS 控制面微服务
│   └── dashboard/           # React 管理前端
├── packages/
│   └── shared/              # 共享类型/工具
└── deploy/
    └── k8s/                 # K8s 部署配置
```

## 相关仓库

- [agent-digital-cowork](https://github.com/refly-ai/agent-digital-cowork) — 产品规划、Spec、原型
- [openclaw](https://github.com/openclaw/openclaw) — 上游 OpenClaw 项目
- [refly-infra](https://github.com/refly-ai/refly-infra) — 基础设施（EKS / RDS / Redis / ArgoCD）

## 技术栈

- **Control Plane**: NestJS + Prisma + BullMQ
- **Dashboard**: React + Ant Design
- **Gateway Runtime**: OpenClaw (多 Agent 共享进程模式)
- **Channels**: Slack (共享 App + OAuth) + 飞书 (内置插件)
- **基础设施**: AWS EKS / RDS PostgreSQL / ElastiCache Redis / S3
