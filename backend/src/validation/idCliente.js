export function validarId(id) {
    if(!Number.isInteger(id) || id <= 0)
        throw new Error("O id deve ser um número inteiro e positivo.")
}