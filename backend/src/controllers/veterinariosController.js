import { Router } from 'express'
import * as service from '../service/veterinariosService.js'
import { logError, formatarError } from '../utils/error.js'
import { autenticar } from '../middleware/authMiddlware.js'
import verificarAdmin from '../middleware/verificarAdmin.js'

const endpoints = Router()

// LISTAR VETERINARIOS POR UNIDADE
endpoints.get('/veterinarios', async (req, res) => {
    try {
        const unidade = req.query.unidade

        const veterinarios = await service.listarVeterinarios(unidade)

        res.status(200).json({ 
            quantidade: veterinarios.length, 
            veterinarios 
        })
    } catch (error) {
        logError(error)
        res.status(400).json(formatarError(error))
    }
})

// CRIAR VETERINARIO
endpoints.post('/veterinarios', autenticar, verificarAdmin, async (req, res) => {
    try { 
        const dados = req.body

        const resultado = await service.criarVeterinario(dados)

        res.status(201).json({ 
            id_veterinario: resultado 
        }) 
    } catch (error) { 
        logError(error)
        res.status(400).json(formatarError(error)) 
    }
})

// BUSCAR HORARIOS
endpoints.get('/veterinarios/:id/horarios', async (req, res) => {
    try { 
        const id_veterinario = Number(req.params.id)

        const resultado = await service.listarHorarios(id_veterinario)

        res.json(resultado) 
    } catch (error) { 
        logError(error)
        res.status(400).json(formatarError(error)) 
    }
})

// CRIAR NOVO HORARIO
endpoints.post('/veterinarios/:id/horarios', autenticar, verificarAdmin, async (req, res) => {
    try { 
        const dados = req.body
        const id_veterinario = Number(req.params.id)

        const resultado = await service.criarHorario(id_veterinario, dados)

        res.status(201).json({ id_horario: resultado }) 
    } catch (error) { 
        const status = error.message === 'Veterinário não encontrado.' ? 404 : 400

        logError(error)
        res.status(status).json(formatarError(error)) 
    }
})

// DELETAR HORARIO
endpoints.delete('/veterinarios/:id/horarios/:idHorario', autenticar, verificarAdmin, async (req, res) => {
    try { 
        const id_veterinario = Number(req.params.id)
        const id_horario = Number(req.params.idHorario)

        const resultado = await service.apagarHorario(id_veterinario, id_horario)

        res.status(200).json({ 
            mensagem: 'Horário excluído com sucesso.',
            resultado
        }) 
    } catch (error) { 
        const status = error.message === 'Horário não encontrado.' ? 404 : 400

        logError(error)
        res.status(status).json(formatarError(error)) 
    }
})

export default endpoints
