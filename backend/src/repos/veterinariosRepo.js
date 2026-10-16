import { db } from './connection.js'

export async function buscarPorCrmv(crmv) {
    const [resultado] = await db.query('SELECT id_veterinario FROM veterinarios WHERE crmv = ?', [crmv])
    return resultado[0]
}

export async function criarVeterinario(dados) {
    await db.beginTransaction()
    try {
        const [usuario] = await db.query(`INSERT INTO usuarios (email, senha_hash, tipo) VALUES (?, ?, 'veterinario')`, [dados.email, dados.senha_hash])
        const [veterinario] = await db.query(`
            INSERT INTO veterinarios (id_usuario, nome, crmv, especialidade, unidade, telefone)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [usuario.insertId, dados.nome, dados.crmv, dados.especialidade, dados.unidade, dados.telefone])
        await db.commit()
        return veterinario.insertId
    } catch (error) {
        await db.rollback(); throw error
    }
}

export async function listarHorarios(idVeterinario) {
    const [resultado] = await db.query(`SELECT * FROM horarios_veterinarios WHERE id_veterinario = ? ORDER BY dia_semana, hora_inicio`, [idVeterinario])
    return resultado
}

export async function criarHorario(dados) {
    const [resultado] = await db.query(`
        INSERT INTO horarios_veterinarios (id_veterinario, dia_semana, hora_inicio, hora_fim, unidade)
        VALUES (?, ?, ?, ?, ?)
    `, [dados.id_veterinario, dados.dia_semana, dados.hora_inicio, dados.hora_fim, dados.unidade])
    return resultado.insertId
}

export async function existeHorarioSobreposto(dados) {
    const [resultado] = await db.query(`
        SELECT id_horario FROM horarios_veterinarios
        WHERE id_veterinario = ? AND dia_semana = ?
          AND hora_inicio < ? AND hora_fim > ?
    `, [dados.id_veterinario, dados.dia_semana, dados.hora_fim, dados.hora_inicio])
    return Boolean(resultado[0])
}

export async function apagarHorario(idHorario, idVeterinario) {
    const [resultado] = await db.query(`DELETE FROM horarios_veterinarios WHERE id_horario = ? AND id_veterinario = ?`, [idHorario, idVeterinario])
    return resultado.affectedRows
}
