import { db } from "./connection.js";

export class banco {
    async buscarTodosClientes() {
        const [resultado] = await db.query(`
            SELECT * FROM clientes 
        `, [])

        return resultado
    }

    async buscarClientePorFiltros({ nome, id, cpf }) {
        let query = `
            SELECT * FROM clientes
            WHERE 1 = 1
        `

        let valores = []

        if(nome){
            query += `AND nome LIKE ?`
            valores.push(`%${nome}%`)
        }

        if(id){
            query += `AND id_cliente = ?`
            valores.push(id)
        }

        if(cpf){
            query += `AND cpf = ?`
            valores.push(cpf)
        }

        const [resultado] = await db.query(query, valores)

        return resultado[0]
    }

    async buscarClientePorNome(nome) {
        const [resultado] = await db.query(`
            SELECT * FROM clientes
            WHERE nome = ?
        `, [nome])
        
        return resultado[0]
    }

    async adicionarCliente(cliente) {
        const [resultado] = await db.query(`
            INSERT INTO clientes(nome, data_nascimento, telefone, cpf, endereco)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            cliente.nome,
            cliente.data_nasc,
            cliente.telefone,
            cliente.cpf,
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
        await db.query(`
            DELETE FROM agendamentos
            WHERE id_cliente = ?
        `, [id])

        await db.query(`
            DELETE FROM animais
            WHERE id_cliente =? 
        `, [id])

        const [resultado] = await db.query(`
            DELETE FROM clientes
            WHERE id_cliente = ?
        `, [id])

        return resultado.affectedRows
    }

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

export default class Usuario {
    async buscarDadosCliente(id){
        const [resultado] = await db.query(`
            SELECT * FROM clientes as c
            INNER JOIN usuarios as u
                ON u.id_usuario = c.id_usuario
            WHERE c.id_usuario = ? 
        `, [id])

        return resultado[0]
    }

    async atualizarClientePorUsuario(cliente, idUsuario){
            const {
            nome,
            data_nascimento,
            telefone,
            cpf,
            endereco,
            email
        } = cliente

        const [resultado] = await db.query(`
            UPDATE clientes c
            INNER JOIN usuarios u
                ON u.id_usuario = c.id_usuario
            SET
                c.nome = ?,
                c.data_nascimento = ?,
                c.telefone = ?,
                c.cpf = ?,
                c.endereco = ?,
                u.email = ?
            WHERE u.id_usuario = ?
        `, [
            nome,
            data_nascimento,
            telefone,
            cpf,
            endereco,
            email,
            idUsuario
        ])

        return resultado
    }
}