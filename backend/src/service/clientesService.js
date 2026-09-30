import { CRUD, RegrasDeNegocio } from '../repos/clientesRepo.js'

const crud = new CRUD()
const regras = new RegrasDeNegocio()

export async function cadastrarCliente(cliente){
    if(!cliente) throw new Error ("Erro ao enviar os dados.")

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
        throw new Error("Cliente já cadastrado com esse telefone.")
    }

    return crud.adicionarCliente(cliente)
}

export async function buscarClientePorId(id) {
    if(!id) throw new Error("Erro ao enviar o ID do cliente.")
    if(id < 0) throw new Error("O id deve ser inteiro e positivo.")

    return crud.buscarClientePorId(id)
}

export async function buscarTodosClientes() {
    return crud.buscarTodosClientes()
}