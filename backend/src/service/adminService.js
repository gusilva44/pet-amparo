import Usuario, { banco } from "../repos/clientesRepo.js"
import { validarDataNascimento } from "../utils/date.js"
import { validarId } from "../validation/idCliente.js"
import * as authService from './authService.js'
import { regex } from "../utils/regex.js"

const db = new banco()
const dbU = new Usuario()

// BUSCAR POR FILTROS
export async function buscarClientePorFiltros(filtros) {
    return db.buscarClientePorFiltros(filtros)
}

// CADASTRAR
export async function cadastrarCliente(cliente){
    return authService.cadastrarCliente(cliente)
}

// BUSCAR TODOS
export async function buscarTodosClientes() {
    return db.buscarTodosClientes()
}

// DELETAR
export async function deletarCliente(id) {
    validarId(id)

    return db.deletarCliente(id)
}

// ATUALIZAR
export async function atualizarCliente(cliente, id) {
    if(!cliente) throw new Error("Os dados para atualização são obrigatórios.")

    const { nome, email, senha, data_nascimento, telefone, cpf, endereco } = cliente

    if(!nome || !email || !senha || !data_nascimento || !telefone || !endereco) throw new Error("Todos os campos devem ser preenchidos.")
    
    if(regex.verificarNome.test(cliente.nome)) throw new Error("O nome não pode conter números.")
    
    validarDataNascimento(cliente.data_nascimento)

    if(!cliente.telefone) throw new Error("O telefone dever ser preenchido.")

    if(cliente.telefone.length > 14) throw new Error("O telefone está maior do que o normal.")

    const cpfLimpo = cliente.cpf.replace(regex.limparCpf, "");

    if(cpfLimpo.length > 11) throw new Error("CPF grande demais.")

    if(cpfLimpo.length !== 11) throw new Error("O CPF deve ter 11 números.")

    const emailValido = regex.verificarEmail

    if(!emailValido.test(cliente.email)) 
        throw new Error("Digite o email corretamente.")
    
    validarId(id)
    
    return db.atualizarCliente(cliente, id)
}

// ALTERAR STATUS DO USUÁRIO
export async function alterarStatusUsuario(id, ativo) {
    validarId(Number(id))

    if (ativo !== 0 && ativo !== 1) {
        throw new Error("Status inválido.")
    }

    const usuario = await dbU.buscarUsuarioPorId(id)

    if (!usuario) {
        throw new Error("Usuário não encontrado.")
    }

    await dbU.alterarStatusUsuario(id, ativo)

    return {
        id_usuario: Number(id),
        ativo
    }
}

// ATUALIZAR USUÁRIO
export async function atualizarUsuario(id, dados) {
    validarId(Number(id));

    const { email, tipo } = dados;

    if (!email || !tipo) {
        throw new Error("E-mail e tipo são obrigatórios.");
    }

    if (!regex.verificarEmail.test(email)) {
        throw new Error("Digite um e-mail válido.");
    }

    if (!["cliente", "veterinario", "admin"].includes(tipo)) {
        throw new Error("Tipo de usuário inválido.");
    }

    const usuario = await dbU.buscarUsuarioPorId(id);

    if (!usuario) {
        throw new Error("Usuário não encontrado.");
    }

    return db.atualizarDadosUsuario(id, email, tipo);
}