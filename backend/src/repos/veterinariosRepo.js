import { db } from './connection.js'

export async function buscarPorCrmv(crmv) {
    const [resultado] = await db.query('SELECT id_veterinario FROM veterinarios WHERE crmv = ?', [crmv])
    return resultado[0]
}

export async function buscarVeterinarioPorId(idVeterinario) {
    const [resultado] = await db.query('SELECT id_veterinario FROM veterinarios WHERE id_veterinario = ?', [idVeterinario])
    return resultado[0]
}

export async function vincularUnidade(idVeterinario, idUnidade) {
    await db.query(`
        INSERT INTO veterinarios_unidades (id_veterinario, id_unidade, ativo)
        VALUES (?, ?, TRUE)
        ON DUPLICATE KEY UPDATE ativo = TRUE
    `, [idVeterinario, idUnidade])
}

export async function buscarVeterinarioPorUsuario(idUsuario) {
    const [resultado] = await db.query(`
        SELECT id_veterinario, id_usuario, nome, ativo
        FROM veterinarios
        WHERE id_usuario = ?
    `, [idUsuario])
    return resultado[0]
}

export async function criarVeterinario(dados) {
    await db.beginTransaction()
    try {
        const [usuario] = await db.query(`INSERT INTO usuarios (email, senha_hash, tipo) VALUES (?, ?, 'veterinario')`, [dados.email, dados.senha_hash])
        const [veterinario] = await db.query(`
            INSERT INTO veterinarios (id_usuario, nome, crmv, especialidade, telefone)
            VALUES (?, ?, ?, ?, ?)
        `, [usuario.insertId, dados.nome, dados.crmv, dados.especialidade, dados.telefone])

        await db.query(`
            INSERT INTO veterinarios_unidades (id_veterinario, id_unidade)
            VALUES (?, ?)
        `, [veterinario.insertId, dados.id_unidade])

        await db.commit()
        return veterinario.insertId
    } catch (error) {
        await db.rollback(); throw error
    }
}

export async function veterinarioAtendeNaUnidade(idVeterinario, idUnidade) {
    const [resultado] = await db.query(`
        SELECT id_veterinario
        FROM veterinarios_unidades
        WHERE id_veterinario = ? AND id_unidade = ? AND ativo = TRUE
    `, [idVeterinario, idUnidade])
    return resultado[0]
}

export async function listarHorarios(idVeterinario) {
    const [resultado] = await db.query(`
        SELECT h.*, u.nome AS unidade_nome,
            GROUP_CONCAT(DISTINCT s.nome ORDER BY s.nome SEPARATOR ', ') AS servicos_nomes,
            GROUP_CONCAT(DISTINCT s.id_servico ORDER BY s.id_servico SEPARATOR ',') AS servicos_ids
        FROM horarios_veterinarios h
        INNER JOIN unidades u ON u.id_unidade = h.id_unidade
        LEFT JOIN horarios_veterinarios_servicos hs ON hs.id_horario = h.id_horario
        LEFT JOIN servicos s ON s.id_servico = hs.id_servico
        WHERE h.id_veterinario = ? AND h.ativo = TRUE AND u.ativo = TRUE
        GROUP BY h.id_horario
        ORDER BY h.id_unidade, h.data_disponivel, h.dia_semana, h.hora_inicio
    `, [idVeterinario])
    return resultado
}

export async function listarUnidadesDoVeterinario(idVeterinario) {
    const [resultado] = await db.query(`
        SELECT u.id_unidade, u.nome
        FROM veterinarios_unidades vu
        INNER JOIN unidades u ON u.id_unidade = vu.id_unidade
        WHERE vu.id_veterinario = ? AND vu.ativo = TRUE AND u.ativo = TRUE
        ORDER BY u.nome
    `, [idVeterinario])
    return resultado
}

export async function criarHorario(dados) {
    await db.beginTransaction();
    try {
        const [resultado] = await db.query(`
            INSERT INTO horarios_veterinarios (id_veterinario, id_unidade, dia_semana, data_disponivel, hora_inicio, hora_fim)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [dados.id_veterinario, dados.id_unidade, dados.dia_semana, dados.data_disponivel, dados.hora_inicio, dados.hora_fim]);
        for (const idServico of dados.ids_servicos) {
            await db.query(`INSERT INTO horarios_veterinarios_servicos (id_horario, id_servico) VALUES (?, ?)`, [resultado.insertId, idServico]);
        }
        await db.commit();
        return resultado.insertId;
    } catch (error) {
        await db.rollback();
        throw error;
    }
}

export async function existeHorarioSobreposto(dados) {
    const [resultado] = await db.query(`
        SELECT id_horario FROM horarios_veterinarios
        WHERE id_veterinario = ? AND id_unidade = ? AND dia_semana = ?
          AND (? IS NULL OR data_disponivel IS NULL OR data_disponivel = ?)
          AND hora_inicio < ? AND hora_fim > ?
    `, [dados.id_veterinario, dados.id_unidade, dados.dia_semana, dados.data_disponivel, dados.data_disponivel, dados.hora_fim, dados.hora_inicio])
    return Boolean(resultado[0])
}

export async function apagarHorario(idHorario, idVeterinario) {
    const [resultado] = await db.query(`DELETE FROM horarios_veterinarios WHERE id_horario = ? AND id_veterinario = ?`, [idHorario, idVeterinario])
    return resultado.affectedRows
}
