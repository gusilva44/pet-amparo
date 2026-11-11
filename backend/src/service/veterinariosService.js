import * as repo from '../repos/agendamentosRepo.js'
import * as veterinariosRepo from '../repos/veterinariosRepo.js'
import * as authRepo from '../repos/authRepo.js'
import * as unidadesRepo from '../repos/unidadesRepo.js'
import * as servicosRepo from '../repos/servicosRepo.js'
import bcrypt from 'bcryptjs'
import { regex } from '../utils/regex.js';

export function listarVeterinarios(idUnidade) {
    if (idUnidade !== undefined && (!Number.isInteger(Number(idUnidade)) || Number(idUnidade) <= 0)) throw new Error('A unidade informada é inválida.')

    return repo.listarVeterinarios(idUnidade === undefined ? undefined : Number(idUnidade))
}

export function listarVeterinariosAdmin() {
    return veterinariosRepo.listarVeterinariosAdmin()
}

export function listarContasVeterinariasSemFicha() {
    return veterinariosRepo.listarContasVeterinariasSemFicha()
}

export async function criarFichaParaContaVeterinaria(idUsuario, dados) {
    validarId(idUsuario)
    const idUnidade = Number(dados?.id_unidade)
    if (!dados?.nome?.trim() || !dados?.crmv?.trim()) throw new Error('Nome e CRMV são obrigatórios.')
    validarId(idUnidade)

    const usuario = await authRepo.buscarUsuarioPorId(idUsuario)
    if (!usuario || usuario.tipo !== 'veterinario' || !usuario.ativo) throw new Error('Conta de veterinário não encontrada ou inativa.')
    if (await veterinariosRepo.buscarVeterinarioPorUsuario(idUsuario)) throw new Error('Esta conta já possui uma ficha profissional.')
    if (await veterinariosRepo.buscarPorCrmv(dados.crmv.trim())) throw new Error('Já existe um veterinário cadastrado com esse CRMV.')

    const unidade = await unidadesRepo.buscarUnidadePorId(idUnidade)
    if (!unidade || !unidade.ativo) throw new Error('Unidade não encontrada ou inativa.')

    return veterinariosRepo.criarFichaParaContaVeterinaria(idUsuario, {
        nome: dados.nome.trim(),
        crmv: dados.crmv.trim(),
        especialidade: dados.especialidade?.trim() || null,
        telefone: dados.telefone?.trim() || null,
        id_unidade: idUnidade,
    })
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

export async function listarUnidadesDoVeterinario(idVeterinario) {
    validarId(idVeterinario)
    return veterinariosRepo.listarUnidadesDoVeterinario(idVeterinario)
}

export async function vincularVeterinarioUnidade(idVeterinario, idUnidade) {
    validarId(idVeterinario)
    validarId(idUnidade)
    const [veterinario, unidade] = await Promise.all([
        veterinariosRepo.buscarVeterinarioPorId(idVeterinario),
        unidadesRepo.buscarUnidadePorId(idUnidade),
    ])
    if (!veterinario) throw new Error('Veterinário não encontrado.')
    if (!unidade || !unidade.ativo) throw new Error('Unidade não encontrada ou inativa.')
    await veterinariosRepo.vincularUnidade(idVeterinario, idUnidade)
    return { id_veterinario: idVeterinario, id_unidade: idUnidade }
}

export async function criarHorario(idVeterinario, dados) {
    validarId(idVeterinario)

    const data = dados?.data || null
    let dataObj = null
    if (data) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) throw new Error('Informe uma data válida.')
        dataObj = new Date(`${data}T12:00:00`)
        if (Number.isNaN(dataObj.getTime()) || `${dataObj.getFullYear()}-${String(dataObj.getMonth() + 1).padStart(2, '0')}-${String(dataObj.getDate()).padStart(2, '0')}` !== data) throw new Error('Informe uma data válida.')
        const hoje = new Date()
        const hojeISO = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`
        if (data < hojeISO) throw new Error('A data deve ser hoje ou futura.')
    }
    const dia = dataObj ? (dataObj.getDay() === 0 ? 7 : dataObj.getDay()) : Number(dados?.dia_semana)
    const idUnidade = Number(dados?.id_unidade)
    const idsServicos = [...new Set((Array.isArray(dados?.ids_servicos) ? dados.ids_servicos : []).map(Number))]

    validarId(idUnidade)
    if (!Number.isInteger(dia) || dia < 1 || dia > 7) throw new Error('O dia da semana informado é inválido.')
    if (data && (!idsServicos.length || idsServicos.some((id) => !Number.isInteger(id) || id <= 0))) throw new Error('Selecione ao menos um serviço válido.')
    for (const idServico of idsServicos) {
        if (!await servicosRepo.servicoDisponivelNaUnidade(idServico, idUnidade)) throw new Error('Um dos serviços não está disponível nesta unidade.')
    }
    if (!regex.verificarFormatosHorario.test(dados.hora_inicio || '') || !regex.verificarFormatosHorario.test(dados.hora_fim || '') || dados.hora_inicio >= dados.hora_fim) throw new Error('O intervalo de horários é inválido.')

    if (!await veterinariosRepo.veterinarioAtendeNaUnidade(idVeterinario, idUnidade))throw new Error('O veterinário não atende nesta unidade.')
    

    const horario = { 
        id_veterinario: idVeterinario, 
        id_unidade: idUnidade,
        dia_semana: dia, 
        data_disponivel: data,
        ids_servicos: idsServicos,
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
