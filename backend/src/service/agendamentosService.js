import * as repo from '../repos/agendamentosRepo.js'
import * as animaisRepo from '../repos/animaisRepo.js'
import * as servicosRepo from '../repos/servicosRepo.js'
import * as unidadesRepo from '../repos/unidadesRepo.js'
import {
    adicionarMinutos,
    agoraNoFuso,
    dataDeDataHora,
    dataHoraParaBanco,
    diaSemana,
    minutosDaHora,
    normalizarData,
    normalizarDataHora,
} from '../utils/dataHora.js'

function validarId(id) {
    if (!Number.isInteger(id) || id <= 0) throw new Error('O ID deve ser um número inteiro e positivo.')
}

function dentroDoHorario(inicio, fim, horario) {
    const inicioNoDia = inicio.slice(11)
    const fimNoDia = fim.slice(11)
    return inicio.slice(0, 10) === fim.slice(0, 10)
        && inicioNoDia >= String(horario.hora_inicio).slice(0, 8)
        && fimNoDia <= String(horario.hora_fim).slice(0, 8)
}

async function validarVeterinarioEHorario(idVeterinario, idUnidade, inicio, fim, idServico) {
    const veterinario = await repo.buscarVeterinarioNaUnidade(idVeterinario, idUnidade)
    if (!veterinario || !veterinario.ativo || !veterinario.usuario_ativo || !veterinario.unidade_ativa) {
        throw new Error('Veterinário não encontrado ou indisponível nesta unidade.')
    }

    if (!veterinario || !veterinario.ativo || !veterinario.usuario_ativo) throw new Error('Veterinário não encontrado ou inativo.')

    const horarios = await repo.buscarHorarioDoVeterinario(idVeterinario, idUnidade, numeroDiaSemana(inicio), dataLocalISO(inicio), idServico)

    if (!horarios.some(horario => dentroDoHorario(inicio, fim, horario))) throw new Error('O horário escolhido está fora do expediente do veterinário.')
    
}

export function listarMeusAgendamentos(idCliente) {
    validarId(idCliente)
    return repo.listarAgendamentosCliente(idCliente)
}

export async function listarHorariosDisponiveis({ idVeterinario, idUnidade, idServico, data }) {
    validarId(idVeterinario);
    validarId(idUnidade);
    validarId(idServico);
    if (typeof data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data)) throw new Error('Informe uma data válida.');
    const inicioDia = new Date(`${data}T00:00:00`);
    if (Number.isNaN(inicioDia.getTime()) || dataLocalISO(inicioDia) !== data) throw new Error('Informe uma data válida.');
    const servico = await servicosRepo.buscarServicoPorId(idServico);
    if (!servico?.ativo || !await servicosRepo.servicoDisponivelNaUnidade(idServico, idUnidade)) return [];
    const veterinario = await repo.buscarVeterinarioNaUnidade(idVeterinario, idUnidade);
    if (!veterinario?.ativo || !veterinario?.usuario_ativo) return [];
    const horarios = await repo.buscarHorarioDoVeterinario(idVeterinario, idUnidade, numeroDiaSemana(inicioDia), data, idServico);
    const ocupados = await repo.listarConflitos(idVeterinario, data);
    const duracao = Number(servico.duracao_minutos);
    const passo = Math.max(15, Math.min(duracao, 60));
    const agora = new Date();
    const opcoes = new Set();
    for (const horario of horarios) {
        const inicioExpediente = minutosDaHora(String(horario.hora_inicio))
        const fimExpediente = minutosDaHora(String(horario.hora_fim))

        for (let minuto = inicioExpediente; minuto + duracao <= fimExpediente; minuto += passo) {
            const hora = `${String(Math.floor(minuto / 60)).padStart(2, '0')}:${String(minuto % 60).padStart(2, '0')}`
            const inicio = dataHoraParaBanco(data, hora)
            const fim = adicionarMinutos(inicio, duracao)
            if (inicio <= agora) continue
            if (ocupados.some(item => inicio < item.fim && fim > item.inicio)) continue
            opcoes.add(hora)
        }
    }
    return [...opcoes].sort()
}

