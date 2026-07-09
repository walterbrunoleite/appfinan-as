# Casa Leite

Controle financeiro da família — Walter e Nat. Grátis, privado, só para vocês dois.

---

## O que já está pronto

- Dashboard com saldo do mês, gastos por categoria, fixo x variável, por pessoa
- Lançamentos (adicionar/editar/excluir despesas e receitas)
- Orçamento mensal por categoria (com aviso quando estourar)
- Categorias personalizáveis (cor + ícone)
- Login por email e senha, só para `walter.bruno.leite@gmail.com` e `nleite23@gmail.com` (com recuperação de senha por email)

Custo pra manter isso rodando: **R$ 0/mês** (Supabase free + Vercel free).

---

## Passo 1 — Criar as tabelas no Supabase (5 min)

1. Abre o seu projeto em [supabase.com/dashboard](https://supabase.com/dashboard)
2. No menu da esquerda, clica em **SQL Editor**
3. Clica em **New query**
4. Abre o arquivo [`supabase/schema.sql`](supabase/schema.sql) desta pasta, copia **tudo**, cola no editor
5. Clica em **Run** (ou `Ctrl+Enter`)

Isso cria as tabelas, as categorias padrão, e a regra que faz você e a Nat entrarem automaticamente na "Família Leite" assim que fizerem login pela primeira vez — ninguém mais precisa mexer no SQL depois disso.

⚠️ Antes de colar esse SQL em qualquer lugar, dá uma conferida rápida no conteúdo do arquivo — é sempre bom revisar o que vai rodar no seu banco.

---

## Passo 2 — Pegar as chaves e configurar o `.env.local`

1. No Supabase, vai em **Project Settings** (ícone de engrenagem) → **API**
2. Copia a **Project URL** e a chave **anon public**
3. Nesta pasta (`app`), abre o arquivo `.env.local` (se não existir, copia `.env.local.example` e renomeia)
4. Cola assim:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Importante:** também precisa avisar o Supabase que a URL do app existe. Vai em **Authentication** → **URL Configuration** e adiciona `http://localhost:3000/**` em "Redirect URLs" (depois de publicar no Vercel, adiciona a URL de lá também).

---

## Passo 3 — Rodar no seu computador

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Na tela de login, clica em **"Primeira vez? Criar senha"**, usa `walter.bruno.leite@gmail.com` e escolhe uma senha (mínimo 8 caracteres). Depois é a vez da Nat fazer o mesmo com `nleite23@gmail.com` — ela entra automaticamente na mesma família, sem precisar de nenhum passo técnico além de criar a senha dela.

Esqueceu a senha? Tem um link "Esqueci minha senha" na tela de login que manda um email pra redefinir.

---

## Passo 4 — Publicar (deixar acessível de qualquer lugar)

✅ **Já feito.** O app está no ar em **[https://appfinan-as-teal.vercel.app](https://appfinan-as-teal.vercel.app)**.

Se um dia precisar redeployar manualmente (normalmente não precisa — todo push na branch `main` do GitHub já dispara um deploy automático):

```bash
npx vercel deploy --prod
```

Se precisar mudar alguma variável de ambiente de produção:

```bash
npx vercel env ls production          # ver o que já existe
npx vercel env add NOME_DA_VAR production   # adicionar/atualizar
npx vercel env rm NOME_DA_VAR production    # remover
```

Pronto — você e a Nat acessam de qualquer celular ou computador, de graça, em **appfinan-as-teal.vercel.app**.

---

## Comandos úteis

```bash
npm run dev      # rodar local, com hot-reload
npm run build    # gerar build de produção (bom pra checar erros antes de publicar)
npm run lint     # checar qualidade do código
```

---

## Estrutura do projeto

```
app/
├── app/
│   ├── (app)/          # telas logadas: dashboard, lançamentos, orçamento, categorias
│   ├── login/           # tela de login
│   └── auth/callback/    # processa o link mágico
├── components/           # componentes de UI
├── lib/
│   ├── supabase/         # clientes Supabase (browser + servidor)
│   ├── actions.ts        # todas as operações de escrita (criar/editar/excluir)
│   ├── data.ts            # leituras (dashboard, lançamentos, orçamento)
│   └── colors.ts          # paleta de cores das categorias
├── supabase/
│   └── schema.sql         # script único pra criar o banco todo
└── .env.local              # suas credenciais (nunca vai pro GitHub)
```
