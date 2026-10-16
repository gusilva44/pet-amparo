import { Router } from 'express'
import * as service from '../service/veterinariosService.js'
import { logError, formatarError } from '../utils/error.js'
import { autenticar } from '../middleware/authMiddlware.js'
import verificarAdmin from '../middleware/verificarAdmin.js'

const endpoints = Router()

endpoints.get('/veterinarios', async (req, res) => {
    try {
        const veterinarios = await service.listarVeterinarios(req.query.unidade)
        res.status(200).json({ quantidade: veterinarios.length, veterinarios })
    } catch (error) {
        logError(error)
        res.status(400).json(formatarError(error))
    }
})

endpoints.post('/veterinarios', autenticar, verificarAdmin, async (req, res) => {
    try { res.status(201).json({ id_veterinario: await service.criarVeterinario(req.body) }) }
    catch (error) { logError(error); res.status(400).json(formatarError(error)) }
})

endpoints.get('/veterinarios/:id/horarios', async (req, res) => {
    try { res.json(await service.listarHorarios(Number(req.params.id))) }
    catch (error) { logError(error); res.status(400).json(formatarError(error)) }
})

endpoints.post('/veterinarios/:id/horarios', autenticar, verificarAdmin, async (req, res) => {
    try { res.status(201).json({ id_horario: await service.criarHorario(Number(req.params.id), req.body) }) }
    catch (error) { logError(error); res.status(error.message === 'Veterinário não encontrado.' ? 404 : 400).json(formatarError(error)) }
})

endpoints.delete('/veterinarios/:id/horarios/:idHorario', autenticar, verificarAdmin, async (req, res) => {
    try { await service.apagarHorario(Number(req.params.id), Number(req.params.idHorario)); res.json({ mensagem: 'Horário excluído com sucesso.' }) }
    catch (error) { logError(error); res.status(error.message === 'Horário não encontrado.' ? 404 : 400).json(formatarError(error)) }
})

export default endpoints
