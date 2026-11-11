# API Pet Amparo

Referência da API REST implementada no backend do Pet Amparo.

> Esta documentação descreve as rotas registradas em `backend/src/controllers`. A API não possui prefixo como `/api` ou versionamento no endereço.

## Endereço base

| Ambiente | URL |
| --- | --- |
| Docker Compose | `http://localhost:3001` |
| Backend iniciado diretamente | `http://localhost:3001` por padrão, ou a porta definida em `PORT` |

No Compose, a interface é servida em `http://localhost:3000` e o banco fica disponível para o host em `localhost:3307`.

## Convenções

- Envie corpos em JSON, com `Content-Type: application/json`.
- IDs em URL devem ser inteiros positivos.
- Datas usam `AAAA-MM-DD`; horários usam `HH:MM`; um início de agendamento usa uma data ISO 8601 com fuso, como `2027-06-21T14:00:00-03:00`.
- A maioria das respostas de sucesso contém `sucesso: true`; erros normalmente retornam `{ "sucesso": false, "mensagem": "..." }`. Algumas rotas mais antigas retornam apenas os dados indicados em sua seção.

## Sessão e níveis de acesso

O login grava o JWT no cookie HTTP-only `token`. Para chamar uma rota protegida, o cliente precisa preservar e reenviar esse cookie. Não há autenticação por `Authorization: Bearer` implementada.

```js
await fetch('http://localhost:3001/animais', {
  credentials: 'include'
})
```

Com Axios, use `withCredentials: true`. Em `curl`, grave e reutilize os cookies:

```bash
curl -i -c cookies.txt \
  -H 'Content-Type: application/json' \
  -d '{"email":"ana@example.com","senha":"senha-segura"}' \
  http://localhost:3001/auth/login

curl -b cookies.txt http://localhost:3001/animais
```

| Acesso | Requisito |
| --- | --- |
| Público | Não exige sessão. |
| Autenticado | Cookie `token` válido e usuário ativo. |
| Cliente | Usuário autenticado com cadastro de cliente. |
| Veterinário | Usuário do tipo `veterinario` com ficha profissional. |
| Admin | Usuário autenticado do tipo `admin`. |

Uma sessão ausente, expirada ou inválida retorna `401`. Falta de permissão para uma rota de administrador ou veterinário retorna `403`.

## Formatos reutilizáveis

### Cadastro de cliente

Usado em `POST /auth/cadastrar` e em `POST /clientes` para administradores.

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

Todos os campos são obrigatórios. A pessoa deve ser maior de 18 anos; a senha tem pelo menos 6 caracteres; CPF precisa ter 11 dígitos e telefone, 10 ou 11. CPF e telefone podem conter máscara.

### Cliente

Usado em `PUT /clientes/me` e `PUT /clientes/:id`. Todos os campos abaixo são exigidos nesses endpoints; `foto` é opcional.

```json
{
  "nome": "Ana Silva",
  "email": "ana@example.com",
  "data_nascimento": "1998-07-15",
  "telefone": "11999999999",
  "cpf": "12345678901",
  "endereco": "Rua Exemplo, 100",
  "foto": "data:image/jpeg;base64,..."
}
```

Para a atualização administrativa de um cliente (`PUT /clientes/:id`), inclua também `senha`.

### Foto

Fotos de perfil e pets devem ser uma data URL de PNG, JPG ou WEBP. O limite é de 2 MB para perfil e 5 MB para pet. A API salva o arquivo e retorna uma URL pública em `/uploads/...`; para remover uma foto, envie `null` ou uma string vazia no campo correspondente.

### Animal

Usado em `POST /animais` e `PUT /animais/:id`.

```json
{
  "nome": "Amparo",
  "especie": "Cão",
  "raca": "Vira-lata",
  "rga": "RGA-123456",
  "idade": 4,
  "sexo": "F",
  "porte": "medio",
  "foto": "data:image/webp;base64,...",
  "e_vacinado": true
}
```

Todos os campos, exceto `foto`, são obrigatórios. `idade` é um inteiro de 0 a 30; `sexo` aceita `M` ou `F`; `porte` aceita `pequeno`, `medio`, `grande` ou `nao_informado`; e o RGA é único.

