import { db } from './connection.js'

export async function listarServicos(incluirInativos = false) {
    const filtro = incluirInativos ? '' : 'WHERE s.ativo = TRUE'

    const [resultado] = await db.query(`
        SELECT
            s.id_servico,
            s.nome,
            s.descricao,
            s.duracao_minutos,
            s.ativo,
            (SELECT COUNT(*) FROM unidades_servicos AS us
                WHERE us.id_servico = s.id_servico AND us.ativo = TRUE) AS total_unidades,
            (SELECT COUNT(*) FROM agendamentos AS a
                WHERE a.id_servico = s.id_servico AND a.status <> 'cancelado') AS total_agendamentos
        FROM servicos AS s
        ${filtro}
        ORDER BY s.nome
    `)

    return resultado
}

export async function buscarServicoPorId(idServico) {
    const [resultado] = await db.query(`
        SELECT
            id_servico,
            nome,
            descricao,
            duracao_minutos,
            ativo
        FROM servicos
        WHERE id_servico = ?
    `, [idServico])

    return resultado[0]
}

export async function buscarServicoPorNome(nome) {
    const [resultado] = await db.query(`
        SELECT id_servico, nome
        FROM servicos
        WHERE nome = ?
    `, [nome])

    return resultado[0]
}

export async function servicoDisponivelNaUnidade(idServico, idUnidade) {
    const [resultado] = await db.query(`
        SELECT id_servico
        FROM unidades_servicos
        WHERE id_servico = ? AND id_unidade = ? AND ativo = TRUE
    `, [
        idServico,
        idUnidade
    ])

    return resultado[0]
}

export async function listarUnidadesDoServico(idServico) {
    const [resultado] = await db.query(`
        SELECT u.id_unidade, u.nome
        FROM unidades_servicos AS us
        INNER JOIN unidades AS u ON u.id_unidade = us.id_unidade
        WHERE us.id_servico = ? AND us.ativo = TRUE
        ORDER BY u.nome
    `, [idServico])

    return resultado
}

export async function criarServico(servico) {
    const [resultado] = await db.query(`
        INSERT INTO servicos (nome, descricao, duracao_minutos, ativo)
        VALUES (?, ?, ?, ?)
    `, [
        servico.nome,
        servico.descricao,
        servico.duracao_minutos,
        servico.ativo
    ])

    return resultado.insertId
}

export async function atualizarServico(idServico, servico) {
    const [resultado] = await db.query(`
        UPDATE servicos
        SET nome = ?,
            descricao = ?,
            duracao_minutos = ?,
            ativo = ?
        WHERE id_servico = ?
    `, [
        servico.nome,
        servico.descricao,
        servico.duracao_minutos,
        servico.ativo,
        idServico
    ])

    return resultado.affectedRows
}

export async function alterarStatusServico(idServico, ativo) {
    const [resultado] = await db.query(`
        UPDATE servicos
        SET ativo = ?
        WHERE id_servico = ?
    `, [ativo, idServico])

    return resultado.affectedRows
}

export async function existeAgendamentoFuturo(idServico) {
    const [resultado] = await db.query(`
        SELECT id_agendamento
        FROM agendamentos
        WHERE id_servico = ?
          AND inicio >= NOW()
          AND status NOT IN ('cancelado', 'concluido')
        LIMIT 1
    `, [idServico])

    return resultado[0]
}

export async function vincularUnidade(idServico, idUnidade) {
    const [resultado] = await db.query(`
        INSERT INTO unidades_servicos (id_unidade, id_servico, ativo)
        VALUES (?, ?, TRUE)
        ON DUPLICATE KEY UPDATE ativo = TRUE
    `, [idUnidade, idServico])

    return resultado.affectedRows
}

export async function desvincularUnidade(idServico, idUnidade) {
    const [resultado] = await db.query(`
        UPDATE unidades_servicos
        SET ativo = FALSE
        WHERE id_servico = ? AND id_unidade = ?
    `, [idServico, idUnidade])

    return resultado.affectedRows
}

export async function sincronizarUnidades(idServico, idsUnidades) {
    const [vinculadas] = await db.query(`
        SELECT id_unidade
        FROM unidades_servicos
        WHERE id_servico = ?
    `, [idServico])

    const atuais = vinculadas.map(item => Number(item.id_unidade))

    for (const idUnidade of idsUnidades) {
        await vincularUnidade(idServico, idUnidade)
    }

    for (const idUnidade of atuais) {
        if (!idsUnidades.includes(idUnidade)) {
            await desvincularUnidade(idServico, idUnidade)
        }
    }
}
