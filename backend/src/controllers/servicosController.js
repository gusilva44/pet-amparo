import { Router } from 'express'
import * as service from '../service/servicosService.js'
import { autenticar } from '../middleware/authMiddlware.js'
import verificarAdmin from '../middleware/verificarAdmin.js'
import { logError, formatarError } from '../utils/error.js'

const endpoints = Router()

// LISTAR TODOS OS SERVIÇOS
endpoints.get('/servicos', async (req, res) => {
    try {
        const incluirInativos = req.query.incluir_inativos === 'true' && req.usuario?.tipo === 'admin'
        
        const resultado = await service.listarServicos(incluirInativos)
        res.status(200).json(resultado)
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

        res.status(200).json(resultado)
    } catch (error) {
        logError(error)
        res.status(error.message === 'Serviço não encontrado.' ? 404 : 400).json(formatarError(error))
    }
})

// CRIAR NOVO SERVIÇO
endpoints.post('/servicos', autenticar, verificarAdmin, async (req, res) => {
    try {
        const id_servico = await service.criarServico(req.body)
        res.status(201).json({ 
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
        const linhas_afetadas = await service.atualizarServico(Number(req.params.id), req.body)
        res.status(200).json({ mensagem: 'Serviço atualizado com sucesso.', linhas_afetadas })
    } catch (error) {
        logError(error)
        res.status(error.message === 'Serviço não encontrado.' ? 404 : 400).json(formatarError(error))
    }
})

export default endpoints
