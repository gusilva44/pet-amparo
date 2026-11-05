import * as repo from '../repos/servicosRepo.js'
import * as unidadesRepo from '../repos/unidadesRepo.js'

const DURACAO_MINIMA = 5
const DURACAO_MAXIMA = 480

function validarId(id) {
    if (!Number.isInteger(id) || id <= 0) throw new Error('O ID deve ser um número inteiro e positivo.')
}

function normalizar(servico) {
    if (!servico || typeof servico.nome !== 'string' || !servico.nome.trim()) {
        throw new Error('O nome do serviço é obrigatório.')
    }

    const duracao = Number(servico.duracao_minutos)

    if (!Number.isInteger(duracao) || duracao < DURACAO_MINIMA || duracao > DURACAO_MAXIMA) {
        throw new Error(`A duração deve ser um número inteiro entre ${DURACAO_MINIMA} e ${DURACAO_MAXIMA} minutos.`)
    }

    if (servico.ativo !== undefined && typeof servico.ativo !== 'boolean') {
        throw new Error('O campo ativo deve ser verdadeiro ou falso.')
    }

    return {
        nome: servico.nome.trim(),
        descricao: servico.descricao?.trim() || null,
        duracao_minutos: duracao,
        ativo: servico.ativo ?? true
    }
}

function normalizarUnidades(lista) {
    if (lista === undefined || lista === null) return null

    if (!Array.isArray(lista)) throw new Error('A lista de unidades é inválida.')

    const ids = lista.map(item => Number(item))

    ids.forEach(validarId)

    return [...new Set(ids)]
}

async function validarUnidades(ids) {
    if (!ids || ids.length === 0) return

    const unidades = await Promise.all(ids.map(id => unidadesRepo.buscarUnidadePorId(id)))

    unidades.forEach((unidade, indice) => {
        if (!unidade) throw new Error(`Unidade ${ids[indice]} não encontrada.`)
    })
}

async function garantirNomeLivre(nome, idAtual = null) {
    const existente = await repo.buscarServicoPorNome(nome)

    if (existente && Number(existente.id_servico) !== idAtual) {
        throw new Error('Já existe um serviço cadastrado com esse nome.')
    }
}

export function listarServicos(incluirInativos = false) {
    return repo.listarServicos(incluirInativos)
}

export async function buscarServicoPorId(idServico) {
    validarId(idServico)

    const servico = await repo.buscarServicoPorId(idServico)

    if (!servico) throw new Error('Serviço não encontrado.')

    const unidades = await repo.listarUnidadesDoServico(idServico)

    return { ...servico, unidades }
}

export async function criarServico(dados) {
    const servico = normalizar(dados)
    const unidades = normalizarUnidades(dados?.unidades)

    await garantirNomeLivre(servico.nome)
    await validarUnidades(unidades)

    const idServico = await repo.criarServico(servico)

    if (unidades?.length) await repo.sincronizarUnidades(idServico, unidades)

    return idServico
}

export async function atualizarServico(idServico, dados) {
    validarId(idServico)

    const atual = await repo.buscarServicoPorId(idServico)

    if (!atual) throw new Error('Serviço não encontrado.')

    const servico = normalizar({
        ...atual,
        ...dados,
        ativo: dados?.ativo ?? Boolean(atual.ativo)
    })

    const unidades = normalizarUnidades(dados?.unidades)

    await garantirNomeLivre(servico.nome, idServico)
    await validarUnidades(unidades)

    const alteradas = await repo.atualizarServico(idServico, servico)

    if (unidades) await repo.sincronizarUnidades(idServico, unidades)

    return alteradas
}

export async function alterarStatusServico(idServico, ativo) {
    validarId(idServico)

    if (typeof ativo !== 'boolean') throw new Error('Informe se o serviço deve ficar ativo ou inativo.')

    const servico = await repo.buscarServicoPorId(idServico)

    if (!servico) throw new Error('Serviço não encontrado.')
    if (Boolean(servico.ativo) === ativo) return 0

    if (!ativo && await repo.existeAgendamentoFuturo(idServico)) {
        throw new Error('Existem agendamentos futuros vinculados a este serviço.')
    }

    return repo.alterarStatusServico(idServico, ativo)
}
