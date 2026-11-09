import Usuario from '../repos/clientesRepo.js'
import { validarDataNascimento } from '../utils/date.js'
import { regex } from '../utils/regex.js';
import { autenticacaoUsuario } from '../validation/idCliente.js'

const dbUser = new Usuario()

export function buscarClientePorUsuario(idUsuario){
    autenticacaoUsuario(idUsuario)

    return dbUser.buscarDadosCliente(idUsuario)
}

export function atualizarClientePorUsuario(cliente, idUsuario){
    autenticacaoUsuario(idUsuario)
    if (!cliente) throw new Error('Nenhum dado foi enviado.')

    const { nome, data_nascimento, telefone, cpf, endereco, email, foto } = cliente

    if (!nome || !data_nascimento || !telefone || !cpf || !endereco || !email) throw new Error('Todos os campos do cliente são obrigatórios.')

    if (regex.verificarNome.test(cliente.nome)) throw new Error('O nome não pode conter números.')
    validarDataNascimento(cliente.data_nascimento)
    if (foto && !/^data:image\/(png|jpe?g|webp);base64,/i.test(foto)) throw new Error('A foto do perfil deve ser PNG, JPG ou WEBP.')
    if (foto && foto.length > 2800000) throw new Error('A foto do perfil deve ter no mÃ¡ximo 2 MB.')

    return dbUser.atualizarClientePorUsuario(cliente, idUsuario)
}

export function atualizarFotoPorUsuario(foto, idUsuario) {
    autenticacaoUsuario(idUsuario)
    if (foto && !/^data:image\/(png|jpe?g|webp);base64,/i.test(foto)) throw new Error('A foto do perfil deve ser PNG, JPG ou WEBP.')
    if (foto && foto.length > 2800000) throw new Error('A foto do perfil deve ter no m\u00e1ximo 2 MB.')

    return dbUser.atualizarFotoPorUsuario(foto || null, idUsuario)
}

export function deletarClientePorUsuario(idUsuario){
    autenticacaoUsuario(idUsuario)
    
    return dbUser.deletarClientePorUsuario(idUsuario)
}