### Serviço

Usado em `POST /servicos` e `PUT /servicos/:id`.

```json
{
  "nome": "Consulta clínica",
  "descricao": "Avaliação veterinária geral",
  "duracao_minutos": 30,
  "ativo": true,
  "unidades": [1, 3]
}
```

`nome` e `duracao_minutos` são obrigatórios na criação. A duração deve ser um inteiro de 5 a 480 minutos. `ativo` é booleano e `unidades`, quando informado, substitui os vínculos de unidades do serviço.

### Unidade

Usado em `POST /unidades` e `PUT /unidades/:id`.

```json
{
  "nome": "Unidade Leste",
  "descricao": "Atendimento veterinário público",
  "cep": "03000-000",
  "endereco": "Rua Exemplo",
  "numero": "100",
  "complemento": "Próximo à praça",
  "bairro": "Tatuapé",
  "cidade": "São Paulo",
  "estado": "SP",
  "telefone": "11999999999",
  "email": "unidade@example.com",
  "latitude": -23.5401,
  "longitude": -46.5765,
  "ativo": true
}
```

`nome`, `endereco`, `bairro` e `cidade` são obrigatórios. `estado` deve ter duas letras; latitude e longitude, quando enviadas, devem estar nas faixas geográficas válidas.

### Veterinário

Usado em `POST /veterinarios`.

```json
{
  "nome": "Dra. Beatriz Lima",
  "email": "beatriz@example.com",
  "senha": "senha-segura",
  "crmv": "SP-12345",
  "especialidade": "Clínica geral",
  "telefone": "11999999999",
  "id_unidade": 1
}
```

`nome`, `email`, `senha`, `crmv` e `id_unidade` são obrigatórios. A unidade precisa estar ativa e o CRMV e e-mail não podem estar em uso.

### Horário de expediente

Usado em `POST /veterinarios/me/horarios` e `POST /veterinarios/:id/horarios`.

```json
{
  "id_unidade": 1,
  "dia_semana": 1,
  "hora_inicio": "08:00",
  "hora_fim": "12:00",
  "ids_servicos": [1, 2]
}
```

`dia_semana` vai de `1` (segunda-feira) a `7` (domingo). Para uma disponibilidade em data específica, envie `data` no lugar de `dia_semana`; a API calcula o dia da semana e exige ao menos um serviço:

```json
{
  "id_unidade": 1,
  "data": "2027-06-21",
  "hora_inicio": "13:00",
  "hora_fim": "17:00",
  "ids_servicos": [1]
}
```

A data deve ser atual ou futura. O profissional precisa atender a unidade, os serviços devem estar disponíveis nela e o intervalo não pode se sobrepor a outro expediente.

## Autenticação e conta

