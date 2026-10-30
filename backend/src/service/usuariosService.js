import bcrypt from "bcryptjs";
import * as db from "../repos/usuariosRepo.js";

export async function buscarTodosUsuarios() {
    return await db.buscarTodosUsuarios();
}

export async function cadastrarUsuario(dados) {
    const { email, senha, tipo } = dados;

    if (!email || !senha || !tipo) {
        throw new Error("Preencha todos os campos obrigatórios.");
    }

    if (tipo !== "admin") {
        throw new Error("Esta rota permite cadastrar somente administradores.");
    }

    const usuarioExistente = await db.buscarUsuarioPorEmail(email);

    if (usuarioExistente) {
        throw new Error("Este e-mail já está cadastrado.");
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const id = await db.cadastrarUsuario(email, senhaHash, tipo);

    return {
        id_usuario: id,
        email,
        tipo,
        ativo: 1
    };
}

export async function atualizarUsuario(id, dados) {
    const { email } = dados;

    if (!email) {
        throw new Error("Informe o e-mail.");
    }

    const usuario = await db.buscarUsuarioPorId(id);

    if (!usuario) {
        throw new Error("Usuário não encontrado.");
    }

    const emailExistente = await db.buscarUsuarioPorEmail(email);

    if (emailExistente && Number(emailExistente.id_usuario) !== Number(id)) {
        throw new Error("Este e-mail já está sendo utilizado.");
    }

    await db.atualizarEmail(id, email);

    return {
        ...usuario,
        email
    };
}

export async function alterarStatusUsuario(id, ativo) {
    const usuario = await db.buscarUsuarioPorId(id);

    if (!usuario) {
        throw new Error("Usuário não encontrado.");
    }

    await db.alterarStatus(id, ativo);

    return {
        ...usuario,
        ativo
    };
}