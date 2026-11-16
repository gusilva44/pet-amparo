import { db } from "./connection.js";

export async function buscarTodosUsuarios() {
    const [resultado] = await db.query(`
        SELECT 
            u.id_usuario,
            u.email,
            u.tipo,
            u.ativo,
            u.criado_em,
            c.id_cliente,
            c.cpf,
            COALESCE(c.nome, v.nome, u.email) AS nome,
            v.id_veterinario,
            vinculacoes.unidades_ids,
            vinculacoes.unidades_nomes
        FROM usuarios u
        LEFT JOIN clientes c ON c.id_usuario = u.id_usuario
        LEFT JOIN veterinarios v ON v.id_usuario = u.id_usuario
        LEFT JOIN (
            SELECT vu.id_veterinario,
                GROUP_CONCAT(vu.id_unidade ORDER BY vu.id_unidade SEPARATOR ',') AS unidades_ids,
                GROUP_CONCAT(un.nome ORDER BY un.nome SEPARATOR ', ') AS unidades_nomes
            FROM veterinarios_unidades vu
            INNER JOIN unidades un ON un.id_unidade = vu.id_unidade
            WHERE vu.ativo = TRUE
            GROUP BY vu.id_veterinario
        ) vinculacoes ON vinculacoes.id_veterinario = v.id_veterinario
        ORDER BY u.id_usuario DESC
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

export async function excluirUsuario(id) {
    const conexao = await db.getConnection();
    try {
        await conexao.beginTransaction();
        const [usuarios] = await conexao.query(
            `SELECT tipo FROM usuarios WHERE id_usuario = ? FOR UPDATE`,
            [id]
        );

        if (!usuarios.length) {
            await conexao.rollback();
            return 0;
        }

        if (usuarios[0].tipo === "cliente") {
            await conexao.query(`
                DELETE a FROM agendamentos a
                INNER JOIN clientes c ON c.id_cliente = a.id_cliente
                WHERE c.id_usuario = ?
            `, [id]);
        } else if (usuarios[0].tipo === "veterinario") {
            await conexao.query(`
                DELETE a FROM agendamentos a
                INNER JOIN veterinarios v ON v.id_veterinario = a.id_veterinario
                WHERE v.id_usuario = ?
            `, [id]);
        }

        const [resultado] = await conexao.query(
            `DELETE FROM usuarios WHERE id_usuario = ?`,
            [id]
        );
        await conexao.commit();
        return resultado.affectedRows;
    } catch (error) {
        await conexao.rollback();
        throw error;
    } finally {
        conexao.release();
    }
}
