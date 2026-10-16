import { db } from './connection.js'

export async function listarServicos(incluirInativos = false) {
    const filtro = incluirInativos ? '' : 'WHERE ativo = TRUE'
    const [resultado] = await db.query(`
        SELECT id_servico, nome, descricao, duracao_minutos, ativo
        FROM servicos ${filtro}
        ORDER BY nome
    `)
    return resultado
}

export async function buscarServicoPorId(idServico) {
    const [resultado] = await db.query(`
        SELECT id_servico, nome, descricao, duracao_minutos, ativo
        FROM servicos WHERE id_servico = ?
    `, [idServico])
    return resultado[0]
}

export async function criarServico(servico) {
    const [resultado] = await db.query(`
        INSERT INTO servicos (nome, descricao, duracao_minutos, ativo)
        VALUES (?, ?, ?, ?)
    `, [servico.nome, servico.descricao, servico.duracao_minutos, servico.ativo])
    return resultado.insertId
}

export async function atualizarServico(idServico, servico) {
    const [resultado] = await db.query(`
        UPDATE servicos
        SET nome = ?, descricao = ?, duracao_minutos = ?, ativo = ?
        WHERE id_servico = ?
    `, [servico.nome, servico.descricao, servico.duracao_minutos, servico.ativo, idServico])
    return resultado.affectedRows
}
