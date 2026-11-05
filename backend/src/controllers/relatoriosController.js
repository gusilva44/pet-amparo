import { Router } from "express"
import { autenticar } from "../middleware/authMiddlware.js"
import verificarAdmin from "../middleware/verificarAdmin.js"
import { logError, formatarError } from "../utils/error.js"

import * as service from "../service/relatoriosService.js"

const endpoints = Router()

endpoints.get('/admin/relatorios', autenticar, verificarAdmin, async (req, res) => {
    try {
        const periodo = req.query.periodo

        const relatorio = await service.gerarRelatorio(periodo)

        res.status(200).json({
            sucesso: true,
            resultado: relatorio
        })
    } catch (error) {
        logError(error)
        res.status(500).json(formatarError(error))
    }
})

export default endpoints
