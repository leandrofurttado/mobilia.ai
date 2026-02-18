# Homevia

Transforme cômodos da sua casa com IA: envie uma foto e receba uma versão moderna, bonita e aconchegante gerada pela **OpenAI** (GPT Image, endpoint de edição de imagens).

## Pré-requisitos

- Node.js 18+
- Chave de API da [OpenAI](https://platform.openai.com/) (edição de imagens)
- Conta Google e credenciais OAuth para login

## Configuração

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie o arquivo `.env.local` na raiz (use `.env.local.example` como base).

3. **Login com Google** (obrigatório):
   - No [Google Cloud Console](https://console.cloud.google.com/apis/credentials), crie um projeto e credenciais OAuth 2.0 (tipo "Aplicativo da Web").
   - Em "URIs de redirecionamento autorizados" adicione: `http://localhost:3000/api/auth/callback/google` (e em produção: `https://seu-dominio.com/api/auth/callback/google`).
   - Defina no `.env.local`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_URL=http://localhost:3000` e `NEXTAUTH_SECRET` (gere com `openssl rand -base64 32`).

4. **OpenAI** (para transformar imagens):
   - Adicione `OPENAI_API_KEY=sk-...` no `.env.local` ([platform.openai.com/api-keys](https://platform.openai.com/api-keys)).

Sem as variáveis de Google e NEXTAUTH, o login não funcionará. Sem `OPENAI_API_KEY`, a transformação de imagens não funcionará.

## Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Uso

1. Acesse o app; se não estiver logado, você será redirecionado para a tela de login.
2. Entre com **Google** (único método de login).
3. Na Home, vá em **Criar** (menu ou botão) e envie uma foto de um cômodo. A imagem será transformada pela IA e o resultado aparecerá em **Suas criações**.

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção
- `npm run start` — servidor de produção
- `npm run lint` — ESLint
