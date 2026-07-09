"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    if (password.length < 8) {
      setErrorMessage("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("As senhas não são iguais.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      setErrorMessage(
        "Não deu para salvar a senha nova. O link pode ter expirado — pede um novo em 'Esqueci minha senha'.",
      );
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl italic tracking-tight text-foreground">
            Casa Leite
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Criar uma senha nova
          </p>
        </div>

        <Card className="border-border/60">
          <CardHeader>
            <p className="text-sm text-muted-foreground">
              Escolhe sua senha nova.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Senha nova</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Pelo menos 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirm">Confirmar senha nova</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {errorMessage && (
                <p className="text-sm text-critical">{errorMessage}</p>
              )}

              <Button type="submit" disabled={submitting} className="mt-2">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Salvar senha nova
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
