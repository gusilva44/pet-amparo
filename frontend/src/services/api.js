import { requisicao } from "../utils/api.js";

// Cada grupo espelha as rotas disponíveis no backend. As funções retornam o JSON da resposta.

export const authApi = {
  // Cadastro público de cliente. Payload: nome, email, senha, data_nascimento, telefone, cpf, endereco.
  cadastrar: (dados) =>
    requisicao({ method: "POST", url: "/auth/cadastrar", data: dados }),
  // O login grava o cookie HTTP-only de sessão no navegador.
  login: (credenciais) =>
    requisicao({ method: "POST", url: "/auth/login", data: credenciais }),
  // Limpa o cookie de sessão.
  logout: () => requisicao({ method: "POST", url: "/auth/logout" }),
  // Consulta os dados do usuário autenticado; rejeita com 401 se a sessão expirou.
  usuarioAtual: () => requisicao({ method: "GET", url: "/auth/me" }),
};

export const clientesApi = {
  meusDados: () => requisicao({ method: "GET", url: "/clientes/me" }),
  atualizarMeusDados: (dados) =>
    requisicao({ method: "PUT", url: "/clientes/me", data: dados }),
  excluirMinhaConta: () =>
    requisicao({ method: "DELETE", url: "/clientes/me" }),
  // Operações administrativas, exigem sessão de administrador.
  listar: () => requisicao({ method: "GET", url: "/clientes" }),
  buscar: (filtros) =>
    requisicao({ method: "GET", url: "/clientes/filtros", params: filtros }),
  criar: (dados) =>
    requisicao({ method: "POST", url: "/clientes", data: dados }),
  atualizar: (id, dados) =>
    requisicao({ method: "PUT", url: `/clientes/${id}`, data: dados }),
  excluir: (id) => requisicao({ method: "DELETE", url: `/clientes/${id}` }),
};

export const animaisApi = {
  listarMeus: () => requisicao({ method: "GET", url: "/animais" }),
  buscarMeu: (id) => requisicao({ method: "GET", url: `/animais/${id}` }),
  cadastrar: (dados) =>
    requisicao({ method: "POST", url: "/animais", data: dados }),
  atualizar: (id, dados) =>
    requisicao({ method: "PUT", url: `/animais/${id}`, data: dados }),
  excluir: (id) => requisicao({ method: "DELETE", url: `/animais/${id}` }),
};

export const servicosApi = {
  listar: (incluirInativos = false) =>
    requisicao({
      method: "GET",
      url: "/servicos",
      params: incluirInativos ? { incluir_inativos: true } : undefined,
    }),
  buscarPorId: (id) => requisicao({ method: "GET", url: `/servicos/${id}` }),
  criar: (dados) =>
    requisicao({ method: "POST", url: "/servicos", data: dados }),
  atualizar: (id, dados) =>
    requisicao({ method: "PUT", url: `/servicos/${id}`, data: dados }),
};

export const agendamentosApi = {
  listarMeus: () => requisicao({ method: "GET", url: "/agendamentos" }),
  criar: (dados) =>
    requisicao({ method: "POST", url: "/agendamentos", data: dados }),
  cancelar: (id) =>
    requisicao({ method: "DELETE", url: `/agendamentos/${id}` }),
};

export const veterinariosApi = {
  listar: (unidade) =>
    requisicao({
      method: "GET",
      url: "/veterinarios",
      params: unidade === undefined ? undefined : { id_unidade: unidade },
    }),
  criar: (dados) =>
    requisicao({ method: "POST", url: "/veterinarios", data: dados }),
  listarHorarios: (idVeterinario) =>
    requisicao({
      method: "GET",
      url: `/veterinarios/${idVeterinario}/horarios`,
    }),
  criarHorario: (idVeterinario, dados) =>
    requisicao({
      method: "POST",
      url: `/veterinarios/${idVeterinario}/horarios`,
      data: dados,
    }),
  excluirHorario: (idVeterinario, idHorario) =>
    requisicao({
      method: "DELETE",
      url: `/veterinarios/${idVeterinario}/horarios/${idHorario}`,
    }),
};

export const medicamentosApi = {
  listar: () => requisicao({ method: "GET", url: "/medicamentos" }),
  criar: (dados) =>
    requisicao({ method: "POST", url: "/medicamentos", data: dados }),
  // A rota existe, mas o controller atual do backend tem erro ao ler o ID e chamar o service.
  atualizar: (id, dados) =>
    requisicao({ method: "PUT", url: `/medicamentos/${id}`, data: dados }),
  listarCarteiraDoAnimal: (idAnimal) =>
    requisicao({ method: "GET", url: `/animais/${idAnimal}/medicacoes` }),
  adicionarNaCarteiraDoAnimal: (idAnimal, dados) =>
    requisicao({
      method: "POST",
      url: `/animais/${idAnimal}/medicacoes`,
      data: dados,
    }),
};

export const unidadesApi = {
  listarComServicos: () =>
    requisicao({
      method: "GET",
      url: "/unidades",
      params: { incluir_servicos: true },
    }),
  listar: (incluirInativas = false) =>
    requisicao({
      method: "GET",
      url: "/unidades",
      params: incluirInativas ? { incluir_inativas: true } : undefined,
    }),
  buscarPorId: (id) => requisicao({ method: "GET", url: `/unidades/${id}` }),
  criar: (dados) =>
    requisicao({ method: "POST", url: "/unidades", data: dados }),
  atualizar: (id, dados) =>
    requisicao({ method: "PUT", url: `/unidades/${id}`, data: dados }),
};
