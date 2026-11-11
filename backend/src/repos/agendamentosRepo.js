import { db } from "./connection.js";

export async function buscarVeterinarioNaUnidade(idVeterinario, idUnidade) {
  const [resultado] = await db.query(
    `
        SELECT
            v.id_veterinario,
            v.nome,
            vu.id_unidade,
            v.ativo,
            u.ativo AS usuario_ativo
        FROM veterinarios as v
        INNER JOIN usuarios as u
            ON u.id_usuario = v.id_usuario
        INNER JOIN veterinarios_unidades as vu
            ON vu.id_veterinario = v.id_veterinario
        WHERE v.id_veterinario = ? AND vu.id_unidade = ? AND vu.ativo = TRUE
    `,
    [idVeterinario, idUnidade],
  );

  return resultado[0];
}

export async function listarVeterinarios(idUnidade) {
  const filtroUnidade = idUnidade === undefined ? "" : "AND vu.id_unidade = ?";
  const valores = idUnidade === undefined ? [] : [idUnidade];
  const [resultado] = await db.query(
    `
        SELECT DISTINCT
            v.id_veterinario,
            v.nome,
            v.crmv,
            v.especialidade,
            v.telefone,
            vu.id_unidade
        FROM veterinarios as v
        INNER JOIN usuarios as u
            ON u.id_usuario = v.id_usuario
        INNER JOIN veterinarios_unidades as vu
            ON vu.id_veterinario = v.id_veterinario
        WHERE v.ativo = TRUE
          AND u.ativo = TRUE
          AND vu.ativo = TRUE
          ${filtroUnidade}
        ORDER BY v.nome
    `,
    valores,
  );

  return resultado;
}

export async function buscarHorarioDoVeterinario(
  idVeterinario,
  idUnidade,
  diaSemana,
  data,
  idServico,
) {
  const [resultado] = await db.query(
    `
        SELECT
            id_horario,
            hora_inicio,
            hora_fim,
            id_unidade,
            data_disponivel
        FROM horarios_veterinarios
        WHERE id_veterinario = ? AND id_unidade = ?
          AND dia_semana = ?
          AND ativo = TRUE
          AND (data_disponivel IS NULL OR data_disponivel = ?)
          AND (NOT EXISTS (SELECT 1 FROM horarios_veterinarios_servicos hs WHERE hs.id_horario = horarios_veterinarios.id_horario)
               OR EXISTS (SELECT 1 FROM horarios_veterinarios_servicos hs WHERE hs.id_horario = horarios_veterinarios.id_horario AND hs.id_servico = ?))
        ORDER BY hora_inicio
    `,
    [idVeterinario, idUnidade, diaSemana, data, idServico],
  );

  return resultado;
}

export async function listarAgendamentosCliente(idCliente) {
  const [resultado] = await db.query(
    `
        SELECT
            a.id_agendamento,
            a.inicio,
            a.fim,
            a.status,
            CASE
                WHEN a.status = 'concluido' THEN 'concluido'
                WHEN a.status = 'cancelado' THEN 'cancelado'
                ELSE 'pendente'
            END AS situacao,
            a.id_unidade,
            u.nome AS unidade,
            u.endereco,
            a.observacao,
            an.id_animal,
            an.nome AS animal,
            s.id_servico,
            s.nome AS servico,
            v.id_veterinario,
            v.nome AS veterinario
        FROM agendamentos as a
        INNER JOIN animais as an
            ON an.id_animal = a.id_animal
        INNER JOIN servicos as s
            ON s.id_servico = a.id_servico
        INNER JOIN veterinarios as v
            ON v.id_veterinario = a.id_veterinario
        INNER JOIN unidades as u
            ON u.id_unidade = a.id_unidade
        WHERE a.id_cliente = ?
        ORDER BY a.inicio DESC
    `,
    [idCliente],
  );

  return resultado;
}

