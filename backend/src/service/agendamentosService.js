import * as repo from '../repos/agendamentosRepo.js'
import * as animaisRepo from '../repos/animaisRepo.js'
import * as servicosRepo from '../repos/servicosRepo.js'
import * as unidadesRepo from '../repos/unidadesRepo.js'

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
    const horarios = await repo.buscarHorarioDoVeterinario(idVeterinario, idUnidade, numeroDiaSemana(inicioDia));
    const ocupados = await repo.listarConflitos(idVeterinario, data);
    const duracao = Number(servico.duracao_minutos);
    const passo = Math.max(15, Math.min(duracao, 60));
    const agora = new Date();
    const opcoes = new Set();
    for (const horario of horarios) {
        const [h0, m0] = horario.hora_inicio.slice(0, 5).split(':').map(Number);
        const [h1, m1] = horario.hora_fim.slice(0, 5).split(':').map(Number);
        const fimExpediente = h1 * 60 + m1;
        for (let minuto = h0 * 60 + m0; minuto + duracao <= fimExpediente; minuto += passo) {
            const hora = `${String(Math.floor(minuto / 60)).padStart(2, '0')}:${String(minuto % 60).padStart(2, '0')}`;
            const inicio = new Date(`${data}T${hora}:00`);
            const fim = new Date(inicio.getTime() + duracao * 60000);
            if (inicio <= agora) continue;
            if (ocupados.some(item => inicio < new Date(item.fim) && fim > new Date(item.inicio))) continue;
            opcoes.add(hora);
        }
    }
    return [...opcoes].sort();
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
        const dia = dataLocalISO(new Date(agendamento.inicio))

        if (!dias.has(dia)) {
            dias.set(dia, { dia, total: 0, pendentes: 0, concluidos: 0, cancelados: 0, agendamentos: [] })
        }

        const registro = dias.get(dia)

        registro.total += 1
        registro.agendamentos.push(agendamento)

        if (agendamento.situacao === 'concluido') registro.concluidos += 1
        else if (agendamento.situacao === 'cancelado') registro.cancelados += 1
        else registro.pendentes += 1
    }

    return {
        total: agendamentos.length,
        dias: [...dias.values()]
    }
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

    if (!unidade || !unidade.ativo) {
        throw new Error('Unidade não encontrada ou indisponível para agendamentos.')
    }

    const animal = await animaisRepo.buscarAnimalPorId(idAnimal, idCliente)

    if (!animal) throw new Error('Animal não encontrado.')

    const servico = await servicosRepo.buscarServicoPorId(idServico)

    if (!servico || !servico.ativo) {
        throw new Error('Serviço não encontrado ou inativo.')
    }

    if (!await servicosRepo.servicoDisponivelNaUnidade(idServico, idUnidade)) {
        throw new Error('O serviço não está disponível nesta unidade.')
    }

    const inicio = lerDataHora(dados.inicio)
    const fim = new Date(inicio.getTime() + servico.duracao_minutos * 60_000)

    await validarVeterinarioEHorario(idVeterinario, idUnidade, inicio, fim)

    if (await repo.existeConflito(idVeterinario, inicio, fim)) {
        throw new Error('Este horário não está mais disponível.')
    }

    return repo.criarAgendamento({
        id_cliente: idCliente,
        id_animal: idAnimal,
        id_veterinario: idVeterinario,
        id_unidade: idUnidade,
        id_servico: idServico,
        inicio,
        fim,
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
