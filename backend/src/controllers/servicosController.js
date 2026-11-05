import { Router } from 'express'
import { autenticar } from '../middleware/authMiddlware.js'
import { logError, formatarError } from '../utils/error.js'
import verificarAdmin from '../middleware/verificarAdmin.js'

import * as service from '../service/servicosService.js'

const endpoints = Router()

endpoints.get('/servicos', autenticar, async (req, res) => {
    try {
        const ehAdmin = req.usuario?.tipo === 'admin'
        const incluirInativos = ehAdmin && req.query.incluir_inativos === 'true'

        const resultado = await service.listarServicos(incluirInativos)

        res.status(200).json({
            sucesso: true,
            quantidade: resultado.length,
            resultado
        })
    } catch (error) {
        const status = error.message.includes('não encontrado') ? 404 : 400

        logError(error)
        res.status(status).json(formatarError(error))
    }
})

endpoints.get('/servicos/:id', async (req, res) => {
    try {
        const id_servico = Number(req.params.id)

        const resultado = await service.buscarServicoPorId(id_servico)

        res.status(200).json({
            sucesso: true,
            resultado
        })
    } catch (error) {
        const status = error.message.includes('não encontrado') ? 404 : 400

        logError(error)
        res.status(status).json(formatarError(error))
    }
})

endpoints.post('/servicos', autenticar, verificarAdmin, async (req, res) => {
    try {
        const id_servico = await service.criarServico(req.body)

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

endpoints.put('/servicos/:id', autenticar, verificarAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id)

        const linhas_afetadas = await service.atualizarServico(id, req.body)

        res.status(200).json({
            sucesso: true,
            mensagem: 'Serviço atualizado com sucesso.',
            linhas_afetadas
        })
    } catch (error) {
        const status = error.message.includes('não encontrado') ? 404 : 400

        logError(error)
        res.status(status).json(formatarError(error))
    }
})

endpoints.patch('/servicos/:id/status', autenticar, verificarAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id)
        const ativo = req.body?.ativo

        await service.alterarStatusServico(id, ativo)

        res.status(200).json({
            sucesso: true,
            mensagem: ativo ? 'Serviço ativado com sucesso.' : 'Serviço desativado com sucesso.'
        })
    } catch (error) {
        const status = error.message.includes('não encontrado') ? 404 : 400

        logError(error)
        res.status(status).json(formatarError(error))
    }
})

export default endpoints
