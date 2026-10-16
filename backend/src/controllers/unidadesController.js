import { Router } from 'express'
import * as service from '../service/unidadesService.js'
import { autenticar } from '../middleware/authMiddlware.js'
import verificarAdmin from '../middleware/verificarAdmin.js'
import { logError, formatarError } from '../utils/error.js'

const endpoints = Router()

endpoints.get('/unidades', async (req, res) => {
    try {
        const incluirInativas = req.query.incluir_inativas === 'true' && req.usuario?.tipo === 'admin'
        res.status(200).json(await service.listarUnidades(incluirInativas))
    } catch (error) {
        logError(error)
        res.status(400).json(formatarError(error))
    }
})

endpoints.get('/unidades/:id', async (req, res) => {
    try {
        res.status(200).json(await service.buscarUnidadePorId(Number(req.params.id)))
    } catch (error) {
        logError(error)
        res.status(error.message === 'Unidade não encontrada.' ? 404 : 400).json(formatarError(error))
    }
})

endpoints.post('/unidades', autenticar, verificarAdmin, async (req, res) => {
    try {
        const id_unidade = await service.criarUnidade(req.body)
        res.status(201).json({ mensagem: 'Unidade cadastrada com sucesso.', id_unidade })
    } catch (error) {
        logError(error)
        res.status(400).json(formatarError(error))
    }
})

endpoints.put('/unidades/:id', autenticar, verificarAdmin, async (req, res) => {
    try {
        const linhas_afetadas = await service.atualizarUnidade(Number(req.params.id), req.body)
        res.status(200).json({ mensagem: 'Unidade atualizada com sucesso.', linhas_afetadas })
    } catch (error) {
        logError(error)
        res.status(error.message === 'Unidade não encontrada.' ? 404 : 400).json(formatarError(error))
    }
})

export default endpoints
