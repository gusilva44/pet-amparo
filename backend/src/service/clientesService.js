import { CRUD, RegrasDeNegocio } from '../repos/clientesRepo.js'

const crud = new CRUD()
const regras = new RegrasDeNegocio()

export async function cadastrarCliente(cliente){
    const [ 
        verificarEmail, 
        verificarCpf, 
        verificarTelefone
    ] = await Promise.all([
        regras.Email(cliente),
        regras.Cpf(cliente),
        regras.Telefone(cliente)
    ])

    if(verificarCpf > 0){
        throw new Error("Cliente já cadastrado com esse CPF.")
    } else if (verificarEmail > 0) {
        throw new Error('Cliente já cadastrado com esse email.')
    } else if (verificarTelefone > 0) {
        throw new Error("Cliente já cadastrado com esse telefone")
    }

    return crud.adicionarCliente(cliente)
}