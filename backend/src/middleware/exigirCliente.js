import * as db from '../repos/authRepo.js'

export async function exigirCliente(req, res, next) {
    try {
        const idUsuario = req.usuario.id_usuario

        const cliente = await db.buscarClientePorUsuario(idUsuario)

        if (!cliente) {
            return res.status(404).json({
                mensagem: 'Cadastro de cliente não encontrado.'
            })
        }

        req.cliente = cliente

        next()
    } catch (error) {
        return res.status(500).json({
            mensagem: 'Erro ao identificar o cliente.'
        })
    }
}