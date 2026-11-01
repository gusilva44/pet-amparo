import { db } from './connection.js'

const colunas = `id_unidade, nome, descricao, cep, endereco, numero, complemento, bairro, cidade, estado, telefone, email, latitude, longitude, ativo`

export async function listarUnidades(incluirInativas = false) {
    const [resultado] = await db.query(`SELECT ${colunas} FROM unidades ${incluirInativas ? '' : 'WHERE ativo = TRUE'} ORDER BY nome`)
    return resultado
}

export async function listarUnidadesComServicos(incluirInativas = false) {
    const [linhas] = await db.query(`
        SELECT
            u.id_unidade, 
            u.nome, 
            u.descricao, 
            u.cep,
            u.endereco, 
            u.numero,
            u.complemento, 
            u.bairro, 
            u.cidade, 
            u.estado, 
            u.telefone, 
            u.email,
            u.latitude, 
            u.longitude, 
            u.ativo,
            s.id_servico, 
            s.nome AS servico_nome, 
            s.descricao AS servico_descricao,
            s.duracao_minutos, 
            s.ativo AS servico_ativo
        FROM unidades AS u
        LEFT JOIN unidades_servicos AS us
            ON us.id_unidade = u.id_unidade AND us.ativo = TRUE
        LEFT JOIN servicos AS s
            ON s.id_servico = us.id_servico AND s.ativo = TRUE
        ${incluirInativas ? '' : 'WHERE u.ativo = TRUE'}
        ORDER BY u.nome, s.nome
    `)

    const unidades = new Map()
    for (const linha of linhas) {
        if (!unidades.has(linha.id_unidade)) {
            const { id_servico, servico_nome, servico_descricao, duracao_minutos, servico_ativo, ...unidade } = linha
            unidades.set(linha.id_unidade, { ...unidade, servicos: [] })
        }

        if (linha.id_servico) {
            unidades.get(linha.id_unidade).servicos.push({
                id_servico: linha.id_servico,
                nome: linha.servico_nome,
                descricao: linha.servico_descricao,
                duracao_minutos: linha.duracao_minutos,
                ativo: Boolean(linha.servico_ativo)
            })
        }
    }

    return [...unidades.values()]
}

export async function buscarUnidadePorId(idUnidade) {
    const [resultado] = await db.query(`SELECT ${colunas} FROM unidades WHERE id_unidade = ?`, [idUnidade])
    return resultado[0]
}

export async function criarUnidade(unidade) {
    const [resultado] = await db.query(`
        INSERT INTO unidades (nome, descricao, cep, endereco, numero, complemento, bairro, cidade, estado, telefone, email, latitude, longitude, ativo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        unidade.nome, 
        unidade.descricao, 
        unidade.cep, 
        unidade.endereco, 
        unidade.numero, 
        unidade.complemento, 
        unidade.bairro, 
        unidade.cidade, 
        unidade.estado, 
        unidade.telefone, 
        unidade.email, 
        unidade.latitude, 
        unidade.longitude, 
        unidade.ativo
    ])

    return resultado.insertId
}

export async function atualizarUnidade(idUnidade, unidade) {
    const [resultado] = await db.query(`
        UPDATE unidades 
        SET nome = ?, 
            descricao = ?, 
            cep = ?, 
            endereco = ?, 
            numero = ?, 
            complemento = ?, 
            bairro = ?, 
            cidade = ?, 
            estado = ?, 
            telefone = ?, 
            email = ?, 
            latitude = ?, 
            longitude = ?, 
            ativo = ?
        WHERE id_unidade = ?
    `, [
        unidade.nome, 
        unidade.descricao, 
        unidade.cep, 
        unidade.endereco, 
        unidade.numero, 
        unidade.complemento, 
        unidade.bairro, 
        unidade.cidade, 
        unidade.estado, 
        unidade.telefone, 
        unidade.email, 
        unidade.latitude, 
        unidade.longitude, 
        unidade.ativo, 
        idUnidade
    ])
    
    return resultado.affectedRows
}

export async function vincularServico(idUnidade, idServico) {
    await db.query(`
        INSERT INTO unidades_servicos (id_unidade, id_servico, ativo)
        VALUES (?, ?, TRUE)
        ON DUPLICATE KEY UPDATE ativo = TRUE
    `, [idUnidade, idServico])
}

export async function desvincularServico(idUnidade, idServico) {
    const [resultado] = await db.query(`
        UPDATE unidades_servicos
        SET ativo = FALSE
        WHERE id_unidade = ? AND id_servico = ? AND ativo = TRUE
    `, [idUnidade, idServico])
    return resultado.affectedRows
}

export async function contarVeterinariosVinculados(idUnidade) {
    const [resultado] = await db.query(`
        SELECT COUNT(*) AS total
        FROM veterinarios_unidades
        WHERE id_unidade = ?
    `, [idUnidade])

    return resultado[0].total
}

export async function contarAgendamentosVinculados(idUnidade) {
    const [resultado] = await db.query(`
        SELECT COUNT(*) AS total
        FROM agendamentos
        WHERE id_unidade = ?
    `, [idUnidade])

    return resultado[0].total
}

export async function excluirUnidade(idUnidade) {
    validarId(idUnidade)

    const unidade = await repo.buscarUnidadePorId(idUnidade)

    if (!unidade) {
        throw new Error('Unidade não encontrada.')
    }

    const [totalVeterinarios, totalAgendamentos] = await Promise.all([
        repo.contarVeterinariosVinculados(idUnidade),
        repo.contarAgendamentosVinculados(idUnidade)
    ])

    if (totalAgendamentos > 0) {
        throw new Error(
            `Não é possível excluir esta unidade. Existem ${totalAgendamentos} agendamento(s) vinculado(s).`
        )
    }

    if (totalVeterinarios > 0) {
        throw new Error(
            `Não é possível excluir esta unidade. Existem ${totalVeterinarios} vínculo(s) com veterinários.`
        )
    }

    try {
        const excluida = await repo.excluirUnidade(idUnidade)

        if (!excluida) {
            throw new Error('Não foi possível excluir a unidade.')
        }

        return {
            mensagem: 'Unidade excluída permanentemente.'
        }

    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            throw new Error(
                'Não foi possível excluir a unidade porque existem registros vinculados a ela.'
            )
        }

        throw error
    }
}

export async function atualizarStatusUnidade(idUnidade, ativo) {
    const [resultado] = await db.query(`
        UPDATE unidades
        SET ativo = ?
        WHERE id_unidade = ?
    `, [ativo, idUnidade])

    return resultado.affectedRows
}