import * as service from '../service/clientesService.js'
import { Router } from 'express'
import { logError, formatarError } from '../utils/error.js'
import { CRUD } from '../repos/clientesRepo.js'

const endpoints = Router()

endpoints.post('/clientes', async (req, res) => {
    try {
        const cliente = req.body

        const resultado = await service.cadastrarCliente(cliente)

        if(!resultado || resultado < 0) throw new Error("Erro ao cadastrar o cliente.")

        res.status(200).json({ resultado })
    } catch (error) {
        logError(error)
        res.status(400).json(formatarError(error))
    }
})

endpoints.get('/clientes', async (req, res) => {
    try {
        const resultado = await service.buscarTodosClientes()

        res.status(200).json(resultado)
    } catch (error) {
        logError(error)
        res.status(400).json(formatarError(error))
    }
})

endpoints.get('/clientes/:id', async (req, res) => {
    try {
        const resultado = service.buscarClientePorId(id)

        if (!resultado) throw new Error("Erro ao buscar cliente.")
        if (resultado < 0) throw new Error("Nenhum cliente registrado com esse id.")

        res.status(200).json(resultado)
    } catch (error) {
        logError(error)
        res.status(400).json(formatarError(error))
    }
})

export default endpoints;