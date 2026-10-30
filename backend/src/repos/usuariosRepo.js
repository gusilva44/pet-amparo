import { db } from "./connection.js";

export async function buscarTodosUsuarios() {
    const [resultado] = await db.query(`
        SELECT 
            id_usuario,
            email,
            tipo,
            ativo,
            criado_em
        FROM usuarios
        ORDER BY id_usuario DESC
    `);

    return resultado;
}

export async function buscarUsuarioPorId(id) {
    const [resultado] = await db.query(
        `SELECT id_usuario, email, tipo, ativo
         FROM usuarios
         WHERE id_usuario = ?`,
        [id]
    );

    return resultado[0];
}

export async function buscarUsuarioPorEmail(email) {
    const [resultado] = await db.query(
        `SELECT id_usuario FROM usuarios WHERE email = ?`,
        [email]
    );

    return resultado[0];
}

export async function cadastrarUsuario(email, senhaHash, tipo) {
    const [resultado] = await db.query(
        `INSERT INTO usuarios (email, senha_hash, tipo, ativo)
         VALUES (?, ?, ?, 1)`,
        [email, senhaHash, tipo]
    );

    return resultado.insertId;
}

export async function atualizarEmail(id, email) {
    const [resultado] = await db.query(
        `UPDATE usuarios SET email = ? WHERE id_usuario = ?`,
        [email, id]
    );

    return resultado.affectedRows;
}

export async function alterarStatus(id, ativo) {
    const [resultado] = await db.query(
        `UPDATE usuarios SET ativo = ? WHERE id_usuario = ?`,
        [ativo, id]
    );

    return resultado.affectedRows;
}