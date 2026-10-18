import Usuario from '../repos/clientesRepo.js'
import { validarDataNascimento } from '../utils/date.js'
import { regex } from '../utils/regex.js';
import { autenticacaoUsuario } from '../validation/idCliente.js'

const dbUser = new Usuario()

// BUSCAR MEUS DADOS
export function buscarClientePorUsuario(idUsuario){
    autenticacaoUsuario(idUsuario)

    return dbUser.buscarDadosCliente(idUsuario)
}

// ATUALIZAR MEUS DADOS
export function atualizarClientePorUsuario(cliente, idUsuario){
    autenticacaoUsuario(idUsuario)
    
    if (!cliente) {
        throw new Error('Nenhum dado foi enviado.')
    }

    const { nome, data_nascimento, telefone, cpf, endereco, email } = cliente

    if (!nome || !data_nascimento || !telefone || !cpf || !endereco || !email) {
        throw new Error('Todos os campos do cliente são obrigatórios.')
    }

    if (regex.verificarNome.test(cliente.nome)) throw new Error('O nome não pode conter números.')
    validarDataNascimento(cliente.data_nascimento)

    return dbUser.atualizarClientePorUsuario(cliente, idUsuario)
}

// DELETAR MINHA CONTA
export function deletarClientePorUsuario(idUsuario){
    autenticacaoUsuario(idUsuario)
    return dbUser.deletarClientePorUsuario(idUsuario)
}
