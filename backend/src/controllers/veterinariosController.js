import { Router } from "express";
import { logError, formatarError } from "../utils/error.js";
import { autenticar } from "../middleware/authMiddlware.js";
import { exigirVeterinario } from "../middleware/exigirVeterinario.js";
import verificarAdmin from "../middleware/verificarAdmin.js";

import * as service from "../service/veterinariosService.js";
import * as agendamentosService from "../service/agendamentosService.js";

const endpoints = Router();

// LISTAR VETERINARIOS POR UNIDADE
endpoints.get("/veterinarios", async (req, res) => {
  try {
    const idUnidade =
      req.query.id_unidade === undefined
        ? undefined
        : Number(req.query.id_unidade);

    const veterinarios = await service.listarVeterinarios(idUnidade);

    res.status(200).json({
      sucesso: true,
      quantidade: veterinarios.length,
      veterinarios,
    });
  } catch (error) {
    logError(error);
    res.status(400).json(formatarError(error));
  }
});

// AGENDAMENTOS DO VETERINÁRIO LOGADO
endpoints.get(
  "/veterinarios/me/agendamentos",
  autenticar,
  exigirVeterinario,
  async (req, res) => {
    try {
      const id = Number(req.veterinario.id_veterinario);

      const agendamentos =
        await agendamentosService.listarAgendamentosDoVeterinario(id);

      res.status(200).json({
        sucesso: true,
        quantidade: agendamentos.length,
        agendamentos,
      });
    } catch (error) {
      logError(error);
      res.status(400).json(formatarError(error));
    }
  },
);

// ATUALIZAR SITUAÇÃO DE UM AGENDAMENTO PRÓPRIO
endpoints.patch(
  "/veterinarios/me/agendamentos/:id/status",
  autenticar,
  exigirVeterinario,
  async (req, res) => {
    try {
      const id_agendamento = Number(req.params.id);
      const status = req.body?.status;
      const id_veterinario = Number(req.veterinario.id_veterinario);

      const resultado =
        await agendamentosService.atualizarStatusPeloVeterinario(
          id_agendamento,
          id_veterinario,
          status,
        );

      res.status(200).json({
        sucesso: true,
        mensagem: "Status do agendamento atualizado.",
        ...resultado,
      });
    } catch (error) {
      const status = error.message.includes("não encontrado.") ? 404 : 400;

      logError(error);
      res.status(status).json(formatarError(error));
    }
  },
);

// CRIAR VETERINARIO
endpoints.post(
  "/veterinarios",
  autenticar,
  verificarAdmin,
  async (req, res) => {
    try {
      const dados = req.body;

      const resultado = await service.criarVeterinario(dados);

      res.status(201).json({
        sucesso: true,
        id_veterinario: resultado,
      });
    } catch (error) {
      logError(error);
      res.status(400).json(formatarError(error));
    }
  },
);

// BUSCAR HORARIOS
endpoints.get("/veterinarios/:id/horarios", async (req, res) => {
  try {
    const id_veterinario = Number(req.params.id);

    const resultado = await service.listarHorarios(id_veterinario);

    res.status(200).json({
      sucesso: true,
      resultado,
    });
  } catch (error) {
    logError(error);
    res.status(400).json(formatarError(error));
  }
});

// CRIAR NOVO HORARIO
endpoints.post(
  "/veterinarios/:id/horarios",
  autenticar,
  verificarAdmin,
  async (req, res) => {
    try {
      const dados = req.body;
      const id_veterinario = Number(req.params.id);

      const resultado = await service.criarHorario(id_veterinario, dados);

      res.status(201).json({
        sucesso: true,
        id_horario: resultado,
      });
    } catch (error) {
      const status = error.message.includes("não encontrado.") ? 404 : 400;

      logError(error);
      res.status(status).json(formatarError(error));
    }
  },
);

// DELETAR HORARIO
endpoints.delete(
  "/veterinarios/:id/horarios/:idHorario",
  autenticar,
  verificarAdmin,
  async (req, res) => {
    try {
      const id_veterinario = Number(req.params.id);
      const id_horario = Number(req.params.idHorario);

      const resultado = await service.apagarHorario(id_veterinario, id_horario);

      res.status(200).json({
        sucesso: true,
        mensagem: "Horário excluído com sucesso.",
        resultado,
      });
    } catch (error) {
      const status = error.message.includes("não encontrado.") ? 404 : 400;

      logError(error);
      res.status(status).json(formatarError(error));
    }
  },
);

export default endpoints;
