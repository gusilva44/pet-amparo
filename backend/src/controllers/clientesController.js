import * as service from '../service/clientesService.js'
import { Router } from 'express'
import { logError, formatarError } from '../utils/error.js'

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
        const id = Number(req.params.id)

        const resultado = await service.buscarClientePorId(id)

        if (!resultado) throw new Error("Erro ao buscar cliente.")

        res.status(200).json(resultado)
    } catch (error) {
        logError(error)
        res.status(404).json(formatarError(error))
    }
})

endpoints.delete('/clientes/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const cliente = await service.deletarCliente(id)
        res.status(200).json(cliente)
        
    } catch (error) {
        logError(error)
        res.status(400).json(formatarError(error))
    }
})

endpoints.put('/clientes/:id ', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const cliente = req.body;

        const up = await service.atualizarCliente(cliente, id)

        res.status(200).json(up)
    } catch (error){
        logError(error)
        res.status(400).json(formatarError(error))
    }
});

export default endpoints;