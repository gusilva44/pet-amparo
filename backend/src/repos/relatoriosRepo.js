import { db } from "./connection.js";

const STATUS_CONCLUIDO = "concluido";
const STATUS_CANCELADO = "cancelado";

function filtroPeriodo(meses) {
  return `inicio >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)`;
}

export async function contarUnidades() {
  const [linhas] = await db.query(`
        SELECT
            COUNT(*) AS total,
            SUM(ativo = TRUE) AS ativas
        FROM unidades
    `);

  return linhas[0];
}

export async function contarUsuariosPorTipo() {
  const [linhas] = await db.query(`
        SELECT tipo, COUNT(*) AS total
        FROM usuarios
        GROUP BY tipo
    `);

  return linhas;
}

export async function contarAnimais() {
  const [linhas] = await db.query(`
        SELECT
            COUNT(*) AS total,
            SUM(e_vacinado = TRUE) AS vacinados
        FROM animais
    `);

  return linhas[0];
}

export async function contarServicos() {
  const [linhas] = await db.query(`
        SELECT
            COUNT(*) AS total,
            SUM(ativo = TRUE) AS ativos
        FROM servicos
    `);

  return linhas[0];
}

export async function contarAgendamentosPorStatus(meses) {
  const [linhas] = await db.query(
    `
        SELECT status, COUNT(*) AS total
        FROM agendamentos
        WHERE ${filtroPeriodo(meses)}
        GROUP BY status
    `,
    [meses],
  );

  return linhas;
}

export async function agendamentosPorUnidade(meses) {
  const [linhas] = await db.query(
    `
        SELECT
            u.id_unidade,
            u.nome,
            COUNT(a.id_agendamento) AS total,
            SUM(a.status = ?) AS concluidos,
            SUM(a.status = ?) AS cancelados
        FROM unidades AS u
        LEFT JOIN agendamentos AS a
            ON a.id_unidade = u.id_unidade
            AND ${filtroPeriodo(meses)}
        GROUP BY u.id_unidade, u.nome
        ORDER BY total DESC, u.nome
    `,
    [STATUS_CONCLUIDO, STATUS_CANCELADO, meses],
  );

  return linhas;
}

export async function agendamentosPorServico(meses) {
  const [linhas] = await db.query(
    `
        SELECT
            s.id_servico,
            s.nome,
            COUNT(a.id_agendamento) AS total
        FROM servicos AS s
        LEFT JOIN agendamentos AS a
            ON a.id_servico = s.id_servico
            AND ${filtroPeriodo(meses)}
        GROUP BY s.id_servico, s.nome
        ORDER BY total DESC, s.nome
    `,
    [meses],
  );

  return linhas;
}

export async function agendamentosPorVeterinario(meses) {
  const [linhas] = await db.query(
    `
        SELECT
            v.id_veterinario,
            v.nome,
            v.especialidade,
            COUNT(a.id_agendamento) AS total,
            SUM(a.status = ?) AS concluidos
        FROM veterinarios AS v
        INNER JOIN agendamentos AS a
            ON a.id_veterinario = v.id_veterinario
            AND ${filtroPeriodo(meses)}
        GROUP BY v.id_veterinario, v.nome, v.especialidade
        ORDER BY total DESC
    `,
    [STATUS_CONCLUIDO, meses],
  );

  return linhas;
}

export async function agendamentosPorMes(meses) {
  const [linhas] = await db.query(
    `
        SELECT
            DATE_FORMAT(inicio, '%Y-%m') AS mes,
            COUNT(*) AS total,
            SUM(status = ?) AS concluidos,
            SUM(status = ?) AS cancelados
        FROM agendamentos
        WHERE ${filtroPeriodo(meses)}
        GROUP BY mes
        ORDER BY mes
    `,
    [STATUS_CONCLUIDO, STATUS_CANCELADO, meses],
  );

  return linhas;
}

export async function proximosAgendamentos(limite) {
  const [linhas] = await db.query(
    `
        SELECT
            a.id_agendamento,
            a.inicio,
            a.status,
            c.nome AS cliente,
            an.nome AS animal,
            s.nome AS servico,
            u.nome AS unidade,
            v.nome AS veterinario
        FROM agendamentos AS a
        INNER JOIN clientes AS c ON c.id_cliente = a.id_cliente
        INNER JOIN animais AS an ON an.id_animal = a.id_animal
        INNER JOIN servicos AS s ON s.id_servico = a.id_servico
        INNER JOIN unidades AS u ON u.id_unidade = a.id_unidade
        INNER JOIN veterinarios AS v ON v.id_veterinario = a.id_veterinario
        WHERE a.inicio >= NOW()
          AND a.status NOT IN ('cancelado')
        ORDER BY a.inicio
        LIMIT ?
    `,
    [limite],
  );

  return linhas;
}

export async function medicamentosMaisPrescritos(limite) {
  const [linhas] = await db.query(
    `
        SELECT
            m.id_medicamento,
            m.nome,
            COUNT(c.id_carteira) AS total
        FROM medicamentos AS m
        LEFT JOIN carteiras_medicacao AS c
            ON c.id_medicamento = m.id_medicamento
        GROUP BY m.id_medicamento, m.nome
        ORDER BY total DESC, m.nome
        LIMIT ?
    `,
    [limite],
  );

  return linhas;
}