| Método e rota | Acesso | Descrição |
| --- | --- | --- |
| `POST /auth/cadastrar` | Público | Cria uma conta de cliente com o formato de [cadastro de cliente](#cadastro-de-cliente). Retorna `201` com `resultado`. |
| `POST /auth/login` | Público | Recebe `{ "email", "senha" }`, cria o cookie `token` e retorna o usuário básico em `usuario`. |
| `POST /auth/logout` | Público | Remove o cookie `token`. Não recebe corpo. |
| `GET /auth/me` | Autenticado | Retorna o usuário da sessão em `usuario`. |
| `PUT /auth/me` | Autenticado | Altera a senha; recebe `{ "senhaAntiga", "senhaNova" }`. A nova senha deve ter ao menos 6 caracteres e ser diferente da atual. |

> A rota pública de cadastro é `/auth/cadastrar`. Não existe `POST /auth/cadastro`.

## Perfil do cliente e pets

### Perfil do usuário autenticado

| Método e rota | Acesso | Corpo ou resultado |
| --- | --- | --- |
| `GET /clientes/me` | Cliente | Retorna o perfil em `cliente`. |
| `PUT /clientes/me` | Cliente | Atualiza o perfil usando o formato [cliente](#cliente). |
| `PATCH /clientes/me/foto` | Cliente | Recebe `{ "foto": "data:image/..." }`, `null` ou string vazia. |
| `DELETE /clientes/me` | Cliente | Exclui a própria conta. |

### Animais

| Método e rota | Acesso | Descrição |
| --- | --- | --- |
| `GET /animais` | Cliente | Lista os animais da própria conta em `animais`, com `quantidade`. |
| `GET /animais/:id` | Cliente | Obtém um animal que pertença ao cliente autenticado. |
| `POST /animais` | Cliente | Cria um pet com o formato [animal](#animal); retorna `201` e `id_animal`. |
| `PUT /animais/:id` | Cliente | Atualiza integralmente um pet próprio com o mesmo formato. Se `foto` for omitida, preserva a atual. |
| `DELETE /animais/:id` | Cliente | Exclui um pet próprio. |

## Agendamentos

### Fluxo recomendado

1. Cadastre e autentique um cliente.
2. Cadastre pelo menos um animal.
3. Consulte as unidades em `GET /unidades?incluir_servicos=true`.
4. Consulte os veterinários da unidade com `GET /veterinarios?id_unidade=:id`.
5. Busque opções com `GET /agendamentos/disponibilidade`.
6. Crie o agendamento usando um dos horários retornados.

### Rotas

| Método e rota | Acesso | Descrição |
| --- | --- | --- |
| `GET /agendamentos/disponibilidade` | Público | Recebe `id_unidade`, `id_servico`, `id_veterinario` e `data` (`AAAA-MM-DD`) por query string. Retorna `horarios` livres em `HH:MM`. |
| `GET /agendamentos` | Cliente | Lista os agendamentos do cliente autenticado em `agendamentos`, com `quantidade`. |
| `POST /agendamentos` | Cliente | Cria um agendamento e retorna `201` com `id_agendamento`. |
| `DELETE /agendamentos/:id` | Cliente | Cancela um agendamento próprio que ainda não tenha iniciado. |

Corpo de criação:

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

Os quatro IDs e `inicio` são obrigatórios. `observacao` é opcional e aceita até 500 caracteres. Antes de salvar, a API valida a propriedade do animal, a unidade e serviço ativos, o vínculo do serviço à unidade, o profissional ativo na unidade, o expediente compatível e conflitos de horário.

## Serviços e unidades

### Serviços

| Método e rota | Acesso | Descrição |
| --- | --- | --- |
| `GET /servicos` | Autenticado | Lista serviços ativos em `resultado`. Administradores podem usar `?incluir_inativos=true`. |
| `GET /servicos/:id` | Público | Retorna um serviço e as unidades vinculadas. |
| `POST /servicos` | Admin | Cria com o formato [serviço](#serviço). |
| `PUT /servicos/:id` | Admin | Atualiza serviço; se `unidades` for enviado, sincroniza os vínculos. |
| `PATCH /servicos/:id/status` | Admin | Recebe `{ "ativo": true }` ou `{ "ativo": false }`. Não permite desativar serviço com agendamentos futuros. |

> Diferentemente de `GET /servicos/:id`, a listagem `GET /servicos` exige sessão válida.

### Unidades

| Método e rota | Acesso | Descrição |
| --- | --- | --- |
| `GET /unidades` | Público | Lista unidades ativas. Use `?incluir_servicos=true` para incluir os serviços vinculados. |
| `GET /unidades/:id` | Público | Retorna uma unidade pelo ID. |
| `GET /admin/unidades` | Admin | Lista unidades ativas e inativas. Aceita `?incluir_servicos=true`. |
| `POST /unidades` | Admin | Cria uma unidade com o formato [unidade](#unidade). |
| `PUT /unidades/:id` | Admin | Atualiza uma unidade com o mesmo formato. |
| `PUT /unidades/:id/status` | Admin | Recebe `{ "ativo": true }` ou `{ "ativo": false }`. |
| `DELETE /unidades/:id` | Admin | Exclui a unidade. |
| `POST /unidades/:id/servicos/:idServico` | Admin | Vincula um serviço ativo a uma unidade. Não recebe corpo. |
| `DELETE /unidades/:id/servicos/:idServico` | Admin | Remove o vínculo de um serviço da unidade. |

## Veterinários, agenda e expediente

### Consulta e administração

| Método e rota | Acesso | Descrição |
| --- | --- | --- |
| `GET /veterinarios` | Público | Lista veterinários ativos. Aceita `?id_unidade=:id` para filtrar por unidade. |
| `POST /veterinarios` | Admin | Cria o usuário, a ficha profissional e o primeiro vínculo de unidade usando o formato [veterinário](#veterinário). |
| `GET /admin/veterinarios` | Admin | Lista veterinários para administração. |
| `GET /admin/veterinarios/contas-sem-ficha` | Admin | Lista contas do tipo veterinário que ainda não possuem ficha profissional. |
| `POST /admin/veterinarios/contas/:id/ficha` | Admin | Cria a ficha para uma conta existente; recebe `nome`, `crmv`, `id_unidade` e, opcionalmente, `especialidade` e `telefone`. |
| `POST /admin/veterinarios/:id/unidades/:idUnidade` | Admin | Vincula um veterinário a uma unidade ativa. Não recebe corpo. |

### Área do veterinário autenticado

| Método e rota | Acesso | Descrição |
| --- | --- | --- |
| `GET /veterinarios/me/unidades` | Veterinário | Lista as unidades vinculadas ao profissional da sessão. |
| `GET /veterinarios/me/horarios` | Veterinário | Lista os expedientes do profissional da sessão. |
| `POST /veterinarios/me/horarios` | Veterinário | Cria expediente próprio com o formato [horário de expediente](#horário-de-expediente). |
| `DELETE /veterinarios/me/horarios/:idHorario` | Veterinário | Exclui um expediente próprio. |
| `GET /veterinarios/me/agendamentos` | Veterinário | Lista a própria agenda. Aceita `mes=AAAA-MM` e `situacao=pendente`, `concluido` ou `cancelado`. |
| `GET /veterinarios/me/agenda` | Veterinário | Retorna a agenda agrupada por dia. Aceita os mesmos filtros. |
| `PATCH /veterinarios/me/agendamentos/:id/status` | Veterinário | Recebe `{ "status": "pendente" }` ou `{ "status": "concluido" }` para um agendamento próprio. Não altera agendamentos cancelados. |

### Gestão de expediente por administrador

| Método e rota | Acesso | Descrição |
| --- | --- | --- |
| `GET /veterinarios/:id/horarios` | Público | Lista os expedientes de um veterinário. |
| `POST /veterinarios/:id/horarios` | Admin | Cria expediente para o profissional usando o formato [horário de expediente](#horário-de-expediente). |
| `DELETE /veterinarios/:id/horarios/:idHorario` | Admin | Exclui o expediente do profissional. |

## Medicamentos e carteira de medicação

### Medicamentos

Formato de medicamento:

```json
{
  "nome": "Amoxicilina",
  "descricao": "Antibiótico",
  "ativo": true
}
```

| Método e rota | Acesso | Descrição |
| --- | --- | --- |
| `GET /medicamentos` | Público | Retorna diretamente a lista de medicamentos ativos. |
| `POST /medicamentos` | Admin | Cria um medicamento; retorna `201` com `id_medicamento`. |
| `PUT /medicamentos/:id` | Admin | Atualiza um medicamento com o formato acima. |

### Carteira de um pet

| Método e rota | Acesso | Descrição |
| --- | --- | --- |
| `GET /animais/:id/medicacoes` | Cliente | Retorna a carteira de medicação de um animal próprio. |
| `POST /animais/:id/medicacoes` | Admin | Registra uma medicação para o animal indicado e retorna `201` com `id_carteira`. |

Corpo para registrar uma medicação:

```json
{
  "id_medicamento": 1,
  "id_veterinario": 2,
  "dosagem": "10 mg",
  "frequencia": "A cada 12 horas",
  "data_inicio": "2027-06-21",
  "data_fim": "2027-06-28",
  "observacao": "Administrar após alimentação"
}
```

`id_medicamento`, `dosagem`, `frequencia` e `data_inicio` são obrigatórios. `id_veterinario`, `data_fim` e `observacao` são opcionais. Se informada, a data final não pode preceder a inicial.

## Administração de clientes e usuários

### Clientes

| Método e rota | Acesso | Descrição |
| --- | --- | --- |
| `GET /clientes` | Admin | Lista todos os clientes. |
| `GET /clientes/filtros` | Admin | Busca clientes pelos parâmetros opcionais `nome`, `id` e `cpf`. Retorna `404` quando não há resultado. |
| `POST /clientes` | Admin | Cria um cliente com o formato [cadastro de cliente](#cadastro-de-cliente). |
| `PUT /clientes/:id` | Admin | Atualiza um cliente. Exige os campos do formato [cliente](#cliente), além de `senha`. |
| `DELETE /clientes/:id` | Admin | Exclui um cliente pelo ID. |

### Usuários administrativos

| Método e rota | Acesso | Descrição |
| --- | --- | --- |
| `GET /usuarios` | Admin | Lista todos os usuários. |
| `POST /usuarios` | Admin | Cria somente administrador. Recebe `{ "email", "senha", "tipo": "admin" }`. |
| `PUT /usuarios/:id` | Admin | Atualiza o e-mail de um usuário. Recebe `{ "email": "novo@example.com" }`. |
| `PATCH /usuarios/:id/status` | Admin | Altera status. Recebe `{ "ativo": true }`, `{ "ativo": false }`, `0` ou `1`. |
| `PATCH /admin/usuarios/:id/ativar` | Admin | Ativa um usuário. Não recebe corpo. |
| `PATCH /admin/usuarios/:id/desativar` | Admin | Desativa um usuário. Não recebe corpo. |
| `PUT /admin/usuarios/:id` | Admin | Atualiza e-mail e tipo. Recebe `{ "email": "novo@example.com", "tipo": "cliente\|veterinario\|admin" }`. |

## Relatórios

| Método e rota | Acesso | Descrição |
| --- | --- | --- |
| `GET /admin/relatorios` | Admin | Gera indicadores consolidados de unidades, usuários, animais, serviços, agendamentos e medicamentos. Aceita `periodo` em meses: `1`, `3`, `6` ou `12`; se omitido ou inválido, usa `6`. |

A resposta contém `resultado` com `resumo`, `animais`, `agendamentos`, séries por unidade, serviço, veterinário e mês, próximos agendamentos e medicamentos mais prescritos.

## Mapa rápido de rotas

| Grupo | Rotas |
| --- | --- |
| Autenticação | `POST /auth/cadastrar`, `POST /auth/login`, `POST /auth/logout`, `GET/PUT /auth/me` |
| Cliente e pets | `GET/PUT/DELETE /clientes/me`, `PATCH /clientes/me/foto`, `GET/POST /animais`, `GET/PUT/DELETE /animais/:id` |
| Agendamentos | `GET /agendamentos/disponibilidade`, `GET/POST /agendamentos`, `DELETE /agendamentos/:id` |
| Catálogo | `GET /servicos`, `GET /servicos/:id`, `POST /servicos`, `PUT /servicos/:id`, `PATCH /servicos/:id/status`, `GET/POST /unidades` |
| Unidades administrativas | `GET /admin/unidades`, `GET/PUT/DELETE /unidades/:id`, `PUT /unidades/:id/status`, `POST/DELETE /unidades/:id/servicos/:idServico` |
| Veterinários | `GET/POST /veterinarios`, `GET/POST /veterinarios/:id/horarios`, `DELETE /veterinarios/:id/horarios/:idHorario`, rotas `/veterinarios/me/*` e `/admin/veterinarios/*` |
| Saúde | `GET/POST /medicamentos`, `PUT /medicamentos/:id`, `GET/POST /animais/:id/medicacoes` |
| Administração | `GET/POST /clientes`, `GET /clientes/filtros`, `PUT/DELETE /clientes/:id`, `GET/POST /usuarios`, `PUT /usuarios/:id`, `PATCH /usuarios/:id/status`, rotas `/admin/usuarios/*`, `GET /admin/relatorios` |