export async function listarAgendamentosVeterinario(
  idVeterinario,
  filtros = {},
) {
  const condicoes = ["a.id_veterinario = ?"];
  const valores = [idVeterinario];

  if (filtros.mes) {
    condicoes.push("DATE_FORMAT(a.inicio, '%Y-%m') = ?");
    valores.push(filtros.mes);
  }

  if (filtros.situacao === "pendente") {
    condicoes.push(
      "a.status IN ('agendado', 'confirmado', 'em_atendimento')",
    );
  }

  if (filtros.situacao === "concluido") {
    condicoes.push("a.status = 'concluido'");
  }

  if (filtros.situacao === "cancelado") {
    condicoes.push("a.status = 'cancelado'");
  }

  const [resultado] = await db.query(
    `
        SELECT
            a.id_agendamento,
            a.inicio,
            a.fim,
            a.status,
            CASE
                WHEN a.status = 'concluido' THEN 'concluido'
                WHEN a.status = 'cancelado' THEN 'cancelado'
                ELSE 'pendente'
            END AS situacao,
            a.observacao,
            c.id_cliente,
            c.nome AS cliente,
            c.telefone AS cliente_telefone,
            c.cpf AS cliente_cpf,
            an.id_animal,
            an.nome AS animal,
            an.especie,
            an.raca,
            an.porte,
            an.sexo,
            an.idade,
            an.rga,
            an.e_vacinado,
            an.foto AS animal_foto,
            s.id_servico,
            s.nome AS servico,
            s.duracao_minutos,
            u.id_unidade,
            u.nome AS unidade
        FROM agendamentos a
        INNER JOIN clientes as c ON c.id_cliente = a.id_cliente
        INNER JOIN animais as an ON an.id_animal = a.id_animal
        INNER JOIN servicos as s ON s.id_servico = a.id_servico
        INNER JOIN unidades as u ON u.id_unidade = a.id_unidade
        WHERE ${condicoes.join(" AND ")}
        ORDER BY a.inicio
    `,
    valores,
  );

  return resultado;
}

export async function buscarAgendamentoDoCliente(idAgendamento, idCliente) {
  const [resultado] = await db.query(
    `
        SELECT *
        FROM agendamentos
        WHERE id_agendamento = ?
          AND id_cliente = ?
    `,
    [idAgendamento, idCliente],
  );

  return resultado[0];
}

export async function buscarAgendamentoDoVeterinario(
  idAgendamento,
  idVeterinario,
) {
  const [resultado] = await db.query(
    `
        SELECT id_agendamento, status
        FROM agendamentos
        WHERE id_agendamento = ? AND id_veterinario = ?
    `,
    [idAgendamento, idVeterinario],
  );
  return resultado[0];
}

export async function atualizarStatusDoAgendamento(
  idAgendamento,
  idVeterinario,
  status,
) {
  const [resultado] = await db.query(
    `
        UPDATE agendamentos
        SET status = ?
        WHERE id_agendamento = ? AND id_veterinario = ?
    `,
    [status, idAgendamento, idVeterinario],
  );
  return resultado.affectedRows;
}

export async function existeConflito(
  idVeterinario,
  inicio,
  fim,
  ignorarId = null,
) {
  let sql = `
        SELECT id_agendamento
        FROM agendamentos
        WHERE id_veterinario = ?
          AND status <> 'cancelado'
          AND inicio < ?
          AND fim > ?
    `;

  const valores = [idVeterinario, fim, inicio];

  if (ignorarId) {
    sql += " AND id_agendamento <> ?";
    valores.push(ignorarId);
  }

  const [resultado] = await db.query(sql, valores);

  return Boolean(resultado[0]);
}

export async function listarConflitos(idVeterinario, data) {
  const [resultado] = await db.query(
    `SELECT inicio, fim FROM agendamentos
     WHERE id_veterinario = ? AND DATE(inicio) = ?
       AND status <> 'cancelado'
     ORDER BY inicio`,
    [idVeterinario, data],
  );
  return resultado;
}

export async function criarAgendamento(agendamento) {
  const [resultado] = await db.query(
    `
        INSERT INTO agendamentos (
            id_cliente,
            id_animal,
            id_veterinario,
            id_unidade,
            id_servico,
            inicio,
            fim,
            observacao
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      agendamento.id_cliente,
      agendamento.id_animal,
      agendamento.id_veterinario,
      agendamento.id_unidade,
      agendamento.id_servico,
      agendamento.inicio,
      agendamento.fim,
      agendamento.observacao,
    ],
  );

  return resultado.insertId;
}

export async function cancelarAgendamento(idAgendamento, idCliente) {
  const [resultado] = await db.query(
    `
        UPDATE agendamentos
        SET status = 'cancelado'
        WHERE id_agendamento = ?
          AND id_cliente = ?
          AND status IN ('agendado', 'confirmado')
    `,
    [idAgendamento, idCliente],
  );

  return resultado.affectedRows;
}
