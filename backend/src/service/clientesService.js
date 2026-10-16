import Usuario, { banco } from '../repos/clientesRepo.js'
import { validarDataNascimento } from '../utils/date.js'
import { validarId, autenticacaoUsuario } from '../validation/idCliente.js'

const db = new banco()
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

    const campos = ['nome', 'data_nascimento', 'telefone', 'cpf', 'endereco', 'email']
    if (campos.some(campo => !cliente[campo])) {
        throw new Error('Todos os campos do cliente são obrigatórios.')
    }

    if (/\d/.test(cliente.nome)) throw new Error('O nome não pode conter números.')
    validarDataNascimento(cliente.data_nascimento)

    return dbUser.atualizarClientePorUsuario(cliente, idUsuario)
}

// DELETAR MINHA CONTA
export function deletarClientePorUsuario(idUsuario){
    autenticacaoUsuario(idUsuario)
    return dbUser.deletarClientePorUsuario(idUsuario)
}
