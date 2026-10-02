import jwt from 'jsonwebtoken'

export function gerarToken(usuario) {
    return jwt.sign(
        {
            id_usuario: usuario.id_usuario,
            email: usuario.email,
            tipo: usuario.tipo
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '1h'
        }
    )
}

export function verificarToken(token) {
    return jwt.verify(
        token,
        process.env.JWT_SECRET
    )
}

export function opcoesCookie() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000,
        path: '/'
    }
}