"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";

const ALLOWED_EMAILS = ["walter.bruno.leite@gmail.com", "nleite23@gmail.com"];

type Mode = "signin" | "signup" | "forgot";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  function resetMessages() {
    setErrorMessage("");
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    resetMessages();
    setSubmitting(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setSubmitting(false);

    if (error) {
      setErrorMessage("Email ou senha errados. Confere e tenta de novo.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    resetMessages();
    const normalized = email.trim().toLowerCase();

    if (!ALLOWED_EMAILS.includes(normalized)) {
      setErrorMessage("Esse email não está liberado para a Casa Leite.");
      return;
    }
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
    const { error } = await supabase.auth.signUp({
      email: normalized,
      password,
    });

    setSubmitting(false);

    if (error) {
      if (error.code === "user_already_exists") {
        setErrorMessage(
          "Esse email já tem conta. Usa 'Esqueci minha senha' pra criar uma senha nova.",
        );
      } else {
        setErrorMessage("Não deu para criar a senha. Tenta de novo em instantes.");
      }
      return;
    }

    router.push("/");
    router.refresh();
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    resetMessages();
    const normalized = email.trim().toLowerCase();

    if (!ALLOWED_EMAILS.includes(normalized)) {
      setErrorMessage("Esse email não está liberado para a Casa Leite.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(normalized, {
      redirectTo: `${window.location.origin}/auth/callback?redirect_to=/reset-password`,
    });

    setSubmitting(false);

    if (error) {
      setErrorMessage("Não deu para enviar o email. Tenta de novo em instantes.");
      return;
    }

    setForgotSent(true);
  }

  function switchMode(next: Mode) {
    setMode(next);
    resetMessages();
    setPassword("");
    setConfirmPassword("");
    setForgotSent(false);
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
          {mode === "signin" && (
            <>
              <CardHeader>
                <p className="text-sm text-muted-foreground">
                  Entre com seu email e senha.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="flex flex-col gap-4">
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
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {errorMessage && (
                    <p className="text-sm text-critical">{errorMessage}</p>
                  )}

                  <Button type="submit" disabled={submitting} className="mt-2">
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Entrar
                  </Button>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => switchMode("signup")}
                      className="hover:text-foreground hover:underline"
                    >
                      Primeira vez? Criar senha
                    </button>
                    <button
                      type="button"
                      onClick={() => switchMode("forgot")}
                      className="hover:text-foreground hover:underline"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                </form>
              </CardContent>
            </>
          )}

          {mode === "signup" && (
            <>
              <CardHeader>
                <p className="text-sm text-muted-foreground">
                  Primeiro acesso? Cria sua senha aqui — só funciona com o email
                  liberado pra Casa Leite.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="voce@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Pelo menos 8 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="signup-confirm">Confirmar senha</Label>
                    <Input
                      id="signup-confirm"
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
                    Criar senha e entrar
                  </Button>

                  <button
                    type="button"
                    onClick={() => switchMode("signin")}
                    className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                  >
                    Já tem senha? Entrar
                  </button>
                </form>
              </CardContent>
            </>
          )}

          {mode === "forgot" && (
            <>
              <CardHeader>
                <p className="text-sm text-muted-foreground">
                  Manda um link pro seu email pra você criar uma senha nova.
                </p>
              </CardHeader>
              <CardContent>
                {forgotSent ? (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <CheckCircle2 className="h-10 w-10 text-success" />
                    <p className="text-sm text-foreground">
                      Link enviado para <strong>{email}</strong>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Abre seu email, clica no link e cria uma senha nova.
                    </p>
                    <button
                      type="button"
                      onClick={() => switchMode("signin")}
                      className="mt-2 text-xs text-muted-foreground hover:text-foreground hover:underline"
                    >
                      Voltar pro login
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgot} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="forgot-email">Email</Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="voce@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>

                    {errorMessage && (
                      <p className="text-sm text-critical">{errorMessage}</p>
                    )}

                    <Button type="submit" disabled={submitting} className="mt-2">
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Mail className="h-4 w-4" />
                      )}
                      Enviar link de recuperação
                    </Button>

                    <button
                      type="button"
                      onClick={() => switchMode("signin")}
                      className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                    >
                      Voltar pro login
                    </button>
                  </form>
                )}
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
