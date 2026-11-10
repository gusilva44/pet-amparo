import Usuario from '../repos/clientesRepo.js'
import { validarDataNascimento } from '../utils/date.js'
import { regex } from '../utils/regex.js';
import { autenticacaoUsuario } from '../validation/idCliente.js'
import { salvarImagemDataUrl } from '../utils/imagem.js'

const dbUser = new Usuario()

export function buscarClientePorUsuario(idUsuario){
    autenticacaoUsuario(idUsuario)

    return dbUser.buscarDadosCliente(idUsuario)
}

export async function atualizarClientePorUsuario(cliente, idUsuario){
    autenticacaoUsuario(idUsuario)
    if (!cliente) throw new Error('Nenhum dado foi enviado.')

    const { nome, data_nascimento, telefone, cpf, endereco, email, foto } = cliente

    if (!nome || !data_nascimento || !telefone || !cpf || !endereco || !email) throw new Error('Todos os campos do cliente são obrigatórios.')

    if (regex.verificarNome.test(cliente.nome)) throw new Error('O nome não pode conter números.')
    validarDataNascimento(cliente.data_nascimento)
    const fotoSalva = foto === undefined ? undefined : await salvarImagemDataUrl(foto, {
        limiteBytes: 2 * 1024 * 1024,
        campo: 'foto do perfil',
        pasta: 'perfis',
    })

    return dbUser.atualizarClientePorUsuario({ ...cliente, foto: fotoSalva }, idUsuario)
}

export async function atualizarFotoPorUsuario(foto, idUsuario) {
    autenticacaoUsuario(idUsuario)
    const fotoSalva = await salvarImagemDataUrl(foto, {
        limiteBytes: 2 * 1024 * 1024,
        campo: 'foto do perfil',
        pasta: 'perfis',
    })

    const alteradas = await dbUser.atualizarFotoPorUsuario(fotoSalva, idUsuario)
    if (!alteradas) throw new Error('Perfil do cliente não encontrado.')
    return alteradas
}

export function deletarClientePorUsuario(idUsuario){
    autenticacaoUsuario(idUsuario)
    
    return dbUser.deletarClientePorUsuario(idUsuario)
}
