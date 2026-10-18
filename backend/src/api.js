import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import adicionarRotas from './router.js';

const app = express()

// O front pode iniciar em 3000 ou 3001 durante o desenvolvimento, dependendo
// de qual processo ocupou a primeira porta. Como a autenticação usa cookie,
// a origem precisa estar autorizada pelo CORS para o navegador enviá-lo.
const origensPermitidas = (process.env.CORS_ORIGINS
    || 'http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001')
    .split(',')
    .map(origem => origem.trim())
    .filter(Boolean)

app.use(express.json())

app.use(cors({
    origin: origensPermitidas,
    credentials: true
}))

app.use(cookieParser())

adicionarRotas(app)

const PORT = process.env.PORT || 3000

app.listen(PORT, () =>{
    console.log(`---> API rodando na porta ${PORT}`)
})
