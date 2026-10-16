import { Router } from 'express'
import * as service from '../service/agendamentosService.js'
import { autenticar } from '../middleware/authMiddlware.js'
import { exigirCliente } from '../middleware/exigirCliente.js'
import { logError, formatarError } from '../utils/error.js'

const endpoints = Router()

// BUSCAR TODOS AGENDAMENTOS
endpoints.get('/agendamentos', autenticar, exigirCliente, async (req, res) => {
    try {
        const id_cliente = req.cliente.id_cliente

        const agendamentos = await service.listarMeusAgendamentos(id_cliente)

        res.status(200).json({ 
            quantidade: agendamentos.length, 
            agendamentos })
    } catch (error) {
        logError(error); 
        res.status(400).json(formatarError(error))
    }
})

// CRIAR NOVO AGENDAMENTO
endpoints.post('/agendamentos', autenticar, exigirCliente, async (req, res) => {
    try {
        const dados = req.body
        const id_cliente = req.cliente.id_cliente

        const id_agendamento = await service.criarAgendamento(dados, id_cliente)

        res.status(201).json({ 
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
        const id_cliente = req.cliente.id_cliente

        await service.cancelarAgendamento(id_agendamento, id_cliente)

        res.status(200).json({ 
            mensagem: 'Agendamento cancelado com sucesso.'
        })
    } catch (error) {
        logError(error)
        res.status(error.message === 'Agendamento não encontrado.' ? 404 : 400).json(formatarError(error))
    }
})

export default endpoints
