import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, Loader2, Pause, Play, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import "@/lib/api";
import {
  getV1Bots,
  getV1Models,
  patchV1BotsByBotId,
  postV1BotsByBotIdPause,
  postV1BotsByBotIdResume,
} from "../../lib/api/sdk.gen";

export function BotConfigPage() {
  const queryClient = useQueryClient();

  const { data: botsData, isLoading: botsLoading } = useQuery({
    queryKey: ["bots"],
    queryFn: async () => {
      const { data } = await getV1Bots();
      return data;
    },
  });

  const { data: modelsData } = useQuery({
    queryKey: ["models"],
    queryFn: async () => {
      const { data } = await getV1Models();
      return data;
    },
  });

  const bot = botsData?.bots?.[0];
  const models = modelsData?.models ?? [];

  const [modelId, setModelId] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");

  useEffect(() => {
    if (bot) {
      setModelId(bot.modelId ?? "");
      setSystemPrompt(bot.systemPrompt ?? "");
    }
  }, [bot]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!bot) return;
      const { error } = await patchV1BotsByBotId({
        path: { botId: bot.id },
        body: { modelId, systemPrompt },
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      toast.success("Bot configuration saved");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const pauseMutation = useMutation({
    mutationFn: async () => {
      if (!bot) return;
      const { error } = await postV1BotsByBotIdPause({
        path: { botId: bot.id },
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      toast.success("Bot paused");
    },
  });

  const resumeMutation = useMutation({
    mutationFn: async () => {
      if (!bot) return;
      const { error } = await postV1BotsByBotIdResume({
        path: { botId: bot.id },
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      toast.success("Bot resumed");
    },
  });

  if (botsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Bot className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">
          No bot found. Please contact support.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{bot.name}</h1>
          <p className="text-muted-foreground">Configure your bot</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={bot.status === "active" ? "success" : "warning"}>
            {bot.status}
          </Badge>
          {bot.status === "active" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => pauseMutation.mutate()}
              disabled={pauseMutation.isPending}
            >
              <Pause className="mr-1 h-3 w-3" />
              Pause
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => resumeMutation.mutate()}
              disabled={resumeMutation.isPending}
            >
              <Play className="mr-1 h-3 w-3" />
              Resume
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Model & Prompt</CardTitle>
          <CardDescription>
            Choose the AI model and customize the system prompt for your bot.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Model</Label>
            <Select value={modelId} onValueChange={setModelId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    <div className="flex items-center gap-2">
                      <span>{m.name}</span>
                      {m.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          default
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {models.find((m) => m.id === modelId)?.description && (
              <p className="text-xs text-muted-foreground">
                {models.find((m) => m.id === modelId)?.description}
              </p>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>System Prompt</Label>
            <Textarea
              placeholder="You are a helpful assistant..."
              rows={6}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              This prompt defines your bot&apos;s personality and behavior.
            </p>
          </div>

          <Button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
