# Casa Leite

Controle financeiro da família — Walter e Nat. Grátis, privado, só para vocês dois.

---

## O que já está pronto

- Dashboard com saldo do mês, gastos por categoria, fixo x variável, por pessoa
- Lançamentos (adicionar/editar/excluir despesas e receitas)
- Orçamento mensal por categoria (com aviso quando estourar)
- Categorias personalizáveis (cor + ícone)
- Login por link mágico — sem senha — só para `walter.bruno.leite@gmail.com` e `nleite23@gmail.com`

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

Abre [http://localhost:3000](http://localhost:3000). Faz login com `walter.bruno.leite@gmail.com`, abre o email, clica no link. Depois é a vez da Nat fazer o mesmo com `nleite23@gmail.com` — ela entra automaticamente na mesma família, sem precisar de nenhum passo técnico.

---

## Passo 4 — Publicar (deixar acessível de qualquer lugar)

1. Sobe o código pro GitHub (repositório `appfinan-as`, que você já criou):
   ```bash
   git init
   git add .
   git commit -m "Casa Leite — versão inicial"
   git remote add origin https://github.com/walterbrunoleite/appfinan-as.git
   git branch -M main
   git push -u origin main
   ```
2. Entra em [vercel.com/new](https://vercel.com/new), importa o repositório `appfinan-as`
3. Nas variáveis de ambiente, adiciona as mesmas 3 do `.env.local` (troca `NEXT_PUBLIC_SITE_URL` pela URL que a Vercel vai te dar, tipo `https://appfinan-as.vercel.app`)
4. Clica em **Deploy**
5. Volta no Supabase → **Authentication** → **URL Configuration** e adiciona a URL da Vercel em "Redirect URLs"

Pronto — você e a Nat acessam de qualquer celular ou computador, de graça.

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
