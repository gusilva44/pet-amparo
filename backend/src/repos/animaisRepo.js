import { db } from './connection.js'


export async function buscarTodosAnimaisPorCliente(idCliente) {
    const [resultado] = await db.query(`
        SELECT * FROM animais
        WHERE id_cliente = ?
        ORDER BY nome
    `, [idCliente])

    return resultado
}


export async function buscarAnimalPorId(idAnimal, idCliente) {
    const [resultado] = await db.query(`
        SELECT * FROM animais
        WHERE id_animal = ?
        AND id_cliente = ?
    `, [
        idAnimal,
        idCliente
    ])

    return resultado[0]
}


export async function buscarAnimalPorRga(rga) {
    const [resultado] = await db.query(`
        SELECT id_animal, id_cliente FROM animais
        WHERE rga = ?
    `, [rga])

    return resultado[0]
}


export async function adicionarAnimal(animal, idCliente) {
    const [resultado] = await db.query(`
        INSERT INTO animais (id_cliente, nome, especie, raca, rga, idade, sexo, porte, foto, e_vacinado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        idCliente,
        animal.nome,
        animal.especie,
        animal.raca,
        animal.rga,
        animal.idade,
        animal.sexo,
        animal.porte,
        animal.foto,
        animal.e_vacinado
    ])

    return resultado.insertId
}

export async function atualizarAnimal(animal, idAnimal, idCliente) {
    const [resultado] = await db.query(`
        UPDATE animais
        SET
            nome = ?,
            especie = ?,
            raca = ?,
            rga = ?,
            idade = ?,
            sexo = ?,
            porte = ?,
            foto = ?,
            e_vacinado = ?
        WHERE id_animal = ? AND id_cliente = ?
    `, [
        animal.nome,
        animal.especie,
        animal.raca,
        animal.rga,
        animal.idade,
        animal.sexo,
        animal.porte,
        animal.foto,
        animal.e_vacinado,
        idAnimal,
        idCliente
    ])

    return resultado.affectedRows
}

export async function deletarAnimal(idAnimal, idCliente) {
    const [resultado] = await db.query(`
        DELETE FROM animais
        WHERE id_animal = ?
        AND id_cliente = ?
    `, [idAnimal, idCliente])

    return resultado.affectedRows
}
