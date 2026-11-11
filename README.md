# Pet Amparo

Plataforma desenvolvida como TCC para apoiar o acesso a serviços veterinários públicos. Ela centraliza o cadastro de tutores e pets, a consulta de unidades e serviços, o agendamento de atendimentos e o acompanhamento de medicações.

## Índice

- [Visão geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Como executar](#como-executar)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Documentação](#documentação)

## Visão geral

O sistema possui três perfis de acesso:

| Perfil | Principais possibilidades |
| --- | --- |
| Cliente | Mantém seus dados e pets, consulta unidades, agenda atendimentos e acompanha a carteira de medicação. |
| Veterinário | Configura disponibilidade, consulta a própria agenda e atualiza o status dos atendimentos. |
| Administrador | Administra clientes, unidades, serviços, veterinários e relatórios. |

Os agendamentos consideram o serviço oferecido pela unidade, o vínculo do profissional com ela, o expediente cadastrado e os horários já ocupados. Os horários são tratados no fuso `America/Sao_Paulo`.

```text
Navegador
    │
    ▼
Frontend React (porta 3000) ──► API Express (porta 3001) ──► MySQL 8
                                      │
                                      └── uploads de fotos
```

## Tecnologias

- **Frontend:** React, React Router, Axios, Sass e Sonner
- **Backend:** Node.js, Express, MySQL2, JWT, cookies HTTP-only e bcrypt
- **Banco de dados:** MySQL 8
- **Ambiente local:** Docker Compose

## Como executar

### Pré-requisitos

- Docker e o plugin Docker Compose, para executar toda a aplicação em contêineres;
- Node.js 22 e npm, somente para executar algum serviço fora do Docker.

### Opção recomendada: executar tudo com Docker

Na raiz do projeto, inicie o frontend, a API e o banco:

```bash
docker compose up --build
```

Abra [http://localhost:3000](http://localhost:3000). A API fica em `http://localhost:3001` e o MySQL é exposto em `localhost:3307` (porta interna do contêiner: `3306`). O frontend é entregue por Nginx, com suporte às rotas do React.

Em um volume novo, o Docker Compose executa automaticamente `backend/src/schema/tables.sql`. As imagens enviadas à API ficam no volume `pet_uploads`, persistindo entre reinicializações.

Para parar os contêineres:

```bash
docker compose down
```

Para remover também os volumes e recriar o banco do zero:

```bash
docker compose down -v
```

> `docker compose down -v` exclui os dados locais do MySQL e os uploads persistidos. Use-o somente quando essa remoção for intencional.

### Sem Docker

1. Tenha um servidor MySQL 8 disponível e importe o schema inicial:

   ```bash
   mysql -u <usuario> -p < backend/src/schema/tables.sql
   ```

2. Crie `backend/.env` com as credenciais do banco e uma chave JWT própria:

   ```dotenv
   PORT=3001
   DB_HOST=127.0.0.1
   DB_USER=pet_amparo
   DB_PASSWORD=uma_senha_local
   DB_DATABASE=pet_amparo
   JWT_SECRET=use_uma_chave_longa_e_aleatoria
   JWT_EXPIRES_IN=1h
   CORS_ORIGINS=http://localhost:3000
   ```

3. Inicie a API:

   ```bash
   cd backend
   npm ci
   npm run dev
   ```

4. Configure `frontend/.env.local` com os valores da seção anterior e inicie o frontend:

   ```bash
   cd frontend
   npm ci
   npm start
   ```

> A configuração do Compose usa valores apenas para desenvolvimento local. Nunca reutilize a chave JWT ou as senhas dele em produção.

## Estrutura do repositório

```text
.
├── backend/                 # API REST, acesso ao banco e schema MySQL
│   ├── docs/                # Referência detalhada da API
│   ├── src/controllers/     # Endpoints HTTP
│   ├── src/service/         # Regras de negócio
│   ├── src/repos/           # Consultas ao banco
│   └── src/schema/          # Schema inicial e migrações
├── frontend/                # Interface React
│   └── src/
│       ├── components/      # Componentes reutilizáveis e áreas administrativas
│       ├── pages/           # Páginas da aplicação
│       └── services/        # Comunicação com a API
└── docker-compose.yml       # Serviços MySQL e API para desenvolvimento
```

## Documentação

- [Guia do frontend](frontend/README.md): configuração, scripts, rotas e organização da interface.
- [Guia do backend](backend/README.md): variáveis de ambiente, arquitetura e execução da API.
- [Referência da API](backend/docs/API.md): endpoints, permissões, parâmetros e exemplos de requisição.
- [Documentação da API](backend/docs/README.md): ponto de entrada da documentação de consumo.

## Dados de desenvolvimento

O schema inicial inclui unidades e serviços. Para disponibilizar horários de agendamento, um administrador precisa associar os serviços às unidades, cadastrar ou vincular veterinários e registrar os expedientes dos profissionais. O cadastro público cria contas do tipo `cliente`.

Para criar o primeiro administrador em ambiente de desenvolvimento, crie uma conta e altere o campo `tipo` do usuário correspondente para `admin` no MySQL.
