import bcrypt from 'bcryptjs'

import * as db from '../repos/authRepo.js'

import { validarDataNascimento } from '../utils/date.js'
import { gerarToken } from '../utils/jwt.js'

export async function cadastrarCliente(dados) {
    if (!dados) throw new Error('Os dados do cadastro são obrigatórios.')
    
    const { nome, email, senha, data_nascimento, telefone, cpf, endereco } = dados

    const cpfNormalizado = cpf.replace(/\D/g, '')
    const telefoneNormalizado = telefone.replace(/\D/g, '')
    const emailNormalizado = email.trim().toLowerCase()
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if ( !nome || !email || !senha || !data_nascimento || !telefone || !cpf || !endereco ) 
        throw new Error('Todos os campos são obrigatórios.')

    if (/\d/.test(nome)) throw new Error('O nome não pode conter números.')

    if (!emailValido.test(emailNormalizado)) throw new Error('Digite um email válido.')
    if (senha.length < 6) throw new Error('A senha deve possuir pelo menos 6 caracteres.')  

    validarDataNascimento(data_nascimento)

    if (cpfNormalizado.length !== 11) throw new Error('O CPF deve possuir 11 números.')

    if (telefoneNormalizado.length < 10 || telefoneNormalizado.length > 11) 
        throw new Error('O telefone deve possuir 10 ou 11 números.')

    const usuarioExistente = await db.buscarUsuarioPorEmail(emailNormalizado)
    if (usuarioExistente) throw new Error('Já existe um usuário cadastrado com esse email.')

    const cpfExistente = await db.buscarClientePorCpf(cpfNormalizado)
    if (cpfExistente) throw new Error('Já existe um cliente cadastrado com esse CPF.')

    const telefoneExistente =await db.buscarClientePorTelefone(telefoneNormalizado)
    if (telefoneExistente) throw new Error('Já existe um cliente cadastrado com esse telefone.')

    const senhaHash = await bcrypt.hash(senha, 12)

    return db.cadastrarCliente({
        nome,
        email: emailNormalizado,
        senhaHash,
        data_nascimento,
        telefone: telefoneNormalizado,
        cpf: cpfNormalizado,
        endereco
    })
}

export async function login(email, senha) {
    if (!email || !senha) throw new Error('Email e senha são obrigatórios.')

    const emailNormalizado = email.trim().toLowerCase()

    const usuario = await db.buscarUsuarioPorEmail(emailNormalizado)

    if (!usuario) throw new Error('Email ou senha inválidos.')
    if (!usuario.ativo) throw new Error('Este usuário está desativado.')
    
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash)
    if (!senhaCorreta) throw new Error('Senha incorreta.')
    
    const token = gerarToken(usuario)

    return {
        token,
        usuario: {
            id_usuario: usuario.id_usuario,
            email: usuario.email,
            tipo: usuario.tipo
        }
    }
}

export async function buscarUsuarioAutenticado(idUsuario) {
    const usuario = await db.buscarUsuarioPorId(idUsuario)

    if (!usuario) throw new Error('Usuário não encontrado.')
    if (!usuario.ativo) throw new Error('Usuário desativado.')
    
    return usuario
}