import * as repo from '../repos/medicamentosRepo.js'
import * as animaisRepo from '../repos/animaisRepo.js'

function validarId(id) {
    if (!Number.isInteger(id) || id <= 0) throw new Error('O ID deve ser um número inteiro e positivo.')
}

function normalizarMedicamento(dados) {
    if (!dados?.nome?.trim()) throw new Error('O nome do medicamento é obrigatório.')
    if (dados.ativo !== undefined && typeof dados.ativo !== 'boolean') throw new Error('O campo ativo deve ser verdadeiro ou falso.')
    return { nome: dados.nome.trim(), descricao: dados.descricao?.trim() || null, ativo: dados.ativo ?? true }
}

export function listarMedicamentos(incluirInativos = false) { return repo.listarMedicamentos(incluirInativos) }
export function criarMedicamento(dados) { return repo.criarMedicamento(normalizarMedicamento(dados)) }

export async function atualizarMedicamento(id, dados) {
    validarId(id)
    if (!await repo.atualizarMedicamento(id, normalizarMedicamento(dados))) throw new Error('Medicamento não encontrado.')
}

export async function listarCarteira(idAnimal, idCliente) {
    validarId(idAnimal); validarId(idCliente)
    if (!await animaisRepo.buscarAnimalPorId(idAnimal, idCliente)) throw new Error('Animal não encontrado.')
    return repo.listarCarteira(idAnimal, idCliente)
}

export async function adicionarNaCarteira(idAnimal, dados) {
    validarId(idAnimal)
    if (!dados) throw new Error('Os dados da medicação são obrigatórios.')
    const idMedicamento = Number(dados.id_medicamento)
    const idVeterinario = dados.id_veterinario === undefined || dados.id_veterinario === null ? null : Number(dados.id_veterinario)
    validarId(idMedicamento)
    if (idVeterinario !== null) validarId(idVeterinario)
    if (!dados.dosagem?.trim() || !dados.frequencia?.trim() || !dados.data_inicio) throw new Error('Dosagem, frequência e data de início são obrigatórias.')
    if (dados.data_fim && dados.data_fim < dados.data_inicio) throw new Error('A data final não pode ser anterior à data inicial.')
    const medicamento = await repo.buscarMedicamento(idMedicamento)
    if (!medicamento || !medicamento.ativo) throw new Error('Medicamento não encontrado ou inativo.')
    return repo.adicionarNaCarteira({
        id_animal: idAnimal, id_veterinario: idVeterinario, id_medicamento: idMedicamento,
        dosagem: dados.dosagem.trim(), frequencia: dados.frequencia.trim(),
        data_inicio: dados.data_inicio, data_fim: dados.data_fim || null, observacao: dados.observacao?.trim() || null
    })
}
