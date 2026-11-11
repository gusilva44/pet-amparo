import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import adicionarRotas from './router.js';

const app = express()

const origensPermitidas = (process.env.CORS_ORIGINS
    || 'http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001')
    .split(',')
    .map(origem => origem.trim())
    .filter(Boolean)

app.use(express.json({ limit: '8mb' }))

app.use(cors({
    origin: origensPermitidas,
    credentials: true
}))

app.use(cookieParser())

const diretorioUploads = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../uploads')
app.use('/uploads', express.static(diretorioUploads, {
    dotfiles: 'deny',
    index: false,
    immutable: true,
    maxAge: '1y',
    fallthrough: false,
}))

adicionarRotas(app)

const PORT = process.env.PORT || 3001

app.listen(PORT, () =>{
    console.log(`---> API rodando na porta ${PORT}`)
})