import { db } from "./connection.js";

export class CRUD {

    async buscarTodosAnimal() {
        const [resultado] = await db.query(`
            SELECT * FROM animais 
        `, [])

        return resultado
    }

    async buscarAnimalPorId(id){
        const [resultado] = await db.query(`
            SELECT * FROM animais
            WHERE animais_id = ?
        `, [id])

        return resultado[0]
    }

    async adicionarAnimal(animais) {
        const [resultado] = await db.query(`
             INSERT INTO animal(nome, especie, raca, rga, idade, sexo, porte, foto, e_vacinado)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        animais.nome,
        animais.especie,
        animais.raca,
        animais.rga,
        animais.idade,
        animais.sexo,
        animais.porte,
        animais.foto,
        animais.e_vacinado
    ])

    return resultado.insertId
}

async atualizarAnimais(animais, id) {
    const [resultado] = await db.query(`
        UPDATE animais 
        SET nome = ?, 
            especie = ?, 
            raca = ?, 
            rga = ?, 
            idade = ?, 
            sexo = ?,
            porte =?,
            foto = ?, 
            e_vacinado = ?
        WHERE id_cliente = ?
    `, [
        cliente.nome,
        cliente.especie,
        cliente.raca,
        cliente.rga,
        cliente.idade,
        cliente.sexo,
        animais.porte,
        animais.foto,
        animais.e_vacinado,
        id
    ])

    return resultado.affectedRows
}


async deletarCliente(id) {
    const [resultado] = await db.query(`
        DELETE FROM clientes
        WHERE id_cliente = ?
    `, [id])

    return resultado.affectedRows
}
}






