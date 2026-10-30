import { Router } from "express";

import { autenticar } from "../middleware/authMiddlware.js";
import verificarAdmin from "../middleware/verificarAdmin.js";

import * as service from "../service/usuariosService.js";

const endpoints = Router();

// LISTAR TODOS OS USUÁRIOS
endpoints.get("/usuarios", autenticar, verificarAdmin, async (req, res) => {
    try {
        const resultado = await service.buscarTodosUsuarios();

        return res.status(200).json({
            sucesso: true,
            resultado
        });

    } catch (error) {
        return res.status(500).json({
            sucesso: false,
            mensagem: error.message
        });
    }
});

// CADASTRAR ADMINISTRADOR
endpoints.post("/usuarios", autenticar, verificarAdmin, async (req, res) => {
    try {
        const resultado = await service.cadastrarUsuario(req.body);

        return res.status(201).json({
            sucesso: true,
            mensagem: "Administrador cadastrado com sucesso.",
            resultado
        });

    } catch (error) {
        return res.status(400).json({
            sucesso: false,
            mensagem: error.message
        });
    }
});

// ATUALIZAR E-MAIL
endpoints.put("/usuarios/:id", autenticar, verificarAdmin, async (req, res) => {
    try {
        const resultado = await service.atualizarUsuario(
            req.params.id,
            req.body
        );

        return res.status(200).json({
            sucesso: true,
            mensagem: "Usuário atualizado com sucesso.",
            resultado
        });

    } catch (error) {
        return res.status(400).json({
            sucesso: false,
            mensagem: error.message
        });
    }
});

// ATIVAR OU DESATIVAR USUÁRIO
endpoints.patch("/usuarios/:id/status", autenticar, verificarAdmin, async (req, res) => {
    try {
        const { ativo } = req.body;

        if (typeof ativo !== "boolean" && ativo !== 0 && ativo !== 1) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Informe um status válido."
            });
        }

        const resultado = await service.alterarStatusUsuario(
            req.params.id,
            ativo
        );

        return res.status(200).json({
            sucesso: true,
            mensagem: "Status atualizado com sucesso.",
            resultado
        });

    } catch (error) {
        return res.status(400).json({
            sucesso: false,
            mensagem: error.message
        });
    }
});

export default endpoints;