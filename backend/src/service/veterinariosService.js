import * as repo from '../repos/agendamentosRepo.js'
import * as veterinariosRepo from '../repos/veterinariosRepo.js'
import * as authRepo from '../repos/authRepo.js'
import * as unidadesRepo from '../repos/unidadesRepo.js'
import bcrypt from 'bcryptjs'
import { regex } from '../utils/regex.js';

export function listarVeterinarios(idUnidade) {
    if (idUnidade !== undefined && (!Number.isInteger(Number(idUnidade)) || Number(idUnidade) <= 0)) throw new Error('A unidade informada é inválida.')

    return repo.listarVeterinarios(idUnidade === undefined ? undefined : Number(idUnidade))
}

function validarId(id) { 
    if (!Number.isInteger(id) || id <= 0) throw new Error('O ID deve ser um número inteiro e positivo.') 
}

export async function criarVeterinario(dados) {
    const idUnidade = Number(dados?.id_unidade)

    if (!dados?.nome?.trim() || !dados?.email?.trim() || !dados?.senha || !dados?.crmv?.trim() || !Number.isInteger(idUnidade) || idUnidade <= 0) {
        throw new Error('Nome, email, senha, CRMV e id_unidade são obrigatórios.')
    }

    if (!regex.verificarEmail.test(dados.email)) throw new Error('Digite um email válido.')

    if (dados.senha.length < 6) throw new Error('A senha deve possuir pelo menos 6 caracteres.')

    const email = dados.email.trim().toLowerCase()

    if (await authRepo.buscarUsuarioPorEmail(email)) throw new Error('Já existe um usuário cadastrado com esse email.')

    if (await veterinariosRepo.buscarPorCrmv(dados.crmv.trim())) throw new Error('Já existe um veterinário cadastrado com esse CRMV.')

    const unidade = await unidadesRepo.buscarUnidadePorId(idUnidade)
    if (!unidade || !unidade.ativo) throw new Error('Unidade não encontrada ou inativa.')

    return veterinariosRepo.criarVeterinario({
        nome: dados.nome.trim(), 
        email, 
        senha_hash: await bcrypt.hash(dados.senha, 12), 
        crmv: dados.crmv.trim(),
        especialidade: dados.especialidade?.trim() || null,
        id_unidade: idUnidade,
        telefone: dados.telefone?.trim() || null
    })
}

export async function listarHorarios(idVeterinario) { 
    validarId(idVeterinario)

    return veterinariosRepo.listarHorarios(idVeterinario)
}

export async function criarHorario(idVeterinario, dados) {
    validarId(idVeterinario)

    const dia = Number(dados?.dia_semana)
    const idUnidade = Number(dados?.id_unidade)

    if (!Number.isInteger(dia) || dia < 1 || dia > 7) throw new Error('O dia da semana deve estar entre 1 e 7.')
    validarId(idUnidade)
    if (!regex.verificarFormatosHorario.test(dados.hora_inicio || '') || !regex.verificarFormatosHorario.test(dados.hora_fim || '') || dados.hora_inicio >= dados.hora_fim) throw new Error('O intervalo de horários é inválido.')

    if (!await veterinariosRepo.veterinarioAtendeNaUnidade(idVeterinario, idUnidade))throw new Error('O veterinário não atende nesta unidade.')
    

    const horario = { 
        id_veterinario: idVeterinario, 
        id_unidade: idUnidade,
        dia_semana: dia, 
        hora_inicio: dados.hora_inicio, 
        hora_fim: dados.hora_fim
    }

    if (await veterinariosRepo.existeHorarioSobreposto(horario)) throw new Error('Este horário se sobrepõe a outro expediente do veterinário.')

    return veterinariosRepo.criarHorario(horario)
}

export async function apagarHorario(idVeterinario, idHorario) {
    validarId(idVeterinario)
    validarId(idHorario)
    
    if (!await veterinariosRepo.apagarHorario(idHorario, idVeterinario)) throw new Error('Horário não encontrado.')
}