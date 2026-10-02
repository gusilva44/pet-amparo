import { db } from './connection.js'

export async function buscarUsuarioPorEmail(email) {

    const [resultado] = await db.query(`
        SELECT
            id_usuario,
            email,
            senha_hash,
            tipo,
            ativo
        FROM usuarios
        WHERE email = ?
    `, [email])

    return resultado[0]
}

export async function buscarUsuarioPorId(idUsuario) {

    const [resultado] = await db.query(`
        SELECT
            id_usuario,
            email,
            tipo,
            ativo
        FROM usuarios
        WHERE id_usuario = ?
    `, [idUsuario])

    return resultado[0]
}

export async function buscarClientePorCpf(cpf) {

    const [resultado] = await db.query(`
        SELECT id_cliente
        FROM clientes
        WHERE cpf = ?
    `, [cpf])

    return resultado[0]
}

export async function buscarClientePorTelefone(telefone) {

    const [resultado] = await db.query(`
        SELECT id_cliente
        FROM clientes
        WHERE telefone = ?
    `, [telefone])

    return resultado[0]
}

export async function cadastrarCliente(dados) {

    await db.beginTransaction()

    try {

        const [usuario] = await db.query(`
            INSERT INTO usuarios (
                email,
                senha_hash,
                tipo
            )
            VALUES (?, ?, 'cliente')
        `, [
            dados.email,
            dados.senhaHash
        ])

        const idUsuario = usuario.insertId

        const [cliente] = await db.query(`
            INSERT INTO clientes (
                id_usuario,
                nome,
                data_nascimento,
                telefone,
                cpf,
                endereco
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            idUsuario,
            dados.nome,
            dados.data_nascimento,
            dados.telefone,
            dados.cpf,
            dados.endereco
        ])

        await db.commit()

        return {
            id_usuario: idUsuario,
            id_cliente: cliente.insertId
        }

    } catch (error) {

        await db.rollback()

        throw error
    }
}

export async function buscarClientePorUsuario(idUsuario) {

    const [resultado] = await db.query(`
        SELECT
            id_cliente,
            id_usuario,
            nome
        FROM clientes
        WHERE id_usuario = ?
    `, [idUsuario])

    return resultado[0]
}