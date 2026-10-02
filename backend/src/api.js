import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import adicionarRotas from './router.js';

const app = express()

app.use(express.json())

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))

app(cookieParser())

adicionarRotas(app)

const PORT = process.env.PORT || 3001

app.listen(PORT, () =>{
    console.log(`---> API rodando na porta ${PORT}`)
})