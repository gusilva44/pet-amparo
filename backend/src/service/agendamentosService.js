import * as repo from '../repos/agendamentosRepo.js'
import * as animaisRepo from '../repos/animaisRepo.js'
import * as servicosRepo from '../repos/servicosRepo.js'

function validarId(id) {
    if (!Number.isInteger(id) || id <= 0) throw new Error('O ID deve ser um número inteiro e positivo.')
}

function lerDataHora(valor) {
    if (typeof valor !== 'string' || !valor.trim()) throw new Error('A data e hora de início são obrigatórias.')
    const data = new Date(valor)
    if (Number.isNaN(data.getTime())) throw new Error('Data e hora de início inválidas.')
    if (data <= new Date()) throw new Error('O agendamento deve estar no futuro.')
    return data
}

function numeroDiaSemana(data) {
    return data.getDay() === 0 ? 7 : data.getDay()
}

function dataLocalISO(data) {
    const pad = valor => String(valor).padStart(2, '0')
    return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}`
}

function dentroDoHorario(inicio, fim, horario) {
    const data = dataLocalISO(inicio)
    const inicioHorario = new Date(`${data}T${horario.hora_inicio}`)
    const fimHorario = new Date(`${data}T${horario.hora_fim}`)
    return inicio >= inicioHorario && fim <= fimHorario
}

async function validarVeterinarioEHorario(idVeterinario, unidade, inicio, fim) {
    const veterinario = await repo.buscarVeterinario(idVeterinario)
    if (!veterinario || !veterinario.ativo || !veterinario.usuario_ativo) throw new Error('Veterinário não encontrado ou inativo.')
    if (veterinario.unidade !== unidade) throw new Error('O veterinário não atende nesta unidade.')

    const horarios = await repo.buscarHorarioDoVeterinario(idVeterinario, numeroDiaSemana(inicio))
    if (!horarios.some(horario => horario.unidade === unidade && dentroDoHorario(inicio, fim, horario))) {
        throw new Error('O horário escolhido está fora do expediente do veterinário.')
    }
}

export function listarMeusAgendamentos(idCliente) {
    validarId(idCliente)
    return repo.listarAgendamentosCliente(idCliente)
}

export async function criarAgendamento(dados, idCliente) {
    validarId(idCliente)
    if (!dados) throw new Error('Os dados do agendamento são obrigatórios.')
    const idAnimal = Number(dados.id_animal)
    const idVeterinario = Number(dados.id_veterinario)
    const idServico = Number(dados.id_servico)
    validarId(idAnimal); validarId(idVeterinario); validarId(idServico)
    if (!dados.unidade?.trim()) throw new Error('A unidade é obrigatória.')

    const animal = await animaisRepo.buscarAnimalPorId(idAnimal, idCliente)
    if (!animal) throw new Error('Animal não encontrado.')
    const servico = await servicosRepo.buscarServicoPorId(idServico)
    if (!servico || !servico.ativo) throw new Error('Serviço não encontrado ou inativo.')

    const inicio = lerDataHora(dados.inicio)
    const fim = new Date(inicio.getTime() + servico.duracao_minutos * 60_000)
    const unidade = dados.unidade.trim()
    await validarVeterinarioEHorario(idVeterinario, unidade, inicio, fim)
    if (await repo.existeConflito(idVeterinario, inicio, fim)) throw new Error('Este horário não está mais disponível.')

    return repo.criarAgendamento({
        id_cliente: idCliente, id_animal: idAnimal, id_veterinario: idVeterinario,
        id_servico: idServico, unidade, inicio, fim,
        observacao: dados.observacao?.trim() || null
    })
}

export async function cancelarAgendamento(idAgendamento, idCliente) {
    validarId(idAgendamento); validarId(idCliente)
    const agendamento = await repo.buscarAgendamentoDoCliente(idAgendamento, idCliente)
    if (!agendamento) throw new Error('Agendamento não encontrado.')
    if (new Date(agendamento.inicio) <= new Date()) throw new Error('Não é possível cancelar um agendamento já iniciado.')
    if (!await repo.cancelarAgendamento(idAgendamento, idCliente)) throw new Error('Este agendamento não pode ser cancelado.')
}
