import { db } from "./connection.js";

export async function buscarTodosClientes() {
    const [resultado] = await db.query(`
        SELECT * FROM clientes 
    `, [])

    return resultado
}

export async function buscarClientePorId(id){
    const [resultado] = await db.query(`
        SELECT * FROM clientes
        WHERE cliente_id = ?
    `, [id])

    return resultado[0]
}

export async function adicionarCliente(cliente) {
    const [resultado] = await db.query(`
        INSERT INTO clientes(nome, data_nasc, telefone, cpf, email, endereco)
        VALUES (?, ?, ?, ?, ?, ?)
    `, [
        cliente.nome,
        cliente.data_nasc,
        cliente.telefone,
        cliente.cpf,
        cliente.email,
        cliente.endereco
    ])

    return resultado.insertId
}

export async function atualizarCliente(cliente, id) {
    const [resultado] = await db.query(`
        UPDATE clientes 
        SET nome = ?, 
            data_nasc = ?, 
            telefone = ?, 
            cpf = ?, 
            email = ?, 
            endereco = ?
        WHERE id_cliente = ?
    `, [
        cliente.nome,
        cliente.data_nasc,
        cliente.telefone,
        cliente.cpf,
        cliente.email,
        cliente.endereco,
        id
    ])

    return resultado.affectedRows
}

export async function deletarCliente(id) {
    const [resultado] = await db.query(`
        DELETE FROM clientes
        WHERE id_cliente = ?
    `, [id])

    return resultado.affectedRows
}