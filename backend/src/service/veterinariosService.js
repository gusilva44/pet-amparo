import * as repo from '../repos/agendamentosRepo.js'
import * as veterinariosRepo from '../repos/veterinariosRepo.js'
import * as authRepo from '../repos/authRepo.js'
import bcrypt from 'bcryptjs'

export function listarVeterinarios(unidade) {
    if (unidade !== undefined && (typeof unidade !== 'string' || !unidade.trim())) {
        throw new Error('A unidade informada é inválida.')
    }
    return repo.listarVeterinarios(unidade?.trim())
}

function validarId(id) { if (!Number.isInteger(id) || id <= 0) throw new Error('O ID deve ser um número inteiro e positivo.') }

export async function criarVeterinario(dados) {
    if (!dados?.nome?.trim() || !dados?.email?.trim() || !dados?.senha || !dados?.crmv?.trim() || !dados?.unidade?.trim()) throw new Error('Nome, email, senha, CRMV e unidade são obrigatórios.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) throw new Error('Digite um email válido.')
    if (dados.senha.length < 6) throw new Error('A senha deve possuir pelo menos 6 caracteres.')
    const email = dados.email.trim().toLowerCase()
    if (await authRepo.buscarUsuarioPorEmail(email)) throw new Error('Já existe um usuário cadastrado com esse email.')
    if (await veterinariosRepo.buscarPorCrmv(dados.crmv.trim())) throw new Error('Já existe um veterinário cadastrado com esse CRMV.')
    return veterinariosRepo.criarVeterinario({
        nome: dados.nome.trim(), email, senha_hash: await bcrypt.hash(dados.senha, 12), crmv: dados.crmv.trim(),
        especialidade: dados.especialidade?.trim() || null, unidade: dados.unidade.trim(), telefone: dados.telefone?.trim() || null
    })
}

export async function listarHorarios(idVeterinario) { validarId(idVeterinario); return veterinariosRepo.listarHorarios(idVeterinario) }

export async function criarHorario(idVeterinario, dados) {
    validarId(idVeterinario)
    const dia = Number(dados?.dia_semana)
    if (!Number.isInteger(dia) || dia < 1 || dia > 7) throw new Error('O dia da semana deve estar entre 1 e 7.')
    if (!/^\d{2}:\d{2}(:\d{2})?$/.test(dados.hora_inicio || '') || !/^\d{2}:\d{2}(:\d{2})?$/.test(dados.hora_fim || '') || dados.hora_inicio >= dados.hora_fim) throw new Error('O intervalo de horários é inválido.')
    const veterinario = await repo.buscarVeterinario(idVeterinario)
    if (!veterinario) throw new Error('Veterinário não encontrado.')
    const unidade = dados.unidade?.trim() || veterinario.unidade
    if (unidade !== veterinario.unidade) throw new Error('O horário deve pertencer à unidade do veterinário.')
    const horario = { id_veterinario: idVeterinario, dia_semana: dia, hora_inicio: dados.hora_inicio, hora_fim: dados.hora_fim, unidade }
    if (await veterinariosRepo.existeHorarioSobreposto(horario)) throw new Error('Este horário se sobrepõe a outro expediente do veterinário.')
    return veterinariosRepo.criarHorario(horario)
}

export async function apagarHorario(idVeterinario, idHorario) {
    validarId(idVeterinario); validarId(idHorario)
    if (!await veterinariosRepo.apagarHorario(idHorario, idVeterinario)) throw new Error('Horário não encontrado.')
}
