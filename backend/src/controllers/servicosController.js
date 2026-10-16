import { Router } from 'express'
import * as service from '../service/servicosService.js'
import { autenticar } from '../middleware/authMiddlware.js'
import verificarAdmin from '../middleware/verificarAdmin.js'
import { logError, formatarError } from '../utils/error.js'

const endpoints = Router()

endpoints.get('/servicos', async (req, res) => {
    try {
        const incluirInativos = req.query.incluir_inativos === 'true' && req.usuario?.tipo === 'admin'
        res.status(200).json(await service.listarServicos(incluirInativos))
    } catch (error) {
        logError(error)
        res.status(400).json(formatarError(error))
    }
})

endpoints.get('/servicos/:id', async (req, res) => {
    try {
        res.status(200).json(await service.buscarServicoPorId(Number(req.params.id)))
    } catch (error) {
        logError(error)
        res.status(error.message === 'Serviço não encontrado.' ? 404 : 400).json(formatarError(error))
    }
})

endpoints.post('/servicos', autenticar, verificarAdmin, async (req, res) => {
    try {
        const id_servico = await service.criarServico(req.body)
        res.status(201).json({ mensagem: 'Serviço cadastrado com sucesso.', id_servico })
    } catch (error) {
        logError(error)
        res.status(400).json(formatarError(error))
    }
})

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
