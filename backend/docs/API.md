# API Pet Amparo

Referência das rotas atualmente implementadas no backend. Os exemplos usam `http://localhost:3001`, endereço exposto pelo Docker Compose. Se o backend for iniciado diretamente, use `http://localhost:<PORT>` (a porta padrão do código é `3000`).

## Como enviar requisições

Os corpos devem ser JSON e usar o cabeçalho `Content-Type: application/json`. IDs de rota são inteiros positivos. Datas usam `YYYY-MM-DD`; início de agendamento usa ISO 8601 com fuso, por exemplo `2027-06-21T14:00:00-03:00`.

O login grava um JWT no cookie HTTP-only `token`. Não é necessário nem possível lê-lo no JavaScript: preserve e reenvie o cookie nas rotas protegidas.

```js
await fetch('http://localhost:3001/animais', {
  credentials: 'include'
})
```

No Axios, configure `withCredentials: true`. Em `curl`, grave e reutilize o arquivo de cookies:

```bash
curl -i -c cookies.txt \
  -H 'Content-Type: application/json' \
  -d '{"email":"ana@example.com","senha":"senha-segura"}' \
  http://localhost:3001/auth/login

curl -b cookies.txt http://localhost:3001/animais
```

Perfis usados pela API:

| Acesso | Requisito |
| --- | --- |
| Público | Não precisa de sessão. |
| Autenticado | Cookie `token` válido. |
| Cliente | Sessão de um usuário com cadastro de cliente. |
| Veterinário | Sessão de um usuário veterinário com cadastro correspondente. |
| Admin | Sessão cujo `tipo` é `admin`. |

Erros normalmente retornam um objeto com `mensagem`; erros de autenticação retornam `401` e falta de permissão, `403`.

## Fluxo sugerido para agendar

1. Cadastre e faça login como cliente.
2. Crie um animal em `POST /animais`.
3. Consulte `GET /unidades?incluir_servicos=true`, `GET /veterinarios?id_unidade=:id` e `GET /veterinarios/:id/horarios`.
4. Envie o agendamento para `POST /agendamentos`.

O servidor confere propriedade do animal, disponibilidade do serviço na unidade, vínculo e expediente do veterinário, horário futuro e conflitos.

## Autenticação e conta

### `POST /auth/cadastro` e `POST /auth/cadastrar`

**Acesso:** público. As duas URLs criam uma conta de cliente equivalente.

```json
{
  "nome": "Ana Silva",
  "email": "ana@example.com",
  "senha": "senha-segura",
  "data_nascimento": "1998-07-15",
  "telefone": "11999999999",
  "cpf": "12345678901",
  "endereco": "Rua Exemplo, 100"
}
```

Todos os campos são obrigatórios. A pessoa deve ser maior de 18 anos; senha tem no mínimo 6 caracteres; CPF tem 11 dígitos; telefone tem 10 ou 11 dígitos. CPF e telefone aceitam máscara. Retorna `201` e o identificador em `resultado`.

### `POST /auth/login`

**Acesso:** público.

```json
{ "email": "ana@example.com", "senha": "senha-segura" }
```

Retorna `200`, os dados básicos em `usuario` e o cookie de sessão.

### `POST /auth/logout`

**Acesso:** público. Não recebe corpo; remove o cookie `token` e retorna `200`.

### `GET /auth/me`

**Acesso:** autenticado. Sem corpo. Retorna o usuário da sessão em `usuario`.

### `PUT /auth/me`

**Acesso:** autenticado.

```json
{ "senhaAntiga": "senha-atual", "senhaNova": "nova-senha-segura" }
```

As duas senhas são obrigatórias; a nova deve ter ao menos 6 caracteres e ser diferente da atual.

## Perfil de cliente

### `GET /clientes/me`

**Acesso:** cliente. Retorna o perfil do cliente associado à sessão.

### `PUT /clientes/me`

**Acesso pretendido:** cliente. Corpo completo:

```json
{
  "nome": "Ana Silva",
  "data_nascimento": "1998-07-15",
  "telefone": "11999999999",
  "cpf": "12345678901",
  "endereco": "Rua Exemplo, 100",
  "email": "ana.nova@example.com"
}
```

### `DELETE /clientes/me`

**Acesso pretendido:** cliente. Sem corpo; exclui a conta.

> **Limitação atual:** as rotas `PUT` e `DELETE /clientes/me` são interceptadas antes pelas rotas administrativas `/clientes/:id`, pois elas são registradas primeiro. Na versão atual, não devem ser usadas até o ajuste da ordem/definição das rotas. `GET /clientes/me` funciona normalmente.

## Animais

Para criar ou atualizar, envie o objeto completo:

```json
{
  "nome": "Amparo",
  "especie": "Cão",
  "raca": "Vira-lata",
  "rga": "RGA-123456",
  "idade": 4,
  "sexo": "F",
  "porte": "medio",
  "foto": "https://exemplo.com/amparo.jpg",
  "e_vacinado": true
}
```

