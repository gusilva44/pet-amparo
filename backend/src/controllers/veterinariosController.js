import { Router } from "express";
import { logError, formatarError } from "../utils/error.js";
import { autenticar } from "../middleware/authMiddlware.js";
import { exigirVeterinario } from "../middleware/exigirVeterinario.js";
import verificarAdmin from "../middleware/verificarAdmin.js";

import * as service from "../service/veterinariosService.js";
import * as agendamentosService from "../service/agendamentosService.js";

const endpoints = Router();

function statusDoErro(error) {
  return error.message.includes("não encontrado") ? 404 : 400;
}

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
    res.status(statusDoErro(error)).json(formatarError(error));
  }
});

endpoints.get(
  "/veterinarios/me/agendamentos",
  autenticar,
  exigirVeterinario,
  async (req, res) => {
    try {
      const id = Number(req.veterinario.id_veterinario);

      const filtros = {
        mes: req.query.mes,
        situacao: req.query.situacao,
      };

      const agendamentos = await agendamentosService.listarAgendamentosDoVeterinario(
        id,
        filtros,
      );

      res.status(200).json({
        sucesso: true,
        quantidade: agendamentos.length,
        agendamentos,
      });
    } catch (error) {
      logError(error);
      res.status(statusDoErro(error)).json(formatarError(error));
    }
  },
);

endpoints.get(
  "/veterinarios/me/agenda",
  autenticar,
  exigirVeterinario,
  async (req, res) => {
    try {
      const id = Number(req.veterinario.id_veterinario);

      const agenda = await agendamentosService.montarAgendaDoVeterinario(id, {
        mes: req.query.mes,
        situacao: req.query.situacao,
      });

      res.status(200).json({
        sucesso: true,
        resultado: agenda,
      });
    } catch (error) {
      logError(error);
      res.status(statusDoErro(error)).json(formatarError(error));
    }
  },
);

endpoints.patch(
  "/veterinarios/me/agendamentos/:id/status",
  autenticar,
  exigirVeterinario,
  async (req, res) => {
    try {
      const id_agendamento = Number(req.params.id);
      const status = req.body?.status;
      const id_veterinario = Number(req.veterinario.id_veterinario);

      const resultado = await agendamentosService.atualizarStatusPeloVeterinario(
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
      logError(error);
      res.status(statusDoErro(error)).json(formatarError(error));
    }
  },
);

endpoints.get("/veterinarios/me/unidades", autenticar, exigirVeterinario, async (req, res) => {
  try {
    const resultado = await service.listarUnidadesDoVeterinario(Number(req.veterinario.id_veterinario));
    res.status(200).json({ sucesso: true, resultado });
  } catch (error) {
    logError(error);
    res.status(statusDoErro(error)).json(formatarError(error));
  }
});

endpoints.get("/veterinarios/me/horarios", autenticar, exigirVeterinario, async (req, res) => {
  try {
    const resultado = await service.listarHorarios(Number(req.veterinario.id_veterinario));
    res.status(200).json({ sucesso: true, resultado });
  } catch (error) {
    logError(error);
    res.status(statusDoErro(error)).json(formatarError(error));
  }
});

endpoints.post("/veterinarios/me/horarios", autenticar, exigirVeterinario, async (req, res) => {
  try {
    const id_horario = await service.criarHorario(Number(req.veterinario.id_veterinario), req.body);
    res.status(201).json({ sucesso: true, id_horario });
  } catch (error) {
    logError(error);
    res.status(statusDoErro(error)).json(formatarError(error));
  }
});

endpoints.delete("/veterinarios/me/horarios/:idHorario", autenticar, exigirVeterinario, async (req, res) => {
  try {
    const resultado = await service.apagarHorario(Number(req.veterinario.id_veterinario), Number(req.params.idHorario));
    res.status(200).json({ sucesso: true, resultado });
  } catch (error) {
    logError(error);
    res.status(statusDoErro(error)).json(formatarError(error));
  }
});

endpoints.post("/veterinarios", autenticar, verificarAdmin, async (req, res) => {
  try {
    const resultado = await service.criarVeterinario(req.body);

    res.status(201).json({
      sucesso: true,
      id_veterinario: resultado,
    });
  } catch (error) {
    logError(error);
    res.status(statusDoErro(error)).json(formatarError(error));
  }
});

endpoints.post("/admin/veterinarios/:id/unidades/:idUnidade", autenticar, verificarAdmin, async (req, res) => {
  try {
    const resultado = await service.vincularVeterinarioUnidade(
      Number(req.params.id),
      Number(req.params.idUnidade),
    );
    res.status(200).json({ sucesso: true, mensagem: "Veterinário vinculado à unidade.", resultado });
  } catch (error) {
    logError(error);
    res.status(statusDoErro(error)).json(formatarError(error));
  }
});

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
    res.status(statusDoErro(error)).json(formatarError(error));
  }
});

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
      logError(error);
      res.status(statusDoErro(error)).json(formatarError(error));
    }
  },
);

endpoints.delete(
  "/veterinarios/:id/horarios/:idHorario",
  autenticar,
  verificarAdmin,
  async (req, res) => {
    try {
      const id_veterinario = Number(req.params.id);
      const id_horario = Number(req.params.idHorario);

      const resultado = await service.apagarHorario(
        id_veterinario,
        id_horario,
      );

      res.status(200).json({
        sucesso: true,
        mensagem: "Horário excluído com sucesso.",
        resultado,
      });
    } catch (error) {
      logError(error);
      res.status(statusDoErro(error)).json(formatarError(error));
    }
  },
);

export default endpoints;
