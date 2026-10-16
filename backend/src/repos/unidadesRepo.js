import { db } from './connection.js'

const colunas = `id_unidade, nome, descricao, cep, endereco, numero, complemento, bairro, cidade, estado, telefone, email, latitude, longitude, ativo`

export async function listarUnidades(incluirInativas = false) {
    const [resultado] = await db.query(`SELECT ${colunas} FROM unidades ${incluirInativas ? '' : 'WHERE ativo = TRUE'} ORDER BY nome`)
    return resultado
}

export async function buscarUnidadePorId(idUnidade) {
    const [resultado] = await db.query(`SELECT ${colunas} FROM unidades WHERE id_unidade = ?`, [idUnidade])
    return resultado[0]
}

export async function criarUnidade(unidade) {
    const [resultado] = await db.query(`
        INSERT INTO unidades (nome, descricao, cep, endereco, numero, complemento, bairro, cidade, estado, telefone, email, latitude, longitude, ativo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [unidade.nome, unidade.descricao, unidade.cep, unidade.endereco, unidade.numero, unidade.complemento, unidade.bairro, unidade.cidade, unidade.estado, unidade.telefone, unidade.email, unidade.latitude, unidade.longitude, unidade.ativo])
    return resultado.insertId
}

export async function atualizarUnidade(idUnidade, unidade) {
    const [resultado] = await db.query(`
        UPDATE unidades SET nome = ?, descricao = ?, cep = ?, endereco = ?, numero = ?, complemento = ?, bairro = ?, cidade = ?, estado = ?, telefone = ?, email = ?, latitude = ?, longitude = ?, ativo = ?
        WHERE id_unidade = ?
    `, [unidade.nome, unidade.descricao, unidade.cep, unidade.endereco, unidade.numero, unidade.complemento, unidade.bairro, unidade.cidade, unidade.estado, unidade.telefone, unidade.email, unidade.latitude, unidade.longitude, unidade.ativo, idUnidade])
    return resultado.affectedRows
}
