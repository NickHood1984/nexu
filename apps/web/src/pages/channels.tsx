import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Copy,
  ExternalLink,
  HelpCircle,
  Key,
  Link2,
  Loader2,
  RefreshCw,
  RotateCcw,
  Shield,
  Smartphone,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import "@/lib/api";
import {
  deleteV1ChannelsByChannelId,
  getV1Channels,
  getV1ChannelsSlackOauthUrl,
  postV1ChannelsDiscordConnect,
  postV1ChannelsSlackConnect,
} from "../../lib/api/sdk.gen";

type Platform = "slack" | "discord" | "whatsapp";

const PLATFORMS: { id: Platform; emoji: string; desc: string }[] = [
  { id: "slack", emoji: "#", desc: "Workspace Bot" },
  { id: "discord", emoji: "🎮", desc: "Server Bot" },
  { id: "whatsapp", emoji: "💬", desc: "Business API" },
];

const PLATFORM_LABELS: Record<Platform, string> = {
  slack: "Slack",
  discord: "Discord",
  whatsapp: "WhatsApp",
};

type DetailItem = string | { text: string; url: string };

interface StepDef {
  step: number;
  title: string;
  desc: string;
  detail?: DetailItem[];
  copyable?: string;
  hasInputs?: boolean;
}

const DISCORD_STEPS: StepDef[] = [
  {
    step: 1,
    title: "Create Discord Application",
    desc: "Go to Discord Developer Portal and create a new application.",
    detail: [
      { text: "Discord Developer Portal", url: "https://discord.com/developers/applications" },
      '点击「New Application」',
      "填写 App Name: Nexu",
      "保存并进入 Bot 页面",
    ],
  },
  {
    step: 2,
    title: "配置 Bot 权限",
    desc: "在 Bot 页面开启 Privileged Gateway Intents。",
    detail: [
      "进入 Application → Bot",
      "开启以下 Intents：",
      "  · MESSAGE CONTENT INTENT — 读取消息内容",
      "  · SERVER MEMBERS INTENT — 读取成员信息",
    ],
  },
  {
    step: 3,
    title: "填入凭证",
    desc: "将 Discord Application 的 Bot Token 和 Application ID 填入下方。",
    hasInputs: true,
  },
  {
    step: 4,
    title: "邀请并测试",
    desc: "用 OAuth2 URL 邀请 Bot 到你的 Server，然后 @Nexu 测试。",
    detail: [
      "进入 Application → OAuth2 → URL Generator",
      "勾选 bot scope + Send Messages 权限",
      "复制链接并在浏览器中打开，选择 Server",
      '在频道中发送 "@Nexu 你好" 测试',
    ],
  },
];

const SLACK_STEPS: StepDef[] = [
  {
    step: 1,
    title: "创建 Slack App",
    desc: "前往 Slack API，创建一个新的 App。",
    detail: [
      { text: "Slack API Dashboard", url: "https://api.slack.com/apps" },
      '点击「Create New App」',
      '选择「From scratch」',
      "填写 App Name: Nexu",
      "选择要安装到的 Workspace",
    ],
  },
  {
    step: 2,
    title: "配置 Bot 权限",
    desc: "在 OAuth & Permissions 中添加 Bot Token Scopes。",
    detail: [
      "进入 App → OAuth & Permissions",
      "在 Bot Token Scopes 中添加：",
      "  · chat:write — 发送消息",
      "  · app_mentions:read — 接收 @ 消息",
      "  · files:read — 读取上传的文件",
      "  · channels:history — 读取频道消息",
    ],
  },
  {
    step: 3,
    title: "配置事件订阅",
    desc: "设置 Request URL，让 Slack 将事件转发给 Nexu。",
    detail: [
      "进入 App → Event Subscriptions",
      "开启 Enable Events",
      "Request URL 填写以下地址：",
    ],
    copyable: "/api/slack/events",
  },
  {
    step: 4,
    title: "填入凭证",
    desc: "将 Slack App 的 Bot Token 和 Signing Secret 填入下方。",
    hasInputs: true,
  },
  {
    step: 5,
    title: "安装并测试",
    desc: "安装 App 到 Workspace，然后在频道里 @Nexu 测试。",
    detail: [
      "进入 App → Install App",
      '点击「Install to Workspace」',
      "在任意频道中输入 /invite @Nexu",
      '发送 "@Nexu 你好" 测试',
    ],
  },
];

