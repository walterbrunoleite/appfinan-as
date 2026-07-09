"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";

const ALLOWED_EMAILS = ["walter.bruno.leite@gmail.com", "nleite23@gmail.com"];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalized = email.trim().toLowerCase();

    if (!ALLOWED_EMAILS.includes(normalized)) {
      setStatus("error");
      setErrorMessage("Esse email não está liberado para a Casa Leite.");
      return;
    }

    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: normalized,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage("Não deu para enviar o link. Tenta de novo em instantes.");
      return;
    }

    setStatus("sent");
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl italic tracking-tight text-foreground">
            Casa Leite
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Controle financeiro da família
          </p>
        </div>

        <Card className="border-border/60">
          <CardHeader>
            <p className="text-sm text-muted-foreground">
              Entre com seu email. Vamos te mandar um link de acesso — sem senha.
            </p>
          </CardHeader>
          <CardContent>
            {status === "sent" ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <CheckCircle2 className="h-10 w-10 text-success" />
                <p className="text-sm text-foreground">
                  Link enviado para <strong>{email}</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  Abre seu email e clica no link. Pode fechar essa aba.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="voce@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                {status === "error" && (
                  <p className="text-sm text-critical">{errorMessage}</p>
                )}

                <Button
                  type="submit"
                  disabled={status === "sending"}
                  className="mt-2"
                >
                  {status === "sending" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Enviar link de acesso
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
