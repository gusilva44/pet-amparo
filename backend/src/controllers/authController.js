import { Router } from 'express'
import * as service from '../service/authService.js'
import { autenticar } from '../middleware/authMiddlware.js'
import { gerarToken, opcoesCookie } from '../utils/jwt.js'
import { logError, formatarError } from '../utils/error.js'

const endpoints = Router()

// CADASTRO
endpoints.post('/auth/cadastro', async (req, res) => {
    try {
        const resultado = await service.cadastrarCliente(req.body)

        res.status(201).json({
            mensagem: 'Cliente cadastrado com sucesso.',
            resultado
        })

    } catch (error) {
        logError(error)
        res.status(400).json(
            formatarError(error)
        )
    }
})


// LOGIN
endpoints.post('/auth/login', async (req, res) => {
    try {
        const { email, senha } = req.body

        const resultado = await service.login(email, senha)

        res.cookie('token', resultado.token, opcoesCookie())

        res.status(200).json({
            mensagem: 'Login realizado com sucesso.',
            usuario: resultado.usuario
        })

    } catch (error) {
        logError(error)
        res.status(401).json(
            formatarError(error)
        )
    }
})


// LOGOUT
endpoints.post('/auth/logout', (req, res) => {
    res.clearCookie('token', opcoesCookie())

    res.status(200).json({
        mensagem: 'Logout realizado com sucesso.'
    })
})

// USUÁRIO AUTENTICADO
endpoints.get('/auth/me', autenticar, async (req, res) => {
        try {
            const idUsuario = req.usuario.id_usuario
            const usuario = await service.buscarUsuarioAutenticado(idUsuario)

            res.status(200).json({ usuario })
        } catch (error) {
            logError(error)
            res.status(401).json(formatarError(error))
        }
    }
)

export default endpoints