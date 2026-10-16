import { Router } from 'express'
import * as service from '../service/medicamentosService.js'
import { autenticar } from '../middleware/authMiddlware.js'
import { exigirCliente } from '../middleware/exigirCliente.js'
import verificarAdmin from '../middleware/verificarAdmin.js'
import { logError, formatarError } from '../utils/error.js'

const endpoints = Router()
const tratar = (res, error) => { logError(error); res.status(error.message.includes('não encontrado') ? 404 : 400).json(formatarError(error)) }

endpoints.get('/medicamentos', async (req, res) => {
    try { res.json(await service.listarMedicamentos(false)) } catch (error) { tratar(res, error) }
})
endpoints.post('/medicamentos', autenticar, verificarAdmin, async (req, res) => {
    try { res.status(201).json({ id_medicamento: await service.criarMedicamento(req.body) }) } catch (error) { tratar(res, error) }
})
endpoints.put('/medicamentos/:id', autenticar, verificarAdmin, async (req, res) => {
    try { await service.atualizarMedicamento(Number(req.params.id), req.body); res.json({ mensagem: 'Medicamento atualizado com sucesso.' }) } catch (error) { tratar(res, error) }
})
endpoints.get('/animais/:id/medicacoes', autenticar, exigirCliente, async (req, res) => {
    try { res.json(await service.listarCarteira(Number(req.params.id), req.cliente.id_cliente)) } catch (error) { tratar(res, error) }
})
endpoints.post('/animais/:id/medicacoes', autenticar, verificarAdmin, async (req, res) => {
    try { res.status(201).json({ id_carteira: await service.adicionarNaCarteira(Number(req.params.id), req.body) }) } catch (error) { tratar(res, error) }
})

export default endpoints
