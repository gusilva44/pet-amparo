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

async function validarVeterinarioEHorario(idVeterinario, idUnidade, inicio, fim) {
    const veterinario = await repo.buscarVeterinarioNaUnidade(idVeterinario, idUnidade)

    if (!veterinario || !veterinario.ativo || !veterinario.usuario_ativo) throw new Error('Veterinário não encontrado ou inativo.')

    const horarios = await repo.buscarHorarioDoVeterinario(idVeterinario, idUnidade, numeroDiaSemana(inicio))

    if (!horarios.some(horario => dentroDoHorario(inicio, fim, horario))) throw new Error('O horário escolhido está fora do expediente do veterinário.')
    
}

export function listarMeusAgendamentos(idCliente) {
    validarId(idCliente)

    return repo.listarAgendamentosCliente(idCliente)
}

export function listarAgendamentosDoVeterinario(idVeterinario) {
    validarId(idVeterinario)

    return repo.listarAgendamentosVeterinario(idVeterinario)
}

export async function atualizarStatusPeloVeterinario(idAgendamento, idVeterinario, statusSolicitado) {
    validarId(idAgendamento)
    validarId(idVeterinario)

    const status = statusSolicitado === 'pendente' ? 'agendado' : statusSolicitado === 'concluido' ? 'concluido' : null

    if (!status) throw new Error('O status deve ser pendente ou concluido.')

    const agendamento = await repo.buscarAgendamentoDoVeterinario(idAgendamento, idVeterinario)

    if (!agendamento) throw new Error('Agendamento não encontrado.')
    if (agendamento.status === 'cancelado') throw new Error('Não é possível alterar um agendamento cancelado.')

    await repo.atualizarStatusDoAgendamento(idAgendamento, idVeterinario, status)
    return { status, situacao: status === 'concluido' ? 'concluido' : 'pendente' }
}

export async function criarAgendamento(dados, idCliente) {
    validarId(idCliente)

    if (!dados) throw new Error('Os dados do agendamento são obrigatórios.')

    const idAnimal = Number(dados.id_animal)
    const idVeterinario = Number(dados.id_veterinario)
    const idUnidade = Number(dados.id_unidade)
    const idServico = Number(dados.id_servico)

    validarId(idAnimal)
    validarId(idVeterinario)
    validarId(idUnidade)
    validarId(idServico)

    const animal = await animaisRepo.buscarAnimalPorId(idAnimal, idCliente)

    if (!animal) throw new Error('Animal não encontrado.')

    const servico = await servicosRepo.buscarServicoPorId(idServico)

    if (!servico || !servico.ativo) throw new Error('Serviço não encontrado ou inativo.')
    if (!await servicosRepo.servicoDisponivelNaUnidade(idServico, idUnidade)) throw new Error('O serviço não está disponível nesta unidade.')
    
    const inicio = lerDataHora(dados.inicio)
    const fim = new Date(inicio.getTime() + servico.duracao_minutos * 60_000)
    await validarVeterinarioEHorario(idVeterinario, idUnidade, inicio, fim)

    if (await repo.existeConflito(idVeterinario, inicio, fim)) throw new Error('Este horário não está mais disponível.')

    return repo.criarAgendamento({
        id_cliente: idCliente, id_animal: idAnimal, id_veterinario: idVeterinario,
        id_unidade: idUnidade, id_servico: idServico, inicio, fim,
        observacao: dados.observacao?.trim() || null
    })
}

export async function cancelarAgendamento(idAgendamento, idCliente) {
    validarId(idAgendamento)
    validarId(idCliente)

    const agendamento = await repo.buscarAgendamentoDoCliente(idAgendamento, idCliente)

    if (!agendamento) throw new Error('Agendamento não encontrado.')

    if (new Date(agendamento.inicio) <= new Date()) throw new Error('Não é possível cancelar um agendamento já iniciado.')
        
    if (!await repo.cancelarAgendamento(idAgendamento, idCliente)) throw new Error('Este agendamento não pode ser cancelado.')
}