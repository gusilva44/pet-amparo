import * as repo from '../repos/servicosRepo.js'

function validarId(id) {
    if (!Number.isInteger(id) || id <= 0) throw new Error('O ID deve ser um número inteiro e positivo.')
}

function normalizar(servico) {
    if (!servico || !servico.nome?.trim()) throw new Error('O nome do serviço é obrigatório.')
    const duracao = Number(servico.duracao_minutos)
    if (!Number.isInteger(duracao) || duracao <= 0) throw new Error('A duração deve ser um número inteiro positivo.')
    if (servico.ativo !== undefined && typeof servico.ativo !== 'boolean') throw new Error('O campo ativo deve ser verdadeiro ou falso.')

    return {
        nome: servico.nome.trim(),
        descricao: servico.descricao?.trim() || null,
        duracao_minutos: duracao,
        ativo: servico.ativo ?? true
    }
}

export function listarServicos(incluirInativos = false) {
    return repo.listarServicos(incluirInativos)
}

export async function buscarServicoPorId(idServico) {
    validarId(idServico)
    const servico = await repo.buscarServicoPorId(idServico)
    if (!servico) throw new Error('Serviço não encontrado.')
    return servico
}

export function criarServico(servico) {
    return repo.criarServico(normalizar(servico))
}

export async function atualizarServico(idServico, servico) {
    validarId(idServico)
    const alteradas = await repo.atualizarServico(idServico, normalizar(servico))
    if (!alteradas) throw new Error('Serviço não encontrado.')
    return alteradas
}
