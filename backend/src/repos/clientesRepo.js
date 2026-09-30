import { db } from "./connection.js";

export class CRUD {
    async buscarTodosClientes() {
        const [resultado] = await db.query(`
            SELECT * FROM clientes 
        `, [])

        return resultado
    }

    async buscarClientePorId(id){
        const [resultado] = await db.query(`
            SELECT * FROM clientes
            WHERE cliente_id = ?
        `, [id])

        return resultado[0]
    }

    async adicionarCliente(cliente) {
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

    async atualizarCliente(cliente, id) {
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

    async deletarCliente(id) {
        const [resultado] = await db.query(`
            DELETE FROM clientes
            WHERE id_cliente = ?
        `, [id])

        return resultado.affectedRows
    }
}

export class regrasDeNegocio {
    async Telefone({ telefone }) {
        const [res] = await db.query(`
            SELECT * FROM clientes
            WHERE telefone = ?
        `, [telefone])

        return res
    }

    async Cpf({ cpf }) {
        const [res] = await db.query(`
            SELECT * FROM clientes
            WHERE cpf = ?
        `, [cpf,])

        return res
    }

    async Email({ email }) {
        const [res] = await db.query(`
            SELECT * FROM clientes
            WHERE email = ?
        `, [email])

        return res
    }
}