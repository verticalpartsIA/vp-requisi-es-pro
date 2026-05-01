import type { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth, type AppRole } from "@/features/auth/auth-context";

export function AccessGuard({
  roles,
  children,
}: {
  roles: AppRole[];
  children: ReactNode;
}) {
  const { hasRole } = useAuth();
  const allowed = roles.some((role) => hasRole(role));

  if (allowed) {
    return <>{children}</>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-amber-300 bg-amber-50">
        <CardContent className="p-8 text-center">
          <ShieldAlert className="h-10 w-10 mx-auto text-amber-700 mb-4" />
          <h2 className="text-lg font-semibold text-amber-900">Acesso restrito</h2>
          <p className="mt-2 text-sm text-amber-800">
            Seu perfil não possui permissão para acessar esta área do sistema.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
