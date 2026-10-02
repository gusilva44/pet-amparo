import { verificarToken } from '../utils/jwt.js'
import * as db from '../repos/authRepo.js'

export async function autenticar(req, res, next) {
    try {
        const token = req.cookies?.token

        if (!token) {
            return res.status(401).json({
                mensagem: 'Usuário não autenticado.'
            })
        }

        const dadosToken = verificarToken(token)
        const usuario = await db.buscarUsuarioPorId(dadosToken.id_usuario)

        if (!usuario) {
            return res.status(401).json({
                mensagem: 'Usuário não encontrado.'
            })
        }

        if (!usuario.ativo) {
            return res.status(401).json({
                mensagem: 'Usuário desativado.'
            })
        }

        req.usuario = { 
            id_usuario: usuario.id_usuario,
            email: usuario.email,
            tipo: usuario.tipo
        }

        next()
    } catch (error) {
        return res.status(401).json({
            mensagem: 'Sessão inválida ou expirada.'
        })
    }
}