const WHATSAPP_STEPS: StepDef[] = [
  {
    step: 1,
    title: "Create Meta App",
    desc: "Go to Meta for Developers and create a new Business App.",
    detail: [
      { text: "Meta for Developers", url: "https://developers.facebook.com/apps" },
      '点击「Create App」',
      "选择 Business 类型",
      "填写 App Name: Nexu",
    ],
  },
  {
    step: 2,
    title: "配置 WhatsApp Business API",
    desc: "在 App Dashboard 中添加 WhatsApp 产品。",
    detail: [
      "进入 App → Add Products",
      '选择「WhatsApp」并点击 Set Up',
      "绑定 Business Account",
      "获取测试号码或添加正式号码",
    ],
  },
  {
    step: 3,
    title: "配置 Webhook",
    desc: "设置 Webhook URL，让 WhatsApp 将消息转发给 Nexu。",
    detail: [
      "进入 WhatsApp → Configuration",
      "Callback URL 填写以下地址：",
    ],
    copyable: "/api/whatsapp/webhook",
  },
  {
    step: 4,
    title: "填入凭证",
    desc: "将 WhatsApp Business API 的 Access Token 和 Phone Number ID 填入下方。",
    hasInputs: true,
  },
  {
    step: 5,
    title: "发送测试消息",
    desc: "向测试号码发送消息，验证 Nexu 能正常收发。",
    detail: [
      "进入 WhatsApp → API Setup",
      "使用 Test Number 发送一条消息",
      "在 Nexu 中确认消息已收到",
      '回复 "hello" 测试双向通信',
    ],
  },
];

const STEPS_MAP: Record<Platform, StepDef[]> = {
  slack: SLACK_STEPS,
  discord: DISCORD_STEPS,
  whatsapp: WHATSAPP_STEPS,
};

const CREDENTIAL_FIELDS: Record<
  Platform,
  { label1: string; placeholder1: string; hint1: string; label2: string; placeholder2: string; hint2: string }
> = {
  discord: {
    label1: "Application ID",
    placeholder1: "123456789012345678",
    hint1: "Application → General Information → Application ID",
    label2: "Bot Token",
    placeholder2: "MTxx...",
    hint2: "Application → Bot → Reset Token，复制生成的 Token",
  },
  slack: {
    label1: "Bot User OAuth Token",
    placeholder1: "xoxb-xxxxxxxxxxxxx",
    hint1: "App → OAuth & Permissions → Bot User OAuth Token（以 xoxb- 开头）",
    label2: "Signing Secret",
    placeholder2: "xxxxxxxxxxxxxxxxxxxxxxx",
    hint2: "App → Basic Information → App Credentials → Signing Secret",
  },
  whatsapp: {
    label1: "Access Token",
    placeholder1: "EAAxxxxxxxxxxxxxxx",
    hint1: "App Dashboard → WhatsApp → API Setup → Temporary Access Token",
    label2: "Phone Number ID",
    placeholder2: "xxxxxxxxxxxxx",
    hint2: "App Dashboard → WhatsApp → API Setup → Phone Number ID",
  },
};

// ─── Main page ───────────────────────────────────────────────

