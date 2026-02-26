import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { Navigate, Outlet } from "react-router-dom";

export function AuthLayout() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session?.user) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
