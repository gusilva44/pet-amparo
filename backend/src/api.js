import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import adicionarRotas from './router.js';

const app = express()

app.use(express.json())
app.use(cors())
adicionarRotas(app)

const PORT = process.env.PORT

app.listen(PORT, () =>{
    console.log(`---> API rodando na porta ${PORT}`)
})