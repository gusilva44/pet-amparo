export function validarId(id) {
    if(!Number.isInteger(id) || id <= 0)
        throw new Error("O id deve ser um número inteiro e positivo.")
}

export function autenticacaoUsuario(id){
    if (!id) {
        throw new Error('Usuário não autenticado.')
    }
}
