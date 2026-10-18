import { db } from './connection.js'

export async function buscarPorCrmv(crmv) {
    const [resultado] = await db.query('SELECT id_veterinario FROM veterinarios WHERE crmv = ?', [crmv])
    return resultado[0]
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
        SELECT * FROM horarios_veterinarios
        WHERE id_veterinario = ?
        ORDER BY dia_semana, hora_inicio
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
