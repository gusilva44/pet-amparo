import jwt from 'jsonwebtoken'

export function autenticar(req, res, next) {
    try {
        const token = req.cookies.token

        if (!token) {
            return res.status(401).json({
                erro: 'Usuário não autenticado.'
            })
        }

        const usuario = jwt.verify(token, process.env.JWT_SECRET)

        req.usuario = usuario

        next()
    } catch (error) {
        return res.status(401).json({
            erro: 'Sessão inválida ou expirada.'
        })
    }
}