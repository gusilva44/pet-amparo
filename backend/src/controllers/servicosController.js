import { Router } from 'express'
import { autenticar } from '../middleware/authMiddlware.js'
import { logError, formatarError } from '../utils/error.js'
import verificarAdmin from '../middleware/verificarAdmin.js'

import * as service from '../service/servicosService.js'

const endpoints = Router()

// LISTAR TODOS OS SERVIÇOS
endpoints.get('/servicos', async (req, res) => {
    try {
        const incluirInativos = req.query.incluir_inativos === 'true' && req.usuario?.tipo === 'admin'
        
        const resultado = await service.listarServicos(incluirInativos)

        res.status(200).json({
            sucesso: true,
            resultado
        })
    } catch (error) {
        logError(error)
        res.status(400).json(formatarError(error))
    }
})

// BUSCAR SERVIÇO POR ID 
endpoints.get('/servicos/:id', async (req, res) => {
    try {
        const id_servico = Number(req.params.id)

        const resultado = await service.buscarServicoPorId(id_servico)

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

// CRIAR NOVO SERVIÇO
endpoints.post('/servicos', autenticar, verificarAdmin, async (req, res) => {
    try {
        const dados = req.body

        const id_servico = await service.criarServico(dados)

        res.status(201).json({ 
            sucesso: true,
            mensagem: 'Serviço cadastrado com sucesso.', 
            id_servico 
        })
    } catch (error) {
        logError(error)
        res.status(400).json(formatarError(error))
    }
})

// ATUALIZAR SERVIÇO
endpoints.put('/servicos/:id', autenticar, verificarAdmin, async (req, res) => {
    try {
        const dados = req.body
        const id = Number(req.params.id)

        const linhas_afetadas = await service.atualizarServico(id, dados)
        res.status(200).json({ 
            sucesso: true,
            mensagem: 'Serviço atualizado com sucesso.',
            linhas_afetadas
        })
    } catch (error) {
        const status = error.message.includes("não encontrado") ? 404 : 400

        logError(error)
        res.status(status).json(formatarError(error))
    }
})

export default endpoints