`foto` é opcional ou pode ser `null`. `idade` precisa ser um número inteiro entre 0 e 38, `sexo` aceita `M` ou `F`, e `e_vacinado` é booleano. O RGA é único.

| Método e rota | Acesso | Como usar |
| --- | --- | --- |
| `GET /animais` | Cliente | Lista os animais da própria conta. |
| `GET /animais/:id` | Cliente | Obtém um animal da própria conta. Sem corpo. |
| `POST /animais` | Cliente | Cria um animal com o JSON acima; retorna `201` e `id_animal`. |
| `PUT /animais/:id` | Cliente | Atualiza integralmente um animal próprio com o JSON acima. |
| `DELETE /animais/:id` | Cliente | Exclui um animal próprio. Sem corpo. |

## Agendamentos

### `GET /agendamentos`

**Acesso:** cliente. Sem corpo. Retorna `quantidade` e `agendamentos`, incluindo pet, serviço, veterinário, início, fim, status e situação.

### `POST /agendamentos`

**Acesso:** cliente.

```json
{
  "id_animal": 1,
  "id_veterinario": 2,
  "id_servico": 3,
  "id_unidade": 1,
  "inicio": "2027-06-21T14:00:00-03:00",
  "observacao": "Animal com coceira"
}
```

Os quatro IDs e `inicio` são obrigatórios; `observacao` é opcional. O horário precisa estar no futuro e dentro do expediente. O servidor calcula o fim pela duração do serviço e retorna `201` com `id_agendamento`.

### `DELETE /agendamentos/:id`

**Acesso:** cliente. Sem corpo. Cancela somente agendamento próprio, futuro, com status `agendado` ou `confirmado`.

### Rotas do veterinário

| Método e rota | Acesso | Como usar |
| --- | --- | --- |
| `GET /veterinarios/me/agendamentos` | Veterinário | Lista a agenda do profissional autenticado, com cliente, animal, serviço e unidade. |
| `PATCH /veterinarios/me/agendamentos/:id/status` | Veterinário | Altera a situação de um agendamento próprio. Envie `{ "status": "pendente" }` ou `{ "status": "concluido" }`. |

Não é possível alterar um agendamento cancelado. `pendente` é armazenado como `agendado` e retornado como situação `pendente`.

## Serviços

Formato administrativo de serviço:

```json
{
  "nome": "Consulta clínica",
  "descricao": "Avaliação veterinária geral",
  "duracao_minutos": 30,
  "ativo": true
}
```

`nome` e `duracao_minutos` são obrigatórios; duração é inteiro positivo. `descricao` é opcional; `ativo` é booleano e assume `true` se omitido.

| Método e rota | Acesso | Como usar |
| --- | --- | --- |
| `GET /servicos` | Público | Lista serviços ativos. |
| `GET /servicos/:id` | Público | Busca um serviço por ID. |
| `POST /servicos` | Admin | Cria com o JSON acima. |
| `PUT /servicos/:id` | Admin | Atualiza integralmente com o JSON acima. |

> O parâmetro `?incluir_inativos=true` existe, mas atualmente não efetiva a listagem de inativos porque esta rota não autentica a requisição.

## Unidades

Formato administrativo de unidade:

```json
{
  "nome": "Unidade Norte",
  "descricao": "Atendimento veterinário público",
  "cep": "02000-000",
  "endereco": "Av. Exemplo",
  "numero": "100",
  "complemento": "Bloco A",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "estado": "SP",
  "telefone": "1133334444",
  "email": "norte@petamparo.org",
  "latitude": -23.5,
  "longitude": -46.6,
  "ativo": true
}
```

Obrigatórios: `nome`, `endereco`, `bairro` e `cidade`. Os demais são opcionais. `estado` precisa ter duas letras; latitude vai de -90 a 90 e longitude de -180 a 180. Quando omitidos, `estado` é `SP` e `ativo` é `true`.

| Método e rota | Acesso | Como usar |
| --- | --- | --- |
| `GET /unidades` | Público | Lista unidades ativas. Use `?incluir_servicos=true` para trazer o campo `servicos`. |
| `GET /unidades/:id` | Público | Busca uma unidade. |
| `POST /unidades` | Admin | Cria usando o JSON acima. |
| `PUT /unidades/:id` | Admin | Atualiza integralmente usando o JSON acima. |
| `POST /unidades/:id/servicos/:idServico` | Admin | Vincula ou reativa um serviço ativo à unidade. Sem corpo. |
| `DELETE /unidades/:id/servicos/:idServico` | Admin | Desvincula o serviço. Sem corpo. |

> Assim como em serviços, `?incluir_inativas=true` não funciona na implementação atual, pois a listagem é pública e não preenche o usuário da requisição.

## Veterinários e expediente

### `GET /veterinarios`

**Acesso:** público. Use `?id_unidade=1` para filtrar por unidade. Retorna `quantidade` e a lista de profissionais ativos.

### `POST /veterinarios`

**Acesso:** admin.

```json
{
  "nome": "Dra. Beatriz Lima",
  "email": "beatriz@example.com",
  "senha": "senha-segura",
  "crmv": "CRMV-SP 12345",
  "especialidade": "Clínica médica",
  "id_unidade": 1,
  "telefone": "11988887777"
}
```