function normalizarFiltros(filtros = {}) {
    const mes = typeof filtros.mes === 'string' && /^\d{4}-\d{2}$/.test(filtros.mes) ? filtros.mes : null
    const situacao = ['pendente', 'concluido', 'cancelado'].includes(filtros.situacao) ? filtros.situacao : null
    return { mes, situacao }
}

export function listarAgendamentosDoVeterinario(idVeterinario, filtros) {
    validarId(idVeterinario)
    return repo.listarAgendamentosVeterinario(idVeterinario, normalizarFiltros(filtros))
}

export async function montarAgendaDoVeterinario(idVeterinario, filtros) {
    const agendamentos = await listarAgendamentosDoVeterinario(idVeterinario, filtros)
    const dias = new Map()

    for (const agendamento of agendamentos) {
        const dia = dataDeDataHora(String(agendamento.inicio).replace('T', ' ').slice(0, 19))
        if (!dias.has(dia)) dias.set(dia, { dia, total: 0, pendentes: 0, concluidos: 0, cancelados: 0, agendamentos: [] })
        const registro = dias.get(dia)
        registro.total += 1
        registro.agendamentos.push(agendamento)
        if (agendamento.situacao === 'concluido') registro.concluidos += 1
        else if (agendamento.situacao === 'cancelado') registro.cancelados += 1
        else registro.pendentes += 1
    }
    return { total: agendamentos.length, dias: [...dias.values()] }
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

    const unidade = await unidadesRepo.buscarUnidadePorId(idUnidade)
    if (!unidade || !unidade.ativo) throw new Error('Unidade não encontrada ou indisponível para agendamentos.')
    const animal = await animaisRepo.buscarAnimalPorId(idAnimal, idCliente)
    if (!animal) throw new Error('Animal não encontrado.')
    const servico = await servicosRepo.buscarServicoPorId(idServico)
    if (!servico || !servico.ativo) throw new Error('Serviço não encontrado ou inativo.')
    if (!await servicosRepo.servicoDisponivelNaUnidade(idServico, idUnidade)) throw new Error('O serviço não está disponível nesta unidade.')

    if (!servico || !servico.ativo) {
        throw new Error('Serviço não encontrado ou inativo.')
    }

    if (!await servicosRepo.servicoDisponivelNaUnidade(idServico, idUnidade)) {
        throw new Error('O serviço não está disponível nesta unidade.')
    }

    const inicio = lerDataHora(dados.inicio)
    const fim = new Date(inicio.getTime() + servico.duracao_minutos * 60_000)

    await validarVeterinarioEHorario(idVeterinario, idUnidade, inicio, fim, idServico)

    const observacao = typeof dados.observacao === 'string' ? dados.observacao.trim() : ''
    if (observacao.length > 500) throw new Error('A observação deve ter no máximo 500 caracteres.')

    return repo.criarAgendamentoAtomico({
        id_cliente: idCliente,
        id_animal: idAnimal,
        id_veterinario: idVeterinario,
        id_unidade: idUnidade,
        id_servico: idServico,
        inicio,
        fim,
        observacao: observacao || null,
    })
}

export async function cancelarAgendamento(idAgendamento, idCliente) {
    validarId(idAgendamento)
    validarId(idCliente)
    const agendamento = await repo.buscarAgendamentoDoCliente(idAgendamento, idCliente)
    if (!agendamento) throw new Error('Agendamento não encontrado.')
    if (String(agendamento.inicio) <= agoraNoFuso()) throw new Error('Não é possível cancelar um agendamento já iniciado.')
    if (!await repo.cancelarAgendamento(idAgendamento, idCliente)) throw new Error('Este agendamento não pode ser cancelado.')
}
