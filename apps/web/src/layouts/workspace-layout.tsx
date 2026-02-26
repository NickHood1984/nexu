import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Hash,
  LogOut,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import "@/lib/api";
import { getV1Bots, getV1BotsByBotIdChannels } from "../../lib/api/sdk.gen";

export function WorkspaceLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { data: session } = authClient.useSession();

  const { data: botsData } = useQuery({
    queryKey: ["bots"],
    queryFn: async () => {
      const { data } = await getV1Bots();
      return data;
    },
  });

  const botId = botsData?.bots?.[0]?.id;

  const { data: channelsData } = useQuery({
    queryKey: ["channels", botId],
    queryFn: async () => {
      if (!botId) return null;
      const { data } = await getV1BotsByBotIdChannels({
        path: { botId },
      });
      return data;
    },
    enabled: !!botId,
  });

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };

  const channels = channelsData?.channels ?? [];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r bg-muted/30 transition-all",
          collapsed ? "w-16" : "w-64",
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b px-4">
          {!collapsed && (
            <Link to="/" className="text-lg font-bold">
              Nexu
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto p-2">
          {!collapsed && (
            <p className="mb-2 px-2 text-xs font-medium uppercase text-muted-foreground">
              Channels
            </p>
          )}
          {channels.length === 0 && !collapsed && (
            <p className="px-2 text-sm text-muted-foreground">
              No channels connected
            </p>
          )}
          {channels.map((ch) => (
            <div
              key={ch.id}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                "hover:bg-accent",
              )}
            >
              <Hash className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <span className="truncate">{ch.teamName ?? ch.accountId}</span>
              )}
              <span
                className={cn(
                  "ml-auto h-2 w-2 shrink-0 rounded-full",
                  ch.status === "connected" ? "bg-emerald-500" : "bg-gray-300",
                )}
              />
            </div>
          ))}
        </div>

        <Separator />

        {/* Nav */}
        <nav className="p-2">
          <Link
            to="/workspace/channels"
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent",
              location.pathname.includes("/channels") && "bg-accent",
            )}
          >
            <Settings className="h-4 w-4" />
            {!collapsed && "Channel Config"}
          </Link>
          <Link
            to="/workspace/bot"
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent",
              location.pathname.includes("/bot") && "bg-accent",
            )}
          >
            <Bot className="h-4 w-4" />
            {!collapsed && "Bot Config"}
          </Link>
        </nav>

        <Separator />

        {/* User */}
        <div className="flex items-center gap-2 p-3">
          {!collapsed && (
            <span className="flex-1 truncate text-sm text-muted-foreground">
              {session?.user?.email}
            </span>
          )}
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
