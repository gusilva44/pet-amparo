import { Router } from 'express'
import { autenticar } from '../middleware/authMiddlware.js'
import { logError, formatarError } from '../utils/error.js'
import verificarAdmin from '../middleware/verificarAdmin.js'

import * as service from '../service/unidadesService.js'

const endpoints = Router()

endpoints.get('/unidades', async (req, res) => {
    try {
        const incluirInativas = req.query.incluir_inativas === 'true' && req.usuario?.tipo === 'admin'
        const incluirServicos = req.query.incluir_servicos === 'true'

        const resultado = await service.listarUnidades(incluirInativas, incluirServicos)

        res.status(200).json({
            sucesso: true,
            resultado
        })
    } catch (error) {
        logError(error)
        res.status(400).json(formatarError(error))
    }
})

endpoints.get('/unidades/:id', async (req, res) => {
    try {
        const id = Number(req.params.id)

        const resultado = await service.buscarUnidadePorId(id)

        res.status(200).json({
            sucesso: true,
            resultado
        })
    } catch (error) {
        const status = error.message.includes("não encontrada") ? 404 : 400

        logError(error)
        res.status(status).json(formatarError(error))
    }
})

endpoints.post('/unidades', autenticar, verificarAdmin, async (req, res) => {
    try {
        const dados = req.body

        const id_unidade = await service.criarUnidade(dados)

        res.status(201).json({ 
            sucesso: true,
            mensagem: 'Unidade cadastrada com sucesso.',
            id_unidade 
        })
    } catch (error) {
        logError(error)
        res.status(400).json(formatarError(error))
    }
})

endpoints.put('/unidades/:id', autenticar, verificarAdmin, async (req, res) => {
    try {
        const id_unidade = Number(req.params.id)
        const dados = req.body

        const linhas_afetadas = await service.atualizarUnidade(id_unidade, dados)

        res.status(200).json({ 
            sucesso: true,
            mensagem: 'Unidade atualizada com sucesso.', 
            linhas_afetadas 
        })
    } catch (error) {
        const status = error.message.includes("não encontrada") ? 404 : 400

        logError(error)
        res.status(status).json(formatarError(error))
    }
})

endpoints.post('/unidades/:id/servicos/:idServico', autenticar, verificarAdmin, async (req, res) => {
    try {
        const id_unidade = Number(req.params.id)
        const id_servico = Number(req.params.idServico)

        const resultado = await service.vincularServico(id_unidade, id_servico)

        res.status(200).json({ 
            sucesso: true,
            mensagem: 'Serviço vinculado à unidade com sucesso.',
            resultado
        })
    } catch (error) {
        const status = error.message.includes("não encontrada") ? 404 : 400

        logError(error)
        res.status(status).json(formatarError(error))
    }
})

endpoints.delete('/unidades/:id/servicos/:idServico', autenticar, verificarAdmin, async (req, res) => {
    try {
        const id_unidade = Number(req.params.id)
        const id_servico = Number(req.params.idServico)

        const resultado = await service.desvincularServico(id_unidade, id_servico)
        res.status(200).json({ 
            sucesso: true,
            mensagem: 'Serviço desvinculado da unidade com sucesso.',
            resultado
        })
    } catch (error) {
        const status = error.message.includes("não está vinculado") ? 404 : 400

        logError(error)
        res.status(status).json(formatarError(error))
    }
})

export default endpoints
