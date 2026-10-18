import { Router } from 'express'
import { autenticar } from '../middleware/authMiddlware.js'
import { exigirCliente } from '../middleware/exigirCliente.js'
import { logError, formatarError } from '../utils/error.js'
import verificarAdmin from '../middleware/verificarAdmin.js'

import * as service from '../service/medicamentosService.js'

const endpoints = Router()

// BUSCAR TODOS OS MEDICAMENTOS
endpoints.get('/medicamentos', async (req, res) => {
    try {         
        const resultado = await service.listarMedicamentos(false)

        res.status(200).json(resultado)
    } catch (error) {
        const status = error.message.includes("não encontrado") ? 404 : 400

        logError(error)
        res.status(status).json(formatarError(error))
    }
})

// CRIAR NOVO MEDICAMENTO 
endpoints.post('/medicamentos', autenticar, verificarAdmin, async (req, res) => {
    try { 
        const dados = req.body

        const resultado = await service.criarMedicamento(dados)

        res.status(201).json({ id_medicamento: resultado }) 
    } catch (error) { 
        const status = error.message.includes("não encontrado") ? 404 : 400

        logError(error)
        res.status(status).json(formatarError(error))
    }
})

// ATUALIZAR MEDICAMENTO
endpoints.put('/medicamentos/:id', autenticar, verificarAdmin, async (req, res) => {
    try { 
        const id_medicamento = Number(id.params.id)
        const dados = req.body

        const resultado = await service.atualizarMedicamento(dados, id_medicamento)
        
        res.json({ 
            mensagem: 'Medicamento atualizado com sucesso.',
            resultado
        }) 
    } catch (error) { 
        const status = error.message.includes("não encontrado") ? 404 : 400

        logError(error)
        res.status(status).json(formatarError(error))
    }
})

// LISTAR CARTEIRA DO ANIMAL
endpoints.get('/animais/:id/medicacoes', autenticar, exigirCliente, async (req, res) => {
    try { 
        const id_medicamento = Number(req.params.id)
        const id_cliente = Number(req.cliente.id_cliente)

        const resultado = await service.listarCarteira(id_medicamento, id_cliente)

        res.status(200).json({
            sucesso: true,
            resultado: resultado
        }) 
    } catch (error) { 
        const status = error.message.includes("não encontrado") ? 404 : 400

        logError(error)
        res.status(status).json(formatarError(error))
    }
})

// ADICIONAR MEDICAMENTO À CARTEIRA
endpoints.post('/animais/:id/medicacoes', autenticar, verificarAdmin, async (req, res) => {
    try {
        const id_medicamento = Number(req.params.id)
        const dados = req.body

        const resultado = await service.adicionarNaCarteira(id_medicamento, dados)

        res.status(201).json({ 
            sucesso: true,
            id_carteira: resultado 
        }) 
    } catch (error) { 
        const status = error.message.includes("não encontrado") ? 404 : 400

        logError(error)
        res.status(status).json(formatarError(error))
    }
})

export default endpoints
