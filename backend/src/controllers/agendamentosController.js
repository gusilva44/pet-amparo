import { Router } from 'express'
import { autenticar } from '../middleware/authMiddlware.js'
import { exigirCliente } from '../middleware/exigirCliente.js'
import { logError, formatarError } from '../utils/error.js'

import * as service from '../service/agendamentosService.js'

const endpoints = Router()

// BUSCAR TODOS AGENDAMENTOS
endpoints.get('/agendamentos', autenticar, exigirCliente, async (req, res) => {
    try {
        const id_cliente = Number(req.cliente.id_cliente)
        const agendamentos = await service.listarMeusAgendamentos(id_cliente)

        res.status(200).json({
            sucesso: true,
            quantidade: agendamentos.length, 
            agendamentos
        })
    } catch (error) {
        logError(error)
        res.status(500).json(formatarError(error))
    }
})

// CRIAR NOVO AGENDAMENTO
endpoints.post('/agendamentos', autenticar, exigirCliente, async (req, res) => {
    try {
        const dados = req.body
        const id_cliente = Number(req.cliente.id_cliente)

        const id_agendamento = await service.criarAgendamento(dados, id_cliente)

        res.status(201).json({ 
            sucesso: true,
            mensagem: 'Agendamento criado com sucesso.', 
            id_agendamento 
        })
    } catch (error) {
        logError(error);
        res.status(400).json(formatarError(error))
    }
})

// CANCELAR AGENDAMENTO
endpoints.delete('/agendamentos/:id', autenticar, exigirCliente, async (req, res) => {
    try {
        const id_agendamento = Number(req.params.id)
        const id_cliente = Number(req.cliente.id_cliente)

        await service.cancelarAgendamento(id_agendamento, id_cliente)

        res.status(200).json({
            sucesso: true,
            mensagem: 'Agendamento cancelado com sucesso.'
        })
    } catch (error) {
        const status = error.message.includes("não encontrado") ? 404 : 400

        logError(error)
        res.status(status).json(formatarError(error))
    }
})

export default endpoints