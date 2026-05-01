import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { isLoading, isRecoverySession, session, signOut, updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isRecoverySession && !session) {
      toast.error("Link de recuperação inválido ou expirado.");
    }
  }, [isLoading, isRecoverySession, session]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password.trim().length < 8) {
      toast.error("A nova senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não conferem.");
      return;
    }

    setIsSubmitting(true);

    try {
      await updatePassword(password);
      await signOut();
      toast.success("Senha atualizada com sucesso. Faça login com a nova senha.");
      void navigate({ to: "/login", search: { redirect: "/" } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar sua senha agora.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canReset = !!session && isRecoverySession;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fce588_0%,#fff8dc_18%,#faf8f2_45%,#f4f1e8_100%)] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md border-vp-yellow/50 shadow-xl shadow-amber-100/70">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-vp-yellow text-vp-dark">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Nova senha</CardTitle>
              <CardDescription>Recuperação de acesso VerticalParts</CardDescription>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Defina uma nova senha para concluir a recuperação da sua conta.
          </p>
        </CardHeader>
        <CardContent>
          {!canReset ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Este link de recuperação não está válido no momento. Solicite um novo link na tela de login.
              </p>
              <Button variant="vp" className="w-full" onClick={() => void navigate({ to: "/login", search: { redirect: "/" } })}>
                Voltar ao login
              </Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="password">Nova senha</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Mínimo de 8 caracteres"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isLoading || isSubmitting}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repita a nova senha"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={isLoading || isSubmitting}
                />
              </div>
              <Button type="submit" variant="vp" className="w-full" disabled={isLoading || isSubmitting}>
                <KeyRound className="h-4 w-4 mr-2" />
                Atualizar senha
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