export function ChannelsPage() {
  const queryClient = useQueryClient();
  const [platform, setPlatform] = useState<Platform>("slack");
  const [forceGuide, setForceGuide] = useState(false);

  const { data: channelsData } = useQuery({
    queryKey: ["channels"],
    queryFn: async () => {
      const { data } = await getV1Channels();
      return data;
    },
  });

  const channels = channelsData?.channels ?? [];
  const currentChannel = channels.find(
    (ch) => ch.channelType === platform,
  );
  const isConfigured = !!currentChannel;
  const showGuide = !isConfigured || forceGuide;

  const handlePlatformChange = (p: Platform) => {
    setPlatform(p);
    setForceGuide(false);
  };

  return (
    <div className="p-8 mx-auto max-w-4xl">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-lg font-bold text-text-primary">
          Channel 配置
        </h1>
        <p className="text-[13px] text-text-muted mt-1">
          连接你的 IM 平台，让 Nexu 🦞 进驻你的工作频道
        </p>
      </div>

      {/* Platform selector */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {PLATFORMS.map((p) => {
          const isActive = platform === p.id;
          const connected = channels.some(
            (ch) => ch.channelType === p.id,
          );
          return (
            <button
              type="button"
              key={p.id}
              onClick={() => handlePlatformChange(p.id)}
              className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all cursor-pointer ${
                isActive
                  ? "bg-accent/5 border-2 border-accent/40 shadow-sm"
                  : "bg-surface-1 border border-border hover:border-border-hover hover:bg-surface-2"
              }`}
            >
              <div
                className={`flex justify-center items-center w-9 h-9 rounded-lg shrink-0 ${
                  isActive ? "bg-accent/10" : "bg-surface-3"
                }`}
              >
                <span className="text-sm">{p.emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={`text-[13px] font-semibold ${isActive ? "text-accent" : "text-text-primary"}`}
                >
                  {PLATFORM_LABELS[p.id]}
                </div>
                <div className="text-[10px] text-text-muted mt-0.5">
                  {p.desc}
                </div>
              </div>
              {connected ? (
                <CheckCircle2
                  size={14}
                  className="text-emerald-500 shrink-0"
                />
              ) : (
                <Circle
                  size={14}
                  className="text-text-muted/30 shrink-0"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Coming soon */}
      <div className="flex gap-1.5 items-center mb-6 text-[11px] text-text-muted">
        <Zap size={10} className="text-accent" />
        Telegram、Microsoft Teams、Line 等更多平台即将支持
      </div>

      {/* Back button when force-viewing guide for configured platform */}
      {isConfigured && forceGuide && (
        <button
          type="button"
          onClick={() => setForceGuide(false)}
          className="flex gap-1.5 items-center mb-5 text-[12px] text-accent font-medium hover:underline underline-offset-2"
        >
          <ArrowLeft size={13} /> 返回配置
        </button>
      )}

      {/* Content */}
      {showGuide ? (
        platform === "whatsapp" ? (
          <WhatsAppQRView />
        ) : (
          <SetupGuideView
            platform={platform}
            queryClient={queryClient}
          />
        )
      ) : (
        <ConfiguredView
          platform={platform}
          channel={currentChannel!}
          queryClient={queryClient}
          onShowGuide={() => setForceGuide(true)}
        />
      )}
    </div>
  );
}

// ─── Credential Field with hint tooltip ──────────────────────

function CredentialField({
  label,
  hint,
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  hint: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label className="text-[11px] text-text-muted font-medium">
          {label}
        </Label>
        <div className="relative group">
          <HelpCircle
            size={12}
            className="text-text-muted/50 hover:text-text-secondary cursor-help transition-colors"
          />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-3 py-2 rounded-lg bg-[#1a1a1a] text-white text-[11px] leading-relaxed whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg z-30">
            {hint}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-[#1a1a1a]" />
          </div>
        </div>
      </div>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-[13px]"
      />
    </div>
  );
}

// ─── Setup Guide ─────────────────────────────────────────────

function SetupGuideView({
  platform,
  queryClient,
}: {
  platform: Platform;
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const steps = STEPS_MAP[platform];
  const activeStep = steps[currentStep]!;
  const fields = CREDENTIAL_FIELDS[platform];

  // Credential state
  const [field1, setField1] = useState("");
  const [field2, setField2] = useState("");


  const [oauthLoading, setOauthLoading] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Discord connect
  const discordConnect = useMutation({
    mutationFn: async () => {
      const { data, error } = await postV1ChannelsDiscordConnect({
        body: { botToken: field2, appId: field1 },
      });
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast.success("Discord connected!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Slack manual connect
  const slackConnect = useMutation({
    mutationFn: async () => {
      const { data, error } = await postV1ChannelsSlackConnect({
        body: {
          botToken: field1,
          signingSecret: field2,
        },
      });
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast.success("Slack connected!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSlackOAuth = async () => {
    setOauthLoading(true);
    try {
      const { data, error } = await getV1ChannelsSlackOauthUrl();
      if (error) {
        toast.error(error.message ?? "Failed to get Slack OAuth URL");
        return;
      }
      if (data?.url) window.location.href = data.url;
    } catch {
      toast.error("Failed to start Slack connection");
    } finally {
      setOauthLoading(false);
    }
  };

  const handleFinish = () => {
    if (platform === "discord") discordConnect.mutate();
    else if (platform === "slack") slackConnect.mutate();
  };

  const isPending =
    discordConnect.isPending || slackConnect.isPending;

  return (
    <div className="flex gap-6">
      {/* Steps sidebar */}
      <div className="w-52 shrink-0">
        <div className="p-4 rounded-xl border bg-surface-1 border-border">
          <div className="text-[11px] text-text-muted font-medium mb-3 flex items-center justify-between">
            <span>配置步骤</span>
            <span className="text-accent">约 3 分钟</span>
          </div>
          <div className="space-y-0.5">
            {steps.map((s, i) => (
              <button
                type="button"
                key={s.step}
                onClick={() => setCurrentStep(i)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all cursor-pointer ${
                  i === currentStep
                    ? "bg-accent/10 text-accent"
                    : i < currentStep
                      ? "text-text-secondary hover:bg-surface-3"
                      : "text-text-muted hover:bg-surface-3"
                }`}
              >
                <div
                  className={`w-[22px] h-[22px] rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    i < currentStep
                      ? "bg-accent text-white"
                      : i === currentStep
                        ? "bg-accent/15 text-accent"
                        : "bg-surface-3 text-text-muted"
                  }`}
                >
                  {i < currentStep ? (
                    <Check size={11} />
                  ) : (
                    s.step
                  )}
                </div>
                <span className="text-[12px] font-medium truncate">
                  {s.title}
                </span>
              </button>
            ))}
          </div>

          {/* Slack OAuth shortcut */}
          {platform === "slack" && (
            <div className="mt-4 pt-3 border-t border-border">
              <Button
                className="w-full text-[12px]"
                size="sm"
                onClick={handleSlackOAuth}
                disabled={oauthLoading}
              >
                {oauthLoading ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : null}
                一键 OAuth 安装
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 min-w-0">
        <div className="p-6 rounded-xl border bg-surface-1 border-border">
          <div className="flex gap-3 items-start mb-5">
            <div className="flex justify-center items-center w-9 h-9 rounded-lg shrink-0 bg-accent/10">
              <span className="text-sm font-bold text-accent">
                {activeStep.step}
              </span>
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-text-primary">
                {activeStep.title}
              </h3>
              <p className="mt-1 text-[13px] text-text-muted leading-relaxed">
                {activeStep.desc}
              </p>
            </div>
          </div>

          {activeStep.detail && (
            <div className="ml-12 space-y-2 mb-5">
              {activeStep.detail.map((d, i) => {
                if (typeof d === "object") {
                  return (
                    <div
                      key={i}
                      className="text-[13px] text-text-secondary leading-relaxed"
                    >
                      <span className="flex gap-2.5 items-start">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent/40 shrink-0" />
                        <span>
                          打开{" "}
                          <a
                            href={d.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline underline-offset-2"
                          >
                            {d.text} ↗
                          </a>
                        </span>
                      </span>
                    </div>
                  );
                }
                return (
                  <div
                    key={i}
                    className="text-[13px] text-text-secondary leading-relaxed"
                  >
                    {d.startsWith("  ") ? (
                      <span className="ml-4 text-text-muted font-mono text-[12px]">
                        {d.trim()}
                      </span>
                    ) : (
                      <span className="flex gap-2.5 items-start">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent/40 shrink-0" />
                        {d}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeStep.copyable && (() => {
            const fullUrl = activeStep.copyable!.startsWith("/")
              ? `${window.location.origin}${activeStep.copyable}`
              : activeStep.copyable!;
            return (
            <div className="mb-5 ml-12">
              <div className="flex gap-2 items-center p-3 rounded-lg border bg-surface-0 border-border font-mono text-[12px]">
                <code className="flex-1 break-all text-text-secondary">
                  {fullUrl}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopy(fullUrl)}
                  className="p-1.5 rounded-lg transition-all text-text-muted hover:text-text-primary hover:bg-surface-3 shrink-0"
                  title="复制"
                >
                  {copied ? (
                    <Check
                      size={13}
                      className="text-emerald-500"
                    />
                  ) : (
                    <Copy size={13} />
                  )}
                </button>
              </div>
            </div>
            );
          })()}

          {activeStep.hasInputs && (
            <div className="mb-5 ml-12 space-y-3">
              <CredentialField
                label={fields.label1}
                hint={fields.hint1}
                placeholder={fields.placeholder1}
                value={field1}
                onChange={setField1}
              />
              <CredentialField
                label={fields.label2}
                hint={fields.hint2}
                placeholder={fields.placeholder2}
                type="password"
                value={field2}
                onChange={setField2}
              />
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4 mt-2 border-t border-border">
            <button
              type="button"
              onClick={() =>
                setCurrentStep(Math.max(0, currentStep - 1))
              }
              disabled={currentStep === 0}
              className="px-4 py-2 text-[12px] font-medium text-text-secondary rounded-lg border border-border hover:border-border-hover hover:bg-surface-3 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              上一步
            </button>
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex gap-1 items-center px-5 py-2 text-[12px] font-medium text-white rounded-lg transition-all bg-accent hover:bg-accent-hover"
              >
                下一步 <ChevronRight size={13} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={isPending}
                className="flex gap-1 items-center px-5 py-2 text-[12px] font-medium text-white rounded-lg transition-all bg-accent hover:bg-accent-hover disabled:opacity-60"
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check size={13} />
                )}
                完成配置
              </button>
            )}
          </div>
        </div>

        {/* Help tip */}
        <div className="flex gap-3 items-center p-4 mt-4 rounded-xl border bg-surface-1 border-border">
          <AlertCircle size={15} className="text-accent shrink-0" />
          <div className="text-[12px] text-text-muted leading-relaxed">
            <span className="font-medium text-text-secondary">
              需要帮助？
            </span>{" "}
            查看{" "}
            <a
              href="https://docs.nexu.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline underline-offset-2"
            >
              完整文档
            </a>{" "}
            或在{" "}
            <a
              href="https://discord.gg/nexu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline underline-offset-2"
            >
              Discord
            </a>{" "}
            里找我们。
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Configured View ─────────────────────────────────────────

function ConfiguredView({
  platform,
  channel,
  queryClient,
  onShowGuide,
}: {
  platform: Platform;
  channel: {
    id: string;
    accountId: string;
    teamName: string | null;
    appId?: string | null;
    status: string;
    createdAt?: string | null;
  };
  queryClient: ReturnType<typeof useQueryClient>;
  onShowGuide: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const { error } = await deleteV1ChannelsByChannelId({
        path: { channelId: channel.id },
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast.success(`${PLATFORM_LABELS[platform]} disconnected`);
    },
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const webhookUrl = `${window.location.origin}/api/${platform}/events`;
  const discordInviteUrl = channel.appId
    ? `https://discord.com/oauth2/authorize?client_id=${channel.appId}&scope=bot&permissions=68608`
    : null;

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Status banner */}
      <div className="flex gap-3 items-center p-4 rounded-xl border bg-emerald-500/5 border-emerald-500/15">
        <div className="flex justify-center items-center w-9 h-9 rounded-lg bg-emerald-500/10 shrink-0">
          <CheckCircle2 size={18} className="text-emerald-500" />
        </div>
        <div className="flex-1">
          <div className="text-[13px] font-semibold text-text-primary">
            {PLATFORM_LABELS[platform]} Bot 已连接
          </div>
          <div className="text-[11px] text-text-muted mt-0.5">
            {channel.teamName ?? channel.accountId}
            {channel.createdAt &&
              ` · 配置于 ${new Date(channel.createdAt).toLocaleDateString()}`}
            {" · "}连接正常
          </div>
        </div>
        <button
          type="button"
          onClick={onShowGuide}
          className="flex gap-1.5 items-center px-3 py-1.5 text-[11px] text-text-muted rounded-lg border border-border hover:border-border-hover hover:text-text-secondary transition-all shrink-0"
        >
          <BookOpen size={11} /> 配置流程
        </button>
      </div>

      {/* Discord: Add Bot to Server */}
      {platform === "discord" && discordInviteUrl && (
        <div className="p-5 rounded-xl border bg-surface-1 border-border">
          <div className="flex gap-2 items-center mb-4">
            <div className="flex justify-center items-center w-7 h-7 rounded-lg bg-indigo-500/10 shrink-0">
              <ExternalLink size={13} className="text-indigo-500" />
            </div>
            <h3 className="text-[13px] font-semibold text-text-primary">
              添加到 Server
            </h3>
          </div>
          <p className="text-[12px] text-text-muted mb-3 leading-relaxed">
            使用以下链接将 Bot 邀请到你的 Discord Server。
          </p>
          <a
            href={discordInviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex gap-1.5 items-center px-4 py-2 text-[12px] font-medium text-white rounded-lg bg-accent hover:bg-accent-hover transition-all"
          >
            <ExternalLink size={13} /> Add Bot to Server
          </a>
        </div>
      )}

      {/* Slack: Webhook URL */}
      {platform === "slack" && (
        <div className="p-5 rounded-xl border bg-surface-1 border-border">
          <div className="flex gap-2 items-center mb-4">
            <div className="flex justify-center items-center w-7 h-7 rounded-lg bg-blue-500/10 shrink-0">
              <Link2 size={13} className="text-blue-500" />
            </div>
            <h3 className="text-[13px] font-semibold text-text-primary">
              Webhook URL
            </h3>
          </div>
          <div className="flex gap-2 items-center p-3 rounded-lg border bg-surface-0 border-border font-mono text-[12px]">
            <code className="flex-1 break-all text-text-secondary">
              {webhookUrl}
            </code>
            <button
              type="button"
              onClick={() => handleCopy(webhookUrl)}
              className="p-1.5 rounded-lg transition-all text-text-muted hover:text-text-primary hover:bg-surface-3 shrink-0"
              title="复制"
            >
              {copied ? (
                <Check size={13} className="text-emerald-500" />
              ) : (
                <Copy size={13} />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Credentials */}
      <div className="p-5 rounded-xl border bg-surface-1 border-border">
        <div className="flex gap-2 items-center mb-4">
          <div className="flex justify-center items-center w-7 h-7 rounded-lg bg-amber-500/10 shrink-0">
            <Key size={13} className="text-amber-500" />
          </div>
          <h3 className="text-[13px] font-semibold text-text-primary">
            凭证信息
          </h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-[11px] text-text-muted font-medium mb-1.5 block">
              Account ID
            </label>
            <div className="px-3 py-2.5 w-full text-[13px] rounded-lg border border-border bg-surface-0 text-text-secondary">
              {channel.accountId}
            </div>
          </div>
          {channel.teamName && (
            <div>
              <label className="text-[11px] text-text-muted font-medium mb-1.5 block">
                {platform === "discord" ? "Server Name" : "Team Name"}
              </label>
              <div className="px-3 py-2.5 w-full text-[13px] rounded-lg border border-border bg-surface-0 text-text-secondary">
                {channel.teamName}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Danger zone */}
      <div className="p-5 rounded-xl border border-border bg-surface-1">
        <div className="flex gap-2 items-center mb-3">
          <div className="flex justify-center items-center w-7 h-7 rounded-lg bg-red-500/10 shrink-0">
            <Shield size={13} className="text-red-400" />
          </div>
          <h3 className="text-[13px] font-semibold text-text-primary">
            重置配置
          </h3>
        </div>
        <p className="text-[12px] text-text-muted mb-3.5 leading-relaxed">
          重置将清除当前 {PLATFORM_LABELS[platform]} Bot
          的所有配置，需要重新完成配置流程。
        </p>
        <button
          type="button"
          onClick={() => disconnectMutation.mutate()}
          disabled={disconnectMutation.isPending}
          className="flex gap-1.5 items-center px-3.5 py-2 text-[12px] font-medium text-red-500 rounded-lg border border-red-500/20 hover:bg-red-500/5 hover:border-red-500/30 transition-all disabled:opacity-60"
        >
          {disconnectMutation.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RotateCcw size={12} />
          )}
          重置并重新配置
        </button>
      </div>
    </div>
  );
}

// ─── WhatsApp QR placeholder ─────────────────────────────────

function WhatsAppQRView() {
  return (
    <div className="max-w-md mx-auto">
      <div className="p-8 rounded-xl border bg-surface-1 border-border text-center">
        <div className="flex justify-center items-center w-12 h-12 rounded-xl bg-emerald-500/10 mx-auto mb-5">
          <Smartphone size={22} className="text-emerald-500" />
        </div>
        <h3 className="text-[15px] font-semibold text-text-primary mb-1">
          WhatsApp 即将支持
        </h3>
        <p className="text-[12px] text-text-muted mb-6 leading-relaxed">
          WhatsApp Business API 集成正在开发中，敬请期待。
        </p>
      </div>

      <div className="flex gap-3 items-center p-4 mt-4 rounded-xl border bg-surface-1 border-border">
        <AlertCircle size={15} className="text-accent shrink-0" />
        <div className="text-[12px] text-text-muted leading-relaxed">
          <span className="font-medium text-text-secondary">
            需要帮助？
          </span>{" "}
          查看{" "}
          <a
            href="https://docs.nexu.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline underline-offset-2"
          >
            完整文档
          </a>{" "}
          或在{" "}
          <a
            href="https://discord.gg/nexu"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline underline-offset-2"
          >
            Discord
          </a>{" "}
          里找我们。
        </div>
      </div>
    </div>
  );
}
