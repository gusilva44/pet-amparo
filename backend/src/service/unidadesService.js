import * as repo from '../repos/unidadesRepo.js'

import * as servicosRepo from '../repos/servicosRepo.js'

function validarId(id) {
    if (!Number.isInteger(id) || id <= 0) throw new Error('O ID deve ser um número inteiro e positivo.')
}

function normalizar(unidade) {
    if (!unidade?.nome?.trim()) throw new Error('O nome da unidade é obrigatório.')
    if (!unidade.endereco?.trim() || !unidade.bairro?.trim() || !unidade.cidade?.trim()) throw new Error('Endereço, bairro e cidade são obrigatórios.')
    if (unidade.estado !== undefined && (typeof unidade.estado !== 'string' || !/^[A-Za-z]{2}$/.test(unidade.estado.trim()))) throw new Error('O estado deve conter a sigla de duas letras.')
    if (unidade.ativo !== undefined && typeof unidade.ativo !== 'boolean') throw new Error('O campo ativo deve ser verdadeiro ou falso.')

    const latitude = unidade.latitude === '' || unidade.latitude === undefined ? null : unidade.latitude === null ? null : Number(unidade.latitude)
    const longitude = unidade.longitude === '' || unidade.longitude === undefined ? null : unidade.longitude === null ? null : Number(unidade.longitude)
    if (latitude !== null && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) throw new Error('A latitude informada é inválida.')
    if (longitude !== null && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)) throw new Error('A longitude informada é inválida.')

    return {
        nome: unidade.nome.trim(), descricao: unidade.descricao?.trim() || null,
        cep: unidade.cep?.trim() || null, endereco: unidade.endereco.trim(), numero: unidade.numero?.trim() || null,
        complemento: unidade.complemento?.trim() || null, bairro: unidade.bairro.trim(),
        cidade: unidade.cidade.trim(), estado: unidade.estado?.trim().toUpperCase() || 'SP',
        telefone: unidade.telefone?.trim() || null, email: unidade.email?.trim().toLowerCase() || null,
        latitude, longitude, ativo: unidade.ativo ?? true
    }
}

export function listarUnidades(incluirInativas = false, incluirServicos = false) {
    return incluirServicos ? repo.listarUnidadesComServicos(incluirInativas) : repo.listarUnidades(incluirInativas)
}

export async function buscarUnidadePorId(idUnidade) {
    validarId(idUnidade)

    const unidade = await repo.buscarUnidadePorId(idUnidade)
    if (!unidade) throw new Error('Unidade não encontrada.')

    return unidade
}

export function criarUnidade(unidade) {
    return repo.criarUnidade(normalizar(unidade))
}

export async function atualizarUnidade(idUnidade, unidade) {
    validarId(idUnidade)

    const alteradas = await repo.atualizarUnidade(idUnidade, normalizar(unidade))
    if (!alteradas) throw new Error('Unidade não encontrada.')

    return alteradas
}

export async function vincularServico(idUnidade, idServico) {
    validarId(idUnidade)
    validarId(idServico)

    const [unidade, servico] = await Promise.all([
        repo.buscarUnidadePorId(idUnidade),
        servicosRepo.buscarServicoPorId(idServico)
    ])

    if (!unidade) throw new Error('Unidade não encontrada.')
    if (!servico || !servico.ativo) throw new Error('Serviço não encontrado ou inativo.')

    await repo.vincularServico(idUnidade, idServico)
}

export async function desvincularServico(idUnidade, idServico) {
    validarId(idUnidade)
    validarId(idServico)

    if (!await repo.desvincularServico(idUnidade, idServico)) {
        throw new Error('Serviço não está vinculado a esta unidade.')
    }
}