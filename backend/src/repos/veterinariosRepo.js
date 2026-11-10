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

export async function listarVeterinariosAdmin() {
    const [resultado] = await db.query(`
        SELECT v.id_veterinario, v.nome, v.crmv, v.especialidade, v.telefone,
               v.ativo AS veterinario_ativo, u.email, u.ativo AS usuario_ativo,
               vu.id_unidade, un.nome AS unidade_nome
        FROM veterinarios v
        INNER JOIN usuarios u ON u.id_usuario = v.id_usuario
        LEFT JOIN veterinarios_unidades vu ON vu.id_veterinario = v.id_veterinario AND vu.ativo = TRUE
        LEFT JOIN unidades un ON un.id_unidade = vu.id_unidade
        ORDER BY v.nome, un.nome
    `)
    return resultado
}

export async function listarContasVeterinariasSemFicha() {
    const [resultado] = await db.query(`
        SELECT u.id_usuario, u.email
        FROM usuarios u
        LEFT JOIN veterinarios v ON v.id_usuario = u.id_usuario
        WHERE u.tipo = 'veterinario' AND u.ativo = TRUE AND v.id_veterinario IS NULL
        ORDER BY u.email
    `)
    return resultado
}

export async function criarFichaParaContaVeterinaria(idUsuario, dados) {
    const conexao = await db.getConnection()
    try {
        await conexao.beginTransaction()
        const [contas] = await conexao.query(`
            SELECT id_usuario FROM usuarios
            WHERE id_usuario = ? AND tipo = 'veterinario' AND ativo = TRUE
            FOR UPDATE
        `, [idUsuario])
        if (!contas.length) throw new Error('Conta de veterinário não encontrada ou inativa.')

        const [fichas] = await conexao.query(
            'SELECT id_veterinario FROM veterinarios WHERE id_usuario = ? FOR UPDATE',
            [idUsuario],
        )
        if (fichas.length) throw new Error('Esta conta já possui uma ficha profissional.')

        const [ficha] = await conexao.query(`
            INSERT INTO veterinarios (id_usuario, nome, crmv, especialidade, telefone)
            VALUES (?, ?, ?, ?, ?)
        `, [idUsuario, dados.nome, dados.crmv, dados.especialidade, dados.telefone])
        await conexao.query(`
            INSERT INTO veterinarios_unidades (id_veterinario, id_unidade)
            VALUES (?, ?)
        `, [ficha.insertId, dados.id_unidade])
        await conexao.commit()
        return ficha.insertId
    } catch (error) {
        await conexao.rollback()
        throw error
    } finally {
        conexao.release()
    }
}

export async function criarVeterinario(dados) {
    const conexao = await db.getConnection()
    await conexao.beginTransaction()
    try {
        const [usuario] = await conexao.query(`INSERT INTO usuarios (email, senha_hash, tipo) VALUES (?, ?, 'veterinario')`, [dados.email, dados.senha_hash])
        const [veterinario] = await conexao.query(`
            INSERT INTO veterinarios (id_usuario, nome, crmv, especialidade, telefone)
            VALUES (?, ?, ?, ?, ?)
        `, [usuario.insertId, dados.nome, dados.crmv, dados.especialidade, dados.telefone])

        await conexao.query(`
            INSERT INTO veterinarios_unidades (id_veterinario, id_unidade)
            VALUES (?, ?)
        `, [veterinario.insertId, dados.id_unidade])

        await conexao.commit()
        return veterinario.insertId
    } catch (error) {
        await conexao.rollback(); throw error
    } finally {
        conexao.release()
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
        SELECT h.*, u.nome AS unidade_nome
        FROM horarios_veterinarios h
        INNER JOIN unidades u ON u.id_unidade = h.id_unidade
        WHERE h.id_veterinario = ? AND h.ativo = TRUE AND u.ativo = TRUE
        ORDER BY h.id_unidade, h.dia_semana, h.hora_inicio
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
    const [resultado] = await db.query(`
        INSERT INTO horarios_veterinarios (id_veterinario, id_unidade, dia_semana, hora_inicio, hora_fim)
        VALUES (?, ?, ?, ?, ?)
    `, [dados.id_veterinario, dados.id_unidade, dados.dia_semana, dados.hora_inicio, dados.hora_fim])
    return resultado.insertId
}

export async function existeHorarioSobreposto(dados) {
    const [resultado] = await db.query(`
        SELECT id_horario FROM horarios_veterinarios
        WHERE id_veterinario = ? AND id_unidade = ? AND dia_semana = ?
          AND hora_inicio < ? AND hora_fim > ?
    `, [dados.id_veterinario, dados.id_unidade, dados.dia_semana, dados.hora_fim, dados.hora_inicio])
    return Boolean(resultado[0])
}

export async function apagarHorario(idHorario, idVeterinario) {
    const [resultado] = await db.query(`DELETE FROM horarios_veterinarios WHERE id_horario = ? AND id_veterinario = ?`, [idHorario, idVeterinario])
    return resultado.affectedRows
}
