import * as service from '../service/clientesService.js'
import { Router } from 'express'
import { logError } from '../utils/error.js'

const endpoints = Router()

endpoints.get('/clientes', async (req, res) => {
    try {
        
    } catch (error) {
        logError(error)
    }
})

export default endpoints;