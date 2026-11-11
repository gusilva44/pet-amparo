# Backend — Pet Amparo

API REST do Pet Amparo. Ela concentra autenticação, regras de agendamento, administração de unidades e serviços, gestão de pets e carteira de medicação.

[Voltar ao README principal](../README.md) · [Guia do frontend](../frontend/README.md) · [Referência da API](docs/API.md)

## Tecnologias

- Node.js e Express
- MySQL 8 com `mysql2`
- JWT armazenado em cookie HTTP-only
- `bcryptjs` para proteção de senhas

## Executar localmente

### 1. Banco de dados

Crie o banco e os dados iniciais usando o schema abaixo:

```bash
mysql -u <usuario> -p < src/schema/tables.sql
```

O arquivo cria o banco `pet_amparo`, as tabelas e os registros iniciais de unidades e serviços.

### 2. Variáveis de ambiente

Crie `backend/.env`:

```dotenv
PORT=3000
DB_HOST=127.0.0.1
DB_USER=pet_amparo
DB_PASSWORD=uma_senha_local
DB_DATABASE=pet_amparo
DB_CONNECTION_LIMIT=10
JWT_SECRET=use_uma_chave_longa_e_aleatoria
JWT_EXPIRES_IN=1h
CORS_ORIGINS=http://localhost:3001
```

| Variável | Obrigatória | Finalidade |
| --- | --- | --- |
| `PORT` | Não | Porta da API; usa `3001` quando omitida. |
| `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE` | Sim | Conexão com o MySQL. |
| `DB_CONNECTION_LIMIT` | Não | Máximo de conexões do pool; padrão `10`. |
| `JWT_SECRET` | Sim | Chave usada para assinar e validar sessões. |
| `JWT_EXPIRES_IN` | Não | Duração do token; padrão `1h`. |
| `CORS_ORIGINS` | Não | Origens separadas por vírgula que podem enviar cookies à API. |

### 3. Instalação e início

```bash
cd backend
npm ci
npm run dev
```

A API estará disponível em `http://localhost:3001`. Para iniciar sem observação de arquivos, use `npm start`.

## Executar com Docker Compose

A partir da raiz do repositório:

```bash
docker compose up --build
```

O Compose sobe o frontend, a API e o MySQL. A interface fica em `http://localhost:3000`, a API em `http://localhost:3001` e o banco é exposto ao host em `localhost:3307`. O schema é aplicado somente ao criar um volume de banco novo; os arquivos enviados à API são persistidos no volume `pet_uploads`.

## Arquitetura

```text
src/
├── api.js          # Inicialização do Express, CORS, cookies e arquivos estáticos
├── router.js       # Registro dos controladores
├── controllers/    # Camada HTTP: entrada, resposta e códigos de status
├── service/        # Regras de negócio e validações
├── repos/          # Acesso ao MySQL
├── middleware/     # Autenticação e autorização por perfil
├── schema/         # Schema inicial e migrações SQL
└── utils/          # JWT, datas, imagens, regex e erros
```

As imagens de perfil e de pets são servidas em `/uploads`. Localmente, elas ficam em `backend/uploads`; no Compose, ficam no volume `pet_uploads`.

## Autenticação e CORS

Após `POST /auth/login`, a API grava o token no cookie `token` com `HttpOnly` e `SameSite=Lax`. Clientes web devem enviar requisições com credenciais — o frontend já faz isso com Axios.

Em produção, defina uma `JWT_SECRET` exclusiva, use HTTPS (o cookie passa a ser marcado como `Secure` quando `NODE_ENV=production`) e limite `CORS_ORIGINS` aos domínios reais da interface.

## Banco e migrações

`src/schema/tables.sql` é o ponto de partida para uma instalação nova. As mudanças incrementais ficam em `src/schema/migrations/`; aplique as migrações necessárias em bancos já existentes, na ordem de data presente no nome do arquivo. O Compose não executa essas migrações automaticamente.

## API

A referência completa, com perfis de acesso, parâmetros, corpos e exemplos de requisições, está em [docs/API.md](docs/API.md). Para a navegação da documentação de consumo, consulte também [docs/README.md](docs/README.md).
