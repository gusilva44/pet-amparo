import { Router } from 'express'
import { autenticar } from '../middleware/authMiddlware.js'
import { exigirCliente } from '../middleware/exigirCliente.js'
import { logError, formatarError } from '../utils/error.js'

import * as service from '../service/animaisService.js'

const endpoints = Router()

// BUSCAR MEUS ANIMAIS
endpoints.get('/animais', autenticar, exigirCliente, async (req, res) => {
    try {
        const idCliente = Number(req.cliente.id_cliente)
        const resultado = await service.buscarTodosAnimais(idCliente)

        res.status(200).json({
            sucesso: true,
            quantidade: resultado.length,
            animais: resultado
        })

    } catch (error) {
        logError(error)
        res.status(500).json(formatarError(error))
    }
})

// BUSCAR MEU ANIMAL POR ID
endpoints.get('/animais/:id', autenticar, exigirCliente, async (req, res) => {
    try {
        const idAnimal = Number(req.params.id)
        const idCliente = Number(req.cliente.id_cliente)
        const resultado = await service.buscarAnimalPorId(idAnimal, idCliente)

        res.status(200).json({
            sucesso: true,
            resultado
        })
    } catch (error) {
        const status = error.message.includes("não encontrado") ? 404 : 400
        
        logError(error)
        res.status(status).json(formatarError(error))
    }
})

// CADASTRAR ANIMAL
endpoints.post('/animais', autenticar, exigirCliente, async (req, res) => {
    try {
        const dados = req.body
        const idCliente = Number(req.cliente.id_cliente)
        const resultado = await service.adicionarAnimal(dados, idCliente)

        res.status(201).json({
            sucesso: true,
            mensagem: 'Animal cadastrado com sucesso.',
            id_animal: resultado
        })

    } catch (error) {
        logError(error)
        res.status(400).json(formatarError(error))
    }
})

// ATUALIZAR ANIMAL
endpoints.put('/animais/:id', autenticar, exigirCliente, async (req, res) => {
    try {
        const idAnimal = Number(req.params.id)
        const idCliente = Number(req.cliente.id_cliente)
        const dados = req.body

        const resultado = await service.atualizarAnimal(dados, idAnimal, idCliente)

        res.status(200).json({
            sucesso: true,
            mensagem: 'Animal atualizado com sucesso.',
            linhas_afetadas: resultado
        })

    } catch (error) {
        const status = error.message.includes("não encontrado.") ? 404 : 400
        
        logError(error)
        res.status(status).json(formatarError(error))
    }
})

// DELETAR ANIMAL
endpoints.delete('/animais/:id', autenticar, exigirCliente, async (req, res) => {
    try {
        const idAnimal = Number(req.params.id)
        const idCliente = req.cliente.id_cliente

        const resultado = await service.deletarAnimal(idAnimal, idCliente)

        res.status(200).json({ 
            sucesso: true,
            resultado,
            mensagem: 'Animal excluído com sucesso.'
        })


    } catch (error) {
        const status = error.message.includes("não encontrado") ? 404 : 400
        
        logError(error)
        res.status(status).json(formatarError(error))
    }
})

export default endpoints