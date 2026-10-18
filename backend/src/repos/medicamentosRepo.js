import { db } from './connection.js'

export async function listarMedicamentos(incluirInativos = false) {
    const [resultado] = await db.query(`
        SELECT id_medicamento, nome, descricao, ativo
        FROM medicamentos ${incluirInativos ? '' : 'WHERE ativo = TRUE'}
        ORDER BY nome
    `)
    return resultado
}

export async function buscarMedicamento(idMedicamento) {
    const [resultado] = await db.query(`
        SELECT * FROM medicamentos 
        WHERE id_medicamento = ?`
        , [idMedicamento])

    return resultado[0]
}

export async function criarMedicamento(medicamento) {
    const [resultado] = await db.query(
        `INSERT INTO medicamentos (nome, descricao, ativo) 
        VALUES (?, ?, ?)`,
        [
            medicamento.nome, 
            medicamento.descricao, 
            medicamento.ativo
        ]
    )
    return resultado.insertId
}

export async function atualizarMedicamento(idMedicamento, medicamento) {
    const [resultado] = await db.query(
        `UPDATE medicamentos 
        SET nome = ?, 
            descricao = ?, 
            ativo = ? 
        WHERE id_medicamento = ?`,
        [
            medicamento.nome, 
            medicamento.descricao, 
            medicamento.ativo, 
            idMedicamento
        ]
    )
    return resultado.affectedRows
}

export async function listarCarteira(idAnimal, idCliente) {
    const [resultado] = await db.query(`
        SELECT 
            cm.id_carteira, 
            cm.dosagem, 
            cm.frequencia, 
            cm.data_inicio, 
            cm.data_fim, 
            cm.observacao,
            m.id_medicamento, 
            m.nome AS medicamento, 
            v.nome AS veterinario
        FROM carteiras_medicacao AS cm
        INNER JOIN animais AS a 
            ON a.id_animal = cm.id_animal
        INNER JOIN medicamentos AS m 
            ON m.id_medicamento = cm.id_medicamento
        LEFT JOIN veterinarios AS v 
            ON v.id_veterinario = cm.id_veterinario
        WHERE cm.id_animal = ? 
        AND a.id_cliente = ?
        ORDER BY cm.data_inicio DESC, cm.id_carteira DESC
    `, [
        idAnimal, 
        idCliente
    ])

    return resultado
}

export async function adicionarNaCarteira(dados) {
    const [resultado] = await db.query(`
        INSERT INTO carteiras_medicacao
        (id_animal, id_veterinario, id_medicamento, dosagem, frequencia, data_inicio, data_fim, observacao)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        dados.id_animal, 
        dados.id_veterinario, 
        dados.id_medicamento, 
        dados.dosagem,
        dados.frequencia, 
        dados.data_inicio, 
        dados.data_fim, 
        dados.observacao
    ])
    
    return resultado.insertId
}
