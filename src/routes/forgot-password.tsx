import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, ShieldCheck, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Informe seu e-mail para continuar.");
      return;
    }

    setIsSubmitting(true);

    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/reset-password`
          : "/reset-password";

      await resetPasswordForEmail(email.trim(), redirectTo);
      setSent(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível enviar o e-mail agora.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fce588_0%,#fff8dc_18%,#faf8f2_45%,#f4f1e8_100%)] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md border-vp-yellow/50 shadow-xl shadow-amber-100/70">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-vp-yellow text-vp-dark">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Recuperar senha</CardTitle>
              <CardDescription>VPRequisições — VerticalParts</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                  <Mail className="h-7 w-7 text-green-600" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">E-mail enviado!</p>
                <p className="text-sm text-muted-foreground">
                  Se <strong>{email}</strong> tiver uma conta, você receberá um link para redefinir
                  sua senha em breve.
                </p>
              </div>
              <Link to="/login" search={{ redirect: "/" }} className="mt-2 inline-flex items-center gap-2 text-sm text-vp-dark hover:underline">
                <ArrowLeft className="h-4 w-4" />
                Voltar para o login
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <p className="text-sm text-muted-foreground">
                Informe o e-mail associado à sua conta e enviaremos um link para redefinir sua senha.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@verticalparts.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <Button type="submit" variant="vp" className="w-full" disabled={isSubmitting}>
                <Mail className="h-4 w-4 mr-2" />
                {isSubmitting ? "Enviando..." : "Enviar link de recuperação"}
              </Button>
              <div className="text-center">
                <Link
                  to="/login" search={{ redirect: "/" }}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Voltar para o login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
