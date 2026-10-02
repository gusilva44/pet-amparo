import { banco, Usuario } from '../repos/clientesRepo.js'
import { validarDataNascimento } from '../utils/date.js'
import { validarId, autenticacaoUsuario } from '../validation/idCliente.js'

const db = new banco()
const dbUser = new Usuario()

// BUSCAR MEUS DADOS
export default function buscarClientePorUsuario(idUsuario){
    autenticacaoUsuario(idUsuario)

    return dbUser.buscarDadosCliente(idUsuario)
}

// ATUALIZAR MEUS DADOS
export default function atualizarClientePorUsuario(cliente, idUsuario){
    autenticacaoUsuario(idUsuario)
    
    if (!cliente) {
        return res.status(400).json({
            mensagem: 'Nenhum dado foi enviado.'
        })
    }

    return dbUser.atualizarClientePorUsuario(idUsuario)
}

// DELETAR MINHA CONTA
export default function deletarClientePorUsuario(idUsuario){
    
}