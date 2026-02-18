# mobilia.ai

Transforme cômodos da sua casa com IA: envie uma foto e receba uma versão moderna, bonita e aconchegante gerada pela **OpenAI** (GPT Image, endpoint de edição de imagens).

## Pré-requisitos

- Node.js 18+
- Chave de API da [OpenAI](https://platform.openai.com/) com acesso ao endpoint de edição de imagens (GPT Image)

## Configuração

1. Instale as dependências:

   ```bash
   npm install
   ```

2. **Configure a chave da OpenAI** (obrigatório):

   - Crie o arquivo `.env.local` na raiz do projeto.
   - Adicione sua chave: `OPENAI_API_KEY=sk-...`
   - Obtenha a chave em: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Você pode usar `.env.local.example` como referência.

Sem `OPENAI_API_KEY`, a transformação de imagens não funcionará.

## Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Uso

1. Arraste uma imagem de um cômodo para a área de upload ou clique para selecionar um arquivo.
2. Clique em **Criar**.
3. A imagem será enviada para a OpenAI (GPT Image, edição) com um prompt que preserva o cômodo e altera apenas móveis e decoração.
4. O resultado aparecerá na seção **Minhas criações**.

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção
- `npm run start` — servidor de produção
- `npm run lint` — ESLint