Obrigatórios: `nome`, `email`, `senha`, `crmv` e `id_unidade`. A unidade deve estar ativa. `especialidade` e `telefone` são opcionais. Retorna `201` com `id_veterinario`.

### Expediente

Formato para criar horário:

```json
{
  "dia_semana": 1,
  "hora_inicio": "08:00",
  "hora_fim": "12:00",
  "id_unidade": 1
}
```

`dia_semana` é de `1` (segunda-feira) a `7` (domingo). As horas usam `HH:MM`, o fim deve ser posterior ao início, a unidade precisa estar vinculada ao veterinário e não pode haver sobreposição.

| Método e rota | Acesso | Como usar |
| --- | --- | --- |
| `GET /veterinarios/:id/horarios` | Público | Lista os horários cadastrados. |
| `POST /veterinarios/:id/horarios` | Admin | Cria um horário com o JSON acima. |
| `DELETE /veterinarios/:id/horarios/:idHorario` | Admin | Exclui o horário. Sem corpo. |

## Medicamentos e carteira de medicação

### `GET /medicamentos`

**Acesso:** público. Lista medicamentos ativos.

### `POST /medicamentos`

**Acesso:** admin.

```json
{
  "nome": "Antipulgas",
  "descricao": "Uso conforme prescrição",
  "ativo": true
}
```

`nome` é obrigatório; `descricao` é opcional; `ativo` é booleano e assume `true`. Retorna `201` com `id_medicamento`.

### `PUT /medicamentos/:id`

**Acesso pretendido:** admin. O corpo é o mesmo de criação.

> **Limitação atual:** o controlador usa `id.params.id` em vez de `req.params.id`; esta rota falha antes da atualização. Corrija o controlador antes de integrá-la.

### `GET /animais/:id/medicacoes`

**Acesso:** cliente. Sem corpo. Mostra a carteira do animal indicado somente se ele pertence ao cliente autenticado.

### `POST /animais/:id/medicacoes`

**Acesso:** admin. `:id` é o ID do animal.

```json
{
  "id_medicamento": 1,
  "id_veterinario": 2,
  "dosagem": "1 comprimido",
  "frequencia": "A cada 24 horas",
  "data_inicio": "2027-06-21",
  "data_fim": "2027-06-28",
  "observacao": "Administrar após a refeição"
}
```

Obrigatórios: `id_medicamento`, `dosagem`, `frequencia` e `data_inicio`. `id_veterinario`, `data_fim` e `observacao` são opcionais. A data final não pode ser anterior à inicial e o medicamento precisa estar ativo. Retorna `201` com `id_carteira`.

## Administração de clientes

Todas as rotas abaixo exigem admin. O corpo de criação é o mesmo de `POST /auth/cadastro`; para atualização, envie todos os campos.

| Método e rota | Como usar |
| --- | --- |
| `GET /clientes` | Lista todos os clientes. |
| `GET /clientes/filtros` | Filtra por `?nome=Ana&id=1&cpf=12345678901`. Os filtros são opcionais e combináveis. |
| `POST /clientes` | Cria um cliente com o JSON de cadastro. |
| `PUT /clientes/:id` | Atualiza integralmente o cliente com o JSON de cadastro. |
| `DELETE /clientes/:id` | Exclui o cliente. Sem corpo. |

## Mapa de todas as rotas

| Método | Rota | Acesso |
| --- | --- | --- |
| POST | `/auth/cadastro`, `/auth/cadastrar` | Público |
| POST | `/auth/login`, `/auth/logout` | Público |
| GET, PUT | `/auth/me` | Autenticado |
| GET | `/clientes/me` | Cliente |
| PUT, DELETE | `/clientes/me` | Cliente (indisponível na ordem atual das rotas) |
| GET, POST | `/animais` | Cliente |
| GET, PUT, DELETE | `/animais/:id` | Cliente |
| GET, POST | `/agendamentos` | Cliente |
| DELETE | `/agendamentos/:id` | Cliente |
| GET, PATCH | `/veterinarios/me/agendamentos` e `/veterinarios/me/agendamentos/:id/status` | Veterinário |
| GET, POST, PUT | `/servicos`, `/servicos/:id` | Público / Admin conforme método |
| GET, POST, PUT | `/unidades`, `/unidades/:id` | Público / Admin conforme método |
| POST, DELETE | `/unidades/:id/servicos/:idServico` | Admin |
| GET, POST | `/veterinarios`, `/veterinarios/:id/horarios` | Público / Admin conforme método |
| DELETE | `/veterinarios/:id/horarios/:idHorario` | Admin |
| GET, POST, PUT | `/medicamentos`, `/medicamentos/:id` | Público / Admin conforme método |
| GET, POST | `/animais/:id/medicacoes` | Cliente / Admin conforme método |
| GET, POST | `/clientes`, `/clientes/filtros` | Admin |
| PUT, DELETE | `/clientes/:id` | Admin |

