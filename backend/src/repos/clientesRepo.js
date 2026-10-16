import { db } from "./connection.js";

export class banco {
    async buscarTodosClientes() {
        const [resultado] = await db.query(`
            SELECT c.*, u.email, u.ativo
            FROM clientes c
            INNER JOIN usuarios u ON u.id_usuario = c.id_usuario
            ORDER BY c.nome
        `, [])

        return resultado
    }

    async buscarClientePorFiltros({ nome, id, cpf }) {
        let query = `
            SELECT c.*, u.email, u.ativo
            FROM clientes c
            INNER JOIN usuarios u ON u.id_usuario = c.id_usuario
            WHERE 1 = 1
        `

        let valores = []

        if(nome){
            query += ` AND c.nome LIKE ?`
            valores.push(`%${nome}%`)
        }

        if(id){
            query += ` AND c.id_cliente = ?`
            valores.push(id)
        }

        if(cpf){
            query += ` AND c.cpf = ?`
            valores.push(cpf)
        }

        const [resultado] = await db.query(query, valores)

        return resultado
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
            VALUES (?, ?, ?, ?, ?)
        `, [
            cliente.nome,
            cliente.data_nascimento,
            cliente.telefone,
            cliente.cpf,
            cliente.endereco
        ])

        return resultado.insertId
    }

    async atualizarCliente(cliente, id) {
        const [resultado] = await db.query(`
            UPDATE clientes c
            INNER JOIN usuarios u ON u.id_usuario = c.id_usuario
            SET nome = ?, 
                data_nascimento = ?,
                telefone = ?, 
                cpf = ?, 
                endereco = ?,
                u.email = ?
            WHERE c.id_cliente = ?
        `, [
            cliente.nome,
            cliente.data_nascimento,
            cliente.telefone,
            cliente.cpf,
            cliente.endereco,
            cliente.email,
            id
        ])

        return resultado.affectedRows
    }

    async deletarCliente(id) {
        await db.query(`
            DELETE FROM agendamentos
            WHERE id_cliente = ?
        `, [id])

        const [resultado] = await db.query(`
            DELETE u FROM usuarios u
            INNER JOIN clientes c ON c.id_usuario = u.id_usuario
            WHERE c.id_cliente = ?
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
            SELECT * FROM usuarios
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

    async deletarClientePorUsuario(idUsuario) {
        await db.query(`
            DELETE a FROM agendamentos a
            INNER JOIN clientes c ON c.id_cliente = a.id_cliente
            WHERE c.id_usuario = ?
        `, [idUsuario])

        const [resultado] = await db.query(`
            DELETE u FROM usuarios u
            INNER JOIN clientes c ON c.id_usuario = u.id_usuario
            WHERE u.id_usuario = ?
        `, [idUsuario])

        return resultado.affectedRows
    }
}
