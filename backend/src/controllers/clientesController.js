import { Router } from 'express'
import { logError, formatarError } from '../utils/error.js'
import { autenticar } from '../middleware/authMiddlware.js'
import { exigirCliente } from '../middleware/exigirCliente.js'

import * as service from '../service/clientesService.js'

const endpoints = Router()

// BUSCAR MEUS DADOS (CLIENTE)
endpoints.get('/clientes/me', autenticar, exigirCliente, async (req, res) => {
    try {
        const idUsuario = Number(req.usuario.id_usuario)
        const cliente = await service.buscarClientePorUsuario(idUsuario)

        if (!cliente) return res.status(404).json({ mensagem: 'Cliente não encontrado.' })

        res.status(200).json({
            sucesso: true,
            cliente
        })
    } catch (error) {
        const status = error.message.includes("não encontrado") ? 404 : 400
        
        logError(error)
        res.status(status).json(formatarError(error))
    }
})

// ATUALIZAR MEUS DADOS (CLIENTE)
endpoints.put('/clientes/me', autenticar, exigirCliente, async (req, res) => {
    try {
        const idUsuario = req.usuario.id_usuario
        const cliente = req.body

        const resultado = await service.atualizarClientePorUsuario(cliente, idUsuario)

        if (!resultado) throw new Error('Erro ao atualizar os dados do cliente.')

        res.status(200).json({
            sucesso: true,
            mensagem: 'Dados atualizados com sucesso.',
            resultado
        })

    } catch (error) {
        logError(error)
        res.status(400).json(formatarError(error))
    }
})

// DELETAR MEUS DADOS (CLIENTE)
endpoints.delete('/clientes/me', autenticar, exigirCliente, async (req, res) => {
    try {
        const idUsuario = req.usuario.id_usuario

        if (!idUsuario) return res.status(401).json({ 
            mensagem: 'Usuário não autenticado.' 
        })
    
        const resultado = await service.deletarClientePorUsuario(idUsuario)

        if (!resultado) throw new Error('Erro ao excluir a conta.')

        res.status(200).json({ 
            sucesso: true,
            mensagem: 'Conta excluída com sucesso.' 
        })
    } catch (error) {
        logError(error)
        res.status(400).json(formatarError(error))
    }
})

export default endpoints
