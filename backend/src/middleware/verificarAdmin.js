export default function verificarAdmin(req, res, next) {

    if (!req.usuario) {
        return res.status(401).json({
            mensagem: 'Usuário não autenticado.'
        })
    }

    if (req.usuario.tipo !== 'admin') {
        return res.status(403).json({
            mensagem: 'Acesso permitido somente para administradores.'
        })
    }

    next()
}