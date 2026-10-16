import { db } from './connection.js'

export async function buscarVeterinario(idVeterinario) {
    const [resultado] = await db.query(`
        SELECT v.id_veterinario, v.nome, v.unidade, v.ativo, u.ativo AS usuario_ativo
        FROM veterinarios v
        INNER JOIN usuarios u ON u.id_usuario = v.id_usuario
        WHERE v.id_veterinario = ?
    `, [idVeterinario])
    return resultado[0]
}

export async function listarVeterinarios(unidade) {
    const valores = []
    let filtro = `WHERE v.ativo = TRUE AND u.ativo = TRUE`
    if (unidade) {
        filtro += ' AND v.unidade = ?'
        valores.push(unidade)
    }
    const [resultado] = await db.query(`
        SELECT v.id_veterinario, v.nome, v.crmv, v.especialidade, v.unidade, v.telefone
        FROM veterinarios v
        INNER JOIN usuarios u ON u.id_usuario = v.id_usuario
        ${filtro}
        ORDER BY v.nome
    `, valores)
    return resultado
}

export async function buscarHorarioDoVeterinario(idVeterinario, diaSemana) {
    const [resultado] = await db.query(`
        SELECT id_horario, hora_inicio, hora_fim, unidade
        FROM horarios_veterinarios
        WHERE id_veterinario = ? AND dia_semana = ?
        ORDER BY hora_inicio
    `, [idVeterinario, diaSemana])
    return resultado
}

export async function listarAgendamentosCliente(idCliente) {
    const [resultado] = await db.query(`
        SELECT a.id_agendamento, a.inicio, a.fim, a.status, a.unidade, a.observacao,
               an.id_animal, an.nome AS animal, s.id_servico, s.nome AS servico,
               v.id_veterinario, v.nome AS veterinario
        FROM agendamentos a
        INNER JOIN animais an ON an.id_animal = a.id_animal
        INNER JOIN servicos s ON s.id_servico = a.id_servico
        INNER JOIN veterinarios v ON v.id_veterinario = a.id_veterinario
        WHERE a.id_cliente = ?
        ORDER BY a.inicio DESC
    `, [idCliente])
    return resultado
}

export async function buscarAgendamentoDoCliente(idAgendamento, idCliente) {
    const [resultado] = await db.query(`
        SELECT * FROM agendamentos WHERE id_agendamento = ? AND id_cliente = ?
    `, [idAgendamento, idCliente])
    return resultado[0]
}

export async function existeConflito(idVeterinario, inicio, fim, ignorarId = null) {
    let sql = `
        SELECT id_agendamento FROM agendamentos
        WHERE id_veterinario = ?
          AND status NOT IN ('cancelado', 'concluido')
          AND inicio < ? AND fim > ?
    `
    const valores = [idVeterinario, fim, inicio]
    if (ignorarId) {
        sql += ' AND id_agendamento <> ?'
        valores.push(ignorarId)
    }
    const [resultado] = await db.query(sql, valores)
    return Boolean(resultado[0])
}

export async function criarAgendamento(agendamento) {
    const [resultado] = await db.query(`
        INSERT INTO agendamentos
        (id_cliente, id_animal, id_veterinario, id_servico, unidade, inicio, fim, observacao)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        agendamento.id_cliente, agendamento.id_animal, agendamento.id_veterinario,
        agendamento.id_servico, agendamento.unidade, agendamento.inicio,
        agendamento.fim, agendamento.observacao
    ])
    return resultado.insertId
}

export async function cancelarAgendamento(idAgendamento, idCliente) {
    const [resultado] = await db.query(`
        UPDATE agendamentos SET status = 'cancelado'
        WHERE id_agendamento = ? AND id_cliente = ?
          AND status IN ('agendado', 'confirmado')
    `, [idAgendamento, idCliente])
    return resultado.affectedRows
}
