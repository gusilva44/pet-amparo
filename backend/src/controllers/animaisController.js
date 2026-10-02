import { Router } from 'express'
import * as service from '../service/animaisService.js'
import { autenticar } from '../middleware/authMiddlware.js'
import { exigirCliente } from '../middleware/exigirCliente.js'
import { logError, formatarError } from '../utils/error.js'

const endpoints = Router()

// BUSCAR MEUS ANIMAIS
endpoints.get('/animais', autenticar, exigirCliente, async (req, res) => {
    try {
        const idCliente = req.cliente.id_cliente
        const resultado = await service.buscarTodosAnimais(idCliente)

        res.status(200).json({
            quantidade: resultado.length,
            animais: resultado
        })

    } catch (error) {
        logError(error)
        res.status(400).json(formatarError(error))
    }
})

// BUSCAR MEU ANIMAL POR ID
endpoints.get('/animais/:id', autenticar, exigirCliente, async (req, res) => {
    try {
        const idAnimal = Number(req.params.id)
        const idCliente = req.cliente.id_cliente
        const resultado = await service.buscarAnimalPorId(idAnimal, idCliente)

        res.status(200).json(resultado)
    } catch (error) {
        logError(error)
        const status = error.message === 'Animal não encontrado.' ? 404 : 400

        res.status(status).json(formatarError(error))
    }
})

// CADASTRAR ANIMAL
endpoints.post('/animais', autenticar, exigirCliente, async (req, res) => {
    try {
        const idCliente = req.cliente.id_cliente
        const resultado = await service.adicionarAnimal(req.body, idCliente)

        res.status(201).json({
            mensagem:
                'Animal cadastrado com sucesso.',
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
        const idCliente = req.cliente.id_cliente
        const resultado = await service.atualizarAnimal(req.body, idAnimal, idCliente)

        res.status(200).json({
            mensagem: 'Animal atualizado com sucesso.',
            linhas_afetadas: resultado
        })

    } catch (error) {
        logError(error)
        const status = error.message === 'Animal não encontrado.' ? 404 : 400

        res.status(status).json(formatarError(error))
    }
}
)

// DELETAR ANIMAL
endpoints.delete('/animais/:id', autenticar, exigirCliente, async (req, res) => {
    try {
        const idAnimal = Number(req.params.id)
        const idCliente = req.cliente.id_cliente

        const resultado = await service.deletarAnimal(idAnimal, idCliente)

        res.status(200).json({ 
            resultado,
            mensagem: 'Animal excluído com sucesso.'
        })


    } catch (error) {
        logError(error)
        const status = error.message === 'Animal não encontrado.' ? 404 : 400

        res.status(status).json(formatarError(error))
    }
})


export default endpoints