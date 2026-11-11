# Frontend — Pet Amparo

Interface web do Pet Amparo, construída em React. Ela consome a API do projeto e mantém a sessão por cookies HTTP-only.

[Voltar ao README principal](../README.md) · [Guia do backend](../backend/README.md) · [Referência da API](../backend/docs/API.md)

## Executar com Docker

Na raiz do repositório, o Docker Compose inicia o frontend, a API e o MySQL:

```bash
docker compose up --build
```

Abra [http://localhost:3000](http://localhost:3000). O build do frontend usa `http://localhost:3001` como endereço da API e é servido por Nginx com fallback para `index.html`, necessário para as rotas do React.

## Executar localmente

Para executar apenas a interface fora do Docker, tenha Node.js 22 e npm, além da API em execução.

### Configuração

Crie `frontend/.env.local` para sua máquina. Esse arquivo não é versionado e tem precedência sobre `frontend/.env`:

```dotenv
REACT_APP_API_URL=http://localhost:3001
PORT=3000
```

`REACT_APP_API_URL` deve apontar para a API. Caso a variável não seja definida, a aplicação usa `http://localhost:3001` como padrão.

### Início

```bash
cd frontend
npm ci
npm start
```

Depois, abra [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm start` | Inicia o servidor de desenvolvimento. |
| `npm run build` | Gera a versão otimizada em `build/`. |
| `npm test` | Inicia os testes no modo interativo do Create React App. |

## Áreas da aplicação

| Área | Rota | Acesso |
| --- | --- | --- |
| Início | `/` | Público |
| Unidade | `/unidades/:id` | Público |
| Meus pets | `/meuspets` | Cliente autenticado |
| Agendamentos | `/agendamentos` | Cliente autenticado |
| Painel administrativo | `/usuarios`, `/visao`, `/unidades`, `/servicos`, `/veterinarios`, `/relatorios` | Administrador |
| Área do veterinário | `/admveterinario` | Veterinário |

As rotas administrativas e veterinárias são protegidas pelo componente `RotaProtegida`. A API continua sendo a fonte de autorização: esconder uma rota na interface não substitui a validação feita no backend.

## Organização

```text
src/
├── auth/          # Fluxos e estilos de autenticação
├── components/    # Componentes compartilhados, áreas admin e veterinário
├── pages/         # Páginas associadas às rotas
├── services/      # Serviços organizados por recurso da API
├── utils/         # Cliente Axios e utilitários
└── scss/          # Estilos globais e de páginas
```

O cliente HTTP em `src/utils/api.js` envia requisições com `withCredentials: true`, permitindo que o navegador reenvie o cookie de sessão emitido pela API. Para isso funcionar em outro domínio, ajuste `CORS_ORIGINS` no backend e utilize HTTPS em produção.

## Build de produção

Defina `REACT_APP_API_URL` com a URL pública da API antes de gerar o build:

```bash
REACT_APP_API_URL=https://api.exemplo.com npm run build
```

As variáveis `REACT_APP_*` são incorporadas ao build do React; não coloque segredos nelas.
