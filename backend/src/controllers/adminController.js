import { Router } from "express"
import { autenticar } from "../middleware/authMiddlware.js"
import { logError, formatarError } from "../utils/error.js"
import verificarAdmin from '../middleware/verificarAdmin.js'

import * as service from '../service/adminService.js'

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

        if (resultado.length === 0) throw new Error('Nenhum cliente encontrado.')

        res.status(200).json({
            sucesso: true,
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

        if (!resultado || resultado < 0) throw new Error('Cliente não encontrado.')

        res.status(201).json({
            sucesso: true,
            mensagem: 'Cliente cadastrado com sucesso.',
            resultado: resultado
        })
    } catch (error) {
        const status = error.message.includes("não encontrado") ? 404 : 400

        logError(error)
        res.status(status).json(formatarError(error))
    }
})

// BUSCAR TODOS OS CLIENTES
endpoints.get('/clientes', autenticar, verificarAdmin, async (req, res) => {
    try {
        const resultado = await service.buscarTodosClientes()

        res.status(200).json({
            sucesso: true,
            resultado
        })
    } catch (error) {
        logError(error)
        res.status(500).json(formatarError(error))
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

        const cliente = await service.deletarCliente(id)

        if (!cliente) {
            return res.status(404).json({
                mensagem: 'Cliente não encontrado.'
            })
        }

        res.status(200).json({
            sucesso: true,
            mensagem: 'Cliente excluído com sucesso.',
            resultado: cliente
        })

    } catch (error) {
        const status = error.message.includes("não encontrado") ? 404 : 400

        logError(error)
        res.status(status).json(formatarError(error))
    }
})

// ATUALIZAR CLIENTE 
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
            sucesso: true,
            mensagem:
                'Cliente atualizado com sucesso.',
            resultado
        })

    } catch (error) {
        const status = error.message.includes("não encontrado") ? 404 : 400

        logError(error)
        res.status(status).json(formatarError(error))
    }
})

// ATIVAR USUÁRIO
endpoints.patch('/admin/usuarios/:id/ativar', autenticar, verificarAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id)

        const resultado = await service.alterarStatusUsuario(id, 1)

        res.status(200).json({
            sucesso: true,
            mensagem: 'Usuário ativado com sucesso.',
            resultado
        })

    } catch (error) {
        const status = error.message.includes("não encontrado") ? 404 : 400

        logError(error)
        res.status(status).json(formatarError(error))
    }
})

// DESATIVAR USUÁRIO
endpoints.patch('/admin/usuarios/:id/desativar', autenticar, verificarAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id)

        const resultado = await service.alterarStatusUsuario(id, 0)

        res.status(200).json({
            sucesso: true,
            mensagem: 'Usuário desativado com sucesso.',
            resultado
        })

    } catch (error) {
        const status = error.message.includes("não encontrado") ? 404 : 400

        logError(error)
        res.status(status).json(formatarError(error))
    }
})

// ATUALIZAR USUÁRIO

endpoints.put('/admin/usuarios/:id', autenticar, verificarAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id);

        const resultado = await service.atualizarUsuario(id, req.body);

        res.status(200).json({
            sucesso: true,
            mensagem: 'Usuário atualizado com sucesso.',
            resultado
        });

    } catch (error) {
        const status = error.message.includes("não encontrado") ? 404 : 400;

        logError(error);
        res.status(status).json(formatarError(error));
    }
});

export default endpoints