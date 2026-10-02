import * as service from '../service/adminService.js'
import { autenticar } from "../middleware/authMiddlware.js"
import { logError, formatarError } from "../utils/error.js"
import verificarAdmin from '../middleware/verificarAdmin.js'
import { Router } from "express"
const endpoints = Router()

// BUSCAR CLIENTES POR FILTRO
endpoints.get('/clientes/filtros', autenticar, verificarAdmin, async (req, res) => {
    try {
        const filtros = {
            nome: req.query.nome,
            id: req.query.id,
            cpf: req.query.cpf
        }

        const resultado = await service.buscarClientePorFiltros(filtros)

        if (!resultado) throw new Error('Nenhum cliente encontrado.')

        res.status(200).json({
            mensagem: 'Clientes encontrados com sucesso.',
            busca: resultado
        })

    } catch (error) {
        logError(error)
        res.status(404).json(formatarError(error))
        }
    }
)

// CADASTRAR CLIENTES
endpoints.post('/clientes', autenticar, verificarAdmin, async (req, res) => {
    try {
        const cliente = req.body
        const resultado = await service.cadastrarCliente(cliente)
        if (!resultado || resultado < 0) throw new Error('Erro ao cadastrar o cliente.')

        res.status(201).json({
            mensagem: 'Cliente cadastrado com sucesso.',
            resultado: resultado
        })
    } catch (error) {
        logError(error)
        res.status(400).json(
            formatarError(error)
        )
    }
})

// BUSCAR TODOS OS CLIENTES
endpoints.get('/clientes', autenticar, verificarAdmin, async (req, res) => {
    try {
        const resultado =
            await service.buscarTodosClientes()

        res.status(200).json(resultado)

    } catch (error) {
        logError(error)

        res.status(400).json(
            formatarError(error)
        )
    }
})

// DELETAR CLIENTE
endpoints.delete('/clientes/:id', autenticar, verificarAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id)

        if (Number.isNaN(id)) {
            return res.status(400).json({
                mensagem: 'ID do cliente inválido.'
            })
        }

        const cliente =
            await service.deletarCliente(id)

        if (!cliente) {
            return res.status(404).json({
                mensagem: 'Cliente não encontrado.'
            })
        }

        res.status(200).json({
            mensagem: 'Cliente excluído com sucesso.',
            resultado: cliente
        })

    } catch (error) {

        logError(error)

        res.status(400).json(
            formatarError(error)
        )
    }
})

// ATUALIZAR
endpoints.put('/clientes/:id', autenticar, verificarAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id)
        const cliente = req.body

        const resultado =
            await service.atualizarCliente(cliente, id)

        if (!resultado) {
            return res.status(404).json({
                mensagem: 'Cliente não encontrado.'
            })
        }

        res.status(200).json({
            mensagem:
                'Cliente atualizado com sucesso.',
            resultado
        })

    } catch (error) {
        logError(error)
        res.status(400).json(formatarError(error))
    }
})