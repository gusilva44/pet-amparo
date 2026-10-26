import { banco } from "../repos/clientesRepo.js"
import { validarDataNascimento } from "../utils/date.js"
import { validarId } from "../validation/idCliente.js"
import * as authService from './authService.js'
import { regex } from "../utils/regex.js"

const db = new banco()

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
