# Control Plane

NestJS 控制面微服务。

## 职责

- Bot CRUD（创建/更新/删除用户的 bot）
- Channel 连接管理（Slack OAuth、飞书凭证）
- Gateway 池管理（分配 bot 到 Pod、Config 生成）
- 用量追踪和配额管理

## 技术栈

- NestJS + Prisma + BullMQ
- PostgreSQL + Redis
- AWS KMS（凭证加密）

## 开发

```bash
# TODO: 待初始化
pnpm install
pnpm dev
```
