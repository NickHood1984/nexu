import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, MessageSquare, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <span className="text-xl font-bold">Nexu</span>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link to="/auth?mode=login">Log in</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Your AI assistant, right in Slack
        </h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Connect your team's Slack or Discord to a powerful AI bot. No coding
          required. Choose your model, customize the prompt, and start
          collaborating.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link to="/auth">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-12 text-center text-2xl font-bold">How it works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-6">
              <MessageSquare className="mb-4 h-8 w-8" />
              <h3 className="mb-2 font-semibold">Connect your channels</h3>
              <p className="text-sm text-muted-foreground">
                One-click Slack OAuth or manual Discord setup. Your bot is live
                in seconds.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <Bot className="mb-4 h-8 w-8" />
              <h3 className="mb-2 font-semibold">Choose your model</h3>
              <p className="text-sm text-muted-foreground">
                Pick from Claude Sonnet, Opus, GPT-4o, or GPT-4o Mini. We handle
                the API keys.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <Zap className="mb-4 h-8 w-8" />
              <h3 className="mb-2 font-semibold">Customize and deploy</h3>
              <p className="text-sm text-muted-foreground">
                Write a system prompt, hit save, and your AI assistant is ready
                for your team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        Nexu &mdash; Powered by OpenClaw
      </footer>
    </div>
  );
}
