# Pet Amparo

Aplicação desenvolvida para o TCC que facilita o acesso a serviços veterinários públicos. A plataforma permite o cadastro de tutores e animais, consulta de serviços e veterinários, agendamento de atendimentos e acompanhamento da carteira de medicação do pet.

## Tecnologias

- Frontend: React
- API: Node.js, Express e JWT em cookie HTTP-only
- Banco de dados: MySQL 8
- Infraestrutura local: Docker Compose

## Estrutura do projeto

```text
.
├── backend/              # API REST e schema MySQL
│   └── src/schema/       # criação das tabelas e serviços iniciais
├── frontend/             # interface React
└── docker-compose.yml    # API + MySQL para desenvolvimento
```

## Executar com Docker

Pré-requisito: Docker com o plugin Docker Compose.

```bash
docker compose up --build
```

A API ficará disponível em `http://localhost:3001` e o MySQL em `localhost:3306`. Em um volume de banco novo, o Compose aplica `backend/src/schema/tables.sql` automaticamente. As fotos ficam no volume `pet_uploads` e continuam disponíveis após reiniciar os containers.

Para parar os serviços:

```bash
docker compose down
```

Para apagar também os dados persistidos do MySQL e recriar o banco:

```bash
docker compose down -v
```

> O arquivo `docker-compose.yml` contém uma chave JWT de desenvolvimento. Troque `JWT_SECRET` antes de usar a aplicação fora do ambiente local.

## Executar sem Docker

1. Crie um banco MySQL e execute `backend/src/schema/tables.sql`.
2. Copie `backend/.env.example` para `backend/.env` e preencha as credenciais.
3. Inicie a API:

```bash
cd backend
npm install
npm start
```

O frontend é executado separadamente:

```bash
cd frontend
npm install
npm start
```

Por padrão, o backend aceita requisições do frontend em `http://localhost:3000`.

## Modelo de dados

| Grupo | Tabelas |
| --- | --- |
| Acesso | `usuarios`, `clientes`, `veterinarios` |
| Pets | `animais` |
| Atendimento | `servicos`, `horarios_veterinarios`, `agendamentos` |
| Saúde | `medicamentos`, `carteiras_medicacao` |

Um cliente pertence a um usuário e pode ter vários animais. Cada agendamento associa cliente, animal, veterinário e serviço. A carteira de medicação pertence ao animal e pode registrar o veterinário responsável.

## Autenticação e perfis

O login grava o JWT no cookie `token`, que é HTTP-only. Rotas protegidas dependem desse cookie.

- `cliente`: administra o próprio perfil, animais, agendamentos e visualiza a carteira de medicação.
- `admin`: administra clientes, unidades, serviços, veterinários e horários.
- `veterinario`: consulta e atualiza a própria agenda e expediente.

O cadastro público cria usuários do tipo `cliente`. Para criar o primeiro administrador em desenvolvimento, cadastre um usuário e altere seu `tipo` para `admin` diretamente no MySQL.

## Rotas principais da API

| Método | Rota | Acesso | Finalidade |
| --- | --- | --- | --- |
| POST | `/auth/cadastro` | Público | Cadastra um cliente |
| POST | `/auth/login` | Público | Inicia a sessão |
| POST | `/auth/logout` | Autenticado | Encerra a sessão |
| GET | `/auth/me` | Autenticado | Retorna o usuário atual |
| GET/POST | `/animais` | Cliente | Lista ou cadastra os próprios pets |
| GET/PUT/DELETE | `/animais/:id` | Cliente | Consulta, altera ou remove um pet próprio |
| GET | `/servicos` | Público | Lista serviços ativos |
| POST/PUT | `/servicos` e `/servicos/:id` | Admin | Gerencia serviços |
| GET | `/veterinarios` | Público | Lista veterinários ativos; aceita `?unidade=` |
| POST | `/veterinarios` | Admin | Cria veterinário e usuário associado |
| GET/POST | `/veterinarios/:id/horarios` | Público/Admin | Consulta ou cria expediente |
| DELETE | `/veterinarios/:id/horarios/:idHorario` | Admin | Remove expediente |
| GET/POST | `/agendamentos` | Cliente | Lista ou cria agendamento próprio |
| DELETE | `/agendamentos/:id` | Cliente | Cancela agendamento futuro |
| GET | `/medicamentos` | Público | Lista medicamentos ativos |
| POST/PUT | `/medicamentos` e `/medicamentos/:id` | Admin | Gerencia medicamentos |
| GET | `/animais/:id/medicacoes` | Cliente | Consulta a carteira do próprio pet |
| POST | `/animais/:id/medicacoes` | Admin | Adiciona medicação à carteira |

Para agendar, o cliente escolhe uma unidade, um serviço vinculado a ela, um veterinário ativo que atende nessa unidade e um horário livre no expediente daquele dia. A API repete essas validações ao salvar e impede duas solicitações simultâneas de ocuparem o mesmo intervalo. Horários são tratados no fuso local de São Paulo.

Fotos de perfil e de pets são gravadas em arquivos no diretório `backend/uploads` (ou no volume `pet_uploads` no Compose); o banco guarda o endereço público de cada arquivo. O limite é 2 MB para perfil e 5 MB para pet.

## Exemplo: cadastro e login

```json
POST /auth/cadastro
{
  "nome": "Ana Silva",
  "email": "ana@email.com",
  "senha": "senha-segura",
  "data_nascimento": "1998-07-15",
  "telefone": "11999999999",
  "cpf": "12345678901",
  "endereco": "Rua Exemplo, 100"
}
```

Depois, envie `POST /auth/login` com `email` e `senha`. Clientes HTTP precisam preservar cookies nas próximas requisições.

## Preparar dados para agendamento

O banco inicial cria as unidades e o catálogo de serviços. Para disponibilizar agendamentos, vincule os serviços desejados às unidades na tela **Serviços**, cadastre e associe profissionais na tela **Veterinários**, e peça que cada veterinário configure seus horários semanais na área **Atendimentos**. Só então as opções correspondentes aparecem para o cliente.
